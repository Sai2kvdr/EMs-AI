import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

function Leavelist() {
  const {id} = useParams();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchLeaves();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/leaves/${id}`,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        });
      
      if (response.data.success) {
        setLeaves(response.data.leaves || []);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      if (error.response && !error.response.data.success) {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter leaves based on search
  const filteredLeaves = leaves.filter(leave =>
    leave.leaveType.toLowerCase().includes(search.toLowerCase()) ||
    leave.description.toLowerCase().includes(search.toLowerCase()) ||
    leave.status.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate pagination values
  const totalItems = filteredLeaves.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLeaves = filteredLeaves.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container d-flex justify-content-center mt-5">
      <div className="col-lg-10 col-md-12">
        <div className="card shadow-lg border-0 rounded-3 p-4">
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-primary"> Leave Applications</h2>
            <Link to="/admin-dashboard/employees" className="btn btn-primary">
              Back
            </Link>
          </div>
          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Search by leave type, description, or status"
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
              <p className="mt-2">Loading leaves...</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "60px" }}>S.No</th>
                      <th>Leave Type</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Description</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLeaves.length > 0 ? (
                      currentLeaves.map((leave, index) => (
                        <tr key={leave._id || index}>
                          <td>{startIndex + index + 1}</td>
                          <td className="fw-semibold">{leave.leaveType}</td>
                          <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                          <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                          <td className="text-muted">{leave.description}</td>
                          <td>{new Date(leave.appliedOn || leave.appliedon).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${
                              leave.status === 'Approved' ? 'bg-success' :
                              leave.status === 'Rejected' ? 'bg-danger' :
                              'bg-warning text-dark'
                            }`}>
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          {search ? "No matching leaves found" : "No leave records found"}
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
                    Showing {currentLeaves.length} of {filteredLeaves.length} leaves
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

export default Leavelist;