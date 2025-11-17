

import * as express from 'express';
import {
    getModules,
    createModule,
    updateModule,
    deleteModule
} from '../controllers/moduleController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(getModules) // Publicly accessible to list modules for a service
    .post(protect, authorize('backend'), createModule);

router.route('/:id')
    .put(protect, authorize('backend'), updateModule)
    .delete(protect, authorize('backend'), deleteModule);

export default router;