
import { faker } from '@faker-js/faker';

import db from './models/index.js';
import dotenv from 'dotenv';


dotenv.config();
console.log("Using Faker version:", faker.version || "unknown");


const NUM_USERS = 100;
const NUM_MEMBERS = 70;
const NUM_TRAINERS = 30;
const NUM_MEMBERSHIP_PLANS = 5;
const NUM_CLASSES = 20;
const NUM_BOOKINGS = 200;
const NUM_PAYMENTS = 150;
const NUM_ATTENDANCES = 300;
const NUM_ADMIN = 1;



async function seed() {
  try {
    console.log("🔁 Connecting to DB...");
    await db.sequelize.sync({ force: true });
    
    // ====== SEED USERS ======
    const users = [];
    for (let i = 0; i < NUM_USERS; i++) {
      users.push({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
    }
    await db.user.bulkCreate(users);
    console.log(`✅ ${NUM_USERS} users created.`);

    //====== SEED MEMBERSHIP PLANS ======
    const membershipPlans = [];
    for (let i = 0; i < NUM_MEMBERSHIP_PLANS; i++) {
      membershipPlans.push({
        planName: faker.helpers.arrayElement(['Basic', 'Premium', 'VIP']),
        description: faker.lorem.sentence(),
        price: faker.number.int({ min: 10, max: 100 }),
        duration: faker.number.int({ min: 1, max: 12 }), // in months
        benefits: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(['active', 'inactive']),
      });
    }
    await db.membershipPlan.bulkCreate(membershipPlans);
    console.log(`✅ ${NUM_MEMBERSHIP_PLANS} membership plans created.`);

    // ====== SEED MEMBERS ======
    const members = [];
    for (let i = 0; i < NUM_MEMBERS; i++) {
      members.push({
        userId: faker.number.int({ min: 1, max: NUM_USERS }),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        membershipType: faker.helpers.arrayElement(['basic', 'premium', 'vip']),
        membershipPlanId: faker.number.int({ min: 1, max: NUM_MEMBERSHIP_PLANS }),
        joinDate: faker.date.past(),
        status: faker.helpers.arrayElement(['active', 'inactive']),
      });
    }
    await db.member.bulkCreate(members);
    console.log(`✅ ${NUM_MEMBERS} members created.`);

//     // ====== SEED ADMIN ======
    const admins = [];
    for (let i = 0; i < NUM_ADMIN; i++) {
      admins.push({
        userId: faker.number.int({ min: 1, max: NUM_USERS }),
        role: 'admin',
        permissions: JSON.stringify(['manage_users', 'manage_classes', 'view_reports']),
      });
    }
    await db.admin.bulkCreate(admins);
    console.log(`✅ ${NUM_ADMIN} admin created.`);
//    
//     // ====== SEED TRAINERS ======
    const trainers = [];
    for (let i = 0; i < NUM_TRAINERS; i++) {
      trainers.push({
        userId: faker.number.int({ min: 1, max: NUM_USERS }),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        specialization: faker.helpers.arrayElement(['yoga', 'weightlifting', 'cardio', 'pilates', 'crossfit', 'nutrition']),
        experience: faker.number.int({ min: 1, max: 20 }),
        status: faker.helpers.arrayElement(['active', 'inactive']),
      });
    }
    await db.trainer.bulkCreate(trainers);
    console.log(`✅ ${NUM_TRAINERS} trainers created.`);

     // ====== SEED CLASSES ======
  const classes = [];
  function generateSchedule() {
    const day = faker.helpers.arrayElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    const startHour = faker.number.int({ min: 6, max: 18 });
    const startMin = faker.helpers.arrayElement([0, 30]);
    const duration = faker.helpers.arrayElement([30, 60, 90]);
    const end = new Date(0, 0, 0, startHour, startMin + duration);
    if (end.getHours() > 23) {
      end.setHours(23, 59);
    }
    const format = (h, m) => h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0');
    return `${day} Start From:${format(startHour, startMin)} - ${format(end.getHours(), end.getMinutes())}`;
  }

    

  for (let i = 0; i < NUM_CLASSES; i++) {
    classes.push({
      className: faker.helpers.arrayElement(['Yoga', 'Zumba', 'HIIT', 'Spin', 'Pilates']),
      description: faker.lorem.sentence(),
      schedule: generateSchedule(),
      price: faker.number.int({ min: 10, max: 100 }),
      catagory: faker.helpers.arrayElement(['yoga', 'strength training', 'cardio']),
      status: faker.helpers.arrayElement(['active', 'inactive']),
      capacity: faker.number.int({ min: 10, max: 30 }),
      trainerId: faker.number.int({ min: 1, max: NUM_TRAINERS }),
    });
  }
  await db.class.bulkCreate(classes);
  console.log(`✅ ${NUM_CLASSES} classes created.`);

//   // ====== SEED BOOKINGS ======
  const bookings = [];
  for (let i = 0; i < NUM_BOOKINGS; i++) {
    bookings.push({
      bookingType: faker.helpers.arrayElement(['class', 'personal','training', 'membership']),
      bookingDate: faker.date.past(),
      status: faker.helpers.arrayElement(['confirmed', 'cancelled', 'pending']),
      note: faker.lorem.sentence(),
      classId: faker.number.int({ min: 1, max: NUM_CLASSES }),
      trainerId: faker.number.int({ min: 1, max: NUM_TRAINERS}),
      memberId: faker.number.int({ min: 1, max: NUM_MEMBERS }),
      
    })
  }
  await db.booking.bulkCreate(bookings);
  console.log(`✅ ${NUM_BOOKINGS} bookings created.`);

//   // ====== SEED PAYMENTS ======
  const payments = [];
  for (let i = 0; i < NUM_PAYMENTS; i++) {
    payments.push({
      memberId: faker.number.int({ min: 1, max: NUM_MEMBERS }),
      bookingId: faker.number.int({ min: 1, max: NUM_BOOKINGS }),
      membershipPlanId: faker.number.int({ min: 1, max: NUM_MEMBERSHIP_PLANS}),
      amount: faker.finance.amount(10, 200, 2), // amount in dollars
      date: faker.date.past(),
      method: faker.helpers.arrayElement(['credit_card', 'paypal', 'cash']),
      status: faker.helpers.arrayElement(['paid', 'failed']),
    });
  }
  await db.payment.bulkCreate(payments);
  console.log(`✅ ${NUM_PAYMENTS} payments created.`);

//   // ====== SEED ATTENDANCES ======
  const attendances = [];
  for (let i = 0; i < NUM_ATTENDANCES; i++) {
    attendances.push({
      memberId: faker.number.int({ min: 1, max: NUM_MEMBERS }),
      classId: faker.number.int({ min: 1, max: NUM_CLASSES }),
      date: faker.date.past(),
      checkInTime: faker.date.past(),
      checkOutTime: faker.date.future(),
      status: faker.helpers.arrayElement(['present', 'absent']),
    });
  }
  await db.attendance.bulkCreate(attendances);
  console.log(`✅ ${NUM_ATTENDANCES} attendances created.`);


    console.log("✅ DB Synced Successfully.");
     process.exit(0);


  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
 }
}

seed();

