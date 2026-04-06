import express from "express";
import { getEmployeeSummary } from "../controllers/empdashContoller.js";
import authMiddleware from "../middleware/authMiddlware.js";

const router = express.Router();


router.get("/summary", authMiddleware, getEmployeeSummary);

export default router;
