
import * as express from 'express';
import Service from '../models/Service';
import Module from '../models/Module';
import Endpoint from '../models/Endpoint';
import ModelSchema from '../models/ModelSchema';
import ErrorCode from '../models/ErrorCode';
import OverviewCard from '../models/OverviewCard';


// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices: express.RequestHandler = async (req, res, next) => {
    try {
        const services = await Service.find({}).sort({ name: 1 });
        res.status(200).json({ success: true, count: services.length, data: services });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
export const createService: express.RequestHandler = async (req, res, next) => {
    try {
        const { name } = req.body;
        const existingService = await Service.findOne({ name });
        if (existingService) {
            return res.status(409).json({ success: false, message: 'A service with this name already exists.' });
        }
        const service = await Service.create(req.body);
        res.status(201).json({ success: true, data: service });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService: express.RequestHandler = async (req, res, next) => {
    try {
        const { name } = req.body;
        
        // Check for uniqueness before updating
        const existingService = await Service.findOne({ name });
        if (existingService && existingService._id.toString() !== req.params.id) {
             return res.status(409).json({ success: false, message: 'A service with this name already exists.' });
        }

        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }

        res.status(200).json({ success: true, data: service });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a service and all related data
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService: express.RequestHandler = async (req, res, next) => {
    try {
        const serviceId = req.params.id;
        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }
        
        // Cascade delete all related data
        await Module.deleteMany({ serviceId });
        await Endpoint.deleteMany({ serviceId });
        await ModelSchema.deleteMany({ serviceId });
        await ErrorCode.deleteMany({ serviceId });
        await OverviewCard.deleteMany({ serviceId });

        await service.deleteOne();

        res.status(200).json({ success: true, message: 'Service and all related data deleted successfully.' });
    } catch (error) {
        next(error);
    }
};