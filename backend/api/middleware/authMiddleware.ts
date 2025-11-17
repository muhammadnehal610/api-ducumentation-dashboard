// Fix: Use direct Express Request and Response types to avoid conflicts.
/// <reference path="../../types.ts" />
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { User as UserType, UserRole } from '../../types';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: UserType;
        }
    }
}

// Protect routes
export const protect: express.RequestHandler = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { id: string };

            // Get user from the token using Mongoose
            const user = await User.findById(decoded.id); // Password is not selected by default

            if (!user) {
                 return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }

            req.user = user.toObject(); // Use .toObject() to get a plain object
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

// Grant access to specific roles
export const authorize = (...roles: UserRole[]): express.RequestHandler => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: `User role '${req.user?.role}' is not authorized to access this route` });
        }
        next();
    };
};