// Fix: Use aliased ExpressRequest and ExpressResponse types to avoid conflicts.
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';

// Create User (by Admin)
export const createUser = async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    const { name, email, password, role, status } = req.body;
     try {
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role.' });
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
            status: status || 'active'
        });
        
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ success: true, data: userWithoutPassword });

    } catch (error) {
        next(error);
    }
};

// Read Users
export const getUsers = async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    try {
        const users = await User.findAll(req.query);
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        next(error);
    }
};

// Update User
export const updateUser = async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    try {
        const updatedUser = await User.update(id, { name, email, role, status });
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        next(error);
    }
};

// Delete User
export const deleteUser = async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
     const { id } = req.params;
    try {
        const success = await User.delete(id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        next(error);
    }
};