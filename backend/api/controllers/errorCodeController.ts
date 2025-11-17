import { RequestHandler } from 'express';
import ErrorCode from '../models/ErrorCode';

// @desc    Get all error codes
// @route   GET /api/error-codes
// @access  Public
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const getErrorCodes: RequestHandler = async (req, res, next) => {
    try {
        const errorCodes = await ErrorCode.find({}).sort({ code: 1 });
        res.status(200).json({ success: true, count: errorCodes.length, data: errorCodes });
    } catch (error) {
        next(error);
    }
};

// @desc    Create an error code
// @route   POST /api/error-codes
// @access  Private/Admin
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const createErrorCode: RequestHandler = async (req, res, next) => {
    try {
        const errorCode = await ErrorCode.create(req.body);
        res.status(201).json({ success: true, data: errorCode });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an error code
// @route   PUT /api/error-codes/:id
// @access  Private/Admin
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const updateErrorCode: RequestHandler = async (req, res, next) => {
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
// FIX: Standardized on using the named import for RequestHandler to ensure type compatibility.
export const deleteErrorCode: RequestHandler = async (req, res, next) => {
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