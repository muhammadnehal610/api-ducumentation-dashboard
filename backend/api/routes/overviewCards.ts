
import { Router } from 'express';
import {
    getOverviewCards,
    createOverviewCard,
    updateOverviewCard,
    deleteOverviewCard
} from '../controllers/overviewCardController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.route('/')
    .get(getOverviewCards)
    .post(protect, authorize('backend'), createOverviewCard);

router.route('/:id')
    .put(protect, authorize('backend'), updateOverviewCard)
    .delete(protect, authorize('backend'), deleteOverviewCard);

export default router;