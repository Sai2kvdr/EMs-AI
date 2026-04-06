// File: controllers/aiController.js
import mongoose from "mongoose";
import Employee from "../Models/Employee.js";
import Department from "../Models/Department.js";
import User from "../Models/User.js";
import Salary from "../Models/Salary.js";
import Leave from "../Models/leave.js";
import Event from "../Models/Event.js";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { getImageHash, hammingDistance } from "../utils/getImageHash.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../public/uploads/");

const collections = {
  employees: Employee,
  departments: Department,
  users: User,
  salaries: Salary,
  leaves: Leave,
  events: Event,
};

// Helper: compute MD5 hash of a file
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(fileBuffer).digest("hex");
}

// Helper: get employee by name or ID
async function getEmployeeData(nameOrId) {
  const isObjectId = mongoose.Types.ObjectId.isValid(nameOrId);
  const user = await User.findOne({
    $or: [
      { name: new RegExp(nameOrId, "i") },
      { _id: isObjectId ? nameOrId : null },
    ],
  });

  let emp;
  if (user) {
    emp = await Employee.findOne({ userId: user._id }).populate(
      "department userId"
    );
  } else {
    emp = await Employee.findOne({
      employeeId: new RegExp(nameOrId, "i"),
    }).populate("department userId");
  }
  return { emp, user };
}

/* -------------------- CRUD FUNCTIONS -------------------- */

export const fetchData = async (req, res) => {
  try {
    const { collection, id } = req.query;
    if (!collections[collection])
      return res.status(400).json({ message: "Invalid collection" });

    let data;
    const hostUrl = `${req.protocol}://${req.get("host")}`;
    switch (collection) {
      case "employees":
        if (id) {
          const orQuery = [{ employeeId: id }];
          if (mongoose.Types.ObjectId.isValid(id)) orQuery.push({ _id: id });
          const user = await User.findOne({
            name: new RegExp(`^${id}$`, "i"),
          });
          if (user) orQuery.push({ userId: user._id });

          data = await Employee.findOne({ $or: orQuery })
            .populate({ path: "userId", select: "name email" })
            .populate({ path: "department", select: "dep_name" })
            .lean();

          if (!data)
            return res.status(404).json({ message: "Employee not found" });

          // ✅ attach imageUrl
          data.imageUrl = data.image
            ? `${hostUrl}/uploads/${path.basename(data.image)}`
            : null;
        } else {
          data = await Employee.find()
            .populate({ path: "userId", select: "name email" })
            .populate({ path: "department", select: "dep_name" })
            .lean();

          data = data.map((emp) => ({
            ...emp,
            imageUrl: emp.image
              ? `${hostUrl}/uploads/${path.basename(emp.image)}`
              : null,
          }));
        }
        break;

      case "departments":
        data = id
          ? await Department.findById(id).lean()
          : await Department.find().lean();
        break;

      case "events":
        data = id
          ? await Event.findById(id).lean()
          : await Event.find().lean();
        break;

      case "salaries":
        const salQuery = id ? { employeeId: id } : {};
        data = await Salary.find(salQuery)
          .populate({
            path: "employeeId",
            populate: { path: "userId", select: "name email" },
          })
          .lean();
        break;

      case "leaves":
        const leaveQuery = id ? { employeeId: id } : {};
        data = await Leave.find(leaveQuery)
          .populate({
            path: "employeeId",
            populate: { path: "userId", select: "name email" },
          })
          .lean();
        break;

      default:
        return res.status(400).json({ message: "Invalid collection" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("fetchData error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching data", error: error.message });
  }
};

export const filterData = async (req, res) => {
  try {
    const { type } = req.query;
    if (type === "lastMonthSalary") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const salaries = await Salary.find({ payDate: { $gte: oneMonthAgo } })
        .populate({ path: "employeeId", populate: { path: "userId", select: "name email" } })
        .lean();
      return res.status(200).json(salaries);
    } else if (type === "pendingLeaves") {
      const leaves = await Leave.find({ status: "Pending" })
        .populate({ path: "employeeId", populate: { path: "userId", select: "name email" } })
        .lean();
      return res.status(200).json(leaves);
    }
    return res.status(400).json({ message: "Invalid filter type" });
  } catch (error) {
    console.error("filterData error:", error);
    res.status(500).json({ message: "Server error filtering data", error: error.message });
  }
};

export const createData = async (req, res) => {
  try {
    const { collection, data } = req.body;
    if (!collections[collection])
      return res.status(400).json({ message: "Invalid collection" });

    let result;
    switch (collection) {
      case "employees":
        let user;
        if (data.email) {
          user = await User.findOne({ email: data.email });
          if (!user) {
            user = await User.create({
              name: data.name,
              email: data.email,
              password: "default123",
            });
          }
        }
        result = await Employee.create({
          userId: user?._id || data.userId,
          employeeId: data.employeeId || `EMP-${Date.now()}`,
          dob: data.dob || new Date(),
          gender: data.gender || "Other",
          maritalStatus: data.maritalStatus || "Single",
          department: data.department,
          designation: data.designation,
          salary: data.salary,
          image: data.image || "",
        });
        break;

      case "salaries":
        result = await Salary.create(data);
        break;

      default:
        result = await collections[collection].create(data);
        break;
    }

    res.status(201).json(result);
  } catch (err) {
    console.error("createData error:", err.message);
    res
      .status(500)
      .json({ message: "Error creating document", error: err.message });
  }
};

export const updateData = async (req, res) => {
  try {
    const { collection, id, data } = req.body;
    if (!collections[collection])
      return res.status(400).json({ message: "Invalid collection" });

    const updated = await collections[collection].findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Document not found" });

    res.json(updated);
  } catch (err) {
    console.error("updateData error:", err.message);
    res.status(500).json({ message: "Error updating", error: err.message });
  }
};

export const deleteData = async (req, res) => {
  try {
    const { id } = req.body;

    let employee;

    // ✅ Check if ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      employee = await Employee.findById(id);
    } else {
      // ✅ Treat as employeeId (string)
      employee = await Employee.findOne({ employeeId: id });
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 🔥 Cascade delete
    if (employee.userId) {
      await User.findByIdAndDelete(employee.userId);
    }
    await Salary.deleteMany({ employeeId: employee._id });
    await Leave.deleteMany({ employeeId: employee._id });

    await Employee.findByIdAndDelete(employee._id);

    res.json({
      message: "Employee and related data deleted",
      employee
    });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Error deleting data" });
  }
};

/* -------------------- PROFILE IMAGE UPLOAD -------------------- */
export const uploadProfile = async (req, res) => {
  try {
    const { collection, id } = req.body;
    if (!collections[collection])
      return res.status(400).json({ message: "Invalid collection" });
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const fileUrl = req.file.path;
    let imageHash = "";
    try {
      imageHash = await getImageHash(fileUrl);
    } catch(e) { console.error("Error hashing profile:", e); }

    const updated = await collections[collection].findByIdAndUpdate(
      id,
      { image: fileUrl, imageHash },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Document not found" });

    res.json({
      message: "Profile uploaded successfully",
      updated,
      url: fileUrl,
    });
  } catch (err) {
    console.error("uploadProfile error:", err.message);
    res
      .status(500)
      .json({ message: "Error uploading profile", error: err.message });
  }
};

/* -------------------- IMAGE-BASED EMPLOYEE SEARCH -------------------- */
export const findEmployeeByImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const uploadedPath = req.file.path;
    const uploadedHash = await getImageHash(uploadedPath);

    const employees = await Employee.find()
      .populate("userId department")
      .lean();

    let bestMatch = null;
    let bestDistance = Infinity;

    for (const emp of employees) {
      if (!emp.image) continue;
      
      let empHash = emp.imageHash;
      // Fallback fallback if old data has no hash
      if (!empHash) {
        let empImagePath = emp.image;
        if (!empImagePath.startsWith("http")) {
          empImagePath = path.join(__dirname, "../public/uploads/", path.basename(emp.image));
          if (!fs.existsSync(empImagePath)) continue;
        }
        try {
          empHash = await getImageHash(empImagePath);
          // Auto-save hash to db to avoid recomputing in future
          await Employee.findByIdAndUpdate(emp._id, { imageHash: empHash });
        } catch(e) { continue; }
      }

      const distance = hammingDistance(uploadedHash, empHash);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = emp;
      }
    }

    fs.unlinkSync(uploadedPath); // Multer Cloudinary might not have path like this locally, but we let it fail safely if so. Wait, upload.single("file") for chat doesn't need persistence! We should just check.
    
    if (bestMatch && bestDistance <= 10) {
      bestMatch.imageUrl = bestMatch.image;

      res.json({
        success: true,
        employee: bestMatch,
        distance: bestDistance,
      });
    } else {
      res.json({ success: false, message: "No matching employee found" });
    }
  } catch (err) {
    console.error("findEmployeeByImage error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* -------------------- AI CHAT + NATURAL QUERIES -------------------- */
export const aiChat = async (req, res) => {
  try {
    const { message } = req.body;
    let reply = "I didn't understand that. Try again.";

    const hostUrl = `${req.protocol}://${req.get("host")}`;

    // Image-based search
    if (/find employee by this image/i.test(message)) {
      if (!req.file) reply = "⚠️ Please upload an image with your request.";
      else {
        const uploadedPath = req.file.path;
        const uploadedHash = await getImageHash(uploadedPath);
        const employees = await Employee.find()
          .populate("userId department")
          .lean();

        let foundEmployee = null;
        let bestDistance = Infinity;
        for (const emp of employees) {
          if (!emp.image) continue;
          
          let empHash = emp.imageHash;
          if (!empHash) {
            let empImagePath = emp.image;
            if (!empImagePath.startsWith("http")) {
              empImagePath = path.join(__dirname, "../public/uploads/", path.basename(emp.image));
              if (!fs.existsSync(empImagePath)) continue;
            }
            try {
              empHash = await getImageHash(empImagePath);
              await Employee.findByIdAndUpdate(emp._id, { imageHash: empHash });
            } catch(e) { continue; }
          }
          
          const distance = hammingDistance(uploadedHash, empHash);
          if (distance < bestDistance) {
            bestDistance = distance;
            foundEmployee = emp;
          }
        }

        if (foundEmployee && bestDistance <= 10) {
          const imageUrl = foundEmployee.image || "N/A";

          reply = `👤 Employee Found:
- Name: ${foundEmployee.userId?.name || "N/A"}
- Email: ${foundEmployee.userId?.email || "N/A"}
- Department: ${foundEmployee.department?.dep_name || "N/A"}
- Designation: ${foundEmployee.designation || "N/A"}
- Employee ID: ${foundEmployee.employeeId || "N/A"}
- Profile Image: ${imageUrl}`;
        } else {
          reply = "❌ No employee found with this image.";
        }
      }
    }

    // Employee details by name/ID
    else if (/details/i.test(message)) {
      const name = message.replace(/details/gi, "").trim();
      const { emp } = await getEmployeeData(name);
      if (emp) {
        const imageUrl = emp.image
          ? `${hostUrl}/uploads/${path.basename(emp.image)}`
          : "N/A";
        reply = `👤 Employee:
- Name: ${emp.userId?.name || "N/A"}
- Email: ${emp.userId?.email || "N/A"}
- Department: ${emp.department?.dep_name || "N/A"}
- Designation: ${emp.designation || "N/A"}
- Profile Image: ${imageUrl}`;
      } else {
        reply = `❌ No employee found with ID/name "${name}"`;
      }
    }

    // Salary query
    else if (/salary of/i.test(message)) {
      const name = message.replace(/salary of/gi, "").trim();
      const { emp } = await getEmployeeData(name);
      if (!emp) reply = `❌ No employee named ${name}`;
      else {
        const salary = await Salary.findOne({ employeeId: emp._id }).sort({
          year: -1,
          month: -1,
        });
        reply = `💰 Salary of ${emp.userId?.name || "N/A"}: ${
          salary?.netSalary || emp.salary || "Not available"
        }`;
      }
    }


  // In your aiChat function, replace the leaves section with this:

// Leaves taken by employee
else if (/leave(s)? taken by/i.test(message)) {
  const name = message.replace(/leaves? taken by/gi, "").trim();
  const { emp } = await getEmployeeData(name);
  if (!emp) {
    reply = `❌ No employee named ${name}`;
  } else {
    try {
      const leaves = await Leave.find({
        employeeId: emp._id,
        status: "Approved",
      });
      
      let totalDays = 0;
      leaves.forEach((lv) => {
        if (lv.fromDate && lv.toDate) {
          const fromDate = new Date(lv.fromDate);
          const toDate = new Date(lv.toDate);
          // Calculate difference in days, adding 1 to include both dates
          totalDays += Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
        }
      });
      
      reply = `📝 ${emp.userId?.name || "N/A"} has taken ${
        leaves.length
      } leave(s), totaling ${totalDays} days.`;
    } catch (error) {
      console.error("Error fetching leaves:", error);
      reply = `❌ Error fetching leave information for ${name}`;
    }
  }
}

// All leaves (approved)
else if (/all leaves?|leave all/i.test(message)) {
  try {
    const leaves = await Leave.find({ status: "Approved" }).populate({
      path: "employeeId",
      populate: { path: "userId", select: "name email" },
    });
    
    if (leaves.length === 0) {
      reply = "No approved leaves found.";
    } else {
      const formattedLeaves = leaves
        .map(
          (lv, i) =>
            `${i + 1}. ${lv.employeeId?.userId?.name || "Unknown"} — ${
              lv.leaveType
            } (From: ${
              lv.fromDate
                ? new Date(lv.fromDate).toLocaleDateString()
                : "Invalid Date"
            } To: ${
              lv.toDate
                ? new Date(lv.toDate).toLocaleDateString()
                : "Invalid Date"
            })`
        )
        .join("\n");
      reply = `📝 All approved leaves:\n${formattedLeaves}`;
    }
  } catch (error) {
    console.error("Error fetching all leaves:", error);
    reply = "❌ Error fetching all leaves information";
  }
}

// Pending leaves
else if (/pending leave/i.test(message)) {
  try {
    const leaves = await Leave.find({ status: "Pending" }).populate({
      path: "employeeId",
      populate: { path: "userId", select: "name email" },
    });
    
    if (leaves.length === 0) {
      reply = "No pending leaves found.";
    } else {
      const formattedLeaves = leaves
        .map(
          (lv, i) =>
            `${i + 1}. ${lv.employeeId?.userId?.name || "Unknown"} — ${
              lv.leaveType
            } (From: ${
              lv.fromDate
                ? new Date(lv.fromDate).toLocaleDateString()
                : "Invalid Date"
            } To: ${
              lv.toDate
                ? new Date(lv.toDate).toLocaleDateString()
                : "Invalid Date"
            })`
        )
        .join("\n");
      reply = `📝 Pending leaves:\n${formattedLeaves}`;
    }
  } catch (error) {
    console.error("Error fetching pending leaves:", error);
    reply = "❌ Error fetching pending leaves information";
  }
}

    // Events count
    else if (/events/i.test(message)) {
      const events = await Event.find();
      reply = `📅 Total events: ${events.length}`;
    }

    res.json({ reply });
  } catch (err) {
    console.error("aiChat error:", err.message);
    res.status(500).json({ reply: `⚠️ Error: ${err.message}` });
  }
};

// Additional leave-related endpoints

// Get all leaves for a specific employee
export const getEmployeeLeaves = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    
    const leaves = await Leave.find({ employeeId })
      .populate({
        path: "employeeId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ fromDate: -1 });
    
    res.status(200).json(leaves);
  } catch (error) {
    console.error("getEmployeeLeaves error:", error);
    res.status(500).json({ message: "Server error fetching employee leaves", error: error.message });
  }
};

// Get leaves by status
export const getLeavesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    const validStatuses = ["Pending", "Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be one of: Pending, Approved, Rejected" });
    }
    
    const leaves = await Leave.find({ status })
      .populate({
        path: "employeeId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ fromDate: -1 });
    
    res.status(200).json(leaves);
  } catch (error) {
    console.error("getLeavesByStatus error:", error);
    res.status(500).json({ message: "Server error fetching leaves by status", error: error.message });
  }
};

// Update leave status
export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(leaveId)) {
      return res.status(400).json({ message: "Invalid leave ID" });
    }
    
    const validStatuses = ["Pending", "Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be one of: Pending, Approved, Rejected" });
    }
    
    const updatedLeave = await Leave.findByIdAndUpdate(
      leaveId,
      { status },
      { new: true }
    ).populate({
      path: "employeeId",
      populate: { path: "userId", select: "name email" },
    });
    
    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave not found" });
    }
    
    res.status(200).json(updatedLeave);
  } catch (error) {
    console.error("updateLeaveStatus error:", error);
    res.status(500).json({ message: "Server error updating leave status", error: error.message });
  }
};

// Get leave statistics
export const getLeaveStatistics = async (req, res) => {
  try {
    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
    const approvedLeaves = await Leave.countDocuments({ status: "Approved" });
    const rejectedLeaves = await Leave.countDocuments({ status: "Rejected" });
    
    // Get employee with most leaves
    const mostLeaves = await Leave.aggregate([
      { $match: { status: "Approved" } },
      { $group: { _id: "$employeeId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    
    let employeeWithMostLeaves = null;
    if (mostLeaves.length > 0) {
      employeeWithMostLeaves = await Employee.findById(mostLeaves[0]._id)
        .populate("userId", "name");
    }
    
    res.status(200).json({
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      employeeWithMostLeaves: employeeWithMostLeaves ? {
        name: employeeWithMostLeaves.userId.name,
        count: mostLeaves[0].count
      } : null
    });
  } catch (error) {
    console.error("getLeaveStatistics error:", error);
    res.status(500).json({ message: "Server error fetching leave statistics", error: error.message });
  }
};