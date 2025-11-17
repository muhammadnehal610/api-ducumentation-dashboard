// Fix: Use aliased ExpressRequest and ExpressResponse types to avoid conflicts.
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken, generateRefreshToken } from '../utils/tokenUtils';

export const signup = async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    const { name, email, password, role } = req.body;

    try {
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        const userExists = await User.findByEmail(email);
        if (userExists) {
            return res.status(409).json({ success: false, message: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            status: 'active'
        });

        res.status(201).json({ success: true, message: 'User created successfully', data: { id: newUser.id, name: newUser.name } });

    } catch (error) {
        next(error);
    }
};

export const signin = async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        }

        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        
        if(user.status === 'inactive') {
            return res.status(403).json({ success: false, message: 'Account is inactive.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

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
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        next(error);
    }
};

export const logout = (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    // In a real-world stateless JWT implementation, logout is handled client-side by deleting tokens.
    // If using a refresh token blacklist, you would invalidate the token here.
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
};