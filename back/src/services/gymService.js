import db from '../models/index.js';
import { NotFoundError } from '../utils/errorHelper.js';
import { logInfo } from '../utils/logger.js';

const gymService = {
  async getGyms() {
    const gyms = await db.Gym.findAll();
    return gyms;
  },

  async createGym(data) {
    const gym = await db.Gym.create({
      ...data,
      insertDate: new Date(),
      updateDate: new Date(),
    });

    logInfo({ message: `Gym ${data.name} created`, user: 'admin' });
    return gym;
  },

  async updateGym(id, data) {
    const gym = await db.Gym.findByPk(id);
    if (!gym) {
      throw new NotFoundError('Gym not found');
    }

    await gym.update({
      ...data,
      updateDate: new Date(),
    });

    logInfo({ message: `Gym ${id} updated`, user: 'admin' });
    return gym;
  },

  async deleteGym(id) {
    const gym = await db.Gym.findByPk(id);
    if (!gym) {
      throw new NotFoundError('Gym not found');
    }

    await gym.destroy();
    logInfo({ message: `Gym ${id} deleted`, user: 'admin' });
  },
};

export default gymService;