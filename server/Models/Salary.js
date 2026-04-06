import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
    employeeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Employee", 
        required: true 
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
    },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    payDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate salary entries for same employee and month
salarySchema.index({ employeeId: 1, month: 1 }, { unique: true });

const Salary = mongoose.model("Salary", salarySchema);
export default Salary;