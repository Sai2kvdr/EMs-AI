import React, {useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error,setError] = useState(null);
  const {login} = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );
     if(response.data.success){
      login(response.data.user)
      localStorage.setItem("token",response.data.token)
      if(response.data.user.role === "admin"){
            navigate('/admin-dashboard')
      }else{
        navigate('/employee-dashboard')
      }
     }
    } catch (error) {
     if(error.response &&  error.response.data && error.response.data.error){
      setError(error.response.data.error)
     }else{
      setError("server error..!")
     }
    }
  };

  return (
    <div>
      <div  
        className="d-flex justify-content-around align-items-center p-3 position-sticky top-0"
        style={{
          backgroundColor: "white",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)"
        }}
      >
        <div>
          <h1 
            className="mb-0"
            style={{
              fontFamily: '"Cinzel", serif',
              fontWeight: 700,  
              fontStyle: "normal"
            }}
          >
            <img src="/assets/Logo.png" alt="logo" width="60px" height="50px" />
            Remedy
          </h1>
        </div>
        <div className='d-flex justify-content-between align-items-center gap-3'>
          <h6 style={{textShadow: "2px 2px 4px rgba(0,0,0,0.4)"}}>
            <i className="bi bi-telephone text-primary"></i> +91 75000 75000
          </h6> 
          <button
            className="btn btn-outline-success"
            onClick={() => navigate("/")}
          >
            Back
          </button>
        </div>
      </div>
      <div className="login-page">
        <div className="login-container shadow-lg rounded-4 p-4 animate__animated animate__fadeInUp">
          <div className="image-section">
            <img src="/assets/lottie.jpg" alt="Welcome" className="welcome-img" width="400vw"/>
          </div>

          <div className="form-section">
            <h2 className="text-center mb-4 fw-bold text-gradient">
              Remedy Employment Management System
            </h2>
            {error && <p className='text-danger'>{error}</p>}
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="you@remedy.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me
                  </label>
                </div>
                <Link 
                to="/forgot-password" 
                className="text-decoration-none text-primary fw-semibold"
              >
                Forgot Password?
              </Link>
              </div>
              <button type="submit" className="btn btn-success w-100 fw-bold">
                Log In 
              </button>
              <p className="mt-3 text-center text-danger">
                Ready to Remedy...
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
