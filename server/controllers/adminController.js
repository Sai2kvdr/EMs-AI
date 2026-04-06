import Employee from "../Models/Employee.js";
import Department from "../Models/Department.js";
import Leave from "../Models/leave.js";
import Event from "../Models/Event.js";

// GET DASHBOARD SUMMARY
export const getSummary = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalDepartments = await Department.countDocuments();

    const totalSalaries = await Employee.aggregate([
      { $group: { _id: null, totalSalary: { $sum: "$salary" } } }
    ]);

    const employeeAppliedForLeave = await Leave.distinct("employeeId");
    const leaveSatatus = await Leave.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const leaveSummary = {
      appliedFor: employeeAppliedForLeave.length,
      approved: leaveSatatus.find((item) => item._id === "Approved")?.count || 0,
      pending: leaveSatatus.find((item) => item._id === "Pending")?.count || 0,
      rejected: leaveSatatus.find((item) => item._id === "Rejected")?.count || 0,
    };

    // ✅ fetch upcoming events (>= today)
    const upcomingEvents = await Event.find()
  .sort({ createdAt: -1 }) // latest first
  .limit(2)
  .select("title date");


    // ✅ fetch recently joined employees (last 3 by joinDate or createdAt)
  // recent employees
// ✅ fetch recently joined employees (last 3)
const recentEmployees = await Employee.find()
  .sort({ createdAt: -1 })
  .limit(3)
  .populate("userId", "name") // fetch only the name from User
  .select("department createdAt");



    return res.status(200).json({
      totalDepartments,
      totalEmployees,
      monthlyPay: totalSalaries[0]?.totalSalary || 0,
      leaveSummary,
      upcomingEvents,
      recentEmployees,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// ADD EVENT
export const addEvent = async (req, res) => {
  try {
    const { title, date } = req.body;
    if (!title || !date) {
      return res.status(400).json({ message: "Title and Date required" });
    }
    const event = new Event({ title, date });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to add event", error: error.message });
  }
};

// DELETE EVENT
export const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
};
