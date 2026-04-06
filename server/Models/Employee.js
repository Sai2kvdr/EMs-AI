import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true
  },
  maritalStatus: {
    type: String,
    enum: ["Single", "Married", "Divorced"],
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  imageHash: {
    type: String,
    default: ""
  }
}, { timestamps: true });


const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;