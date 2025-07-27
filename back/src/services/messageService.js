import db from '../models/index.js';
import { NotFoundError } from '../utils/errorHelper.js';
import { logInfo } from '../utils/logger.js';
import { Op } from 'sequelize';

const messageService = {
  async getMessages(userId, clientId) {
    const messages = await db.Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, recipientId: clientId },
          { senderId: clientId, recipientId: userId },
        ],
      },
      order: [['timestamp', 'ASC']],
    });
    return messages;
  },

  async sendMessage({ senderId, recipientId, message }) {
    const sender = await db.User.findByPk(senderId);
    if (!sender) {
      throw new NotFoundError('Sender not found');
    }
    const recipient = await db.Client.findByPk(recipientId);
    if (!recipient) {
      throw new NotFoundError('Recipient not found');
    }

    const messageRecord = await db.Message.create({
      senderId,
      recipientId,
      message,
      timestamp: new Date(),
      insertDate: new Date(),
      updateDate: new Date(),
    });

    logInfo({ message: `Message sent from ${senderId} to ${recipientId}`, user: senderId });
    return messageRecord;
  },
};

export default messageService;