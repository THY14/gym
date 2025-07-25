import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../models/index.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication routes
 */





/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
export const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await db.user.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await db.user.create({ username, email, password: hashedPassword });

        res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, username: newUser.username, email: newUser.email } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *        description: Internal server error
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await db.user.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        //check type of user
        let userType = null;
        if (await db.admin.findOne({ where: { userId: user.id } })) {
            userType = 'admin';
        } else if (await db.trainer.findOne({ where: { userId: user.id } })) {
            userType = 'trainer';
        } else {
            userType = 'member'; // Assuming if not admin or trainer, it's a member
        }
        
        if (!userType) {
            return res.status(400).json({ message: 'User type not defined' });
        }
        


        // Generate JWT token
        const token = jwt.sign({ id: user.id, role: userType }, process.env.JWT_SECRET,{ expiresIn: '1h' });

        console.log("✅ JWT Created:", token); 

        res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       500:
 *         description: Internal server error
 */
export const logout = (req, res) => {
    try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
    });

    return res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
export const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // Find user by email
        const user = await db.user.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}