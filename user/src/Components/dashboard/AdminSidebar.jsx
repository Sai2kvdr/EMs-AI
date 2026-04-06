import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/authContext'

const AdminSidebar = () => {
   const {logout} = useAuth();
  return (
    <>
      {/* Internal CSS */}
      <style>
        {`
          .sidebar {
            width: 250px;
            height: 100vh;
            background-color: #212529; /* Bootstrap dark */
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: space-between; /* pushes logout to bottom */
            padding: 20px 0;
          }

          .sidebar-link {
            padding: 15px 20px;
            margin: 12px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 12px; /* Equal spacing between icon & text */
            color: white;
            text-decoration: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.4); /* White divider line */
            transition: all 0.3s ease;
          }

          .sidebar-link:hover {
            background-color: rgba(255, 255, 255, 0.15);
          }

           .sidebar-link.active {
            background-color: #0d6efd; /* Blue highlight */
            font-weight: bold;
            border-left: 4px solid white; /* White line indicator on active */
            border-radius: 0 6px 6px 0;
          }

          .logout-link {
            padding: 15px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
           background-color: #212529;
            color: #ff4d4d; /* Red text */
            text-decoration: none;
            border-top: 1px solid rgba(255, 255, 255, 0.4); /* Divider above logout */
            transition: all 0.3s ease;
          }

          .logout-link:hover {
            background-color: rgba(158, 21, 21, 0.2); /* Light red hover */
            border-radius: 6px;
          }
        `}
      </style>
      <div className="sidebar">
        <div>
          <h3 className="fs-4 text-center mb-4 mt-4" style={{
        fontFamily: '"Cinzel", serif',
        fontWeight: 500,  
        fontStyle: "normal"
      }}> Remedy MS</h3>
          <ul className="nav nav-pills flex-column mb-auto">
            <li>
              <NavLink to="/admin-dashboard" end className="sidebar-link ">
                <i className="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin-dashboard/employees" className="sidebar-link">
                <i className="bi bi-people"></i>
                <span>Employee</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin-dashboard/departments" className="sidebar-link">
                <i className="bi bi-building"></i>
                <span>Department</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin-dashboard/leaves" className="sidebar-link">
                <i className="bi bi-calendar-check"></i>
                <span>Leave</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin-dashboard/salary" className="sidebar-link">
                <i className="bi bi-cash-stack"></i>
                <span>Salary</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin-dashboard/setting" className="sidebar-link">
                <i className="bi bi-gear"></i>
                <span>Settings</span>
              </NavLink>
            </li>
          </ul>
        </div>
        <div>
          <button className="logout-link w-100 " onClick={logout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar
