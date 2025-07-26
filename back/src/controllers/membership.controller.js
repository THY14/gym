import db from "../models/index.js";


/**
 * @swagger
 * tags:
 *   - name: Membership Plan
 *    description: Membership Plan management routes
 */


/**
 * @swagger
 * /memberships:
 *   get:
 *     summary: Get all membership plans
 *     tags: [MembershipPlan]
 *     responses:
 *       200:
 *         description: A list of membership plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   duration:
 *                     type: string
 *                   price:
 *                     type: number
 *                   benefits:
 *                     type: string 
 *       500:
 *         description: Internal server error
 */

export const getAllMembership = async (req,res) => {
    try {
        const memberships = await db.membershipPlan.findAll();
        return res.status(201).json(memberships);
    } catch (error) {
        console.error("Error fetching membership plans:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
/**
 * @swagger
 * /memberships/{id}:
 *   get:
 *     summary: Get a membership plan by ID
 *     tags: [MembershipPlan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the membership plan to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved membership plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 duration:
 *                   type: string
 *                 price:
 *                   type: number
 *       404:
 *         description: Membership plan not found
 *       500:
 *         description: Internal server error
 */

export const getMembershipById = async (req, res) => {
  const id = req.params.id;

  try {
    const membership = await db.membershipPlan.findByPk(id);

    if (!membership) {
      return res.status(404).json({ message: "Membership plan not found" });
    }

    return res.status(200).json(membership);
  } catch (error) {
    console.error("Error fetching membership plan:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /memberships/{id}:
 *   put:
 *     summary: Update a membership plan by ID
 *     tags: [MembershipPlan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the membership plan to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - duration
 *               - price
 *               - benefits
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the membership plan
 *               duration:
 *                 type: string
 *                 description: Duration of the membership (e.g., "1 month")
 *               price:
 *                 type: number
 *                 description: Price of the membership
 *               benefits:
 *                 type: string 
 *                 description:  benefits of the membership
 *     responses:
 *       200:
 *         description: Membership plan updated successfully
 *       404:
 *         description: Membership plan not found
 *       500:
 *         description: Internal server error
 */

export const updateMembershipById = async (req, res) => {
  const id = req.params.id;
  const { name, duration, price, benefits } = req.body;

  try {
    const membership = await db.membershipPlan.findByPk(id);
    if (!membership) {
      return res.status(404).json({ message: "Membership plan not found" });
    }

    membership.name = name || membership.name;
    membership.duration = duration || membership.duration;
    membership.price = price || membership.price;
    membership.benefits = benefits || membership.benefits;

    await membership.save();

    return res.status(200).json({
      message: "Membership plan updated successfully",
      data: membership
    });
  } catch (error) {
    console.error("Error updating membership plan:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /memberships/{id}:
 *   delete:
 *     summary: Delete a membership plan by ID
 *     tags: [MembershipPlan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the membership plan to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Membership plan deleted successfully
 *       404:
 *         description: Membership plan not found
 *       500:
 *         description: Internal server error
 */

export const deleteMembershipById = async (req, res) => {
  const id = req.params.id;

  try {
    const membership = await db.membershipPlan.findByPk(id);

    if (!membership) {
      return res.status(404).json({ message: "Membership plan not found" });
    }

    await membership.destroy();

    return res.status(200).json({ message: "Membership plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting membership plan:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/memberships/{id}/payment:
 *   post:
 *     summary: Payment a membership plan
 *     tags: [MembershipPlan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Membership plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               method:
 *                 type: string
 *                 example: credit_card
 *               status:
 *                 type: string
 *                 example: completed
 *     responses:
 *       201:
 *         description: Membership plan purchased successfully
 *       404:
 *         description: Membership plan not found
 *       500:
 *         description: Internal server error
 */

export const purchaseMembership = async (req, res) => {
  const membershipId = req.params.id;
  const memberId = req.user?.id; // Set by your JWT middleware
  const { method, status } = req.body;

  try {
    const membership = await db.membershipPlan.findByPk(membershipId);
    if (!membership) {
      return res.status(404).json({ message: "Membership plan not found" });
    }

    const payment = await db.payment.create({
      memberId,
      membershipPlanId: membershipId,
      amount: membership.price,
      date: new Date(),
      method: method || "credit_card",
      status: status || "completed",
    });

    return res.status(201).json({
      message: "Membership purchased successfully",
      payment,
    });
  } catch (error) {
    console.error("❌ Error purchasing membership:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


