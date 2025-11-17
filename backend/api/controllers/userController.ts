// Fix: Use direct Express Request and Response types to avoid conflicts.
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

// Create User (by Admin)
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role, status } = req.body;
     try {
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ success: false, message: 'User with this email already exists.' });
        }
        
        // Password is hashed by model's pre-save hook
        const newUser = await User.create({
            name,
            email,
            password,
            role,
            status: status || 'active'
        });
        
        res.status(201).json({ success: true, data: newUser.toJSON() });

    } catch (error) {
        next(error);
    }
};

// Read Users with Search and Pagination
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';

        const skip = (page - 1) * limit;

        // Build query for search
        const query: any = {};
        if (search) {
            const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
            query.$or = [
                { name: searchRegex },
                { email: searchRegex }
            ];
        }

        // Find users with pagination and sorting
        const users = await User.find(query)
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        // Get total count of users matching the search query for pagination
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            success: true,
            data: {
                users,
                totalUsers,
                page,
                limit,
                totalPages,
            }
        });

    } catch (error) {
        next(error);
    }
};

// Update User
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    // Don't allow password to be updated through this route
    const { password, ...updateData } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(id, updateData, {
            new: true, // Return the modified document
            runValidators: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        next(error);
    }
};

// Delete User
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
     const { id } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        next(error);
    }
};
