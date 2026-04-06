import Employee from "../Models/Employee.js";
import Leave from "../Models/leave.js";
import Event from "../Models/Event.js";

export const getEmployeeSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: missing user id" });
    }

    // Find Employee doc for this user (include salary + department)
    const employee = await Employee.findOne({ userId })
      .populate("userId", "name email")
      .populate("department", "dep_name")  // ✅ Populate department name
      .select("employeeId department designation salary createdAt"); // ✅ use designation not position

    if (!employee) {
      return res.status(404).json({ message: "Employee record not found for this user" });
    }

    const empId = employee._id;

    // Count leaves using employeeId
    const applied = await Leave.countDocuments({ employeeId: empId });
    const approved = await Leave.countDocuments({ employeeId: empId, status: "Approved" });
    const pending = await Leave.countDocuments({ employeeId: empId, status: "Pending" });
    const rejected = await Leave.countDocuments({ employeeId: empId, status: "Rejected" });

    // Salary
    const monthlySalary = employee.salary || 0;

    // Upcoming events
    const upcomingEvents = await Event.find()
  .sort({ createdAt: -1 }) // latest first
  .limit(2)
  .select("title date");

    // Response
    return res.json({
      profile: {
        name: employee.userId?.name || null,
        employeeId: employee.employeeId,
        department: employee.department?.dep_name || "N/A", // ✅ Proper department
        designation: employee.designation, // ✅ Corrected field
      },
      stats: {
        leavesTaken: approved,
        leavesRemaining: Math.max(0, 10 - approved),
        monthlySalary,
      },
      leaveStatus: { applied, approved, pending, rejected },
      upcomingEvents,
    });
  } catch (err) {
    console.error("Error in getEmployeeSummary:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
