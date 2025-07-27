import db from '../models/index.js';
import { NotFoundError } from '../utils/errorHelper.js';
import { logInfo } from '../utils/logger.js';

const checkInService = {
  async getCheckIns(clientId) {
    const checkIns = await db.CheckIn.findAll({
      where: { clientId },
      include: [{ model: db.Gym }],
    });
    return checkIns;
  },

  async createCheckIn({ clientId, gymId, checkInTime }) {
    const client = await db.Client.findByPk(clientId);
    if (!client) {
      throw new NotFoundError('Client not found');
    }
    const gym = await db.Gym.findByPk(gymId);
    if (!gym) {
      throw new NotFoundError('Gym not found');
    }

    const checkIn = await db.CheckIn.create({
      clientId,
      gymId,
      checkInTime,
      insertDate: new Date(),
      updateDate: new Date(),
    });

    logInfo({ message: `Check-in created for client ${clientId}`, user: clientId });
    return checkIn;
  },
};

export default checkInService;