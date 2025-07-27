import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Import all models
import User from './User.js';
import Client from './Client.js';
import WorkoutPlan from './WorkoutPlan.js';
import Class from './Class.js';
import ClassAvailableDay from './ClassAvailableDay.js';
import ClassSchedule from './ClassSchedule.js';
import ScheduleAvailableDay from './ScheduleAvailableDay.js';
import TrainingSession from './TrainingSession.js';
import TrainingSessionClient from './TrainingSessionClient.js';
import SessionTrainingDay from './SessionTrainingDay.js';
import Payment from './Payment.js';
import Gym from './Gym.js';
import Message from './Message.js';
import MembershipPlan from './MembershipPlan.js';
import CheckIn from './CheckIn.js';

// Initialize DB object
const db = {};

// Initialize models
db.User = User(sequelize, DataTypes);
db.Client = Client(sequelize, DataTypes);
db.WorkoutPlan = WorkoutPlan(sequelize, DataTypes);
db.Class = Class(sequelize, DataTypes);
db.ClassAvailableDay = ClassAvailableDay(sequelize, DataTypes);
db.ClassSchedule = ClassSchedule(sequelize, DataTypes);
db.ScheduleAvailableDay = ScheduleAvailableDay(sequelize, DataTypes);
db.TrainingSession = TrainingSession(sequelize, DataTypes);
db.TrainingSessionClient = TrainingSessionClient(sequelize, DataTypes);
db.SessionTrainingDay = SessionTrainingDay(sequelize, DataTypes);
db.Payment = Payment(sequelize, DataTypes);
db.Gym = Gym(sequelize, DataTypes);
db.Message = Message(sequelize, DataTypes);
db.MembershipPlan = MembershipPlan(sequelize, DataTypes);
db.CheckIn = CheckIn(sequelize, DataTypes);

// Shared Day model (for ENUM usage in many-to-many relations)
db.Day = sequelize.define('Day', {
  day: {
    type: DataTypes.ENUM(
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ),
    allowNull: false,
  },
});

// ================== Associations ==================

// User & Client
db.User.hasMany(db.Client, { foreignKey: 'trainerId', onDelete: 'CASCADE' });
db.Client.belongsTo(db.User, { foreignKey: 'trainerId', as: 'Trainer' });
db.Client.belongsTo(db.User, { foreignKey: 'userId', as: 'Member' });

// Client & WorkoutPlan + Membership
db.Client.belongsTo(db.WorkoutPlan, { foreignKey: 'workoutPlanId', onDelete: 'SET NULL' });
db.Client.belongsTo(db.MembershipPlan, { foreignKey: 'membershipPlanId', onDelete: 'SET NULL' });

// User & Class
db.User.hasMany(db.Class, { foreignKey: 'trainerId', onDelete: 'CASCADE' });
db.Class.belongsTo(db.User, { foreignKey: 'trainerId', as: 'Trainer' });

// Class & Schedule
db.Class.hasMany(db.ClassSchedule, { foreignKey: 'classId', onDelete: 'CASCADE' });
db.ClassSchedule.belongsTo(db.Class, { foreignKey: 'classId' });

// User & ClassSchedule
db.User.hasMany(db.ClassSchedule, { foreignKey: 'trainerId', onDelete: 'CASCADE' });
db.ClassSchedule.belongsTo(db.User, { foreignKey: 'trainerId', as: 'Trainer' });

// User & TrainingSession
db.User.hasMany(db.TrainingSession, { foreignKey: 'trainerId', onDelete: 'CASCADE' });
db.TrainingSession.belongsTo(db.User, { foreignKey: 'trainerId', as: 'Trainer' });

// Client & TrainingSession (one-to-many)
db.Client.hasMany(db.TrainingSession, { foreignKey: 'clientId', onDelete: 'SET NULL' });
db.TrainingSession.belongsTo(db.Client, { foreignKey: 'clientId' });

// TrainingSession & Client (many-to-many)
db.TrainingSession.belongsToMany(db.Client, {
  through: db.TrainingSessionClient,
  foreignKey: 'sessionId',
});
db.Client.belongsToMany(db.TrainingSession, {
  through: db.TrainingSessionClient,
  foreignKey: 'clientId',
});

// Gym Associations
db.Class.belongsTo(db.Gym, { foreignKey: 'gymId' });
db.ClassSchedule.belongsTo(db.Gym, { foreignKey: 'gymId' });
db.TrainingSession.belongsTo(db.Gym, { foreignKey: 'gymId' });
db.Gym.hasMany(db.CheckIn, { foreignKey: 'gymId' });

// Payments
db.Client.hasMany(db.Payment, { foreignKey: 'clientId' });
db.Class.hasMany(db.Payment, { foreignKey: 'classId' });
db.TrainingSession.hasMany(db.Payment, { foreignKey: 'sessionId' });
db.MembershipPlan.hasMany(db.Payment, { foreignKey: 'membershipPlanId' });

// Messaging
db.User.hasMany(db.Message, { foreignKey: 'senderId' });
db.Client.hasMany(db.Message, { foreignKey: 'recipientId' });

// Check-Ins
db.Client.hasMany(db.CheckIn, { foreignKey: 'clientId' });

// Days of Availability (many-to-many with Day model)
db.Class.belongsToMany(db.Day, {
  through: db.ClassAvailableDay,
  foreignKey: 'classId',
});
db.ClassSchedule.belongsToMany(db.Day, {
  through: db.ScheduleAvailableDay,
  foreignKey: 'scheduleId',
});
db.TrainingSession.belongsToMany(db.Day, {
  through: db.SessionTrainingDay,
  foreignKey: 'sessionId',
});

// Finalize
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;