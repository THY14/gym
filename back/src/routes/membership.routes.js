import express from 'express';
import { verifyToken, checkRole } from '../middleware/index.js';
import {
  createMembership,
  getAllMembership,
  getMembershipById,
  updateMembershipById,
  deleteMembershipById,
  purchaseMembership,
} from '../controllers/membershipPlan.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MembershipPlan
 *   description: Membership Plan management routes
 */

/**
 * @swagger
 * /memberships:
 *   post:
 *     summary: Create a new membership plan
 *     tags: [MembershipPlan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planName
 *               - duration
 *               - price
 *             properties:
 *               planName:
 *                 type: string
 *               duration:
 *                 type: integer
 *                 description: Duration in months
 *               price:
 *                 type: number
 *               benefits:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Membership plan created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/', verifyToken, checkRole(['admin', 'receptionist']), createMembership);

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
 *                   planName:
 *                     type: string
 *                   duration:
 *                     type: integer
 *                   price:
 *                     type: number
 *                   benefits:
 *                     type: string
 *                   status:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllMembership);

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
 *         description: The ID of the membership plan
 *     responses:
 *       200:
 *         description: Membership plan details
 *       404:
 *         description: Membership plan not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getMembershipById);

/**
 * @swagger
 * /memberships/{id}:
 *   put:
 *     summary: Update a membership plan by ID
 *     tags: [MembershipPlan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the membership plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planName:
 *                 type: string
 *               duration:
 *                 type: integer
 *               price:
 *                 type: number
 *               benefits:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Membership plan updated successfully
 *       404:
 *         description: Membership plan not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', verifyToken, checkRole(['admin', 'receptionist']), updateMembershipById);

/**
 * @swagger
 * /memberships/{id}:
 *   delete:
 *     summary: Delete a membership plan by ID
 *     tags: [MembershipPlan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the membership plan
 *     responses:
 *       200:
 *         description: Membership plan deleted successfully
 *       404:
 *         description: Membership plan not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', verifyToken, checkRole(['admin']), deleteMembershipById);

/**
 * @swagger
 * /memberships/{id}/payment:
 *   post:
 *     summary: Purchase a membership plan
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
 *                 enum: [credit_card, cash]
 *               status:
 *                 type: string
 *                 enum: [paid, pending, failed]
 *     responses:
 *       201:
 *         description: Membership purchased successfully
 *       404:
 *         description: Membership plan or member not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/payment', verifyToken, checkRole(['member']), purchaseMembership);

export default router;