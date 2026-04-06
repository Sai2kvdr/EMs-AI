import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";

const List = () => {
  useAuth();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setEmployees(response.data.employees || []);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

 const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this employee and all associated records (user account, salary ,leaves records)?")) return;
  
  try {
    const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // Check if the deletion was successful based on the response format
    if (response.data.success) {
      alert(response.data.message || "Employee and associated records deleted successfully");
      
      // Refresh the employee list after deletion
      fetchEmployees();
    } else {
      alert(response.data.message || "Failed to delete employee");
    }
  } catch (error) {
    console.error("Error deleting employee:", error);
    
    // Handle different error response formats
    if (error.response?.data?.message) {
      alert(`Error: ${error.response.data.message}`);
    } else if (error.response?.data?.error) {
      alert(`Error: ${error.response.data.error}`);
    } else {
      alert("Error deleting employee. Please try again.");
    }
  }
};

  const handleSort = () => {
    setSortAsc(!sortAsc);
  };

  // Format joining date from createdAt
  const formatJoinDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredEmployees = employees
    .filter((emp) => {
      const searchTerm = search.toLowerCase();
      const userName = emp.userId?.name || "";
      const userEmail = emp.userId?.email || "";
      const departmentName = emp.department?.dep_name || "";
      
      return (
        userName.toLowerCase().includes(searchTerm) ||
        (emp.employeeId || "").toLowerCase().includes(searchTerm) ||
        departmentName.toLowerCase().includes(searchTerm) ||
        userEmail.toLowerCase().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      const nameA = a.userId?.name || "";
      const nameB = b.userId?.name || "";
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function to handle image errors
  const handleImageError = (e) => {
    e.target.src = "https://i.pravatar.cc/40";
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center mt-5">
      <style>
        {`body{
      background-color: #d6d8e2ff
      }`}
      </style>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center mt-5">
      <div className="col-lg-11 col-md-12">
        <div className="card shadow-lg border-0 rounded-3 p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-primary">Manage Employee</h2>
            <Link
              to="/admin-dashboard/employees/add-employee"
              className="btn btn-primary"
            >
              + Add Employee
            </Link>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Search by name, ID, department"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control form-control-lg shadow-sm"
            />
          </div>

          {/* Employee Table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "60px" }}>S.No</th>
                  <th>Profile</th>
                  <th style={{ cursor: "pointer" }} onClick={handleSort}>
                    Name <i className={`bi bi-arrow-${sortAsc ? "down" : "up"}-short`}></i>
                  </th>
                  <th>Employee ID</th>
                  <th>Joining Date</th>
                  <th>Department</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((emp, index) => (
                    <tr key={emp._id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>
                        <img
                          src={
                            emp.image
                              ? `${import.meta.env.VITE_API_URL}/uploads/${emp.image}`
                              : "https://i.pravatar.cc/40"
                          }
                          alt={emp.userId?.name || "Employee"}
                          className="rounded-circle shadow-sm"
                          width="40"
                          height="40"
                          onError={handleImageError}
                        />
                      </td>
                      <td className="fw-semibold">{emp.userId?.name || "N/A"}</td>
                      <td>{emp.employeeId || "N/A"}</td>
                      <td>{formatJoinDate(emp.createdAt)}</td>
                      <td>{emp.department?.dep_name || "N/A"}</td>
                      <td className="text-center">
                        <div className="btn-group gap-2" role="group">
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => navigate(`/admin-dashboard/employees/view/${emp._id}`)}
                          >
                            <i className="bi bi-eye"></i> View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/admin-dashboard/employees/edit/${emp._id}`)}
                          >
                            <i className="bi bi-pencil"></i> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => navigate(`/admin-dashboard/employees/employeesalary/${emp._id}`)}
                          >
                            💰 Salary
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                          onClick={() => navigate(`/admin-dashboard/employees/leaves/${emp._id}`)}
                          >
                            📝 Leave
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(emp._id)}
                          >
                            <i className="bi bi-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      {employees.length === 0 ? "No employees found" : "No matching employees found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredEmployees.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <p className="mb-0 text-muted small">
                Showing {paginatedEmployees.length} of {filteredEmployees.length} employees
              </p>
              <nav>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                      &lt;
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                      &gt;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default List;