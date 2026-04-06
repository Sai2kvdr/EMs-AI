import express from 'express';
import {addLeave, getAllLeaves, getLeaves,updateLeaveStatus,getLeavesByEmployeeId} from '../controllers/leaveControllers.js';
import authMiddleware from '../middleware/authMiddlware.js';

const router = express.Router();

router.post('/', authMiddleware, addLeave);
router.get('/employee/:employeeId', authMiddleware, getLeavesByEmployeeId); 
router.get('/:id', authMiddleware, getLeaves); 
router.get('/', authMiddleware, getAllLeaves);
router.put('/:id/status', authMiddleware, updateLeaveStatus);




export default router;