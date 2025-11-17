import express from 'express';
import { signup, signin, logout } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// FIX: Cast handlers to resolve type conflicts between different module resolutions of express types.
router.post('/signup', signup as express.RequestHandler);
router.post('/signin', signin as express.RequestHandler);
router.post('/logout', protect as express.RequestHandler, logout as express.RequestHandler);

export default router;