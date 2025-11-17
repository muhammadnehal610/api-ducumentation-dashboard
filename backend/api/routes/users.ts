import express from 'express';
import {
    createUser,
    getUsers,
    updateUser,
    deleteUser
} from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// All routes below are protected and restricted to 'backend' role
// FIX: Cast middleware to resolve type conflicts.
router.use(protect as express.RequestHandler);
router.use(authorize('backend') as express.RequestHandler);

// FIX: Cast handlers to resolve type conflicts.
router.route('/')
    .get(getUsers as express.RequestHandler)
    .post(createUser as express.RequestHandler);

router.route('/:id')
    .put(updateUser as express.RequestHandler)
    .delete(deleteUser as express.RequestHandler);

export default router;