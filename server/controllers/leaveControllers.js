import Leave from '../Models/leave.js';
import Employee from '../Models/Employee.js';



export const addLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, description } = req.body;
    
    // Get user ID from the authenticated request (from middleware)
    const userId = req.user.id;
    
    // Find employee by userId
    const employee = await Employee.findOne({ userId });
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: "Employee record not found for this user" 
      });
    }

    // Check if dates are valid
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    // Check if the leave dates overlap with existing leaves
    const overlappingLeave = await Leave.findOne({
      employeeId: employee._id,
      $or: [
        { 
          fromDate: { $lte: endDate }, 
          toDate: { $gte: startDate } 
        },
        {
          fromDate: { $gte: startDate, $lte: endDate }
        }
      ],
      status: { $in: ["Pending", "Approved"] }
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: "You already have a leave request for these dates"
      });
    }

    // Create new leave
    const newLeave = new Leave({
      employeeId: employee._id,
      leaveType,
      fromDate: startDate,
      toDate: endDate,
      description
    });

    await newLeave.save();

    return res.status(201).json({ 
      success: true,
      message: "Leave application submitted successfully", 
      leave: newLeave 
    });
  } catch (error) {
    console.error("Error adding leave:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

export const getLeaves = async (req, res) => { 
  try { 
    const { id } = req.params;
    
    // First try to find leaves with the provided ID as employeeId
    let leaves = await Leave.find({ employeeId: id });
    
    // If no leaves found, check if the ID is a userId and find the employee first
    if (leaves.length === 0) {
      const employee = await Employee.findOne({ userId: id }); 
      
      if (employee) {
        leaves = await Leave.find({ employeeId: employee._id });
      }
    }
    
    return res.status(200).json({
      success: true, 
      message: "Leaves fetched successfully",
      leaves: leaves || [] // Ensure we always return an array
    });
  } catch(error) { 
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  } 
}

export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate({
        path: "employeeId",
        select: "employeeId department userId",
        populate: [
          {
            path: "userId",
            select: "name email"
          },
          {
            path: "department",   // now correctly references Department model
            model: "Department",
            select: "dep_name"
          }
        ]
      })
      .sort({ createdAt: -1 });

    if (!leaves || leaves.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No leaves found"
      });
    }

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching leaves"
    });
  }
};

// Update leave status
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value"
      });
    }

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate({
        path: "employeeId",
        select: "employeeId department userId",
        populate: [
          { path: "userId", select: "name email" },
          { path: "department", select: "name" }
        ]
      });

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: "Leave not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave status updated successfully",
      leave
    });
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating leave status"
    });
  }
};

export const getLeavesByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId)
      .populate("userId", "name email")
      .populate("department", "dep_name");

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    // Leaves only (no pagination here)
    const leaves = await Leave.find({ employeeId })
      .sort({ appliedOn: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      employee,  // full populated employee
      count: leaves.length,
      leaves     // 👈 IMPORTANT: must send `leaves`, not salaries
    });
  } catch (error) {
    console.error("Error fetching employee leaves:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching employee leaves",
    });
  }
};



