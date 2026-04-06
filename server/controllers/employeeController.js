import Employee from "../Models/Employee.js";
import bcrypt from "bcrypt";
import User from "../Models/User.js";
import Salary from "../Models/Salary.js";
import Leave from "../Models/leave.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { getImageHash } from "../utils/getImageHash.js";
export const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      dob,
      gender,
      maritalStatus,
      department,
      designation,
      password,
      salary,
      role, // This goes to User
    } = req.body;

    // Validate required fields
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Check if employeeId already exists
    const existingEmployeeId = await Employee.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(400).json({ error: "Employee ID already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (name, email, password, role)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    let imageHash = "";
    if (req.file) {
      try {
        imageHash = await getImageHash(req.file.path);
      } catch(e) { console.error("Error hashing image:", e); }
    }

    // Create new employee (everything else + userId reference)
    const newEmployee = new Employee({
      userId: newUser._id, // Reference to User
      employeeId,
      dob: new Date(dob),
      gender,
      maritalStatus,
      department,
      designation,
      salary: Number(salary),
      image: req.file.path,
      imageHash,
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee: newEmployee,
    });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("department", "dep_name") // Populate department name
      .populate("userId", "name email role") // Populate user data (name, email, role)
      .select("-__v") // Exclude version field
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      employees: employees || []
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    let employee;

    // First try to find by employeeId (string field)
    employee = await Employee.findOne({ employeeId: id })
      .populate({
        path: "userId",
        select: "name email role profileimage" 
      })
      .populate({
        path: "department",
        select: "dep_name description"  
      });

    // If not found by employeeId, try finding by userId (ObjectId)
    if (!employee) {
      // Check if the ID is a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        employee = await Employee.findOne({ userId: id })
          .populate({
            path: "userId",
            select: "name email role profileimage" 
          })
          .populate({
            path: "department",
            select: "dep_name description"  
          });
      }
    }

    // If still not found, try finding by _id (ObjectId)
    if (!employee) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        employee = await Employee.findById(id)
          .populate({
            path: "userId",
            select: "name email role profileimage" 
          })
          .populate({
            path: "department",
            select: "dep_name description"  
          });
      }
    }

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: "Employee not found with the provided ID" 
      });
    }

    res.json({ success: true, employee });
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: err.message 
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { name, email, password, ...employeeData } = req.body;

    // Handle new image upload
    if (req.file) {
      employeeData.image = req.file.path;
      try {
        employeeData.imageHash = await getImageHash(req.file.path);
      } catch(e) { console.error("Error hashing image:", e); }
    }

    // 1️⃣ Find employee first with populated user
    const employee = await Employee.findById(req.params.id).populate("userId");
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // 2️⃣ Update User document (name, email + password)
    if (employee.userId) {
      const userUpdateData = {};
      
      if (name && name !== employee.userId.name) {
        userUpdateData.name = name;
      }
      
      if (email && email !== employee.userId.email) {
        userUpdateData.email = email;
      }
      
      if (password && password.trim() !== "") {
        userUpdateData.password = await bcrypt.hash(password, 10);
      }

      // Only update user if there are changes
      if (Object.keys(userUpdateData).length > 0) {
        await User.findByIdAndUpdate(
          employee.userId._id,
          userUpdateData,
          { new: true }
        );
      }
    }

    // 3️⃣ Update Employee document
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      employeeData,
      { new: true, runValidators: true }
    )
      .populate("department", "dep_name")
      .populate("userId", "name email role");

    return res.json({
      success: true,
      message: "✅ Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: "Duplicate entry. Employee ID or email might already exist." 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
};


export const deleteEmployee = async (req, res) => {
  try {
    // 1. Find the employee
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // 2. Delete associated User document
    if (employee.userId) {
      await User.findByIdAndDelete(employee.userId);
    }

    // 3. Delete associated Salary records
    await Salary.deleteMany({ employeeId: req.params.id });
    await Leave.deleteMany({ employeeId: req.params.id });

    // 4. Delete image file if it exists locally (skip if Cloudinary url)
    if (employee.image && !employee.image.startsWith('http')) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const imagePath = path.join(__dirname, "..", "public", "uploads", employee.image);
      
      // Use asynchronous file deletion (better for production)
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Error deleting image file:", err);
          } else {
            console.log("Profile image deleted:", employee.image);
          }
        });
      } else {
        console.log("Image file not found:", imagePath);
      }
    }

    // 5. Delete the employee document
    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: "Employee and associated records deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting employee:", error);
    
    // More specific error messages
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid employee ID" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Error deleting employee", 
      error: error.message 
    });
  }
};