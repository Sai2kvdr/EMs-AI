import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ViewSalary() {
  const [salaries, setSalaries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchSalaries();
  }, [currentPage]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/salaries`,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        }
      );
      
      // If the API returns just an array (not wrapped in success/pagination)
      if (Array.isArray(response.data)) {
        setSalaries(response.data);
      } 
      // If the API returns the expected format with success field
      else if (response.data.success) {
        setSalaries(response.data.salaries || []);
      } else {
        console.error("Failed to fetch salaries");
      }
    } catch (err) {
      console.error("Error fetching salaries:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter salaries based on search
  const filteredSalaries = salaries.filter(sal =>
    sal.employeeId?.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
    sal.department?.dep_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate pagination values
  const totalItems = filteredSalaries.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSalaries = filteredSalaries.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container d-flex justify-content-center mt-5">
      <div className="col-lg-10 col-md-12">
        <div className="card shadow-lg border-0 rounded-3 p-4">
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-primary">Salary Records</h2>
            <Link to="/admin-dashboard/salary/add" className="btn btn-primary">
              + Add Salary
            </Link>
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Search by employee ID or department"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control form-control-lg shadow-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading salary data...</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "60px" }}>S.No</th>
                      <th>Employee ID</th>
                      <th>Department</th>
                      <th>Pay Date</th>
                      <th>Allowances</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSalaries.length > 0 ? (
                      currentSalaries.map((sal, index) => (
                        <tr key={sal._id || index}>
                          <td>{startIndex + index + 1}</td>
                          <td className="fw-semibold">{sal.employeeId?.employeeId || "N/A"}</td>
                          <td>{sal.department?.dep_name || "N/A"}</td>
                          <td>{new Date(sal.payDate).toLocaleDateString()}</td>
                          <td>₹{sal.allowances?.toLocaleString() || "0"}</td>
                          <td>₹{sal.deductions?.toLocaleString() || "0"}</td>
                          <td><strong>₹{sal.netSalary?.toLocaleString() || "0"}</strong></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          {search ? "No matching salary records found" : "No salary records found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <p className="mb-0 text-muted small">
                    Showing {currentSalaries.length} of {filteredSalaries.length} salary records
                  </p>
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          &lt;
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li
                          key={i}
                          className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                        >
                          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          &gt;
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewSalary;