import messageService from '../services/messageService.js';
import { sendSuccessResponse } from '../utils/responseHelper.js';
import db from '../models/index.js';

const messageController = {
  async getMessages(req, res, next) {
    try {
      const clientId = req.user.role === 'member' ? (await db.Client.findOne({ where: { userId: req.user.id } })).id : req.query.clientId;
      const messages = await messageService.getMessages(req.user.id, clientId);
      sendSuccessResponse(res, 200, messages);
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const message = await messageService.sendMessage({
        ...req.body,
        senderId: req.user.id,
      });
      sendSuccessResponse(res, 201, message, 'Message sent');
    } catch (error) {
      next(error);
    }
  },
};

export default messageController;