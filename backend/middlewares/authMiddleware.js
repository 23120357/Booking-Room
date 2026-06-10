const { verifyAccessToken } = require('../utils/jwt');
const { AppError } = require('./errorHandler');
const authService = require('../services/auth/authService');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Authentication required', 401);
    }

    const payload = verifyAccessToken(token);
    const user = await authService.getCurrentUser(payload.sub);

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('Authentication required', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      next(new AppError('Authentication required', 401));
      return;
    }
    next(err);
  }
}

module.exports = {
  authenticate,
};
