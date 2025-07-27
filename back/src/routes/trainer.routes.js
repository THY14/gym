import express from 'express';
import { verifyToken } from '../middleware/verifyToken.middleware.js';
import { checkRole } from '../middleware/checkRole.middleware.js';
import db from '../models/index.js';

const router = express.Router();

/**
 * @swagger
 * /trainers:
 *   get:
 *     summary: Get all trainers
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of trainers }
 *       401: { description: Unauthorized }
 */
router.get('/', verifyToken, checkRole(['admin', 'trainer', 'receptionist']), async (req, res) => {
  try {
    const trainers = await db.Trainer.findAll();
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /trainers:
 *   post:
 *     summary: Create a new trainer
 *     tags: [Trainers]
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
 *               specialization: { type: string, enum: ['yoga', 'weightlifting', 'cardio', 'pilates'] }
 *               status: { type: string, enum: ['active', 'inactive'] }
 *     responses:
 *       201: { description: Trainer created }
 *       400: { description: Invalid input }
 */
router.post('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const trainer = await db.Trainer.create(req.body);
    res.status(201).json(trainer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /trainers/{id}:
 *   put:
 *     summary: Update a trainer
 *     tags: [Trainers]
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
 *               specialization: { type: string, enum: ['yoga', 'weightlifting', 'cardio', 'pilates'] }
 *               status: { type: string, enum: ['active', 'inactive'] }
 *     responses:
 *       200: { description: Trainer updated }
 *       404: { description: Trainer not found }
 */
router.put('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const trainer = await db.Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });
    await trainer.update(req.body);
    res.json(trainer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /trainers/{id}:
 *   delete:
 *     summary: Delete a trainer
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Trainer deleted }
 *       404: { description: Trainer not found }
 */
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const trainer = await db.Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ error: 'Trainer not found' });
    await trainer.destroy();
    res.json({ message: 'Trainer deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;