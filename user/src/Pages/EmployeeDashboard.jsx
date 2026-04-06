import React from 'react'
import EmpSidebar from '../Components/EmployeeDashboard/EmpSidebar'
import EmpNavbar from '../Components/EmployeeDashboard/EmpNavbar'
import { Outlet } from 'react-router-dom'

const EmployeeDashboard = () => {
  return (
    <div>
      <div className='d-flex'>
     <EmpSidebar/>
     <div className='flex-grow-1'>
      <EmpNavbar/>
      <Outlet/>
     </div>
    </div>
    </div>
  )
}

export default EmployeeDashboard
