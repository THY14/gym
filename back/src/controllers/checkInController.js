import checkInService from '../services/checkInService.js';
import { sendSuccessResponse } from '../utils/responseHelper.js';
import db from '../models/index.js';

const checkInController = {
  async getCheckIns(req, res, next) {
    try {
      const clientId = req.user.role === 'member' ? (await db.Client.findOne({ where: { userId: req.user.id } })).id : req.query.clientId;
      const checkIns = await checkInService.getCheckIns(clientId);
      sendSuccessResponse(res, 200, checkIns);
    } catch (error) {
      next(error);
    }
  },

  async createCheckIn(req, res, next) {
    try {
      const checkIn = await checkInService.createCheckIn(req.body);
      sendSuccessResponse(res, 201, checkIn, 'Check-in created');
    } catch (error) {
      next(error);
    }
  },
};

export default checkInController;