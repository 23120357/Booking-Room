const { error } = require('../utils/responseHelper');

class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  return error(
    res,
    statusCode >= 500 ? 'Internal server error' : err.message,
    statusCode,
    err.details,
  );
}

module.exports = {
  AppError,
  notFound,
  errorHandler,
};
