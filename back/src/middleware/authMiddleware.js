import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import { sendErrorResponse } from '../utils/responseHelper.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendErrorResponse(res, 401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id || !decoded.role) {
      return sendErrorResponse(res, 401, 'Invalid token');
    }

    // Find user in database
    const user = await db.User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'role', 'firstName', 'lastName'],
    });

    if (!user) {
      return sendErrorResponse(res, 401, 'User not found');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendErrorResponse(res, 401, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return sendErrorResponse(res, 401, 'Token expired');
    }
    return sendErrorResponse(res, 500, 'Authentication failed');
  }
};

// Role-based middleware
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendErrorResponse(res, 403, 'Access denied');
    }
    next();
  };
};

export { authMiddleware, restrictTo };