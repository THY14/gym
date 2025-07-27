import express from 'express';
import { verifyToken } from '../middleware/verifyToken.middleware.js';
import { checkRole } from '../middleware/checkRole.middleware.js';
import db from '../models/index.js';

const router = express.Router();

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of payments }
 *       401: { description: Unauthorized }
 */
router.get('/', verifyToken, checkRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const payments = await db.Payment.findAll();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId: { type: integer }
 *               bookingId: { type: integer }
 *               amount: { type: number }
 *               date: { type: string, format: date-time }
 *               method: { type: string, enum: ['credit_card', 'cash'] }
 *               status: { type: string, enum: ['paid', 'pending', 'failed'] }
 *     responses:
 *       201: { description: Payment created }
 *       400: { description: Invalid input }
 */
router.post('/', verifyToken, checkRole(['receptionist']), async (req, res) => {
  try {
    const payment = await db.Payment.create(req.body);
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Update a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId: { type: integer }
 *               bookingId: { type: integer }
 *               amount: { type: number }
 *               date: { type: string, format: date-time }
 *               method: { type: string, enum: ['credit_card', 'cash'] }
 *               status: { type: string, enum: ['paid', 'pending', 'failed'] }
 *     responses:
 *       200: { description: Payment updated }
 *       404: { description: Payment not found }
 */
router.put('/:id', verifyToken, checkRole(['receptionist']), async (req, res) => {
  try {
    const payment = await db.Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    await payment.update(req.body);
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     summary: Delete a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Payment deleted }
 *       404: { description: Payment not found }
 */
router.delete('/:id', verifyToken, checkRole(['receptionist']), async (req, res) => {
  try {
    const payment = await db.Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    await payment.destroy();
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;