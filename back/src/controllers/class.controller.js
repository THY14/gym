import db from "../models/index.js";

/**
 * @swagger
 * tags:
 *   - name: Class
 *     description: Class management routes
 */

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Get all classes (with pagination, filtering by trainer, sorting)
 *     tags: [Classes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default: 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page (default: 10)
 *       - in: query
 *         name: trainerId
 *         schema:
 *           type: integer
 *         description: Filter by trainer ID
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort by start time (asc or desc)
 *     responses:
 *       200:
 *         description: List of classes with trainer info
 *       500:
 *         description: Internal server error
 */

export const getAllClasses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { trainerId, sort = 'asc' } = req.query;

    const whereClause = {};
    if (trainerId) {
      whereClause.trainerId = trainerId;
    }

    const classes = await db.class.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.trainer,
          attributes: ['id', 'name', 'email','experience'],
        },
      ],
      order: [['schedule', sort.toLowerCase() === 'desc' ? 'DESC' : 'ASC']],
      limit,
      offset,
    });

    return res.status(200).json({
      totalItems: classes.count,
      totalPages: Math.ceil(classes.count / limit),
      currentPage: page,
      classes: classes.rows,
    });
  } catch (error) {
    console.error("❌ Error fetching classes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * @swagger
 * /classes/{id}:
 *   get:
 *     summary: Get class by ID (with trainer info)
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the class to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved class
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Yoga Basics"
 *                 description:
 *                   type: string
 *                   example: "A beginner-friendly yoga class"
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-08-01T10:00:00Z"
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-08-01T11:00:00Z"
 *                 capacity:
 *                   type: integer
 *                   example: 25
 *                 trainer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 3
 *                     fullName:
 *                       type: string
 *                       example: "Sok Bunleab"
 *                     email:
 *                       type: string
 *                       example: "trainer@example.com"
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal server error
 */

export const getClassById = async (req, res) => {
  const { id } = req.params;

  try {
    const classData = await db.class.findByPk(id, {
      include: [
        {
          model: db.trainer,
          attributes: ['id', 'fullName', 'email'],
        },
      ],
    });

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.status(200).json(classData);
  } catch (error) {
    console.error("❌ Error fetching class by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};




// /**
//  * @swagger
//  * /classes/{id}/book:
//  *   post:
//  *     summary: Book a gym class
//  *     tags: [Bookings]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - name: id
//  *         in: path
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: Class ID to book
//  *     responses:
//  *       201:
//  *         description: Class booked successfully
//  *       400:
//  *         description: Already booked or class is full
//  *       404:
//  *         description: Class not found
//  *       500:
//  *         description: Server error
//  */


// export const bookClasses = async (req, res) => {
//   try {
//     const classId = req.params.id;
//     const memberId = req.user.id; // assumes JWT middleware adds `user` to `req`

//     // 1. Get class
//     const gymClass = await db.class.findByPk(classId, {
//       include: {
//         model: db.booking,
//       },
//     });

//     if (!gymClass) {
//       return res.status(404).json({ message: 'Class not found' });
//     }

//     // 2. Check if class is full
//     const currentBookings = await db.booking.count({ where: { classId } });
//     if (currentBookings >= gymClass.capacity) {
//       return res.status(400).json({ message: 'Class is full' });
//     }

//     // 3. Check if already booked
//     const alreadyBooked = await db.booking.findOne({
//       where: { classId, memberId },
//     });
//     if (alreadyBooked) {
//       return res.status(400).json({ message: 'You already booked this class' });
//     }

//     // 4. Create booking
//     const newBooking = await db.booking.create({
//       memberId,
//       classId,
//       status: 'booked', // optional: you may use 'pending', 'cancelled', etc.
//     });

//     res.status(201).json({
//       message: 'Class booked successfully',
//       booking: newBooking,
//     });
//   } catch (error) {
//     console.error('❌ Error booking class:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// /**
//  * @swagger
//  * /bookings/{id}:
//  *   delete:
//  *     summary: Cancel a booking by ID
//  *     tags: [Bookings]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - name: id
//  *         in: path
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: Booking ID to cancel
//  *     responses:
//  *       200:
//  *         description: Booking canceled successfully
//  *       404:
//  *         description: Booking not found
//  *       500:
//  *         description: Server error
//  */

// export const cancelBooking = async (req, res) => {
//   try {
//     const bookingId = req.params.id;
//     const memberId = req.user.id;

//     const booking = await db.booking.findOne({ where: { id: bookingId, memberId } });

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     await booking.destroy();

//     res.status(200).json({ message: 'Booking canceled successfully' });
//   } catch (error) {
//     console.error('❌ Error cancelling booking:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };


// /**
//  * @swagger
//  * /bookings/current:
//  *   get:
//  *     summary: Get current user's class bookings
//  *     tags: [Bookings]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of current bookings
//  *       500:
//  *         description: Server error
//  */
// export const getCurrentBookings = async (req, res) => {
//   try {
//     const memberId = req.user.id;

//     const bookings = await db.booking.findAll({
//       where: { memberId },
//       include: [{ model: db.class }],
//     });

//     res.status(200).json({ bookings });
//   } catch (error) {
//     console.error('❌ Error fetching bookings:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };



// /**
//  * @swagger
//  * /bookings/history:
//  *   get:
//  *     summary: Get booking history with pagination
//  *     tags: [Bookings]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *         description: Page number for pagination
//  *     responses:
//  *       200:
//  *         description: Booking history returned successfully
//  *       500:
//  *         description: Server error
//  */
// export const getBookingHistory = async (req, res) => {
//   try {
//     const memberId = req.user.id;
//     const page = parseInt(req.query.page) || 1;
//     const limit = 5;
//     const offset = (page - 1) * limit;

//     const { rows, count } = await db.booking.findAndCountAll({
//       where: { memberId },
//       include: [{ model: db.class }],
//       limit,
//       offset,
//       order: [['createdAt', 'DESC']],
//     });

//     res.status(200).json({
//       total: count,
//       page,
//       totalPages: Math.ceil(count / limit),
//       bookings: rows,
//     });
//   } catch (error) {
//     console.error('❌ Error fetching booking history:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };






