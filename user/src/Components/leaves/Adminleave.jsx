import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Adminleave = () => {
  const [leaves, setLeaves] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null); // For modal
  const itemsPerPage = 8;

  const fetchLeave = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/leaves`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data.success) {
        const data = response.data.leaves.map((leave, index) => {
          const fromDate = new Date(leave.fromDate);
          const toDate = new Date(leave.toDate);
          const timeDiff = toDate.getTime() - fromDate.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

          return {
            _id: leave._id,
            sno: index + 1,
            employeeId: leave.employeeId?.employeeId || 'N/A',
            name: leave.employeeId?.userId?.name || 'Unknown',
            email: leave.employeeId?.userId?.email || 'N/A',
            leaveType: leave.leaveType || 'N/A',
            department: leave.employeeId?.department?.dep_name || 'N/A',
            fromDate: leave.fromDate,
            toDate: leave.toDate,
            reason: leave.description || "N/A",
            days: daysDiff,
            status: leave.status || 'Pending'
          };
        });

        setLeaves(data);
        setError(null);
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setError(error.response.data.error);
      } else {
        setError("Error fetching leaves. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeave();
  }, []);

  // Filter leaves
  const filteredLeaves = leaves.filter(leave => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      (leave.employeeId || '').toLowerCase().includes(searchTermLower) ||
      (leave.name || '').toLowerCase().includes(searchTermLower) ||
      (leave.department || '').toLowerCase().includes(searchTermLower) ||
      (leave.leaveType || '').toLowerCase().includes(searchTermLower);

    const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeaves = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

 const handleUpdateStatus = async (id, status) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/leaves/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    if (response.data.success) {
      const leave = response.data.leave;

      // flatten it like in fetchLeave
      const updatedLeave = {
        _id: leave._id,
        employeeId: leave.employeeId?.employeeId || 'N/A',
        name: leave.employeeId?.userId?.name || 'Unknown',
        email: leave.employeeId?.userId?.email || 'N/A',
        department: leave.employeeId?.department?.dep_name || 'N/A',
        leaveType: leave.leaveType || 'N/A',
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        description: leave.description || "N/A",
        days: Math.ceil((new Date(leave.toDate) - new Date(leave.fromDate)) / (1000 * 3600 * 24)) + 1,
        status: leave.status || 'Pending'
      };

      // update state
      setLeaves(prevLeaves =>
        prevLeaves.map(l => (l._id === id ? updatedLeave : l))
      );
      setSelectedLeave(updatedLeave); // ✅ now modal always gets flat data
    }
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Failed to update status");
  }
};

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-success';
      case 'Pending':
        return 'bg-warning';
      case 'Rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3">Loading leaves...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <div>{error}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setError(null)}></button>
        </div>
        <div className="text-center">
          <button className="btn btn-primary" onClick={fetchLeave}>
            <i className="fas fa-refresh me-2"></i>Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header pb-0 bg-light border-0">
              <div className="d-lg-flex">
                <div>
                  <h5 className="mb-0">Leave Management</h5>
                  <p className="text-sm mb-0 text-muted">Manage employee leave requests</p>
                </div>
                <div className="ms-auto my-auto mt-lg-0 mt-4">
                  <div className="input-group">
                    <span className="input-group-text text-body">
                      <i className="fas fa-search" aria-hidden="true"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, ID, department..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body px-0 pb-0">
              <div className="d-flex justify-content-between align-items-center px-4">
                <div className="d-flex flex-wrap">
                  {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                    <button
                      key={status}
                      className={`btn btn-sm me-2 mb-2 ${
                        statusFilter === status
                          ? status === 'All'
                            ? 'btn-primary'
                            : status === 'Pending'
                            ? 'btn-warning'
                            : status === 'Approved'
                            ? 'btn-success'
                            : 'btn-danger'
                          : `btn-outline-${status === 'All' ? 'primary' : status.toLowerCase()}`
                      }`}
                      onClick={() => handleStatusFilter(status)}
                    >
                      {status === 'All' ? 'All Leaves' : status}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-secondary">
                  Showing {filteredLeaves.length} of {leaves.length} results
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-flush" id="leaves-list">
                  <thead className="thead-light">
                    <tr>
                      <th>S.No</th>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Leave Type</th>
                      <th>Department</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLeaves.length > 0 ? (
                      currentLeaves.map((leave, index) => (
                        <tr key={leave._id}>
                          <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td>{leave.employeeId}</td>
                          <td>{leave.name}</td>
                          <td>{leave.leaveType}</td>
                          <td>{leave.department}</td>
                          <td>{leave.days}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(leave.status)}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => setSelectedLeave(leave)}
                              data-bs-toggle="modal"
                              data-bs-target="#leaveDetailsModal"
                            >
                              <i className="fas fa-eye me-2"></i>View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          {searchTerm || statusFilter !== 'All'
                            ? 'No leaves found matching your criteria'
                            : 'No leave requests found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-footer bg-light border-0">
              {filteredLeaves.length > 0 && (
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li
                        key={i + 1}
                        className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                      >
                        <button className="page-link" onClick={() => paginate(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Leave Details Modal */}
      <div className="modal fade" id="leaveDetailsModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Leave Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            {selectedLeave && (
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Employee ID:</strong> {selectedLeave.employeeId}</p>
                    <p><strong>Name:</strong> {selectedLeave.name}</p>
                    <p><strong>Email:</strong> {selectedLeave.email}</p>
                    <p><strong>Department:</strong> {selectedLeave.department}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Leave Type:</strong> {selectedLeave.leaveType}</p>
                    <p><strong>From:</strong> {new Date(selectedLeave.fromDate).toLocaleDateString()}</p>
                    <p><strong>To:</strong> {new Date(selectedLeave.toDate).toLocaleDateString()}</p>
                    <p><strong>Total Days:</strong> {selectedLeave.days}</p>
                  </div>
                </div>
                <p><strong>Reason:</strong> {selectedLeave.reason}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${getStatusBadgeClass(selectedLeave.status)}`}>
                    {selectedLeave.status}
                  </span>
                </p>
              </div>
            )}
            <div className="modal-footer">
                            <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleUpdateStatus(selectedLeave._id, "Approved")}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleUpdateStatus(selectedLeave._id, "Rejected")}
                >
                  Reject
                </button>
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adminleave;
