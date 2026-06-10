const db = require('../../config/db');
const User = require('../../models/User');
const { hashPassword, verifyPassword } = require('../../utils/hashPassword');
const { signAccessToken } = require('../../utils/jwt');
const { AppError } = require('../../middlewares/errorHandler');
const { normalizeRole } = require('../../middlewares/roleMiddleware');

const LOGIN_LOCK_THRESHOLD = 5;
const LOGIN_LOCK_MINUTES = 10;

function toDbRole(role) {
  if (!role) return 'TENANT';
  const normalized = String(role).trim().toUpperCase();
  if (normalized === 'HOST') return 'LANDLORD';
  if (normalized === 'TENANT') return 'TENANT';
  throw new AppError('role must be TENANT or HOST', 400);
}

function validatePassword(password) {
  const errors = [];
  if (typeof password !== 'string' || password.length < 8) errors.push('at least 8 characters');
  if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
  if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('one number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('one special character');
  return errors;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeUsername(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 40);
}

async function buildUniqueUsername(email, requestedUsername) {
  const base = normalizeUsername(requestedUsername || email.split('@')[0]) || `user${Date.now()}`;
  let candidate = base;
  let suffix = 1;

  while (await User.findExistingIdentity({ email: `__${candidate}@local.invalid`, username: candidate })) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function validateRegisterPayload(payload) {
  const errors = {};
  const email = normalizeEmail(payload.email);
  const dbRole = toDbRole(payload.role);

  if (!payload.fullName || String(payload.fullName).trim().length < 2) {
    errors.fullName = 'fullName is required';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'valid email is required';
  }
  if (payload.phoneNumber && !/^[0-9]{10,15}$/.test(String(payload.phoneNumber))) {
    errors.phoneNumber = 'phoneNumber must contain 10 to 15 digits';
  }
  if (payload.password !== payload.confirmPassword) {
    errors.confirmPassword = 'confirmPassword must match password';
  }

  const passwordErrors = validatePassword(payload.password || '');
  if (passwordErrors.length > 0) {
    errors.password = `password must contain ${passwordErrors.join(', ')}`;
  }

  if (dbRole === 'LANDLORD') {
    if (!payload.idCardFrontUrl) errors.idCardFrontUrl = 'idCardFrontUrl is required for HOST registration';
    if (!payload.idCardBackUrl) errors.idCardBackUrl = 'idCardBackUrl is required for HOST registration';
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }

  return { email, dbRole };
}

async function auditLogin({ userId = null, identifier, success, failureReason, req }) {
  await db('login_audit_logs').insert({
    user_id: userId,
    login_identifier: identifier,
    success,
    failure_reason: failureReason || null,
    ip_address: req.ip || null,
    user_agent: req.get('user-agent') || null,
  });
}

async function register(payload) {
  const { email, dbRole } = validateRegisterPayload(payload);
  const role = await User.findRole(dbRole);

  if (!role) {
    throw new AppError('Configured role not found', 500);
  }

  const username = await buildUniqueUsername(email, payload.username);
  const existing = await User.findExistingIdentity({
    email,
    phoneNumber: payload.phoneNumber,
    username,
  });

  if (existing) {
    throw new AppError('Email, phone number, or username already exists', 409);
  }

  const passwordHash = await hashPassword(payload.password);
  const user = await User.createUserWithProfile({
    fullName: String(payload.fullName).trim(),
    email,
    phoneNumber: payload.phoneNumber || null,
    username,
    passwordHash,
    roleId: role.role_id,
    dbRole,
    idCardFrontUrl: payload.idCardFrontUrl,
    idCardBackUrl: payload.idCardBackUrl,
  });
  const token = signAccessToken(user);

  return { user, token };
}

async function getSecurity(userId) {
  let security = await db('account_security').where('user_id', userId).first();
  if (!security) {
    const [created] = await db('account_security').insert({ user_id: userId }).returning('*');
    security = created;
  }
  return security;
}

async function recordFailedLogin(userId) {
  const security = await getSecurity(userId);
  const attempts = Number(security.failed_login_attempts || 0) + 1;
  const lockedUntil =
    attempts >= LOGIN_LOCK_THRESHOLD
      ? db.raw(`CURRENT_TIMESTAMP + INTERVAL '${LOGIN_LOCK_MINUTES} minutes'`)
      : security.locked_until;

  await db('account_security').where('user_id', userId).update({
    failed_login_attempts: attempts,
    locked_until: lockedUntil,
    updated_at: db.fn.now(),
  });
}

async function recordSuccessfulLogin(userId) {
  await db('account_security')
    .insert({
      user_id: userId,
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
    .onConflict('user_id')
    .merge({
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
}

async function login(payload, req) {
  const identifier = String(payload.identifier || '').trim();
  const password = payload.password;

  if (!identifier || !password) {
    throw new AppError('identifier and password are required', 400);
  }

  const row = await User.findByIdentifier(identifier);
  const genericError = new AppError('Invalid credentials', 401);

  if (!row) {
    await auditLogin({ identifier, success: false, failureReason: 'USER_NOT_FOUND', req });
    throw genericError;
  }

  const user = User.toPublicUser(row);

  if (user.status !== 'ACTIVE') {
    await auditLogin({ userId: user.user_id, identifier, success: false, failureReason: 'ACCOUNT_NOT_ACTIVE', req });
    throw genericError;
  }

  const security = await getSecurity(user.user_id);
  if (security.locked_until && new Date(security.locked_until) > new Date()) {
    await auditLogin({ userId: user.user_id, identifier, success: false, failureReason: 'ACCOUNT_LOCKED', req });
    throw new AppError('Account is temporarily locked', 423);
  }

  const passwordMatches = await verifyPassword(password, row.password);
  if (!passwordMatches) {
    await recordFailedLogin(user.user_id);
    await auditLogin({ userId: user.user_id, identifier, success: false, failureReason: 'BAD_PASSWORD', req });
    throw genericError;
  }

  await recordSuccessfulLogin(user.user_id);
  await auditLogin({ userId: user.user_id, identifier, success: true, req });

  return {
    user: {
      ...user,
      role: normalizeRole(user.role),
    },
    token: signAccessToken(user),
  };
}

async function getCurrentUser(userId) {
  return User.findById(userId);
}

module.exports = {
  register,
  login,
  getCurrentUser,
};
