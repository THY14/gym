import db from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/errorHelper.js';
import { logInfo } from '../utils/logger.js';

const bookingService = {
  async getTrainerClasses(trainerId) {
    const classes = await db.Class.findAll({
      where: { trainerId },
      include: [{ model: db.Gym }, { model: db.ClassAvailableDay }],
    });
    return classes;
  },

  async createClass(data) {
    const { trainerId, gymId, availableDays } = data;
    const trainer = await db.User.findByPk(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
      throw new ValidationError('Invalid trainer');
    }
    const gym = await db.Gym.findByPk(gymId);
    if (!gym) {
      throw new NotFoundError('Gym not found');
    }

    const classRecord = await db.Class.create({
      ...data,
      enrolled: 0,
      insertDate: new Date(),
      updateDate: new Date(),
    });

    if (availableDays && availableDays.length > 0) {
      const classAvailableDays = availableDays.map((day) => ({
        classId: classRecord.id,
        day,
      }));
      await db.ClassAvailableDay.bulkCreate(classAvailableDays);
    }

    logInfo({ message: `Class ${classRecord.name} created`, user: trainerId });
    return classRecord;
  },

  async updateClass(id, data) {
    const classRecord = await db.Class.findByPk(id);
    if (!classRecord) {
      throw new NotFoundError('Class not found');
    }

    const { availableDays } = data;
    await classRecord.update({
      ...data,
      updateDate: new Date(),
    });

    if (availableDays) {
      await db.ClassAvailableDay.destroy({ where: { classId: id } });
      const classAvailableDays = availableDays.map((day) => ({
        classId: id,
        day,
      }));
      await db.ClassAvailableDay.bulkCreate(classAvailableDays);
    }

    logInfo({ message: `Class ${id} updated`, user: classRecord.trainerId });
    return classRecord;
  },

  async deleteClass(id) {
    const classRecord = await db.Class.findByPk(id);
    if (!classRecord) {
      throw new NotFoundError('Class not found');
    }

    await classRecord.destroy();
    logInfo({ message: `Class ${id} deleted`, user: classRecord.trainerId });
  },

  async getTrainerSchedules(trainerId) {
    const schedules = await db.ClassSchedule.findAll({
      where: { trainerId },
      include: [
        { model: db.Class },
        { model: db.Gym },
        { model: db.ScheduleAvailableDay },
      ],
    });
    return schedules;
  },

  async createSchedule(data) {
    const { classId, trainerId, gymId, availableDays } = data;
    const classRecord = await db.Class.findByPk(classId);
    if (!classRecord) {
      throw new NotFoundError('Class not found');
    }
    const trainer = await db.User.findByPk(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
      throw new ValidationError('Invalid trainer');
    }
    const gym = await db.Gym.findByPk(gymId);
    if (!gym) {
      throw new NotFoundError('Gym not found');
    }

    const schedule = await db.ClassSchedule.create({
      ...data,
      participants: 0,
      insertDate: new Date(),
      updateDate: new Date(),
    });

    if (availableDays && availableDays.length > 0) {
      const scheduleAvailableDays = availableDays.map((day) => ({
        scheduleId: schedule.id,
        day,
      }));
      await db.ScheduleAvailableDay.bulkCreate(scheduleAvailableDays);
    }

    logInfo({ message: `Schedule for class ${classId} created`, user: trainerId });
    return schedule;
  },

  async updateSchedule(id, data) {
    const schedule = await db.ClassSchedule.findByPk(id);
    if (!schedule) {
      throw new NotFoundError('Schedule not found');
    }

    const { availableDays } = data;
    await schedule.update({
      ...data,
      updateDate: new Date(),
    });

    if (availableDays) {
      await db.ScheduleAvailableDay.destroy({ where: { scheduleId: id } });
      const scheduleAvailableDays = availableDays.map((day) => ({
        scheduleId: id,
        day,
      }));
      await db.ScheduleAvailableDay.bulkCreate(scheduleAvailableDays);
    }

    logInfo({ message: `Schedule ${id} updated`, user: schedule.trainerId });
    return schedule;
  },

  async deleteSchedule(id) {
    const schedule = await db.ClassSchedule.findByPk(id);
    if (!schedule) {
      throw new NotFoundError('Schedule not found');
    }

    await schedule.destroy();
    logInfo({ message: `Schedule ${id} deleted`, user: schedule.trainerId });
  },

  async bookClass(scheduleId, clientId) {
    const schedule = await db.ClassSchedule.findByPk(scheduleId);
    if (!schedule) {
      throw new NotFoundError('Schedule not found');
    }
    if (schedule.participants >= schedule.capacity) {
      throw new ValidationError('Class is full');
    }

    await schedule.update({
      participants: schedule.participants + 1,
      updateDate: new Date(),
    });

    const classRecord = await db.Class.findByPk(schedule.classId);
    await classRecord.update({
      enrolled: classRecord.enrolled + 1,
      updateDate: new Date(),
    });

    logInfo({ message: `Client ${clientId} booked schedule ${scheduleId}`, user: clientId });
    return schedule;
  },
};

export default bookingService;