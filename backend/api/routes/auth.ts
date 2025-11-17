


import { Router } from 'express';
import { signup, signin, logout } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/logout', protect, logout);

export default router;