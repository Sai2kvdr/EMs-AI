import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Edit = () => {
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
  const [currentImage, setCurrentImage] = useState("");
  const [employee, setEmployee] = useState(null); // ✅ controls loader

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);

        // 🔹 Fetch departments first
        const deptRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/department`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (deptRes.data.success) {
          setDepartments(deptRes.data.departments);
        }

        // 🔹 Fetch employee
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.data.success) {
          const emp = res.data.employee;

          setEmployee(emp); // ✅ mark employee as loaded

          setFormData({
            name: emp.userId?.name || "",
            email: emp.userId?.email || "",
            role: emp.userId?.role || "",
            employeeId: emp.employeeId || "",
            dob: emp.dob ? new Date(emp.dob).toISOString().split("T")[0] : "",
            gender: emp.gender || "",
            maritalStatus: emp.maritalStatus || "",
            department: emp.department?._id || "",
            designation: emp.designation || "",
            password: "",
            salary: emp.salary || "",
            image: null,
          });

          if (emp.image) {
            const imgUrl = `${import.meta.env.VITE_API_URL}/uploads/${emp.image}`;
            setCurrentImage(imgUrl);
            setPreview(imgUrl);
          }
        } else {
          alert("Employee not found");
          navigate("/admin-dashboard/employees");
        }
      } catch (err) {
        console.error("Frontend error fetching employee:", err);
        alert("Error loading employee data");
        navigate("/admin-dashboard/employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        setFormData({ ...formData, image: file });
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          if (key === "password" && value === "") return; // skip empty password
          payload.append(key, value);
        }
      });

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/employees/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.message) {
        alert("✅ Employee Updated Successfully!");
        navigate("/admin-dashboard/employees");
      } else {
        alert("Failed to update employee!");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      alert(error.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ fix loader condition
  if (!employee) {
    return (
      <div className="container d-flex justify-content-center mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading employee data...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container mt-2">
      <style>
        {`body{
      background-color: #d6d8e2ff
      }`}
      </style>
      <div
        className="card shadow-sm p-3"
        style={{ maxWidth: "600px", margin: "auto", borderRadius: "8px" }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/admin-dashboard/employees")}
          >
            ⬅ Back
          </button>
          <div className="flex-grow-1 text-center">
            <h5 className="mb-0 text-primary fw-bold">✏️ Edit Employee</h5>
          </div>
          <div style={{ width: "50px" }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-2">
            {/* Name */}
            <div className="col-md-6">
              <label className="form-label small">Full Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email (Disabled) */}
            <div className="col-md-6">
              <label className="form-label small">Email</label>
              <input
                type="email"
                className="form-control form-control-sm"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
            </div>

            {/* Employee ID */}
            <div className="col-md-6">
              <label className="form-label small">Employee ID</label>
              <input
                type="text"
                className="form-control form-control-sm"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
            </div>

            {/* DOB */}
            <div className="col-md-6">
              <label className="form-label small">Date of Birth</label>
              <input
                type="date"
                className="form-control form-control-sm"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>

            {/* Gender */}
            <div className="col-md-6">
              <label className="form-label small">Gender</label>
              <select
                className="form-select form-select-sm"
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
              <label className="form-label small">Marital Status</label>
              <select
                className="form-select form-select-sm"
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
              <label className="form-label small">Department</label>
              <select
                className="form-select form-select-sm"
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
              <label className="form-label small">Designation</label>
              <input
                type="text"
                className="form-control form-control-sm"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="col-md-6">
              <label className="form-label small">New Password</label>
              <input
                type="password"
                className="form-control form-control-sm"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave empty to keep current"
              />
            </div>

            {/* Salary */}
            <div className="col-md-6">
              <label className="form-label small">Salary</label>
              <input
                type="number"
                className="form-control form-control-sm"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
              />
            </div>

            {/* Role */}
            <div className="col-md-6">
              <label className="form-label small">Role</label>
              <select
                className="form-select form-select-sm"
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

            {/* Image */}
            <div className="col-md-6">
              <label className="form-label small">Profile Image</label>
              <div className="text-center">
                <input
                  type="file"
                  id="imageInput"
                  className="d-none"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                />
                <label htmlFor="imageInput" style={{ cursor: "pointer" }}>
                  <img
                    src={preview || currentImage || "https://i.pravatar.cc/80"}
                    alt="Profile"
                    className="rounded-circle shadow-sm"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      border: "2px solid #dee2e6",
                    }}
                    onError={(e) => {
                      e.target.src = "https://i.pravatar.cc/80";
                    }}
                  />
                  <div>
                    <small className="text-muted">Click to change</small>
                  </div>
                </label>
              </div>
              {preview && preview !== currentImage && (
                <div className="text-center mt-1">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-xs"
                    onClick={() => {
                      setPreview(null);
                      setFormData({ ...formData, image: null });
                      document.getElementById("imageInput").value = "";
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="text-center mt-2">
            <button
              type="submit"
              className="btn btn-primary btn-sm px-3 py-1"
              disabled={loading}
            >
              {loading ? "Updating..." : "💾 Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Edit;
