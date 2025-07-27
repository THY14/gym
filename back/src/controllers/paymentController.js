import paymentService from '../services/paymentService.js';
import { sendSuccessResponse } from '../utils/responseHelper.js';
import db from '../models/index.js';

const paymentController = {
  async getPayments(req, res, next) {
    try {
      const clientId = req.user.role === 'member' ? (await db.Client.findOne({ where: { userId: req.user.id } })).id : req.query.clientId;
      const payments = await paymentService.getPayments(clientId);
      sendSuccessResponse(res, 200, payments);
    } catch (error) {
      next(error);
    }
  },

  async getTrainerEarnings(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const earnings = await paymentService.getTrainerEarnings(
        req.user.id,
        startDate || '2025-07-01',
        endDate || '2025-07-27'
      );
      sendSuccessResponse(res, 200, earnings);
    } catch (error) {
      next(error);
    }
  },

  async createPayment(req, res, next) {
    try {
      const payment = await paymentService.createPayment(req.body);
      sendSuccessResponse(res, 201, payment, 'Payment created');
    } catch (error) {
      next(error);
    }
  },
};

export default paymentController;