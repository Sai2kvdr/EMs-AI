import express from "express";
import { getSalaries, addSalary, getEmployeeSalaries } from "../controllers/salaryController.js";
import authMiddleware from "../middleware/authMiddlware.js";

const router = express.Router();

router.get("/", authMiddleware,getSalaries);             // Get all salaries
router.post("/", authMiddleware,addSalary);              // Add salary
router.get("/employee/:id",authMiddleware, getEmployeeSalaries); // Salaries of specific employee

export default router;
