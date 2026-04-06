import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        { email }
      );

      if (response.data.success) {
        setMessage(response.data.message);
        setEmail(''); // clear input after success
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Server error. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cssStyles = `
    .forgot-password-page {
      min-height: 88vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(109, 87, 22, 0.3);
      padding: 20px;
    }
    .forgot-password-container {
      background: rgba(251, 245, 241, 0.8);
      max-width: 500px;
      width: 100%;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }
    .forgot-password-icon { font-size: 3rem; color: #4a6cf7; margin-bottom: 1rem; }
    .forgot-password-title { font-family: 'Cinzel', serif; font-weight: 700; color: #2c3e50; margin-bottom: 0.5rem; }
    .forgot-password-subtitle { color: #7f8c8d; margin-bottom: 2rem; }
    .forgot-password-form .form-label { font-weight: 600; color: #2c3e50; margin-bottom: 0.5rem; }
    .forgot-password-form .form-control { border: 2px solid #e9ecef; border-radius: 8px; padding: 12px 15px; transition: all 0.3s ease; }
    .forgot-password-form .form-control:focus { border-color: #4a6cf7; box-shadow: 0 0 0 0.2rem rgba(74, 108, 247, 0.25); }
    .forgot-password-btn { background: linear-gradient(135deg, #4a6cf7 0%, #3b5bdb 100%); border: none; border-radius: 8px; padding: 12px; font-weight: 600; transition: all 0.3s ease; width: 100%; }
    .forgot-password-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(74, 108, 247, 0.3); }
    .forgot-password-btn:disabled { background: #6c757d; transform: none; box-shadow: none; }
    .forgot-password-link { color: #4a6cf7; font-weight: 600; text-decoration: none; transition: color 0.3s ease; }
    .forgot-password-link:hover { color: #3b5bdb; text-decoration: underline; }
    .alert { border-radius: 8px; border: none; padding: 12px 15px; margin-bottom: 1.5rem; }
    .alert-success { background-color: #d4edda; color: #155724; border-left: 4px solid #28a745; }
    .alert-danger { background-color: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
    .email-instructions { background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 15px; margin: 20px 0; }
    @media (max-width: 576px) {
      .forgot-password-container { padding: 1.5rem; margin: 1rem; }
      .forgot-password-icon { font-size: 2.5rem; }
      .forgot-password-title { font-size: 1.5rem; }
    }
  `;

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div  
        className="d-flex justify-content-around align-items-center p-3 position-sticky top-0"
        style={{ backgroundColor: "white", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", zIndex: 1000 }}
      >
        <div>
          <h1 className="mb-0" style={{ fontFamily: '"Cinzel", serif', fontWeight: 700, fontStyle: "normal" }}>
            <img src="/assets/Logo.png" alt="logo" width="60px" height="50px" />
            Remedy
          </h1>
        </div>
        <div className='d-flex justify-content-between align-items-center gap-3'>
          <h6 style={{textShadow: "2px 2px 4px rgba(0,0,0,0.4)"}}>
            <i className="bi bi-telephone text-primary"></i> +91 75000 75000
          </h6> 
          <button className="btn btn-outline-primary" onClick={() => navigate("/login")}>Back to Login</button>
        </div>
      </div>
      
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="text-center mb-4">
            <i className="bi bi-key-fill forgot-password-icon"></i>
            <h2 className="forgot-password-title">Forgot Password</h2>
            <p className="forgot-password-subtitle">Enter your email to reset your password</p>
          </div>

          {message && (
            <div className="alert alert-success" role="alert">
              {message}
              <div className="email-instructions mt-3">
                <h6>📧 Check Your Email</h6>
                <ul>
                  <li>Look for an email from Remedy EMS</li>
                  <li>Click the reset link in the email</li>
                  <li>The link expires in 1 hour</li>
                  <li>Check your spam folder if you don't see it</li>
                </ul>
              </div>
            </div>
          )}
          
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="mb-4">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="you@remedy.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="form-text">Enter the email address associated with your Remedy EMS account.</div>
            </div>
            
            <button type="submit" className="btn btn-primary w-100 fw-bold py-2 forgot-password-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending Reset Instructions...
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p>
              Remember your password?{' '}
              <a href="/login" className="forgot-password-link" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                Back to Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
