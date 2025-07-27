import express from 'express';
import { verifyToken } from '../middleware/verifyToken.middleware.js';
import { checkRole } from '../middleware/checkRole.middleware.js';
import db from '../models/index.js';

const router = express.Router();

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of bookings }
 *       401: { description: Unauthorized }
 */
router.get('/', verifyToken, checkRole(['admin', 'receptionist', 'trainer']), async (req, res) => {
  try {
    const bookings = await db.Booking.findAll();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId: { type: integer }
 *               memberId: { type: integer }
 *               trainerId: { type: integer }
 *               bookingDate: { type: string, format: date-time }
 *               status: { type: string, enum: ['confirmed', 'pending', 'cancelled'] }
 *     responses:
 *       201: { description: Booking created }
 *       400: { description: Invalid input }
 */
router.post('/', verifyToken, checkRole(['receptionist', 'member']), async (req, res) => {
  try {
    const booking = await db.Booking.create(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update a booking
 *     tags: [Bookings]
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
 *               memberId: { type: integer }
 *               trainerId: { type: integer }
 *               bookingDate: { type: string, format: date-time }
 *               status: { type: string, enum: ['confirmed', 'pending', 'cancelled'] }
 *     responses:
 *       200: { description: Booking updated }
 *       404: { description: Booking not found }
 */
router.put('/:id', verifyToken, checkRole(['receptionist', 'member']), async (req, res) => {
  try {
    const booking = await db.Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    await booking.update(req.body);
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Booking deleted }
 *       404: { description: Booking not found }
 */
router.delete('/:id', verifyToken, checkRole(['receptionist', 'member']), async (req, res) => {
  try {
    const booking = await db.Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    await booking.destroy();
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;