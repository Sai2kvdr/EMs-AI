import express from "express";
import { getSummary, addEvent, deleteEvent } from "../controllers/adminController.js";
import authMiddleware from '../middleware/authMiddlware.js';

const router = express.Router();

router.get("/summary", authMiddleware, getSummary);
router.post("/events", authMiddleware, addEvent);
router.delete("/events/:id", authMiddleware, deleteEvent);

export default router;
