import { body, validationResult } from 'express-validator';
import { sendErrorResponse } from '../utils/responseHelper.js';

const schemas = {
  login: [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register: [  // Added this schema
    body('firstName').isString().withMessage('First name is required').isLength({ max: 255 }),
    body('lastName').isString().withMessage('Last name is required').isLength({ max: 255 }),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  updateUser: [
    body('firstName').optional().isString().isLength({ max: 255 }).withMessage('First name must be a string with max 255 characters'),
    body('lastName').optional().isString().isLength({ max: 255 }).withMessage('Last name must be a string with max 255 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('bio').optional().isString().withMessage('Bio must be a string'),
    body('specialties').optional().isString().withMessage('Specialties must be a string'),
    body('certifications').optional().isString().withMessage('Certifications must be a string'),
    body('phoneNumber').optional().isString().isLength({ max: 20 }).withMessage('Phone number must be a string with max 20 characters'),
    body('specialization').optional().isString().isLength({ max: 255 }).withMessage('Specialization must be a string with max 255 characters'),
    body('availability').optional().isString().withMessage('Availability must be a string'),
    body('profileImage').optional().isURL().withMessage('Profile image must be a valid URL'),
  ],
  createClient: [
    body('userId').isInt().withMessage('User ID must be an integer').exists().withMessage('User ID is required'),
    body('goal').isString().isLength({ max: 255 }).withMessage('Goal must be a string with max 255 characters').exists().withMessage('Goal is required'),
    body('fitnessLevel').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Fitness level must be Beginner, Intermediate, or Advanced').exists().withMessage('Fitness level is required'),
    body('medicalHistory').optional().isString().withMessage('Medical history must be a string'),
    body('phoneNumber').optional().isString().isLength({ max: 20 }).withMessage('Phone number must be a string with max 20 characters'),
    body('email').isEmail().withMessage('Invalid email format').exists().withMessage('Email is required'),
    body('trainerId').isInt().withMessage('Trainer ID must be an integer').exists().withMessage('Trainer ID is required'),
    body('membershipPlanId').optional().isInt().withMessage('Membership plan ID must be an integer'),
  ],
  updateClient: [
    body('goal').optional().isString().isLength({ max: 255 }).withMessage('Goal must be a string with max 255 characters'),
    body('fitnessLevel').optional().isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Fitness level must be Beginner, Intermediate, or Advanced'),
    body('medicalHistory').optional().isString().withMessage('Medical history must be a string'),
    body('phoneNumber').optional().isString().isLength({ max: 20 }).withMessage('Phone number must be a string with max 20 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('membershipPlanId').optional().isInt().withMessage('Membership plan ID must be an integer'),
  ],
  createClass: [
    body('name').isString().isLength({ max: 255 }).withMessage('Name must be a string with max 255 characters').exists().withMessage('Name is required'),
    body('description').isString().withMessage('Description must be a string').exists().withMessage('Description is required'),
    body('duration').isInt({ min: 15 }).withMessage('Duration must be an integer >= 15').exists().withMessage('Duration is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be an integer >= 1').exists().withMessage('Capacity is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a number >= 0').exists().withMessage('Price is required'),
    body('trainerId').isInt().withMessage('Trainer ID must be an integer').exists().withMessage('Trainer ID is required'),
    body('gymId').isInt().withMessage('Gym ID must be an integer').exists().withMessage('Gym ID is required'),
    body('availableDays').optional().isArray().withMessage('Available days must be an array').custom((value) => {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return value.every(day => validDays.includes(day));
    }).withMessage('Available days must be valid weekdays'),
  ],
  createSchedule: [
    body('classId').isInt().withMessage('Class ID must be an integer').exists().withMessage('Class ID is required'),
    body('time').isString().isLength({ max: 50 }).withMessage('Time must be a string with max 50 characters').exists().withMessage('Time is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be an integer >= 1').exists().withMessage('Capacity is required'),
    body('location').isString().isLength({ max: 255 }).withMessage('Location must be a string with max 255 characters').exists().withMessage('Location is required'),
    body('room').isString().isLength({ max: 50 }).withMessage('Room must be a string with max 50 characters').exists().withMessage('Room is required'),
    body('trainerId').isInt().withMessage('Trainer ID must be an integer').exists().withMessage('Trainer ID is required'),
    body('gymId').isInt().withMessage('Gym ID must be an integer').exists().withMessage('Gym ID is required'),
    body('availableDays').optional().isArray().withMessage('Available days must be an array').custom((value) => {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return value.every(day => validDays.includes(day));
    }).withMessage('Available days must be valid weekdays'),
  ],
  createTrainingSession: [
    body('type').isIn(['individual', 'group']).withMessage('Type must be individual or group').exists().withMessage('Type is required'),
    body('clientId').optional().isInt().withMessage('Client ID must be an integer'),
    body('time').isString().isLength({ max: 50 }).withMessage('Time must be a string with max 50 characters').exists().withMessage('Time is required'),
    body('startDate').isDate().withMessage('Start date must be a valid date').exists().withMessage('Start date is required'),
    body('endDate').isDate().withMessage('End date must be a valid date').exists().withMessage('End date is required'),
    body('location').isString().isLength({ max: 255 }).withMessage('Location must be a string with max 255 characters').exists().withMessage('Location is required'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('trainerId').isInt().withMessage('Trainer ID must be an integer').exists().withMessage('Trainer ID is required'),
    body('gymId').isInt().withMessage('Gym ID must be an integer').exists().withMessage('Gym ID is required'),
    body('clientIds').optional().isArray().withMessage('Client IDs must be an array').custom((value) => {
      return value.every(id => Number.isInteger(id));
    }).withMessage('Client IDs must be an array of integers'),
    body('trainingDays').optional().isArray().withMessage('Training days must be an array').custom((value) => {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return value.every(day => validDays.includes(day));
    }).withMessage('Training days must be valid weekdays'),
  ],
  createPayment: [
    body('clientId').isInt().withMessage('Client ID must be an integer').exists().withMessage('Client ID is required'),
    body('classId').optional().isInt().withMessage('Class ID must be an integer'),
    body('sessionId').optional().isInt().withMessage('Session ID must be an integer'),
    body('membershipPlanId').optional().isInt().withMessage('Membership plan ID must be an integer'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a number >= 0').exists().withMessage('Amount is required'),
    body('method').isIn(['credit_card', 'cash']).withMessage('Method must be credit_card or cash').exists().withMessage('Method is required'),
    body('status').isIn(['paid', 'pending']).withMessage('Status must be paid or pending').exists().withMessage('Status is required'),
  ],
  sendMessage: [
    body('recipientId').isInt().withMessage('Recipient ID must be an integer').exists().withMessage('Recipient ID is required'),
    body('message').isString().withMessage('Message must be a string').exists().withMessage('Message is required'),
  ],
  createGym: [
    body('name').isString().isLength({ max: 255 }).withMessage('Name must be a string with max 255 characters').exists().withMessage('Name is required'),
    body('address').isString().isLength({ max: 255 }).withMessage('Address must be a string with max 255 characters').exists().withMessage('Address is required'),
    body('phoneNumber').optional().isString().isLength({ max: 20 }).withMessage('Phone number must be a string with max 20 characters'),
  ],
  createMembershipPlan: [
    body('planName').isString().isLength({ max: 255 }).withMessage('Plan name must be a string with max 255 characters').exists().withMessage('Plan name is required'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be an integer >= 1').exists().withMessage('Duration is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a number >= 0').exists().withMessage('Price is required'),
    body('benefits').isString().withMessage('Benefits must be a string').exists().withMessage('Benefits is required'),
    body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive').exists().withMessage('Status is required'),
  ],
  createCheckIn: [
    body('clientId').isInt().withMessage('Client ID must be an integer').exists().withMessage('Client ID is required'),
    body('gymId').isInt().withMessage('Gym ID must be an integer').exists().withMessage('Gym ID is required'),
    body('checkInTime').isDate().withMessage('Check-in time must be a valid date').exists().withMessage('Check-in time is required'),
  ],
};

const validateRequest = (schemaName) => {
  return async (req, res, next) => {
    const validations = schemas[schemaName];
    if (!validations) {
      return sendErrorResponse(res, 500, 'Validation schema not found');
    }

    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map(error => error.msg).join(', ');
      return sendErrorResponse(res, 400, messages);
    }

    next();
  };
};

export default validateRequest;