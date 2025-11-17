import { Request, Response, NextFunction } from 'express';
import ModelSchema from '../models/ModelSchema';

// @desc    Get all schemas for a service
// @route   GET /api/schemas?serviceId=:serviceId
// @access  Public
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const getSchemas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { serviceId } = req.query;
        if (!serviceId) {
            return res.status(400).json({ success: false, message: "Service ID is required." });
        }
        const schemas = await ModelSchema.find({ serviceId });
        res.status(200).json({ success: true, count: schemas.length, data: schemas });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single schema by ID
// @route   GET /api/schemas/:id
// @access  Public
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const getSchema = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = await ModelSchema.findById(req.params.id);
        if (!schema) {
            return res.status(404).json({ success: false, message: 'Schema not found.' });
        }
        res.status(200).json({ success: true, data: schema });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a schema
// @route   POST /api/schemas
// @access  Private/Admin
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const createSchema = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.serviceId) {
            return res.status(400).json({ success: false, message: "Service ID is required to create a schema." });
        }
        const schema = await ModelSchema.create(req.body);
        res.status(201).json({ success: true, data: schema });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a schema
// @route   PUT /api/schemas/:id
// @access  Private/Admin
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const updateSchema = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Exclude fields from this top-level update to prevent accidental overwrite
        const { fields, ...updateData } = req.body;
        
        const schema = await ModelSchema.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!schema) {
            return res.status(404).json({ success: false, message: 'Schema not found.' });
        }
        res.status(200).json({ success: true, data: schema });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a schema
// @route   DELETE /api/schemas/:id
// @access  Private/Admin
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const deleteSchema = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = await ModelSchema.findByIdAndDelete(req.params.id);
        if (!schema) {
            return res.status(404).json({ success: false, message: 'Schema not found.' });
        }
        res.status(200).json({ success: true, message: 'Schema deleted successfully.' });
    } catch (error) {
        next(error);
    }
};


// --- Nested Field Controllers ---

// @desc    Add a field to a schema
// @route   POST /api/schemas/:schemaId/fields
// @access  Private/Admin
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const addSchemaField = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = await ModelSchema.findById(req.params.schemaId);
        if (!schema) {
            return res.status(404).json({ success: false, message: 'Schema not found.' });
        }
        schema.fields.push(req.body);
        await schema.save();
        res.status(201).json({ success: true, data: schema });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a field in a schema
// @route   PUT /api/schemas/:schemaId/fields/:fieldId
// @access  Private/Admin
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const updateSchemaField = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = await ModelSchema.findById(req.params.schemaId);
        if (!schema) {
            return res.status(404).json({ success: false, message: 'Schema not found.' });
        }

        const field = schema.fields.id(req.params.fieldId);
        if (!field) {
            return res.status(404).json({ success: false, message: 'Field not found.' });
        }
        
        Object.assign(field, req.body);
        await schema.save();

        res.status(200).json({ success: true, data: schema });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a field from a schema
// @route   DELETE /api/schemas/:schemaId/fields/:fieldId
// @access  Private/Admin
// FIX: Replaced RequestHandler with explicit types to resolve overload errors.
export const deleteSchemaField = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = await ModelSchema.findById(req.params.schemaId);
        if (!schema) {
            return res.status(404).json({ success: false, message: 'Schema not found.' });
        }
        
        const field = schema.fields.id(req.params.fieldId);
        if (!field) {
            return res.status(404).json({ success: false, message: 'Field not found.' });
        }

        (field as any).remove();
        await schema.save();

        res.status(200).json({ success: true, data: schema });
    } catch (error) {
        next(error);
    }
};
