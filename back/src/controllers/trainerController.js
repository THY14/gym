import trainerService from '../services/trainerService.js';
import { sendSuccessResponse } from '../utils/responseHelper.js';

const trainerController = {
  async getClients(req, res, next) {
    try {
      const clients = await trainerService.getClients(req.user.id);
      sendSuccessResponse(res, 200, clients);
    } catch (error) {
      next(error);
    }
  },

  async createClient(req, res, next) {
    try {
      const client = await trainerService.createClient({
        ...req.body,
        trainerId: req.user.id,
      });
      sendSuccessResponse(res, 201, client, 'Client created');
    } catch (error) {
      next(error);
    }
  },

  async updateClient(req, res, next) {
    try {
      const client = await trainerService.updateClient(req.params.id, req.body);
      sendSuccessResponse(res, 200, client, 'Client updated');
    } catch (error) {
      next(error);
    }
  },

  async deleteClient(req, res, next) {
    try {
      await trainerService.deleteClient(req.params.id);
      sendSuccessResponse(res, 200, null, 'Client deleted');
    } catch (error) {
      next(error);
    }
  },
};

export default trainerController;