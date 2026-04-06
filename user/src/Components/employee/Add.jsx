import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Add = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    department: "",
    designation: "",
    password: "",
    salary: "",
    role: "",
    image: null,
  });

  const [departments, setDepartments] = useState([]);
  const [roles] = useState(["Admin", "Manager", "Employee"]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Departments
        const deptRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/department`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (deptRes.data.success) setDepartments(deptRes.data.departments);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.image) {
      alert("⚠ Please upload an image (required).");
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      
      // Append all form data to the FormData object
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          payload.append(key, formData[key]);
        }
      });

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/employees/add`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.success) {
        alert("✅ Employee Added Successfully!");
        navigate("/admin-dashboard/employees");
      } else {
        alert("Failed to add employee!");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      alert(error.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-3">
      <style>
        {`body{
      background-color: #d6d8e2ff
      }`}
      </style>
      <div
        className="card shadow-sm p-3 pb-1"
        style={{ maxWidth: "700px", margin: "auto", borderRadius: "12px" }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/admin-dashboard/employees")}
          >
            ⬅ Back
          </button>
          <div className="flex-grow-1 text-center">
            <h4 className="mb-0 text-primary fw-bold">➕ Add New Employee</h4>
          </div>
          <div style={{ width: "60px" }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Name */}
            <div className="col-md-6">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Employee ID */}
            <div className="col-md-6">
              <label className="form-label">Employee ID</label>
              <input
                type="text"
                className="form-control"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
            </div>

            {/* DOB */}
            <div className="col-md-6">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>

            {/* Gender */}
            <div className="col-md-6">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Choose...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Marital Status */}
            <div className="col-md-6">
              <label className="form-label">Marital Status</label>
              <select
                className="form-select"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                required
              >
                <option value="">Choose...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>

            {/* Department */}
            <div className="col-md-6">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Choose...</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.dep_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation */}
            <div className="col-md-6">
              <label className="form-label">Designation</label>
              <input 
                type="text"
                className="form-control"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="col-md-6">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Salary */}
            <div className="col-md-6">
              <label className="form-label">Salary</label>
              <input
                type="number"
                className="form-control"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
              />
            </div>

            {/* Role */}
            <div className="col-md-6">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Choose...</option>
                {roles.map((r, idx) => (
                  <option key={idx} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Upload Image *</label>
              <input
                type="file"
                className="form-control"
                name="image"
                onChange={handleChange}
                accept="image/*"
                required
              />
              {preview && (
                <div className="text-success">Successfully uploaded..</div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center mt-1">
            <button 
              type="submit" 
              className="btn btn-primary px-4 py-2 rounded-3 shadow"
              disabled={loading}
            >
              {loading ? "Adding..." : "+ Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;