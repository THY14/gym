import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../models/index.js';
import { AuthenticationError, NotFoundError } from '../utils/errorHelper.js';
import { logInfo } from '../utils/logger.js';

const authService = {
  async login(email, password) {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    logInfo({ message: `User ${user.email} logged in`, user: user.id });
    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    };
  },

  async register({ firstName, lastName, email, password, role }) {
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      throw new AuthenticationError('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      insertDate: new Date(),
      updateDate: new Date(),
    });

    logInfo({ message: `User ${email} registered`, user: user.id });
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  },

  async getUser(id) {
    const user = await db.User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  },

  async updateUser(id, data) {
    const user = await db.User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    await user.update({
      ...data,
      updateDate: new Date(),
    });

    logInfo({ message: `User ${user.email} updated`, user: id });
    return user;
  },
};

export default authService;