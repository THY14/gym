import express from 'express';
import { authMiddleware, restrictTo } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import paymentController from '../controllers/paymentController.js';

const router = express.Router();

router.get('/', authMiddleware, restrictTo('member', 'receptionist'), paymentController.getPayments);
router.get('/earnings', authMiddleware, restrictTo('trainer'), paymentController.getTrainerEarnings);
router.post('/', authMiddleware, restrictTo('receptionist'), validateRequest('createPayment'), paymentController.createPayment);

export default router;