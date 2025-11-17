
import { Router } from 'express';
import {
    getServices,
    createService,
    updateService,
    deleteService
} from '../controllers/serviceController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Public route to get all services for the selection dropdown
router.route('/').get(getServices);

// All subsequent routes are protected and for backend users only
router.use(protect, authorize('backend'));

router.route('/').post(createService);

router.route('/:id')
    .put(updateService)
    .delete(deleteService);

export default router;