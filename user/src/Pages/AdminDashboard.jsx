import React from 'react'
import { useAuth } from '../context/authContext'
import AdminSidebar from '../Components/dashboard/AdminSidebar'
import Navbar from '../Components/dashboard/Navbar'
import { Outlet } from 'react-router-dom'

function AdminDashboard() {
  useAuth()

  return (
    <div className='d-flex'>
     <AdminSidebar/>
     <div className='flex-grow-1'>
      <Navbar/>
      <Outlet/>
     </div>
    </div>
  )
}

export default AdminDashboard
