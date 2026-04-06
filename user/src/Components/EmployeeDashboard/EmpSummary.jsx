import React, { useEffect, useState } from "react";
import axios from "axios";

const EmpSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee/summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching employee summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const formatINR = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (!summary) return <div className="text-center py-4">Failed to load summary</div>;

  const { profile, stats, leaveStatus, upcomingEvents } = summary;

  return (
    <div className="container my-4 summary-wrap">
      <style>{`
      body{
      background-color: #d6d8e2ff
      }
        .summary-wrap {
          font-family: "Segoe UI", sans-serif;
        }

        .profile-header {
          background: linear-gradient(135deg, #2f46abff 100%, #19032fff 100%);
          border-left: 5px solid #3144b3ff;
          color: green;
          position: relative;
          overflow: hidden;
        }

        .profile-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: rgba(138, 27, 27, 0.1);
          transform: rotate(25deg);
          transition: all 0.5s ease;
        }

        .profile-header:hover::before {
          transform: rotate(45deg);
        }

        .badge.bg-primary {
          background: linear-gradient(135deg, #ff7e5f, #feb47b) !important;
          animation: pulse 2s infinite;
        }

        .kpi {
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid rgba(255, 255, 255, 0.5);
          position: relative;
          overflow: hidden;
        }

        .kpi::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .kpi:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .kpi:hover::before {
          transform: scaleX(1);
        }

        .text-primary {
          color: #667eea !important;
        }

        .text-success {
          color: #28a745 !important;
        }

        .badge.bg-secondary {
          background: linear-gradient(135deg, #6c757d, #495057) !important;
          color: white !important;
        }

        .pill {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.5);
          position: relative;
          overflow: hidden;
        }

        .pill::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .pill:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .pill:hover::before {
          opacity: 1;
        }

        .fs-5.text-primary {
          color: #667eea !important;
          font-weight: 600;
        }

        .card {
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.5);
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .card:hover {
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .list-group-item {
          transition: all 0.3s ease;
          background: transparent !important;
        }

        .list-group-item:hover {
          background: rgba(102, 126, 234, 0.05) !important;
        }

        .badge.bg-light {
          background: rgba(102, 126, 234, 0.1) !important;
          color: #667eea !important;
          transition: all 0.3s ease;
        }

        .badge.bg-light:hover {
          background: rgba(102, 126, 234, 0.2) !important;
          transform: rotate(15deg);
        }

        .fw-bold {
          color: #495057;
          position: relative;
        }

        .fw-bold::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 3px;
        }

        .fw-semibold {
          color: #495057;
          position: relative;
        }

        .fw-semibold::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 30px;
          height: 2px;
          background: linear-gradient(13deg, #bfac18ff, #764ba2);
          border-radius: 2px;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 126, 95, 0.4);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(255, 126, 95, 0);
          }
          100% {
            box-shadow: 0 10px 0 0 rgba(255, 126, 95, 0);
          }
        }
      `}</style>
      {/* Profile Header */}
      <div className="card p-3 mb-4 shadow-sm profile-header">
        <h5 className="mb-1">Welcome, {profile?.name}!</h5>
        <p className="mb-2 ">
        {profile?.department} · {profile?.designation}
        </p>
        <span className="badge bg-primary mt-2">ID: {profile?.employeeId}</span>
      </div>

      <h6 className="mb-3 fw-bold">My Dashboard</h6>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6">
          <div className="card kpi bg-light shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center">
              <span className="kpi-title text-primary">
                <i className="bi bi-calendar-check me-1"></i> Leaves
              </span>
              <span className="badge bg-secondary">Remaining</span>
            </div>
            <h4 className="mt-2">{stats.leavesRemaining}</h4>
          </div>
        </div>
        <div className="col-6">
          <div className="card kpi bg-light shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center">
              <span className="kpi-title text-success">
                <i className="bi bi-cash-coin me-1"></i> Salary
              </span>
              <span className="badge bg-secondary">Monthly</span>
            </div>
            <h4 className="mt-2">{formatINR(stats.monthlySalary)}</h4>
          </div>
        </div>
      </div>

      {/* Leave Status + Events */}
      <div className="row g-3">
        {/* Leave Status */}
        <div className="col-12 col-lg-8">
          <div className="card p-3 shadow-sm">
            <h6 className="mb-3 fw-semibold">Leave Status</h6>
            <div className="row g-2">
              {Object.entries(leaveStatus).map(([status, count]) => (
                <div className="col-6 col-md-3" key={status}>
                  <div className="pill text-center py-2 border rounded">
                    <div className="fw-semibold text-capitalize">{status}</div>
                    <div className="fs-5 text-primary">{count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="col-12 col-lg-4">
          <div className="card p-3 shadow-sm">
            <h6 className="mb-3 fw-semibold">
              <i className="bi bi-calendar-event me-2"></i>Upcoming Events
            </h6>
            {upcomingEvents.length > 0 ? (
              <ul className="list-group list-group-flush">
                {upcomingEvents.map((event) => (
                  <li key={event._id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <div>
                      <strong><i className="bi bi-calendar-event me-2"></i> {event.title}</strong>
                      <div className="text-muted small">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="badge bg-light text-dark">
                      <i className="bi bi-calendar-event"></i>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted small">No upcoming events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpSummary;