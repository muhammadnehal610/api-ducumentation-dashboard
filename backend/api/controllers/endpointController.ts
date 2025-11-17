

import { Request, Response, NextFunction } from 'express';
import Endpoint from '../models/Endpoint';

// @desc    Get all endpoints for a service
// @route   GET /api/endpoints?serviceId=:serviceId
// @access  Public
// FIX: Switched to using explicit types for proper type inference.
export const getEndpoints = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { serviceId } = req.query;
        if (!serviceId) {
            return res.status(400).json({ success: false, message: "Service ID is required." });
        }
        const endpoints = await Endpoint.find({ serviceId });
        res.status(200).json({ success: true, count: endpoints.length, data: endpoints });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single endpoint
// @route   GET /api/endpoints/:id
// @access  Public
// FIX: Switched to using explicit types for proper type inference.
export const getEndpoint = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const endpoint = await Endpoint.findById(req.params.id);
        if (!endpoint) {
            return res.status(404).json({ success: false, message: 'Endpoint not found.' });
        }
        res.status(200).json({ success: true, data: endpoint });
    } catch (error) {
        next(error);
    }
};

// @desc    Create an endpoint
// @route   POST /api/endpoints
// @access  Private/Admin
// FIX: Switched to using explicit types for proper type inference.
export const createEndpoint = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.serviceId) {
            return res.status(400).json({ success: false, message: "Service ID is required to create an endpoint." });
        }
        const endpoint = await Endpoint.create(req.body);
        res.status(201).json({ success: true, data: endpoint });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an endpoint
// @route   PUT /api/endpoints/:id
// @access  Private/Admin
// FIX: Switched to using explicit types for proper type inference.
export const updateEndpoint = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const endpoint = await Endpoint.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!endpoint) {
            return res.status(404).json({ success: false, message: 'Endpoint not found.' });
        }
        res.status(200).json({ success: true, data: endpoint });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an endpoint
// @route   DELETE /api/endpoints/:id
// @access  Private/Admin
// FIX: Switched to using explicit types for proper type inference.
export const deleteEndpoint = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const endpoint = await Endpoint.findByIdAndDelete(req.params.id);
        if (!endpoint) {
            return res.status(404).json({ success: false, message: 'Endpoint not found.' });
        }
        res.status(200).json({ success: true, message: 'Endpoint deleted successfully.' });
    } catch (error) {
        next(error);
    }
};