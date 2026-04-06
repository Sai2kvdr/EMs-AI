import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function AddDepartment() {
  const [department, setDepartments] = useState({
    dep_name: "",
    description: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartments({ ...department, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/department/add`,
        department,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        return navigate("/admin-dashboard/departments");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
<>
  <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div className="container" style={{ maxWidth: '600px' }}>
      <div className="card shadow-lg p-4 rounded-4 border-0 animate__animated animate__fadeIn">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0 text-primary">
            <i className="bi bi-building-add me-2"></i> Add Department
          </h3>
          <Link
            to="/admin-dashboard/departments"
            className="btn btn-outline-secondary btn-sm"
          >
            <i className="bi bi-arrow-left me-1"></i> Back
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="dep_name" className="form-label fw-bold">
              Department Name
            </label>
            <input
              type="text"
              id="dep_name"
              name="dep_name"
              onChange={handleChange}
              value={department.dep_name}
              className="form-control"
              placeholder="Enter department name"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label fw-bold">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              onChange={handleChange}
              value={department.description}
              className="form-control"
              placeholder="Enter description"
              rows="4"
              required
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => navigate("/admin-dashboard/departments")}
            >
              <i className="bi bi-x-circle me-1"></i> Cancel
            </button>
            <button type="submit" className="btn btn-success">
              <i className="bi bi-plus-circle me-1"></i> Add Department
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</>

  );
}

export default AddDepartment;
