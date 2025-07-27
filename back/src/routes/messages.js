import express from 'express';
import { authMiddleware, restrictTo } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import messageController from '../controllers/messageController.js';

const router = express.Router();

router.get('/', authMiddleware, restrictTo('trainer', 'member'), messageController.getMessages);
router.post('/', authMiddleware, restrictTo('trainer', 'member'), validateRequest('sendMessage'), messageController.sendMessage);

export default router;