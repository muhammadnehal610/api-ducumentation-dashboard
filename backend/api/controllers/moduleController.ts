import { RequestHandler } from 'express';
import Module from '../models/Module';

// @desc    Get all modules
// @route   GET /api/modules
// @access  Public
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const getModules: RequestHandler = async (req, res, next) => {
    try {
        const modules = await Module.find({});
        res.status(200).json({ success: true, count: modules.length, data: modules });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a module
// @route   POST /api/modules
// @access  Private/Admin
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const createModule: RequestHandler = async (req, res, next) => {
    try {
        const module = await Module.create(req.body);
        res.status(201).json({ success: true, data: module });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a module
// @route   PUT /api/modules/:id
// @access  Private/Admin
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const updateModule: RequestHandler = async (req, res, next) => {
    try {
        const module = await Module.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found.' });
        }
        res.status(200).json({ success: true, data: module });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a module
// @route   DELETE /api/modules/:id
// @access  Private/Admin
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const deleteModule: RequestHandler = async (req, res, next) => {
    try {
        const module = await Module.findByIdAndDelete(req.params.id);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found.' });
        }
        res.status(200).json({ success: true, message: 'Module deleted successfully.' });
    } catch (error) {
        next(error);
    }
};