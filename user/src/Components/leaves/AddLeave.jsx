import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddLeave = () => {
  const [leave, setLeave] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    description: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setLeave({ ...leave, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/leaves`,
        {
          leaveType: leave.leaveType,
          fromDate: leave.fromDate,
          toDate: leave.toDate,
          description: leave.description,
        },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          }
        }
      );

      alert(response.data.message || "Leave request submitted!");
      navigate(-1); // Go back after submission
    } catch (error) {
      console.error("Error submitting leave:", error);
      alert(error.response?.data?.message || "Failed to submit leave");
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
        <h3 className="text-center mb-4">Apply for Leave</h3>
        <form onSubmit={handleSubmit}>
          {/* Leave Type */}
          <div className="mb-3">
            <label className="form-label">Leave Type</label>
            <select
              className="form-select"
              name="leaveType"
              value={leave.leaveType}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Leave Type --</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
            </select>
          </div>

          {/* From Date */}
          <div className="mb-3">
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-control"
              name="fromDate"
              value={leave.fromDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* To Date */}
          <div className="mb-3">
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-control"
              name="toDate"
              value={leave.toDate}
              onChange={handleChange}
              min={leave.fromDate || new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              name="description"
              value={leave.description}
              onChange={handleChange}
              placeholder="Enter reason for leave..."
              required
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-2"></i> Back
            </button>

            <button type="submit" className="btn btn-primary">
              <i className="bi bi-send me-2"></i> Submit Leave Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeave;