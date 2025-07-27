import express from 'express';
import { verifyToken } from '../middleware/verifyToken.middleware.js';
import { checkRole } from '../middleware/checkRole.middleware.js';
import db from '../models/index.js';

const router = express.Router();

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Get all classes
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of classes }
 *       401: { description: Unauthorized }
 */
router.get('/', verifyToken, checkRole(['admin', 'trainer', 'receptionist', 'member']), async (req, res) => {
  try {
    const classes = await db.Class.findAll();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /classes:
 *   post:
 *     summary: Create a new class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               schedule: { type: string, format: date-time }
 *               status: { type: string, enum: ['active', 'inactive'] }
 *               trainerId: { type: integer }
 *     responses:
 *       201: { description: Class created }
 *       400: { description: Invalid input }
 */
router.post('/', verifyToken, checkRole(['admin', 'trainer']), async (req, res) => {
  try {
    const classData = await db.Class.create(req.body);
    res.status(201).json(classData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /classes/{id}:
 *   put:
 *     summary: Update a class
 *     tags: [Classes]
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
 *               description: { type: string }
 *               schedule: { type: string, format: date-time }
 *               status: { type: string, enum: ['active', 'inactive'] }
 *               trainerId: { type: integer }
 *     responses:
 *       200: { description: Class updated }
 *       404: { description: Class not found }
 */
router.put('/:id', verifyToken, checkRole(['admin', 'trainer']), async (req, res) => {
  try {
    const classData = await db.Class.findByPk(req.params.id);
    if (!classData) return res.status(404).json({ error: 'Class not found' });
    await classData.update(req.body);
    res.json(classData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /classes/{id}:
 *   delete:
 *     summary: Delete a class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Class deleted }
 *       404: { description: Class not found }
 */
router.delete('/:id', verifyToken, checkRole(['admin', 'trainer']), async (req, res) => {
  try {
    const classData = await db.Class.findByPk(req.params.id);
    if (!classData) return res.status(404).json({ error: 'Class not found' });
    await classData.destroy();
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;