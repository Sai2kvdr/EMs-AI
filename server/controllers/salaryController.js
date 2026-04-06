import Salary from "../Models/Salary.js";
import Employee from "../Models/Employee.js";


export const getSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate("employeeId", "employeeId")   // employeeId from Employee
      .populate("department", "dep_name");    // dep_name from Department

    res.status(200).json(salaries);
  } catch (error) {
    res.status(500).json({ error: "Error fetching salaries" });
  }
};

export const addSalary = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    
    // Simple validation
    const { employeeId, department, payDate } = req.body;
    if (!employeeId || !department || !payDate) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields" 
      });
    }

    // Get employee data to use their actual salary
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    // Use actual employee salary instead of hardcoded value
    const basicSalary = employee.salary || 0;
    const netSalary = basicSalary + (Number(req.body.allowances) || 0) - (Number(req.body.deductions) || 0);

    // Create salary with correct values
    const salaryData = {
      ...req.body,
      basicSalary: basicSalary, // Use actual employee salary
      netSalary: netSalary,
      payDate: new Date(payDate),
      month: new Date(payDate).toISOString().slice(0, 7),
      year: new Date(payDate).getFullYear()
    };

    const salary = new Salary(salaryData);
    await salary.save();

    res.status(201).json({
      success: true,
      message: "Salary added successfully",
      salary: salary
    });

  } catch (error) {
    console.error("Full error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Server error",
      message: error.message 
    });
  }
};

export const getEmployeeSalaries = async (req, res) => {
  try {
    const { id } = req.params; // can be employee _id or userId
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;


    // Try finding employee either by _id or userId
    const employee = await Employee.findOne({
      $or: [
        { _id: id },       // check by employee's _id
        { userId: id }     // check by linked userId
      ]
    }).populate("department", "dep_name");

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    // Get total count for pagination
    const totalCount = await Salary.countDocuments({ employeeId: employee._id });

    const salaries = await Salary.find({ employeeId: employee._id })
      .populate("employeeId", "employeeId name salary")
      .populate("department", "dep_name")
      .sort({ payDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      employee: {
        name: employee.userId?.name || employee.name,
        employeeId: employee.employeeId,
        baseSalary: employee.salary,
        department: employee.department?.dep_name
      },
      salaries: salaries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error("Error fetching employee salaries:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching employee salaries",
      message: error.message
    });
  }
};


