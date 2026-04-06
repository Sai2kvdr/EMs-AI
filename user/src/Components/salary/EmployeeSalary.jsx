import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EmployeeSalary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salaries, setSalaries] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5
  });

  useEffect(() => {
    fetchSalaries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentPage]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/salaries/employee/${id}?page=${currentPage}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        // Process salaries to use employee baseSalary if basicSalary is empty
        const processedSalaries = response.data.salaries.map(salary => ({
          ...salary,
          // Use employee's baseSalary if basicSalary is empty, null, or 0
          basicSalary: salary.basicSalary || salary.basicSalary === 0 
            ? salary.basicSalary 
            : (response.data.employee?.baseSalary || 0)
        }));
        
        setSalaries(processedSalaries || []);
        setEmployee(response.data.employee);
        setPagination(response.data.pagination || {
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 5
        });
      } else {
        setError(response.data.error || "Failed to fetch salaries");
      }
    } catch (err) {
      console.error("Error fetching salaries:", err);
      setError(err.response?.data?.error || "Error loading salary data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading salary data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">
          <h4>Error</h4>
          <p>{error}</p>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Salary Details</h4>
            <button 
              className="btn btn-light btn-sm"
              onClick={() => navigate(-1)}
            >
              ⬅ Back
            </button>
          </div>
        </div>

        <div className="card-body">
          {/* Employee Info */}
          {employee && (
            <div className="row mb-4">
              <div className="col-md-6">
                <h5>Employee Information</h5>
                <p><strong>Employee ID:</strong> {employee.employeeId}</p>
                <p><strong>Base Salary:</strong> ₹{employee.baseSalary?.toLocaleString()}</p>
                {employee.department && (
                  <p><strong>Department:</strong> {employee.department}</p>
                )}
              </div>
              <div className="col-md-6 text-md-end">
                <h5>Salary Summary</h5>
                <p><strong>Total Records:</strong> {pagination.totalItems}</p>
                {salaries.length > 0 && (
                  <p>
                    <strong>Latest Net Salary:</strong> ₹
                    {salaries[0].netSalary?.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Salary Table */}
          {salaries.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>S.No</th>
                      <th>Pay Date</th>
                      <th>Basic Salary</th>
                      <th>Allowances</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaries.map((sal, index) => (
                      <tr key={sal._id}>
                        <td>{(currentPage - 1) * pagination.itemsPerPage + index + 1}</td>
                        <td>{formatDate(sal.payDate)}</td>
                        <td>₹{sal.basicSalary?.toLocaleString()}</td>
                        <td className="text-success">+₹{sal.allowances?.toLocaleString()}</td>
                        <td className="text-danger">-₹{sal.deductions?.toLocaleString()}</td>
                        <td>
                          <strong className="text-success">
                            ₹{sal.netSalary?.toLocaleString()}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav className="d-flex justify-content-center mt-4">
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}

              {/* Pagination Info */}
              <div className="text-center text-muted mt-2">
                <small>
                  Showing {((currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} records
                </small>
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <div className="text-muted">
                <i className="bi bi-cash-coin display-4"></i>
                <h5 className="mt-3">No salary records found</h5>
                <p>This employee doesn't have any salary records yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeSalary;