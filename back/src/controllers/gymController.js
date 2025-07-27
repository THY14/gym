import gymService from '../services/gymService.js';
import { sendSuccessResponse } from '../utils/responseHelper.js';

const gymController = {
  async getGyms(req, res, next) {
    try {
      const gyms = await gymService.getGyms();
      sendSuccessResponse(res, 200, gyms);
    } catch (error) {
      next(error);
    }
  },

  async createGym(req, res, next) {
    try {
      const gym = await gymService.createGym(req.body);
      sendSuccessResponse(res, 201, gym, 'Gym created');
    } catch (error) {
      next(error);
    }
  },

  async updateGym(req, res, next) {
    try {
      const gym = await gymService.updateGym(req.params.id, req.body);
      sendSuccessResponse(res, 200, gym, 'Gym updated');
    } catch (error) {
      next(error);
    }
  },

  async deleteGym(req, res, next) {
    try {
      await gymService.deleteGym(req.params.id);
      sendSuccessResponse(res, 200, null, 'Gym deleted');
    } catch (error) {
      next(error);
    }
  },
};

export default gymController;