import express from 'express';
import { 
    login, 
    verify, 
    forgotPassword, 
    resetPassword, 
    verifyResetToken 
} from '../controllers/authController.js';
import authMiddlware from '../middleware/authMiddlware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-token', verifyResetToken);

// Protected route
router.get('/verify', authMiddlware, verify);

export default router;