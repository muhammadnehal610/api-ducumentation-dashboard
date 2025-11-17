
import { Router } from 'express';
import {
    createUser,
    getUsers,
    updateUser,
    deleteUser
} from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// All routes below are protected and restricted to 'backend' role
router.use(protect);
router.use(authorize('backend'));

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .put(updateUser)
    .delete(deleteUser);

export default router;