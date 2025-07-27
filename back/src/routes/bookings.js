import express from 'express';
import { authMiddleware, restrictTo } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import bookingController from '../controllers/bookingController.js';

const router = express.Router();

router.get('/classes', authMiddleware, restrictTo('trainer', 'member'), bookingController.getTrainerClasses);
router.post('/classes', authMiddleware, restrictTo('trainer'), validateRequest('createClass'), bookingController.createClass);
router.put('/classes/:id', authMiddleware, restrictTo('trainer'), validateRequest('createClass'), bookingController.updateClass);
router.delete('/classes/:id', authMiddleware, restrictTo('trainer'), bookingController.deleteClass);
router.get('/schedules', authMiddleware, restrictTo('trainer', 'member'), bookingController.getTrainerSchedules);
router.post('/schedules', authMiddleware, restrictTo('trainer'), validateRequest('createSchedule'), bookingController.createSchedule);
router.put('/schedules/:id', authMiddleware, restrictTo('trainer'), validateRequest('createSchedule'), bookingController.updateSchedule);
router.delete('/schedules/:id', authMiddleware, restrictTo('trainer'), bookingController.deleteSchedule);
router.post('/schedules/:id/book', authMiddleware, restrictTo('member', 'receptionist'), bookingController.bookClass);

export default router;