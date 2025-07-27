import express from 'express';
import { authMiddleware, restrictTo } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import checkInController from '../controllers/checkInController.js';

const router = express.Router();

router.get('/', authMiddleware, restrictTo('member', 'receptionist'), checkInController.getCheckIns);
router.post('/', authMiddleware, restrictTo('receptionist'), validateRequest('createCheckIn'), checkInController.createCheckIn);

export default router;