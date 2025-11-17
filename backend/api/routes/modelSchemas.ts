import express from 'express';
import {
    getSchemas,
    getSchema,
    createSchema,
    updateSchema,
    deleteSchema,
    addSchemaField,
    updateSchemaField,
    deleteSchemaField
} from '../controllers/modelSchemaController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Base schema routes
router.route('/')
    .get(getSchemas)
    .post(protect, authorize('backend'), createSchema);

router.route('/:id')
    .get(getSchema)
    .put(protect, authorize('backend'), updateSchema)
    .delete(protect, authorize('backend'), deleteSchema);

// Nested field routes
router.route('/:schemaId/fields')
    .post(protect, authorize('backend'), addSchemaField);
    
router.route('/:schemaId/fields/:fieldId')
    .put(protect, authorize('backend'), updateSchemaField)
    .delete(protect, authorize('backend'), deleteSchemaField);

export default router;
