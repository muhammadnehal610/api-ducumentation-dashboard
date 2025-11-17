
import * as express from 'express';
import ErrorCode from '../models/ErrorCode';

// @desc    Get all error codes for a service
// @route   GET /api/error-codes?serviceId=:serviceId
// @access  Public
export const getErrorCodes: express.RequestHandler = async (req, res, next) => {
    try {
        const { serviceId } = req.query;
        if (!serviceId) {
            return res.status(400).json({ success: false, message: "Service ID is required." });
        }
        const errorCodes = await ErrorCode.find({ serviceId }).sort({ code: 1 });
        res.status(200).json({ success: true, count: errorCodes.length, data: errorCodes });
    } catch (error) {
        next(error);
    }
};

// @desc    Create an error code
// @route   POST /api/error-codes
// @access  Private/Admin
export const createErrorCode: express.RequestHandler = async (req, res, next) => {
    try {
        if (!req.body.serviceId) {
            return res.status(400).json({ success: false, message: "Service ID is required to create an error code." });
        }
        const errorCode = await ErrorCode.create(req.body);
        res.status(201).json({ success: true, data: errorCode });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an error code
// @route   PUT /api/error-codes/:id
// @access  Private/Admin
export const updateErrorCode: express.RequestHandler = async (req, res, next) => {
    try {
        const errorCode = await ErrorCode.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!errorCode) {
            return res.status(404).json({ success: false, message: 'Error code not found.' });
        }
        res.status(200).json({ success: true, data: errorCode });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an error code
// @route   DELETE /api/error-codes/:id
// @access  Private/Admin
export const deleteErrorCode: express.RequestHandler = async (req, res, next) => {
    try {
        const errorCode = await ErrorCode.findByIdAndDelete(req.params.id);
        if (!errorCode) {
            return res.status(404).json({ success: false, message: 'Error code not found.' });
        }
        res.status(200).json({ success: true, message: 'Error code deleted successfully.' });
    } catch (error) {
        next(error);
    }
};