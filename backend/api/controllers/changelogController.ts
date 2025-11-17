import { RequestHandler } from 'express';
import Changelog from '../models/Changelog';

// @desc    Get all changelog items
// @route   GET /api/changelog
// @access  Public
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const getChangelogs: RequestHandler = async (req, res, next) => {
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
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const createChangelog: RequestHandler = async (req, res, next) => {
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
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const updateChangelog: RequestHandler = async (req, res, next) => {
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
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const deleteChangelog: RequestHandler = async (req, res, next) => {
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