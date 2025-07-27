import db from '../models/index.js';

/**
 * Create a new membership plan (admin/receptionist only)
 */
export const createMembership = async (req, res) => {
  const { planName, duration, price, benefits, status } = req.body;

  try {
    if (!planName || !duration || !price) {
      return res.status(400).json({ message: 'Plan name, duration, and price are required' });
    }

    const membership = await db.MembershipPlan.create({
      planName,
      duration,
      price,
      benefits,
      status: status || 'active',
    });

    return res.status(201).json({
      message: 'Membership plan created successfully',
      data: membership,
    });
  } catch (error) {
    console.error('Error creating membership plan:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all membership plans
 */
export const getAllMembership = async (req, res) => {
  try {
    const memberships = await db.MembershipPlan.findAll();
    return res.status(200).json(memberships);
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a membership plan by ID
 */
export const getMembershipById = async (req, res) => {
  const { id } = req.params;

  try {
    const membership = await db.MembershipPlan.findByPk(id);
    if (!membership) {
      return res.status(404).json({ message: 'Membership plan not found' });
    }
    return res.status(200).json(membership);
  } catch (error) {
    console.error('Error fetching membership plan:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update a membership plan by ID (admin/receptionist only)
 */
export const updateMembershipById = async (req, res) => {
  const { id } = req.params;
  const { planName, duration, price, benefits, status } = req.body;

  try {
    const membership = await db.MembershipPlan.findByPk(id);
    if (!membership) {
      return res.status(404).json({ message: 'Membership plan not found' });
    }

    await membership.update({
      planName: planName || membership.planName,
      duration: duration || membership.duration,
      price: price || membership.price,
      benefits: benefits || membership.benefits,
      status: status || membership.status,
    });

    return res.status(200).json({
      message: 'Membership plan updated successfully',
      data: membership,
    });
  } catch (error) {
    console.error('Error updating membership plan:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a membership plan by ID (admin only)
 */
export const deleteMembershipById = async (req, res) => {
  const { id } = req.params;

  try {
    const membership = await db.MembershipPlan.findByPk(id);
    if (!membership) {
      return res.status(404).json({ message: 'Membership plan not found' });
    }

    await membership.destroy();
    return res.status(200).json({ message: 'Membership plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting membership plan:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Purchase a membership plan (member only)
 */
export const purchaseMembership = async (req, res) => {
  const { id: membershipPlanId } = req.params;
  const userId = req.user?.id; // From verifyToken middleware
  const { method, status } = req.body;

  try {
    const membership = await db.MembershipPlan.findByPk(membershipPlanId);
    if (!membership) {
      return res.status(404).json({ message: 'Membership plan not found' });
    }

    const member = await db.Member.findOne({ where: { userId } });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const payment = await db.Payment.create({
      memberId: member.id,
      membershipPlanId,
      amount: membership.price,
      date: new Date(),
      method: method || 'credit_card',
      status: status || 'paid',
    });

    await member.update({ membershipPlanId });

    return res.status(201).json({
      message: 'Membership purchased successfully',
      payment,
    });
  } catch (error) {
    console.error('Error purchasing membership:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};