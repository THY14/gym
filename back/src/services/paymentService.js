import db from '../models/index.js';
import { NotFoundError } from '../utils/errorHelper.js';
import { logInfo } from '../utils/logger.js';
import { Op } from 'sequelize';

const paymentService = {
  async getPayments(clientId) {
    const payments = await db.Payment.findAll({
      where: { clientId },
      include: [
        { model: db.Class },
        { model: db.TrainingSession },
        { model: db.MembershipPlan },
      ],
    });
    return payments;
  },

  async getTrainerEarnings(trainerId, startDate, endDate) {
    const classPayments = await db.Payment.findAll({
      include: [
        {
          model: db.Class,
          where: { trainerId },
          required: true,
        },
      ],
      where: {
        date: { [Op.between]: [startDate, endDate] },
        status: 'paid',
      },
    });

    const sessionPayments = await db.Payment.findAll({
      include: [
        {
          model: db.TrainingSession,
          where: { trainerId },
          required: true,
        },
      ],
      where: {
        date: { [Op.between]: [startDate, endDate] },
        status: 'paid',
      },
    });

    const totalEarnings = [
      ...classPayments,
      ...sessionPayments,
    ].reduce((sum, payment) => sum + payment.amount, 0);

    return {
      classPayments,
      sessionPayments,
      totalEarnings,
    };
  },

  async createPayment(data) {
    const { clientId, classId, sessionId, membershipPlanId } = data;
    if (classId) {
      const classRecord = await db.Class.findByPk(classId);
      if (!classRecord) {
        throw new NotFoundError('Class not found');
      }
      data.amount = classRecord.price;
    } else if (sessionId) {
      const session = await db.TrainingSession.findByPk(sessionId);
      if (!session) {
        throw new NotFoundError('Training session not found');
      }
      data.amount = session.type === 'individual' ? 50.00 : 30.00;
    } else if (membershipPlanId) {
      const plan = await db.MembershipPlan.findByPk(membershipPlanId);
      if (!plan) {
        throw new NotFoundError('Membership plan not found');
      }
      data.amount = plan.price;
    }

    const payment = await db.Payment.create({
      ...data,
      date: new Date(),
      insertDate: new Date(),
      updateDate: new Date(),
    });

    logInfo({ message: `Payment created for client ${clientId}`, user: clientId });
    return payment;
  },
};

export default paymentService;