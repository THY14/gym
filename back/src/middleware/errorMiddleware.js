import { logError } from '../utils/logger.js';
import { sendErrorResponse } from '../utils/responseHelper.js';

const errorMiddleware = (error, req, res, next) => {
  // Log error
  logError({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    user: req.user ? req.user.id : 'unauthenticated',
  });

  // Handle specific error types
  if (error.name === 'SequelizeValidationError') {
    const messages = error.errors.map((err) => err.message);
    return sendErrorResponse(res, 400, messages.join(', '));
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return sendErrorResponse(res, 400, 'Duplicate entry');
  }

  if (error.name === 'ValidationError') {
    return sendErrorResponse(res, 400, error.message);
  }

  // Generic error
  const status = error.status || 500;
  const message = error.message || 'Internal server error';
  return sendErrorResponse(res, status, message);
};

export default errorMiddleware;