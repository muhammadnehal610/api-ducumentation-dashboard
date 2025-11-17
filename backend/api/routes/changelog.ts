import express from 'express';
import {
    getChangelogs,
    createChangelog,
    updateChangelog,
    deleteChangelog
} from '../controllers/changelogController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(getChangelogs)
    .post(protect, authorize('backend'), createChangelog);

router.route('/:id')
    .put(protect, authorize('backend'), updateChangelog)
    .delete(protect, authorize('backend'), deleteChangelog);

export default router;
