import {BrowserRouter, Routes, Route} from "react-router-dom";
import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import AdminDashboard from "./Pages/AdminDashboard";
import EmployeeDashboard from "./Pages/EmployeeDashboard";
import Home from "./Pages/Home";
import RoleBaseRoutes from "./Utils/RoleBaseRoutes";
import PrivateRoute from "./Utils/PrivateRoute";
import AdminSummary from "./Components/dashboard/AdminSummary";
import DepartmentList from "./Components/departments/DepartmentList";
import AddDepartment from "./Components/departments/AddDepartment";
import EditComponent from "./Components/departments/EditComponent";
import List from "./Components/employee/List";
import Add from "./Components/employee/Add";
import Edit from "./Components/employee/Edit";
import View from "./Components/employee/View";
import AddSalary from "./Components/salary/AddSalary";
import ViewSalary from "./Components/salary/ViewSalary";
import EmployeeSalary from "./Components/salary/EmployeeSalary"
import EmpSummary from "./Components/EmployeeDashboard/EmpSummary";
import EmpProfile from "./Components/EmployeeDashboard/EmpProfile";
import LeaveList from "./Components/leaves/LeaveList";
import AddLeave from "./Components/leaves/AddLeave";
import EmpSalary from "./Components/EmployeeDashboard/EmpSalary";
import EmpSetting from "./Components/EmployeeDashboard/EmpSetting";
import Adminleave from "./Components/leaves/Adminleave";
import Viewleave from "./Components/leaves/Viewleave";




function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>}></Route>
      <Route path="/login" element={<Login/>}></Route>
      <Route path="/forgot-password" element={<ForgotPassword/>}></Route>
      <Route path="/reset-password" element={<ResetPassword/>}></Route>
      <Route path="/admin-dashboard" element={
        <PrivateRoute>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <AdminDashboard/>
          </RoleBaseRoutes>
        </PrivateRoute>
        }>
          <Route index element={<AdminSummary/>}></Route>
          <Route path="/admin-dashboard/departments" element={<DepartmentList/>}></Route>
          <Route path="/admin-dashboard/departments/add-department" element={<AddDepartment/>}></Route>
          <Route path="/admin-dashboard/departments/edit/:id" element={<EditComponent/>}></Route>
          <Route path="/admin-dashboard/employees" element={<List/>}></Route>
          <Route path="/admin-dashboard/employees/add-employee" element={<Add/>}></Route>
          <Route path="/admin-dashboard/employees/edit/:id" element={<Edit/>}></Route> 
          <Route path="/admin-dashboard/employees/view/:id" element={<View/>}></Route>
          <Route path="/admin-dashboard/salary/add" element={<AddSalary/>}></Route>
          <Route path="/admin-dashboard/salary" element={<ViewSalary/>}></Route>
          <Route path="/admin-dashboard/employees/leaves/:id" element={<Viewleave/>}></Route>
          <Route path="/admin-dashboard/employees/employeesalary/:id" element={<EmployeeSalary/>}></Route>
          <Route path="/admin-dashboard/leaves" element={<Adminleave/>}></Route> 
          <Route path="/admin-dashboard/setting" element={<EmpSetting/>}></Route>
        </Route>
       <Route path="/employee-dashboard" element={
        <PrivateRoute><RoleBaseRoutes requiredRole={["Manager","Employee"]}>
          <EmployeeDashboard/>
        </RoleBaseRoutes></PrivateRoute>}>
        <Route index element={<EmpSummary/>}></Route>
        <Route path="/employee-dashboard/profile/:id" element={<EmpProfile/>}></Route>
        <Route path="/employee-dashboard/leaves/:id" element={<LeaveList/>}></Route>
        <Route path="/employee-dashboard/leaves/add-leave" element={<AddLeave/>}></Route>
        <Route path="/employee-dashboard/salary/:id" element={<EmpSalary/>}></Route>
         <Route path="/employee-dashboard/setting" element={<EmpSetting/>}></Route>
         </Route>
    </Routes> 
    </BrowserRouter>
  )
}

export default App
