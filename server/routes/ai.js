// File: routes/ai.js
import express from "express";
import {
  fetchData,
  createData,
  updateData,
  deleteData,
  uploadProfile,
  aiChat,
  findEmployeeByImage,
  filterData
} from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddlware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// CRUD
router.get("/fetch", authMiddleware, fetchData);
router.get("/filter", authMiddleware, filterData);
router.post("/create", authMiddleware, createData);
router.put("/update", authMiddleware, updateData);
router.post("/delete", authMiddleware, deleteData);

// Upload profile image
router.post("/upload", authMiddleware, upload.single("file"), uploadProfile);

router.post("/chat", authMiddleware, upload.single("file"), aiChat);

// Dedicated image-search route
router.post("/find-by-image", authMiddleware, upload.single("file"), findEmployeeByImage);



export default router;
