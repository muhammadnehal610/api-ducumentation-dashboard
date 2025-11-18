


import { Router } from 'express';
import {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService
} from '../controllers/serviceController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Protected (backend only) routes
router.post('/', protect, authorize('backend'), createService);
router.put('/:id', protect, authorize('backend'), updateService);
router.delete('/:id', protect, authorize('backend'), deleteService);

export default router;