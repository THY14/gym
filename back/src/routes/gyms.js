import express from 'express';
import { authMiddleware, restrictTo } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import gymController from '../controllers/gymController.js';

const router = express.Router();

router.use(authMiddleware, restrictTo('admin'));
router.get('/', gymController.getGyms);
router.post('/', validateRequest('createGym'), gymController.createGym);
router.put('/:id', validateRequest('createGym'), gymController.updateGym);
router.delete('/:id', gymController.deleteGym);

export default router;