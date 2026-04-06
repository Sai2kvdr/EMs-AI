import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "" });

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add Event
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/events`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setForm({ title: "", date: "" });
      setShowForm(false);
      fetchSummary();
    } catch (err) {
      console.error("Error adding event:", err);
    }
  };

  // Delete Event
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/events/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchSummary();
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading dashboard...</p>
    </div>
  );
  
  if (!summary) return (
    <div className="error-container">
      <h3>Failed to load summary</h3>
      <button className="retry-btn" onClick={fetchSummary}>Try Again</button>
    </div>
  );

  const stats = {
    employees: summary.totalEmployees || 0,
    departments: summary.totalDepartments || 0,
    monthlyPay: summary.monthlyPay || 0,
  };

  const leave = summary.leaveSummary || {
    appliedFor: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  };

  const approvalRate =
    leave.appliedFor === 0
      ? 0
      : Math.round((leave.approved / leave.appliedFor) * 100);

  const events = summary.upcomingEvents || [];
  const recentEmployees = summary.recentEmployees || [];

  const formatINR = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif;
          transition: all 0.3s ease;
        }
        
        .summary-wrap {
          padding: 15px;
          background: linear-gradient(135deg, #f5f7fb 0%, #e8ecf1 100%);
          min-height: 88vh;
        }
        
        .section-title {
          font-weight: 700;
          letter-spacing: 0.2px;
          color: #2d3748;
          margin-bottom: 10px;
          font-size: 1.5rem;
          position: relative;
          padding-bottom: 8px;
        }
        
        .section-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background: linear-gradient(90deg, #4361ee, #3a0ca3);
          border-radius: 2px;
        }
        
        .card-white {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.06);
          height: 100%;
          border: 1px solid rgba(255, 255, 255, 0.5);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
          position: relative;
        }
        
        .card-white:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.09);
        }
        
        .card-white:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #4361ee, #3a0ca3);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .card-white:hover:before {
          opacity: 1;
        }
        
        .kpi-card {
          text-align: center;
          padding: 15px 10px;
        }
        
        .kpi-card h6 {
          color: #718096;
          font-size: 0.8rem;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .kpi-card h3 {
          color: #2d3748;
          font-weight: 700;
          font-size: 1.6rem;
          margin: 0;
        }
        
        .leave-card {
          padding: 15px;
        }
        
        .leave-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        
        .stat-item {
          text-align: center;
          padding: 8px 10px;
          background: rgba(66, 153, 225, 0.1);
          border-radius: 8px;
          flex: 1;
          margin: 0 4px;
          min-width: 90px;
        }
        
        .stat-item:nth-child(2) {
          background: rgba(72, 187, 120, 0.1);
        }
        
        .stat-item:nth-child(3) {
          background: rgba(245, 158, 11, 0.1);
        }
        
        .stat-item:nth-child(4) {
          background: rgba(245, 101, 101, 0.1);
        }
        
        .stat-item strong {
          display: block;
          font-size: 1rem;
          color: #2d3748;
        }
        
        .stat-item span {
          font-size: 0.75rem;
          color: #718096;
        }
        
        .approval-rate {
          background: linear-gradient(135deg, #4361ee, #3a0ca3);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          text-align: center;
          margin-top: 12px;
        }
        
        .approval-rate h5 {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .approval-rate .rate {
          font-size: 1.4rem;
          font-weight: 700;
          margin-top: 3px;
          display: block;
        }
        
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .list-header h6 {
          color: #2d3748;
          font-weight: 600;
          margin: 0;
          font-size: 0.95rem;
        }
        
        .add-btn {
          background: linear-gradient(135deg, #4361ee, #3a0ca3);
          border: none;
          border-radius: 20px;
          padding: 5px 12px;
          color: white;
          font-weight: 500;
          font-size: 0.8rem;
          box-shadow: 0 3px 8px rgba(67, 97, 238, 0.25);
          transition: all 0.3s ease;
        }
        
        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 12px rgba(67, 97, 238, 0.35);
        }
        
        .list-group {
          border-radius: 8px;
          overflow: hidden;
        }
        
        .list-group-item {
          padding: 10px 12px;
          border: none;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s ease;
          font-size: 0.9rem;
        }
        
        .list-group-item:last-child {
          border-bottom: none;
        }
        
        .list-group-item:hover {
          background: #f7fafc;
        }
        
        .delete-btn {
          background: #fc5c7d;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          transition: all 0.2s ease;
        }
        
        .delete-btn:hover {
          background: #e53e3e;
          transform: scale(1.1);
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
        }
        
        .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          width: 350px;
          max-width: 90%;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
          animation: slideUp 0.4s ease;
        }
        
        .modal-content h5 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #2d3748;
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        input {
          width: 100%;
          padding: 8px 12px;
          margin: 6px 0;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        input:focus {
          outline: none;
          border-color: #4361ee;
          box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
        }
        
        .form-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
        }
        
        .btn-primary {
          background: #4361ee;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          color: white;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          background: #3a0ca3;
          transform: translateY(-2px);
        }
        
        .btn-secondary {
          background: #a0aec0;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          color: white;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        .btn-secondary:hover {
          background: #718096;
          transform: translateY(-2px);
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 50vh;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4361ee;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 12px;
        }
        
        .error-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 50vh;
          text-align: center;
        }
        
        .retry-btn {
          background: #4361ee;
          border: none;
          border-radius: 6px;
          padding: 8px 20px;
          color: white;
          font-weight: 500;
          margin-top: 12px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        .retry-btn:hover {
          background: #3a0ca3;
          transform: translateY(-2px);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(15px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .summary-wrap {
            padding: 10px;
          }
          
          .leave-stats {
            flex-direction: column;
          }
          
          .stat-item {
            margin: 4px 0;
          }
          
          .section-title {
            font-size: 1.3rem;
          }
        }
      `}</style>

      <div className="summary-wrap">
        <h4 className="section-title">Dashboard Overview</h4>

        {/* KPI Cards */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-4">
            <div className="card-white kpi-card">
              <h6>Total Employees</h6>
              <h3>{stats.employees}</h3>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card-white kpi-card">
              <h6>Departments</h6>
              <h3>{stats.departments}</h3>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card-white kpi-card">
              <h6>Monthly Payroll</h6>
              <h3>{formatINR(stats.monthlyPay)}</h3>
            </div>
          </div>
        </div>

        {/* Leave Overview (Full Width) */}
        <div className="row g-3 mb-3">
          <div className="col-12">
            <div className="card-white leave-card">
              <div className="leave-stats">
                <div className="stat-item">
                  <strong>{leave.appliedFor}</strong>
                  <span>Applied</span>
                </div>
                <div className="stat-item">
                  <strong>{leave.approved}</strong>
                  <span>Approved</span>
                </div>
                <div className="stat-item">
                  <strong>{leave.pending}</strong>
                  <span>Pending</span>
                </div>
                <div className="stat-item">
                  <strong>{leave.rejected}</strong>
                  <span>Rejected</span>
                </div>
              </div>
              <div className="approval-rate">
                <h5>Approval Rate</h5>
                <span className="rate">{approvalRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Split view: Recent Employees + Upcoming Events */}
        <div className="row g-2">
          {/* Recent Employees */}
          <div className="col-12 col-lg-6">
            <div className="card-white">
              <div className="list-header">
                <h6>Recently Joined Employees</h6>
              </div>
              {recentEmployees.length === 0 ? (
                <p className="text-muted" style={{fontSize: '0.9rem', margin: 0}}>No recent employees</p>
              ) : (
                <ul className="list-group">
                  {recentEmployees.map((emp) => (
                    <li key={emp._id} className="list-group-item">
                      <span><i className="bi bi-people text-success"></i>  {emp.userId?.name}</span>
                      <small className="text-muted">
                        {new Date(emp.createdAt).toLocaleDateString()}
                      </small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="col-12 col-lg-6">
            <div className="card-white">
              <div className="list-header">
                <h6>Upcoming Events</h6>
                <button
                  className="add-btn"
                  onClick={() => setShowForm(true)}
                >
                  + Add Event
                </button>
              </div>
              {events.length === 0 ? (
                <p className="text-muted" style={{fontSize: '0.9rem', margin: 0}}>No upcoming events</p>
              ) : (
                <ul className="list-group">
                  {events.map((event) => (
                    <li
                      key={event._id}
                      className="list-group-item"
                    >
                      <div>
                        <strong style={{fontSize: '0.9rem'}}><i className="bi bi-calendar-event me-2"></i> {event.title}</strong>
                        <br />
                        <small className="text-muted">
                          {new Date(event.date).toLocaleDateString()}
                        </small>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(event._id)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h5>Add New Event</h5>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Event Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSummary;