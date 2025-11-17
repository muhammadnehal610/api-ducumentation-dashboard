


import * as express from 'express';
import {
    getEndpoints,
    getEndpoint,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint
} from '../controllers/endpointController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(getEndpoints)
    .post(protect, authorize('backend'), createEndpoint);

router.route('/:id')
    .get(getEndpoint)
    .put(protect, authorize('backend'), updateEndpoint)
    .delete(protect, authorize('backend'), deleteEndpoint);

export default router;