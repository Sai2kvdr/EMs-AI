import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddSalary() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    department: "",
    payDate: new Date().toISOString().split('T')[0],
    allowances: 0,
    deductions: 0,
    netSalary: 0,
  });
  const [baseSalary, setBaseSalary] = useState(0);
  const [loading, setLoading] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState(null);

  const navigate = useNavigate();

  // Fetch departments and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/department`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (deptRes.data.success) setDepartments(deptRes.data.departments);

        // Fetch employees with populated data
        const empRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (empRes.data.success) setEmployees(empRes.data.employees);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error loading data");
      }
    };

    fetchData();
  }, []);

  // When employee is selected, fetch their details
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (formData.employeeId) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees/${formData.employeeId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          
          if (res.data.success) {
            const employee = res.data.employee;
            setEmployeeDetails(employee);
            setBaseSalary(employee.salary || 0);
            
            // Auto-set department if employee has one
            if (employee.department && !formData.department) {
              setFormData(prev => ({
                ...prev,
                department: employee.department._id || employee.department
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching employee details:", error);
        }
      }
    };

    fetchEmployeeDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.employeeId]);

  // Recalculate net salary when base salary, allowances, or deductions change
  useEffect(() => {
    const net = baseSalary + (Number(formData.allowances) || 0) - (Number(formData.deductions) || 0);
    setFormData(prev => ({ ...prev, netSalary: net }));
  }, [baseSalary, formData.allowances, formData.deductions]);

  const handleChange = (e) => {
  const { name, value } = e.target;
  if (name === "department") {
    setFormData(prev => ({ ...prev, department: value, employeeId: "" })); // reset employeeId
    setEmployeeDetails(null); // clear employee card
    setBaseSalary(0);
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/salaries`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        alert("✅ Salary added successfully!");
        navigate("/admin-dashboard/salary");
      } else {
        alert(res.data.error || "Failed to add salary");
      }
    } catch (error) {
      console.error("Error adding salary:", error);
      alert(error.response?.data?.error || "Error adding salary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-2 mb-1">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-body p-3">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate("/admin-dashboard/salary")}
                >
                  ⬅ Back
                </button>
                <h5 className="mb-0 text-primary fw-bold">➕ Add Salary</h5>
                <div style={{ width: "80px" }}></div>
              </div>

              <form onSubmit={handleSubmit}>
                 {/* Department */}
                <div className="mb-3">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-select"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dep => (
                      <option key={dep._id} value={dep._id}>
                        {dep.dep_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee Selection */}
                <div className="mb-2">
                <label className="form-label">Employee *</label>
                <select
                    className="form-select"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    disabled={!formData.department} // disable until department is chosen
                >
                    <option value="">Select Employee</option>
                    {employees
                    .filter(emp => emp.department?._id === formData.department) // filter by selected dept
                    .map(emp => (
                        <option key={emp._id} value={emp._id}>
                        {emp.employeeId} - {emp.userId?.name || emp.name}
                        </option>
                    ))}
                </select>
                </div>
              {/* Employee Details */}
                {employeeDetails && (
                <div className="card bg-light mb-1 shadow-sm" style={{ maxWidth: "400px", margin: "0 auto" }}>
                    <div className="card-body p-1">
                    <h6 className="card-title mb-1 text-primary">Employee Details</h6>
                    <p className="mb-1"><strong>Name:</strong> {employeeDetails.userId?.name || employeeDetails.name}</p>
                    <p className="mb-1"><strong>Base Salary:</strong> ₹{employeeDetails.salary?.toLocaleString()}</p>
                    </div>
                </div>
                )}

                {/* Pay Date */}
                <div className="mb-1">
                  <label className="form-label">Pay Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="payDate"
                    value={formData.payDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  {/* Allowances */}
                  <div className="col-md-6 mb-1">
                    <label className="form-label">Allowances (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="allowances"
                      value={formData.allowances}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>

                  {/* Deductions */}
                  <div className="col-md-6 mb-1">
                    <label className="form-label">Deductions (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="deductions"
                      value={formData.deductions}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>

                {/* Net Salary Display */}
                <div className="card bg-success text-white mb-2 mt-1">
                  <div className="card-body text-center">
                    <h6 className="card-title">Net Salary</h6>
                    <h4 className="fw-bold">₹{formData.netSalary.toLocaleString()}</h4>
                    <small>
                      Base (₹{baseSalary.toLocaleString()}) + 
                      Allowances (₹{formData.allowances}) - 
                      Deductions (₹{formData.deductions})
                    </small>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "💵 Add Salary"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddSalary;