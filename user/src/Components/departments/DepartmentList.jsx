import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const DepartmentList = () => {
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/department`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          setDepartments(response.data.departments);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/department/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        setDepartments(departments.filter((dept) => dept._id !== id));
      }
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  const handleSort = () => {
    setSortAsc(!sortAsc);
  };

  const filteredDepartments = departments
    .filter((dept) =>
      dept.dep_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortAsc
        ? a.dep_name.localeCompare(b.dep_name)
        : b.dep_name.localeCompare(a.dep_name)
    );

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container d-flex justify-content-center mt-5">
      <div className="col-lg-10 col-md-12">
        <div className="card shadow-lg border-0 rounded-3 p-4">
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-primary">Department List</h2>
            <Link
              to="/admin-dashboard/departments/add-department"
              className="btn btn-primary"
            >
              + Add Department
            </Link>
          </div>

       
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Search department name"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); 
              }}
              className="form-control form-control-lg shadow-sm"
            />
          </div>

         
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "60px" }}>S.No</th>
                  <th style={{ cursor: "pointer" }} onClick={handleSort}>
                    Department{" "}
                    <i className={`bi bi-arrow-${sortAsc ? "down" : "up"}-short`}></i>
                  </th>
                  <th>Description</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDepartments.length > 0 ? (
                  paginatedDepartments.map((dept, index) => (
                    <tr key={dept._id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="fw-semibold">{dept.dep_name}</td>
                      <td className="text-muted">{dept.description}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() =>
                            navigate(`/admin-dashboard/departments/edit/${dept._id}`)
                          }
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(dept._id)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">
                      No departments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

       
          <div className="d-flex justify-content-between align-items-center mt-3">
            <p className="mb-0 text-muted small">
              Showing {paginatedDepartments.length} of {filteredDepartments.length}
            </p>
            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
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
                  >
                    &gt;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentList;
