import React from 'react'
import { useAuth } from '../../context/authContext'
import { useState,useEffect } from 'react';

const EmpNavbar = () => {
    const {user} = useAuth()
     const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dateTime);


  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(dateTime);

  return (
    <>
      <style>
        {`
          .navbar-custom {
            position: sticky;
            top: 0;
            padding: 12px 20px;
            color: #f8f9fa;
            background-color: #373637ff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 10px 5px rgba(0,0,0,0.1);
            font-weight: 500;
          }

          .datetime {
            display: flex;
            align-items: center;
            gap: 20px;
            font-size: 0.8rem;
          }

          .datetime i {
            margin-right: 6px;
            color: #ca3618ff;
            font-size: 1.1rem;
          }
        `}
      </style>

      <div className="navbar-custom p-4">
        <span style={{fontSize: "1.1rem"}}>Welcome {user.name}...</span>
        <div className="datetime">
          <span>
            <i className="bi bi-calendar3"></i>
            {formattedDate}
          </span>
          <span>
            <i className="bi bi-clock"></i>
            {formattedTime}
          </span>
        </div>
      </div>
    </>
  );
};

export default EmpNavbar

