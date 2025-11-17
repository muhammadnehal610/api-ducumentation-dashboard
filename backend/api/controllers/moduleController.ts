import { RequestHandler } from 'express';
import Module from '../models/Module';
import Endpoint from '../models/Endpoint';
import ModelSchema from '../models/ModelSchema';

// @desc    Get all modules with pagination and search
// @route   GET /api/modules
// @access  Public
export const getModules: RequestHandler = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';

        const skip = (page - 1) * limit;

        const query: any = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // For dropdowns, if no limit is specified, return all
        if (!req.query.limit) {
            const allModules = await Module.find({}).sort({ name: 1 });
            return res.status(200).json({ success: true, count: allModules.length, data: allModules });
        }
        
        const modules = await Module.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Module.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        
        res.status(200).json({
            success: true,
            data: {
                services: modules,
                total,
                page,
                limit,
                totalPages,
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a module
// @route   POST /api/modules
// @access  Private/Admin
export const createModule: RequestHandler = async (req, res, next) => {
    try {
        const { name } = req.body;
        const existingModule = await Module.findOne({ name });
        if (existingModule) {
            return res.status(409).json({ success: false, message: 'A service with this name already exists.' });
        }
        const module = await Module.create(req.body);
        res.status(201).json({ success: true, data: module });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a module and cascade changes
// @route   PUT /api/modules/:id
// @access  Private/Admin
export const updateModule: RequestHandler = async (req, res, next) => {
    try {
        const { name } = req.body;
        
        const module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }

        const oldName = module.name;
        
        // If name is changing, cascade the update
        if (name && oldName !== name) {
            // Check for uniqueness before updating
            const existingModule = await Module.findOne({ name });
            if (existingModule && existingModule._id.toString() !== req.params.id) {
                 return res.status(409).json({ success: false, message: 'A service with this name already exists.' });
            }
            await Endpoint.updateMany({ module: oldName }, { $set: { module: name } });
            await ModelSchema.updateMany({ module: oldName }, { $set: { module: name } });
        }

        module.name = name || module.name;
        module.description = req.body.description; // Allow clearing description
        const updatedModule = await module.save();

        res.status(200).json({ success: true, data: updatedModule });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a module and all related data
// @route   DELETE /api/modules/:id
// @access  Private/Admin
export const deleteModule: RequestHandler = async (req, res, next) => {
    try {
        const module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }
        
        // Cascade delete
        await Endpoint.deleteMany({ module: module.name });
        await ModelSchema.deleteMany({ module: module.name });

        await module.deleteOne();

        res.status(200).json({ success: true, message: 'Service and all related data deleted successfully.' });
    } catch (error) {
        next(error);
    }
};
