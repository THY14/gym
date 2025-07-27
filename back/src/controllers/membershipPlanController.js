import membershipPlanService from '../services/membershipPlanService.js';
import { sendSuccessResponse } from '../utils/responseHelper.js';

const membershipPlanController = {
  async getMembershipPlans(req, res, next) {
    try {
      const plans = await membershipPlanService.getMembershipPlans();
      sendSuccessResponse(res, 200, plans);
    } catch (error) {
      next(error);
    }
  },

  async createMembershipPlan(req, res, next) {
    try {
      const plan = await membershipPlanService.createMembershipPlan(req.body);
      sendSuccessResponse(res, 201, plan, 'Membership plan created');
    } catch (error) {
      next(error);
    }
  },

  async updateMembershipPlan(req, res, next) {
    try {
      const plan = await membershipPlanService.updateMembershipPlan(req.params.id, req.body);
      sendSuccessResponse(res, 200, plan, 'Membership plan updated');
    } catch (error) {
      next(error);
    }
  },

  async deleteMembershipPlan(req, res, next) {
    try {
      await membershipPlanService.deleteMembershipPlan(req.params.id);
      sendSuccessResponse(res, 200, null, 'Membership plan deleted');
    } catch (error) {
      next(error);
    }
  },
};

export default membershipPlanController;