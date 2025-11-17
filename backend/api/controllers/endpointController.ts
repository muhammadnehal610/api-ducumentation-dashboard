import { RequestHandler } from 'express';
import Endpoint from '../models/Endpoint';

// @desc    Get all endpoints
// @route   GET /api/endpoints
// @access  Public
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const getEndpoints: RequestHandler = async (req, res, next) => {
    try {
        const endpoints = await Endpoint.find({});
        res.status(200).json({ success: true, count: endpoints.length, data: endpoints });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single endpoint
// @route   GET /api/endpoints/:id
// @access  Public
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const getEndpoint: RequestHandler = async (req, res, next) => {
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
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const createEndpoint: RequestHandler = async (req, res, next) => {
    try {
        const endpoint = await Endpoint.create(req.body);
        res.status(201).json({ success: true, data: endpoint });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an endpoint
// @route   PUT /api/endpoints/:id
// @access  Private/Admin
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const updateEndpoint: RequestHandler = async (req, res, next) => {
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
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const deleteEndpoint: RequestHandler = async (req, res, next) => {
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