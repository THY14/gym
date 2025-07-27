import bookingService from '../services/bookingService.js';
import { sendSuccessResponse } from '../utils/responseHelper.js';

const bookingController = {
  async getTrainerClasses(req, res, next) {
    try {
      const classes = await bookingService.getTrainerClasses(req.user.id);
      sendSuccessResponse(res, 200, classes);
    } catch (error) {
      next(error);
    }
  },

  async createClass(req, res, next) {
    try {
      const classRecord = await bookingService.createClass({
        ...req.body,
        trainerId: req.user.id,
      });
      sendSuccessResponse(res, 201, classRecord, 'Class created');
    } catch (error) {
      next(error);
    }
  },

  async updateClass(req, res, next) {
    try {
      const classRecord = await bookingService.updateClass(req.params.id, req.body);
      sendSuccessResponse(res, 200, classRecord, 'Class updated');
    } catch (error) {
      next(error);
    }
  },

  async deleteClass(req, res, next) {
    try {
      await bookingService.deleteClass(req.params.id);
      sendSuccessResponse(res, 200, null, 'Class deleted');
    } catch (error) {
      next(error);
    }
  },

  async getTrainerSchedules(req, res, next) {
    try {
      const schedules = await bookingService.getTrainerSchedules(req.user.id);
      sendSuccessResponse(res, 200, schedules);
    } catch (error) {
      next(error);
    }
  },

  async createSchedule(req, res, next) {
    try {
      const schedule = await bookingService.createSchedule({
        ...req.body,
        trainerId: req.user.id,
      });
      sendSuccessResponse(res, 201, schedule, 'Schedule created');
    } catch (error) {
      next(error);
    }
  },

  async updateSchedule(req, res, next) {
    try {
      const schedule = await bookingService.updateSchedule(req.params.id, req.body);
      sendSuccessResponse(res, 200, schedule, 'Schedule updated');
    } catch (error) {
      next(error);
    }
  },

  async deleteSchedule(req, res, next) {
    try {
      await bookingService.deleteSchedule(req.params.id);
      sendSuccessResponse(res, 200, null, 'Schedule deleted');
    } catch (error) {
      next(error);
    }
  },

  async bookClass(req, res, next) {
    try {
      const clientId = req.user.role === 'member' ? (await db.Client.findOne({ where: { userId: req.user.id } })).id : req.body.clientId;
      const schedule = await bookingService.bookClass(req.params.id, clientId);
      sendSuccessResponse(res, 200, schedule, 'Class booked');
    } catch (error) {
      next(error);
    }
  },
};

export default bookingController;