const authService = require('../../services/auth/authService');
const { success } = require('../../utils/responseHelper');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return success(res, result, 'Registered successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body, req);
    return success(res, result, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    return success(res, { user: req.user }, 'Current user');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
};
