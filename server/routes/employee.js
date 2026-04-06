import express from "express";
import authMiddleware from "../middleware/authMiddlware.js";
import upload from "../middleware/upload.js";
import {
  addEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

const router = express.Router();

router.post("/add", authMiddleware, upload.single("image"), addEmployee);
router.get("/", authMiddleware, getEmployees);
router.get("/:id", authMiddleware, getEmployee);
router.put("/:id", authMiddleware, upload.single("image"), updateEmployee);
router.delete("/:id", authMiddleware, deleteEmployee);

export default router;
