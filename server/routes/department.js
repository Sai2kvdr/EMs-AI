import express from 'express';
import authMiddleware from '../middleware/authMiddlware.js';
import { 
  addDepartment, 
  getDepartments, 
  updateDepartment, 
  deleteDepartment,
    editDepartment 
} from '../controllers/departmentController.js';

const router = express.Router();

// Routes
router.post('/add', authMiddleware, addDepartment);
router.get('/', authMiddleware, getDepartments);
router.put('/:id', authMiddleware, updateDepartment);
router.delete('/:id', authMiddleware, deleteDepartment);
router.get('/:id', authMiddleware, editDepartment)

export default router;
