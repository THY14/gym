import { faker } from '@faker-js/faker';
import db from './models/index.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();
console.log('Using Faker version:', faker.version || 'unknown');

const NUM_USERS = 30; // 1 admin, 3 trainers, 2 receptionists, 24 members
const NUM_CLIENTS = 24;
const NUM_WORKOUT_PLANS = 5;
const NUM_CLASSES = 3;
const NUM_CLASS_SCHEDULES = 3;
const NUM_TRAINING_SESSIONS = 3;
const NUM_PAYMENTS = 24;
const NUM_GYMS = 1;
const NUM_MESSAGES = 3;
const NUM_MEMBERSHIP_PLANS = 6;
const NUM_CHECK_INS = 15;

async function seed() {
  try {
    console.log('Connecting to DB...');
    await db.sequelize.sync({ force: true }); // Drops and recreates tables

    // ====== SEED GYMS ======
    const gymsData = [];
    for (let i = 0; i < NUM_GYMS; i++) {
      gymsData.push({
        name: `Gym ${faker.location.city()}`,
        address: faker.location.streetAddress(),
        phoneNumber: faker.phone.number(),
      });
    }
    const gyms = await db.Gym.bulkCreate(gymsData, { returning: true });
    console.log(`${NUM_GYMS} gyms created.`);

    // ====== SEED MEMBERSHIP PLANS ======
    const membershipPlansData = [
      {
        planName: '1 Month',
        duration: 1,
        price: 35.0,
        benefits: 'Access to gym facilities for 1 month',
        status: 'active',
      },
      {
        planName: '3 Months',
        duration: 3,
        price: 75.0,
        benefits: 'Access to gym facilities for 3 months with free 1 trainer session',
        status: 'active',
      },
      {
        planName: '6 Months',
        duration: 6,
        price: 115.0,
        benefits: 'Access to gym facilities for 6 months with monthly progress check',
        status: 'active',
      },
      {
        planName: '1 Year',
        duration: 12,
        price: 175.0,
        benefits: 'Access to all gym services for 1 year with seasonal challenges',
        status: 'active',
      },
      {
        planName: 'Individual Training',
        duration: 1,
        price: 250.0,
        benefits: 'Personal trainer support tailored for individual goals',
        status: 'active',
      },
      {
        planName: 'Small Group Training',
        duration: 1,
        price: 180.0,
        benefits: 'Group training sessions (2-4 people) with a personal coach',
        status: 'active',
      },
    ];
    const membershipPlans = await db.MembershipPlan.bulkCreate(membershipPlansData, { returning: true });
    console.log(`${membershipPlans.length} membership plans created.`);

    // ====== SEED USERS ======
    const usersData = [];
    const adminCount = 1,
      trainerCount = 3,
      receptionistCount = 2,
      memberCount = NUM_USERS - adminCount - trainerCount - receptionistCount;
    const usedEmails = new Set();

    for (let i = 0; i < NUM_USERS; i++) {
      let role;
      if (i < adminCount) role = 'admin';
      else if (i < adminCount + trainerCount) role = 'trainer';
      else if (i < adminCount + trainerCount + receptionistCount) role = 'receptionist';
      else role = 'member';

      let email;
      do {
        email = faker.internet.email();
      } while (usedEmails.has(email));
      usedEmails.add(email);

      // Hash password before insertion
      const plainPassword = faker.internet.password();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      usersData.push({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email,
        password: hashedPassword,
        role,
        bio: role === 'trainer' ? faker.lorem.paragraph() : null,
        specialties: role === 'trainer' ? faker.helpers.arrayElement(['Strength Training', 'Cardio', 'Yoga']) : null,
        certifications: role === 'trainer' ? faker.helpers.arrayElement(['NASM', 'ACE', 'ISSA']) : null,
        phoneNumber: faker.phone.number(),
        specialization: role === 'trainer' ? faker.helpers.arrayElement(['Strength', 'Endurance', 'Flexibility']) : null,
        availability: role === 'trainer' ? 'Mon-Fri 8AM-8PM' : null,
        profileImage: 'https://via.placeholder.com/150',
      });
    }
    const users = await db.User.bulkCreate(usersData, { returning: true });
    console.log(`${users.length} users created.`);

    // Filter users by roles for reference
    const trainers = users.filter((u) => u.role === 'trainer');
    const members = users.filter((u) => u.role === 'member');

    // ====== SEED WORKOUT PLANS ======
    const workoutPlansData = [
      { name: 'Full Body Blast', description: '3x per week full body workout.' },
      { name: 'Strength Focus', description: 'Targeted strength building routine.' },
      { name: 'Cardio Boost', description: 'High-intensity cardio program.' },
      { name: 'Flexibility Flow', description: 'Yoga-based flexibility routine.' },
      { name: 'Endurance Elite', description: 'Endurance training for athletes.' },
    ];
    const workoutPlans = await db.WorkoutPlan.bulkCreate(workoutPlansData, { returning: true });
    console.log(`${workoutPlans.length} workout plans created.`);

    // ====== SEED CLIENTS ======
    const clientsData = [];
    for (let i = 0; i < NUM_CLIENTS; i++) {
      let email;
      do {
        email = faker.internet.email();
      } while (usedEmails.has(email));
      usedEmails.add(email);

      clientsData.push({
        userId: members[i % members.length].id,
        goal: faker.helpers.arrayElement(['Lose weight', 'Build muscle', 'Improve endurance']),
        fitnessLevel: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced']),
        medicalHistory: faker.datatype.boolean() ? faker.lorem.sentence() : null,
        phoneNumber: faker.phone.number(),
        email,
        trainerId: trainers[faker.number.int({ min: 0, max: trainers.length - 1 })].id,
        membershipPlanId: membershipPlans[faker.number.int({ min: 0, max: membershipPlans.length - 1 })].id,
      });
    }
    const clients = await db.Client.bulkCreate(clientsData, { returning: true });
    console.log(`${clients.length} clients created.`);

    // ====== SEED CLASSES ======
    const classesData = [];
    for (let i = 0; i < NUM_CLASSES; i++) {
      const trainer = trainers[faker.number.int({ min: 0, max: trainers.length - 1 })];
      const gym = gyms[faker.number.int({ min: 0, max: gyms.length - 1 })];

      classesData.push({
        name: faker.helpers.arrayElement(['Strength Training', 'HIIT', 'Yoga', 'Pilates', 'Spin']),
        description: faker.lorem.sentence(),
        duration: faker.number.int({ min: 60, max: 120 }),
        enrolled: faker.number.int({ min: 0, max: 15 }),
        capacity: 20,
        price: parseFloat(faker.finance.amount(20, 35, 2)),
        trainerId: trainer.id,
        gymId: gym.id,
      });
    }
    const classes = await db.Class.bulkCreate(classesData, { returning: true });
    console.log(`${classes.length} classes created.`);

    // ====== SEED CLASS AVAILABLE DAYS ======
    const classAvailableDaysData = [];
    for (let i = 0; i < classes.length; i++) {
      const days = faker.helpers.arrayElements(
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        faker.number.int({ min: 1, max: 7 })
      );
      days.forEach((day) => {
        classAvailableDaysData.push({
          classId: classes[i].id,
          day,
        });
      });
    }
    await db.ClassAvailableDay.bulkCreate(classAvailableDaysData);
    console.log(`${classAvailableDaysData.length} class available days created.`);

    // ====== SEED CLASS SCHEDULES ======
    const classSchedulesData = [];
    for (let i = 0; i < NUM_CLASS_SCHEDULES; i++) {
      const classRecord = classes[i % classes.length];
      const gymRecord = gyms.find((g) => g.id === classRecord.gymId);

      classSchedulesData.push({
        classId: classRecord.id,
        time: faker.helpers.arrayElement(['6:00 PM - 7:00 PM', '6:00 AM - 7:00 AM', '4:00 PM - 5:00 PM']),
        participants: faker.number.int({ min: 0, max: 15 }),
        capacity: 20,
        location: gymRecord.address,
        room: faker.helpers.arrayElement(['Room A', 'Room B', 'Studio 1']),
        trainerId: classRecord.trainerId,
        gymId: classRecord.gymId,
      });
    }
    const classSchedules = await db.ClassSchedule.bulkCreate(classSchedulesData, { returning: true });
    console.log(`${classSchedules.length} class schedules created.`);

    // ====== SEED SCHEDULE AVAILABLE DAYS ======
    const scheduleAvailableDaysData = [];
    for (let i = 0; i < classSchedules.length; i++) {
      const days = faker.helpers.arrayElements(
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        faker.number.int({ min: 1, max: 7 })
      );
      days.forEach((day) => {
        scheduleAvailableDaysData.push({
          scheduleId: classSchedules[i].id,
          day,
        });
      });
    }
    await db.ScheduleAvailableDay.bulkCreate(scheduleAvailableDaysData);
    console.log(`${scheduleAvailableDaysData.length} schedule available days created.`);

    // ====== SEED TRAINING SESSIONS ======
    const trainingSessionsData = [];
    for (let i = 0; i < NUM_TRAINING_SESSIONS; i++) {
      const isIndividual = i % 2 === 0;
      const gymRecord = gyms[faker.number.int({ min: 0, max: gyms.length - 1 })];
      const trainer = trainers[faker.number.int({ min: 0, max: trainers.length - 1 })];

      trainingSessionsData.push({
        type: isIndividual ? 'individual' : 'group',
        clientId: isIndividual ? clients[faker.number.int({ min: 0, max: clients.length - 1 })].id : null,
        time: faker.helpers.arrayElement(['7:00 AM - 8:00 AM', '2:00 PM - 3:00 PM', '5:00 PM - 6:00 PM']),
        startDate: new Date('2025-07-24'),
        endDate: new Date('2025-08-24'),
        location: gymRecord.address,
        notes: faker.lorem.sentence(),
        trainerId: trainer.id,
        gymId: gymRecord.id,
      });
    }
    const trainingSessions = await db.TrainingSession.bulkCreate(trainingSessionsData, { returning: true });
    console.log(`${trainingSessions.length} training sessions created.`);

    // ====== SEED TRAINING SESSION CLIENTS ======
    const trainingSessionClientsData = [];
    for (let i = 0; i < trainingSessions.length; i++) {
      if (trainingSessions[i].type === 'group') {
        const numClients = faker.number.int({ min: 2, max: 4 });
        const clientIds = faker.helpers.arrayElements(
          clients.map((c) => c.id),
          numClients
        );
        clientIds.forEach((clientId) => {
          trainingSessionClientsData.push({
            sessionId: trainingSessions[i].id,
            clientId,
          });
        });
      }
    }
    await db.TrainingSessionClient.bulkCreate(trainingSessionClientsData);
    console.log(`${trainingSessionClientsData.length} training session clients created.`);

    // ====== SEED SESSION TRAINING DAYS ======
    const sessionTrainingDaysData = [];
    for (let i = 0; i < trainingSessions.length; i++) {
      const days = faker.helpers.arrayElements(
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        faker.number.int({ min: 1, max: 7 })
      );
      days.forEach((day) => {
        sessionTrainingDaysData.push({
          sessionId: trainingSessions[i].id,
          day,
        });
      });
    }
    await db.SessionTrainingDay.bulkCreate(sessionTrainingDaysData);
    console.log(`${sessionTrainingDaysData.length} session training days created.`);

    // ====== SEED PAYMENTS ======
    const paymentsData = [];
    // Class-related payments
    for (let i = 0; i < NUM_PAYMENTS / 2; i++) {
      const classRecord = classes[i % classes.length];
      paymentsData.push({
        clientId: clients[faker.number.int({ min: 0, max: clients.length - 1 })].id,
        classId: classRecord.id,
        sessionId: null,
        membershipPlanId: null,
        amount: classRecord.price,
        date: faker.date.between('2025-07-01', '2025-07-28'),
        method: faker.helpers.arrayElement(['credit_card', 'cash']),
        status: 'paid',
      });
    }
    // Session-related payments
    for (let i = 0; i < NUM_PAYMENTS / 4; i++) {
      const session = trainingSessions[i % trainingSessions.length];
      paymentsData.push({
        clientId: session.type === 'individual' ? session.clientId : clients[faker.number.int({ min: 0, max: clients.length - 1 })].id,
        classId: null,
        sessionId: session.id,
        membershipPlanId: null,
        amount: session.type === 'individual' ? 50.0 : 30.0,
        date: faker.date.between('2025-07-01', '2025-07-28'),
        method: faker.helpers.arrayElement(['credit_card', 'cash']),
        status: 'paid',
      });
    }
    // Membership-related payments
    for (let i = 0; i < NUM_PAYMENTS / 4; i++) {
      const plan = membershipPlans[i % membershipPlans.length];
      paymentsData.push({
        clientId: clients[faker.number.int({ min: 0, max: clients.length - 1 })].id,
        classId: null,
        sessionId: null,
        membershipPlanId: plan.id,
        amount: plan.price,
        date: faker.date.between('2025-07-01', '2025-07-28'),
        method: faker.helpers.arrayElement(['credit_card', 'cash']),
        status: 'paid',
      });
    }
    await db.Payment.bulkCreate(paymentsData);
    console.log(`${paymentsData.length} payments created.`);

    // ====== SEED MESSAGES ======
    const messagesData = [];
    for (let i = 0; i < NUM_MESSAGES; i++) {
      const client = clients[i % clients.length];
      messagesData.push({
        senderId: client.trainerId,
        recipientId: client.id,
        message: faker.lorem.sentence(),
        timestamp: faker.date.between('2025-07-01', '2025-07-28'),
      });
    }
    await db.Message.bulkCreate(messagesData);
    console.log(`${messagesData.length} messages created.`);

    // ====== SEED CHECK-INS ======
    const checkInsData = [];
    for (let i = 0; i < NUM_CHECK_INS; i++) {
      checkInsData.push({
        clientId: clients[faker.number.int({ min: 0, max: clients.length - 1 })].id,
        gymId: gyms[faker.number.int({ min: 0, max: gyms.length - 1 })].id,
        checkInTime: faker.date.between('2025-07-01', '2025-07-28'),
      });
    }
    await db.CheckIn.bulkCreate(checkInsData);
    console.log(`${checkInsData.length} check-ins created.`);

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();