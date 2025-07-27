import express from 'express';
import sequelize from './config/database.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import authRoutes from './routes/auth.js';
import trainerRoutes from './routes/trainers.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import messageRoutes from './routes/messages.js';
import gymRoutes from './routes/gyms.js';
import membershipPlanRoutes from './routes/membershipPlans.js';
import checkInRoutes from './routes/checkIns.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/membershipPlans', membershipPlanRoutes);
app.use('/api/checkIns', checkInRoutes);
app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});