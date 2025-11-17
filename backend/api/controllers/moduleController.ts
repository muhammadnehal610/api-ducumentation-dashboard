
import * as express from 'express';
import Module from '../models/Module';
import Endpoint from '../models/Endpoint';

// @desc    Get all modules for a specific service
// @route   GET /api/modules?serviceId=:serviceId
// @access  Public
export const getModules: express.RequestHandler = async (req, res, next) => {
    try {
        const { serviceId } = req.query;
        if (!serviceId) {
            return res.status(400).json({ success: false, message: "Service ID is required." });
        }
        const modules = await Module.find({ serviceId }).sort({ name: 1 });
        res.status(200).json({ success: true, count: modules.length, data: modules });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a module
// @route   POST /api/modules
// @access  Private/Admin
export const createModule: express.RequestHandler = async (req, res, next) => {
    try {
        const { name, serviceId } = req.body;
        // Check for uniqueness within the service
        const existingModule = await Module.findOne({ name, serviceId });
        if (existingModule) {
            return res.status(409).json({ success: false, message: 'A module with this name already exists in this service.' });
        }
        const module = await Module.create(req.body);
        res.status(201).json({ success: true, data: module });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a module
// @route   PUT /api/modules/:id
// @access  Private/Admin
export const updateModule: express.RequestHandler = async (req, res, next) => {
    try {
        const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found.' });
        }
        res.status(200).json({ success: true, data: module });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a module and its related endpoints
// @route   DELETE /api/modules/:id
// @access  Private/Admin
export const deleteModule: express.RequestHandler = async (req, res, next) => {
    try {
        const module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found.' });
        }
        
        // Cascade delete endpoints within this module
        await Endpoint.deleteMany({ moduleId: module._id });

        await module.deleteOne();

        res.status(200).json({ success: true, message: 'Module and all related endpoints deleted successfully.' });
    } catch (error) {
        next(error);
    }
};