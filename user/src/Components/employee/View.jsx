import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const View = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (response.data.success) {
          setEmployee(response.data.employee);
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        alert("Error loading employee data");
        navigate("/admin-dashboard/employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-50">
        <div className="text-center">
          <div className="text-danger mb-3">
            <i className="bi bi-person-x-fill" style={{fontSize: '3rem'}}></i>
          </div>
          <h5 className="text-muted">Employee not found</h5>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate("/admin-dashboard/employees")}
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <style>
        {`
       
        body{
      background-color: #d6d8e2ff
      }
          .card {
            transition: transform 0.2s ease-in-out;
          }
          .card:hover {
            transform: translateY(-2px);
          }
          .badge {
            font-size: 0.8rem;
            padding: 0.5rem 0.8rem;
          }
          .btn-group .btn {
            border-radius: 0.375rem;
            margin: 0 0.25rem;
          }
          .profile-img {
            width: 130px;
            height: 130px;
            object-fit: cover;
            border: 4px solid #fff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
        `}
      </style>
      
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Header Card */}
          <div className="card shadow-lg border-0 mb-4">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-auto">
                  <img
                    src={
                      employee.image
                        ? (employee.image.startsWith('http') ? employee.image : `${import.meta.env.VITE_API_URL}/uploads/${employee.image}`)
                        : "https://i.pravatar.cc/150"
                    }
                    alt={employee.userId?.name || "Employee"}
                    className="rounded-circle profile-img"
                    onError={(e) => {
                      e.target.src = "https://i.pravatar.cc/150";
                    }}
                  />
                </div>
                <div className="col">
                  <h2 className="mb-1 text-primary fw-bold">{employee.userId?.name || "N/A"}</h2>
                  <p className="text-muted mb-1">
                    <i className="bi bi-envelope me-2"></i>
                    {employee.userId?.email || "N/A"}
                  </p>
                  <p className="text-muted mb-2">
                    <i className="bi bi-person-badge me-2"></i>
                    {employee.employeeId}
                  </p>
                  <span className="badge bg-primary bg-gradient">
                    <i className="bi bi-star-fill me-1"></i>
                    {employee.userId?.role || "N/A"}
                  </span>
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate("/admin-dashboard/employees")}
                  >
                    <i className="bi bi-arrow-left me-1"></i>Back
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="row">
            {/* Personal Information */}
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-person-lines-fill me-2"></i>
                    Personal Information
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="text-muted small">Email Address</label>
                      <p className="mb-2">
                        <i className="bi bi-envelope-fill text-primary me-2"></i>
                        {employee.userId?.email || "N/A"}
                      </p>
                    </div>
                    <div className="col-6">
                      <label className="text-muted small">Date of Birth</label>
                      <p className="mb-2">
                        <i className="bi bi-calendar-event text-primary me-2"></i>
                        {formatDate(employee.dob)}
                      </p>
                    </div>
                    <div className="col-6">
                      <label className="text-muted small">Age</label>
                      <p className="mb-2">
                        <i className="bi bi-heart text-primary me-2"></i>
                        {calculateAge(employee.dob)} years
                      </p>
                    </div>
                    <div className="col-6">
                      <label className="text-muted small">Gender</label>
                      <p className="mb-2">
                        <i className="bi bi-gender-ambiguous text-primary me-2"></i>
                        {employee.gender || "N/A"}
                      </p>
                    </div>
                    <div className="col-6">
                      <label className="text-muted small">Marital Status</label>
                      <p className="mb-0">
                        <i className="bi bi-people text-primary me-2"></i>
                        {employee.maritalStatus || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-briefcase-fill me-2"></i>
                    Professional Information
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="text-muted small">Department</label>
                      <p className="mb-2">
                        <i className="bi bi-building text-success me-2"></i>
                        {employee.department?.dep_name || "N/A"}
                      </p>
                    </div>
                    <div className="col-6">
                      <label className="text-muted small">Designation</label>
                      <p className="mb-2">
                        <i className="bi bi-person-badge text-success me-2"></i>
                        {employee.designation || "N/A"}
                      </p>
                    </div>
                    <div className="col-6">
                      <label className="text-muted small">Salary</label>
                      <p className="mb-2">
                        <i className="bi bi-currency-dollar text-success me-2"></i>
                        ${employee.salary?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="col-6">
                      <label className="text-muted small">Role</label>
                      <p className="mb-2">
                        <i className="bi bi-star-fill text-success me-2"></i>
                        {employee.userId?.role || "N/A"}
                      </p>
                    </div>
                    <div className="col-12">
                      <label className="text-muted small">Employee Since</label>
                      <p className="mb-0">
                        <i className="bi bi-clock-history text-success me-2"></i>
                        {employee.createdAt ? formatDate(employee.createdAt) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <div className="btn-group" role="group">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate(`/admin-dashboard/employees/edit/${employee._id}`)}
                >
                  <i className="bi bi-pencil me-2"></i>Edit Profile
                </button>
                <button
                  className="btn btn-outline-success"
                  onClick={() => navigate(`/admin-dashboard/employees/employeesalary/${employee._id}`)}
                >
                  <i className="bi bi-currency-dollar me-2"></i>Salary Details
                </button>
                <button
                  className="btn btn-outline-warning"
                  onClick={() => navigate(`/admin-dashboard/employees/leaves/${employee._id}`)}
                >
                  <i className="bi bi-calendar-event me-2"></i>Leave Management
                </button>
                <button
                  className="btn btn-outline-info"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-2"></i>Print Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default View;