import db from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/errorHelper.js';
import { logInfo } from '../utils/logger.js';

const trainerService = {
  async getClients(trainerId) {
    const clients = await db.Client.findAll({
      where: { trainerId },
      include: [{ model: db.WorkoutPlan }, { model: db.MembershipPlan }],
    });
    return clients;
  },

  async createClient(data) {
    const { userId, trainerId } = data;
    const user = await db.User.findByPk(userId);
    if (!user || user.role !== 'member') {
      throw new ValidationError('Invalid member user');
    }
    const trainer = await db.User.findByPk(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
      throw new ValidationError('Invalid trainer');
    }

    const client = await db.Client.create({
      ...data,
      insertDate: new Date(),
      updateDate: new Date(),
    });

    logInfo({ message: `Client created for user ${userId}`, user: trainerId });
    return client;
  },

  async updateClient(id, data) {
    const client = await db.Client.findByPk(id);
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    await client.update({
      ...data,
      updateDate: new Date(),
    });

    logInfo({ message: `Client ${id} updated`, user: client.trainerId });
    return client;
  },

  async deleteClient(id) {
    const client = await db.Client.findByPk(id);
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    await client.destroy();
    logInfo({ message: `Client ${id} deleted`, user: client.trainerId });
  },
};

export default trainerService;