import express from 'express';
import { authMiddleware, restrictTo } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import membershipPlanController from '../controllers/membershipPlanController.js';

const router = express.Router();

router.get('/', authMiddleware, restrictTo('admin', 'member'), membershipPlanController.getMembershipPlans);
router.post('/', authMiddleware, restrictTo('admin'), validateRequest('createMembershipPlan'), membershipPlanController.createMembershipPlan);
router.put('/:id', authMiddleware, restrictTo('admin'), validateRequest('createMembershipPlan'), membershipPlanController.updateMembershipPlan);
router.delete('/:id', authMiddleware, restrictTo('admin'), membershipPlanController.deleteMembershipPlan);

export default router;