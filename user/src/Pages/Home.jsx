import React from 'react'
import { useNavigate } from 'react-router-dom';
function Header() {

  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };
  return (
    <>
       <div  className="d-flex justify-content-around align-items-center p-3 position-sticky top-0"
        style={{
          backgroundColor: "white",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
          zIndex: 1000
        }}>
      <div>
      <h1 className="mb-0"  style={{
        fontFamily: '"Cinzel", serif',
        fontWeight: 700,  
        fontStyle: "normal"
      }}><img src="/assets/Logo.png" alt="logo" width="60px" height="50px" />Remedy</h1>
      </div>
      <div className='d-flex justify-content-between align-items-center gap-3'>
       <h6 style={{textShadow: "2px 2px 4px rgba(0,0,0,0.4)"}}><i className="bi bi-telephone text-primary"></i>+91 75000 75000 </h6> 
      <a>
      <button className="btn btn-primary" style={{ width: "100px" }}  onClick={handleLoginClick}>Login</button>
      </a>
      </div>
    </div>
    </>
  )
}

function Body(){
  return(
    <>
    <div style={{backgroundColor:"rgba(84, 21, 27, 0.08)", overflow: "hidden"}}>
    <div className="row align-items-center ms-5">
    <div className="col-sm-6 text-start ps-5">
      <h2 style={{fontFamily:"Cinzel",fontSize:40, textShadow: "2px 2px 5px red",textAlign:"center"}}>Welcome to Remedy</h2>
      <br />
      <p style={{fontFamily: "Dancing Script",fontSize:20,wordSpacing: "20px",textAlign:"left" }}>
      Remedy provides a smart Employee Management System to simplify workforce management. From leave and salary to performance tracking and communication, everything is centralized in one platform. With automation, AI-powered insights, and an easy interface, Remedy ensures accuracy, efficiency, and productivity for both employees and managers.
      </p>
    </div>
    <div className="col-sm-6 mb-5 mt-5 p-0">
      <img src="/assets/ems.png" alt="pic" className="img-fluid" style={{ width: "100%", height: "350px", objectFit: "contain" }}/>
    </div>
  </div>
</div>
</>
  )
}

function Logoslider(){
  return(
      <div className="logo-slider" style={{overflow: "hidden", position: "relative", width: "100%"}}>
      <div className="logo-track">
        <div className='logo-set'>
        <img src="/assets/client1.jpg" alt="Client 1" style={{width: "200px", height: "100px", objectFit: "contain"}} />
        <img src="/assets/client2.png" alt="Client 2" style={{width: "200px", height: "100px", objectFit: "contain"}} />
        <img src="/assets/client3.png" alt="Client 3" style={{width: "200px", height: "100px", objectFit: "contain"}} />
        <img src="/assets/client4.png" alt="Client 4" style={{width: "200px", height: "100px", objectFit: "contain"}} />
        <img src="/assets/client5.png" alt="Client 5" style={{width: "200px", height: "100px", objectFit: "contain"}} />
        </div>
        <div className='logo-set'>
        <img src="/assets/client4.png" alt="Client 1" style={{width: "200px", height: "100px", objectFit: "contain"}} />
        <img src="/assets/client2.png" alt="Client 2" style={{width: "200px", height: "100px", objectFit: "contain"}} />
        <img src="/assets/client1.jpg" alt="Client 3" style={{width: "200px", height: "100px", objectFit: "contain"}} />
        <img src="/assets/client3.png" alt="Client 4" style={{width: "200px", height: "100px", objectFit: "contain"}} />
        <img src="/assets/client5.png" alt="Client 5" style={{width: "200px", height: "100px", objectFit: "contain"}} />
        </div>
      </div>
    </div>
  )
}
function Cards(){
  return(
    <>
      <h2 className="text-center mb-5" style={{fontFamily: '"Cinzel", serif'}}>Key Features</h2>
    <div className="row row-cols-1 row-cols-md-2 g-4 m-4">
  <div className="col">
    <div className="card">
      <img src="/assets/AI.png" className="card-img-top" alt="AI Integration"/>
      <div className="card-body">
        <h5 className="card-title text-dark" style={{fontFamily: '"Cinzel", serif'}}>AI-Powered Insights</h5>
        <p className="card-text" style={{fontFamily: 'Times New Roman', fontSize: '18px'}}>
          • Predictive analytics for workforce planning<br/>
          • Automated performance evaluation<br/>
          • Intelligent leave pattern recognition<br/>
          • Smart team optimization recommendations<br/>
          • Natural language processing for HR queries
        </p>
      </div>
    </div>
  </div>
    <div className="col">
    <div className="card">
      <img src="/assets/emp.png" className="card-img-top" alt="Employee Dashboard"/>
      <div className="card-body">
        <h5 className="card-title " style={{fontFamily: '"Cinzel", serif'}}>Employee Dashboard</h5>
        <p className="card-text" style={{fontFamily: 'Times New Roman', fontSize: '18px'}}>
          • Personalized overview of leaves and deadlines<br/>
          • Salary pay off details<br/>
          • Quick access to payslips and documents<br/>
          • Team collaboration tools<br/>
          • Upcoming events and announcements
        </p>
      </div>
    </div>
  </div>
  <div className="col">
    <div className="card">
      <img src="/assets/leave.png" className="card-img-top" alt="Leave Management"/>
      <div className="card-body">
         <h5 className="card-title" style={{fontFamily: '"Cinzel", serif'}}>Employee Directory</h5>
        <p className="card-text" style={{fontFamily: 'Times New Roman', fontSize: '18px'}}>
          • Comprehensive employee database with search<br/>
          • Organizational chart visualization<br/>
          • Department and team filtering options<br/>
          • Contact information and skill profiles<br/>
          • Reporting structure and team hierarchy
        </p>
      </div>
    </div>
  </div>
  <div className="col">
    <div className="card">
      <img src="/assets/emplist.png" className="card-img-top" alt="Employee Directory"/>
      <div className="card-body">
         <h5 className="card-title" style={{fontFamily: '"Cinzel", serif'}}>Leave Management</h5>
        <p className="card-text" style={{fontFamily: 'Times New Roman', fontSize: '18px'}}>
          • Streamlined request and approval workflow<br/>
          • Real-time leave balance tracking<br/>
          • Customizable policy configuration<br/>
          • Automated accrual calculations<br/>
          • Calendar integration for team visibility
        </p>
      </div>
    </div>
  </div>
</div></>
  )
}
function Home(){
  return(
    <>
    <Header/>
    <br />
    <Body/>
    <br />
    <Logoslider/>
    <br />
    <Cards/>
    </>
  )
}

export default Home