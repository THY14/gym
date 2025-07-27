import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import authController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', validateRequest('login'), authController.login);
router.post('/register', validateRequest('register'), authController.register);
router.get('/me', authMiddleware, authController.getUser);
router.put('/me', authMiddleware, validateRequest('updateUser'), authController.updateUser);

export default router;