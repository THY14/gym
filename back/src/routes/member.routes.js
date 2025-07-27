import express from 'express';
import { verifyToken } from '../middleware/verifyToken.middleware.js';
import { checkRole } from '../middleware/checkRole.middleware.js';
import db from '../models/index.js';

const router = express.Router();

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of members }
 *       401: { description: Unauthorized }
 */
router.get('/', verifyToken, checkRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const members = await db.Member.findAll();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /members:
 *   post:
 *     summary: Create a new member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: integer }
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               joinDate: { type: string, format: date-time }
 *               status: { type: string, enum: ['active', 'inactive'] }
 *     responses:
 *       201: { description: Member created }
 *       400: { description: Invalid input }
 */
router.post('/', verifyToken, checkRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const member = await db.Member.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /members/{id}:
 *   put:
 *     summary: Update a member
 *     tags: [Members]
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
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               joinDate: { type: string, format: date-time }
 *               status: { type: string, enum: ['active', 'inactive'] }
 *     responses:
 *       200: { description: Member updated }
 *       404: { description: Member not found }
 */
router.put('/:id', verifyToken, checkRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const member = await db.Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    await member.update(req.body);
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /members/{id}:
 *   delete:
 *     summary: Delete a member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Member deleted }
 *       404: { description: Member not found }
 */
router.delete('/:id', verifyToken, checkRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const member = await db.Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    await member.destroy();
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /members/{id}/checkin:
 *   post:
 *     summary: Record a check-in for a member
 *     tags: [Members]
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
 *               classId: { type: integer }
 *               date: { type: string, format: date-time }
 *     responses:
 *       200: { description: Check-in recorded }
 *       404: { description: Member not found }
 */
router.post('/:id/checkin', verifyToken, checkRole(['receptionist']), async (req, res) => {
  try {
    const member = await db.Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    const checkIns = JSON.parse(member.checkIns || '[]');
    checkIns.push({ classId: req.body.classId, date: req.body.date });
    await member.update({ checkIns: JSON.stringify(checkIns) });
    res.json({ message: 'Check-in recorded', checkIns });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;