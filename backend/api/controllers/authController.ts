

// Fix: Use direct Express Request and Response types to avoid conflicts.
import * as express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken, generateRefreshToken } from '../utils/tokenUtils';

// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const signup: express.RequestHandler = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    try {
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ success: false, message: 'User with this email already exists.' });
        }

        // Password hashing is handled by the pre-save hook in the model
        const newUser = await User.create({
            name,
            email,
            password, // Pass plaintext password, model will hash it
            role,
            status: 'active'
        });

        // The toJSON transform in the model will remove the password
        res.status(201).json({ success: true, message: 'User created successfully', data: newUser });

    } catch (error) {
        next(error);
    }
};

// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const signin: express.RequestHandler = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        }

        // Explicitly select the password field which is hidden by default
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        
        if(user.status === 'inactive') {
            return res.status(403).json({ success: false, message: 'Account is inactive.' });
        }

        const isMatch = await bcrypt.compare(password, user.password!);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        
        const accessToken = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        
        // In a real app, you would store the refresh token securely (e.g., in DB against user, httpOnly cookie)
        
        res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
            user: user.toJSON() // Use .toJSON() to apply schema transforms
        });

    } catch (error) {
        next(error);
    }
};

// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const logout: express.RequestHandler = (req, res, next) => {
    // In a real-world stateless JWT implementation, logout is handled client-side by deleting tokens.
    // If using a refresh token blacklist, you would invalidate the token here.
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
};