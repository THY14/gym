import dbConfig from "../config/db.config.js";
import { Sequelize } from "sequelize";
import User from "./user.js";
import Member from "./member.js";
import MembershipPlan from "./membershipPlan.js";
import Trainer from "./trainer.js";
import Payment from "./payment.js";
import Class from "./class.js";
import Booking from "./booking.js";
import Attendance from "./attendance.js";
import Admin from "./admin.js";
const db = {};
const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
      host: dbConfig.HOST,
      dialect: dbConfig.dialect,
      port: dbConfig.PORT,
    }
);
db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.user = User(sequelize, Sequelize);
db.member = Member(sequelize, Sequelize);
db.membershipPlan = MembershipPlan(sequelize, Sequelize);
db.trainer = Trainer(sequelize, Sequelize);
db.payment = Payment(sequelize, Sequelize);
db.class = Class(sequelize, Sequelize);
db.booking = Booking(sequelize, Sequelize);
db.attendance = Attendance(sequelize, Sequelize);
db.admin = Admin(sequelize, Sequelize);
// Define associations if needed

db.admin.belongsTo(db.user, { foreignKey: 'userId' });

db.user.hasOne(db.admin, { foreignKey: 'userId' });
db.user.hasOne(db.member, { foreignKey: 'userId' });
db.user.hasOne(db.trainer, { foreignKey: 'userId' });

db.member.belongsTo(db.user, { foreignKey: 'userId' });
db.member.belongsTo(db.membershipPlan, { foreignKey: 'membershipPlanId' });
db.member.hasMany(db.booking, { foreignKey: 'memberId' });
db.member.hasMany(db.attendance, { foreignKey: 'memberId' });
db.member.hasMany(db.payment, { foreignKey: 'memberId' });
db.member.belongsToMany(db.class, { through: db.attendance, foreignKey: 'memberId' });


db.trainer.belongsTo(db.user, { foreignKey: 'userId' });
db.trainer.hasMany(db.class, { foreignKey: 'trainerId' });
db.trainer.hasMany(db.booking, { foreignKey: 'trainerId' }); 

db.class.hasMany(db.booking, { foreignKey: 'classId' });
db.class.hasMany(db.attendance, { foreignKey: 'classId' });
db.class.belongsTo(db.trainer, { foreignKey: 'trainerId' });
db.class.belongsToMany(db.member, { through: db.attendance, foreignKey: 'classId' });

db.booking.belongsTo(db.member, { foreignKey: 'memberId' });
db.booking.belongsTo(db.class, { foreignKey: 'classId' });
db.booking.belongsTo(db.trainer, { foreignKey: 'trainerId' });
db.booking.hasOne(db.payment, { foreignKey: 'bookingId' });

db.payment.belongsTo(db.member, { foreignKey: 'memberId' });
db.payment.belongsTo(db.booking, { foreignKey: 'bookingId' });
db.payment.belongsTo(db.membershipPlan,{ foreignKey: 'membershipPlanId'});

db.attendance.belongsTo(db.member, { foreignKey: 'memberId' });
db.attendance.belongsTo(db.class, { foreignKey: 'classId' });


db.membershipPlan.hasMany(db.member, { foreignKey: 'membershipPlanId' });
db.membershipPlan.hasMany(db.payment, { foreignKey: 'membershipPlanId' });



// Sync the models with the database
await sequelize.sync({alter: true}); 

export default db;