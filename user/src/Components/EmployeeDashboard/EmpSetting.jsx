import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";

const EmpsetSetting = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Added logout function from authContext
  const [setting, setSetting] = useState({
    userId: user._id,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSetting({ ...setting, [name]: value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError(null);
    setSuccess(null);
    
    // Validation
    if (!setting.oldPassword || !setting.newPassword || !setting.confirmPassword) {
      setError("All fields are required");
      return;
    }
    
    if (setting.newPassword !== setting.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }
    

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/setting/change-password`,
        setting,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccess("Password changed successfully. Please login again.");
        setTimeout(() => {
          logout(); // Use the logout function from authContext
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.log("Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to change password");
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }

  return (
    <div className="container d-flex justify-content-center mt-5">
      <div className="col-lg-6 col-md-8">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-header bg-primary text-white rounded-top-4 py-3">
            <div className="d-flex align-items-center">
              <i className="bi bi-shield-lock me-2"></i>
              <h4 className="mb-0">Change Password</h4>
            </div>
          </div>
          <div className="card-body p-4">
            {/* Error Message */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError(null)}></button>
              </div>
            )}
            
            {/* Success Message */}
            {success && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                {success}
                <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Old Password */}
              <div className="mb-3">
                <label className="form-label">Old Password</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword.old ? "text" : "password"}
                    name="oldPassword"
                    className="form-control"
                    placeholder="Enter old password"
                    value={setting.oldPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => togglePasswordVisibility("old")}
                  >
                    <i className={`bi ${showPassword.old ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-key"></i>
                  </span>
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    className="form-control"
                    placeholder="Enter new password"
                    value={setting.newPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    <i className={`bi ${showPassword.new ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-check2-square"></i>
                  </span>
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Re-enter new password"
                    value={setting.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    <i className={`bi ${showPassword.confirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* Button */}
              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-lg">
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Change Password
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="card-footer bg-light text-muted text-center py-2">
            <small>Tip: Don't reuse old passwords and avoid common words.</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpsetSetting;