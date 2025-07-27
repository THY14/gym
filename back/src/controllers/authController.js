import authService from '../services/authService.js';
import { sendSuccessResponse } from '../utils/responseHelper.js';

const authController = {
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      sendSuccessResponse(res, 200, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  },

  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      const { token } = await authService.login(req.body.email, req.body.password); // Auto-login
      sendSuccessResponse(res, 201, { user, token }, 'User registered');
    } catch (error) {
      next(error);
    }
  },

  async getUser(req, res, next) {
    try {
      const user = await authService.getUser(req.user.id);
      sendSuccessResponse(res, 200, user);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const user = await authService.updateUser(req.user.id, req.body);
      sendSuccessResponse(res, 200, user, 'User updated');
    } catch (error) {
      next(error);
    }
  },
};

export default authController;