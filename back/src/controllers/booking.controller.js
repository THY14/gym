import db from '../models/index.js';

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await db.Booking.findAll();
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBooking = async (req, res) => {
  try {
    const booking = await db.Booking.create(req.body);
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const booking = await db.Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    await booking.update(req.body);
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await db.Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    await booking.destroy();
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};

export const bookClasses = async (req, res) => {
  try {
    const classId = req.params.id;
    const memberId = req.user.id;

    const gymClass = await db.Class.findByPk(classId);
    if (!gymClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const alreadyBooked = await db.Booking.findOne({ where: { classId, memberId } });
    if (alreadyBooked) {
      return res.status(400).json({ message: 'You already booked this class' });
    }

    const newBooking = await db.Booking.create({
      memberId,
      classId,
      trainerId: gymClass.trainerId,
      bookingDate: new Date(),
      status: 'pending',
    });

    res.status(201).json({ message: 'Class booked successfully', booking: newBooking });
  } catch (error) {
    console.error('Error booking class:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const memberId = req.user.id;

    const booking = await db.Booking.findOne({ where: { id: bookingId, memberId } });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await booking.destroy();
    res.status(200).json({ message: 'Booking canceled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCurrentBookings = async (req, res) => {
  try {
    const memberId = req.user.id;

    const bookings = await db.Booking.findAll({
      where: { memberId },
      include: [{ model: db.Class }],
    });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBookingHistory = async (req, res) => {
  try {
    const memberId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const { rows, count } = await db.Booking.findAndCountAll({
      where: { memberId },
      include: [{ model: db.Class }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      bookings: rows,
    });
  } catch (error) {
    console.error('Error fetching booking history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};