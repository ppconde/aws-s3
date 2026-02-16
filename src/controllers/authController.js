import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';

// In-memory user storage (for MVP - replace with database in production)
const users = new Map();

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        if (users.has(email)) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, authConfig.saltRounds);

        // Create user object
        const user = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email,
            password: hashedPassword,
            name,
            createdAt: new Date(),
        };

        // Store user
        users.set(email, user);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            authConfig.jwtSecret,
            { expiresIn: authConfig.jwtExpiresIn }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = users.get(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            authConfig.jwtSecret,
            { expiresIn: authConfig.jwtExpiresIn }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

export default { register, login };
