import express from 'express';
import {
    getErrorCodes,
    createErrorCode,
    updateErrorCode,
    deleteErrorCode
} from '../controllers/errorCodeController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(getErrorCodes)
    .post(protect, authorize('backend'), createErrorCode);

router.route('/:id')
    .put(protect, authorize('backend'), updateErrorCode)
    .delete(protect, authorize('backend'), deleteErrorCode);

export default router;
