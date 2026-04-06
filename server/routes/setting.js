import express from 'express';
import authMiddleware from '../middleware/authMiddlware.js';
import { changePassword } from '../controllers/empController.js';


const router = express.Router();

router.put('/change-password', authMiddleware,changePassword);

export default router;