// src/routes/auth.js
import { Router } from 'express';
import { register, login, profile, verify, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verify);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticate, profile);

export default router;
