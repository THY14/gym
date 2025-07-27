import db from '../models/index.js';
import { NotFoundError } from '../utils/errorHelper.js';
import { logInfo } from '../utils/logger.js';

const membershipPlanService = {
  async getMembershipPlans() {
    const plans = await db.MembershipPlan.findAll();
    return plans;
  },

  async createMembershipPlan(data) {
    const plan = await db.MembershipPlan.create({
      ...data,
      insertDate: new Date(),
      updateDate: new Date(),
    });

    logInfo({ message: `Membership plan ${data.planName} created`, user: 'admin' });
    return plan;
  },

  async updateMembershipPlan(id, data) {
    const plan = await db.MembershipPlan.findByPk(id);
    if (!plan) {
      throw new NotFoundError('Membership plan not found');
    }

    await plan.update({
      ...data,
      updateDate: new Date(),
    });

    logInfo({ message: `Membership plan ${id} updated`, user: 'admin' });
    return plan;
  },

  async deleteMembershipPlan(id) {
    const plan = await db.MembershipPlan.findByPk(id);
    if (!plan) {
      throw new NotFoundError('Membership plan not found');
    }

    await plan.destroy();
    logInfo({ message: `Membership plan ${id} deleted`, user: 'admin' });
  },
};

export default membershipPlanService;