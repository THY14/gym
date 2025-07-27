import express from 'express';
import { authMiddleware, restrictTo } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import trainerController from '../controllers/trainerController.js';

const router = express.Router();

router.use(authMiddleware, restrictTo('trainer'));
router.get('/clients', trainerController.getClients);
router.post('/clients', validateRequest('createClient'), trainerController.createClient);
router.put('/clients/:id', validateRequest('updateClient'), trainerController.updateClient);
router.delete('/clients/:id', trainerController.deleteClient);

export default router;