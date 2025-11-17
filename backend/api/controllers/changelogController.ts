

import { Request, Response, NextFunction } from 'express';
import Changelog from '../models/Changelog';

// @desc    Get all changelog items
// @route   GET /api/changelog
// @access  Public
// FIX: Switched to using explicit types for proper type inference.
export const getChangelogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const changelogs = await Changelog.find({}).sort({ date: -1 });
        res.status(200).json({ success: true, count: changelogs.length, data: changelogs });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a changelog item
// @route   POST /api/changelog
// @access  Private/Admin
// FIX: Switched to using explicit types for proper type inference.
export const createChangelog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const changelog = await Changelog.create(req.body);
        res.status(201).json({ success: true, data: changelog });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a changelog item
// @route   PUT /api/changelog/:id
// @access  Private/Admin
// FIX: Switched to using explicit types for proper type inference.
export const updateChangelog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const changelog = await Changelog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!changelog) {
            return res.status(404).json({ success: false, message: 'Changelog item not found.' });
        }
        res.status(200).json({ success: true, data: changelog });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a changelog item
// @route   DELETE /api/changelog/:id
// @access  Private/Admin
// FIX: Switched to using explicit types for proper type inference.
export const deleteChangelog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const changelog = await Changelog.findByIdAndDelete(req.params.id);
        if (!changelog) {
            return res.status(404).json({ success: false, message: 'Changelog item not found.' });
        }
        res.status(200).json({ success: true, message: 'Changelog item deleted successfully.' });
    } catch (error) {
        next(error);
    }
};