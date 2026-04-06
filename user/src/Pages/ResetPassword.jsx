import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Verify token when component loads
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No reset token provided');
        setIsVerifying(false);
        return;
      }

      try {
        console.log('🔍 Verifying reset token from email...');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/verify-reset-token?token=${token}`
        );
        
        if (response.data.success) {
          console.log('✅ Token is valid');
          setTokenValid(true);
          setUserInfo(response.data.user);
          setMessage('Token verified. You can now reset your password.');
        }
      } catch (error) {
        console.error('❌ Token verification failed:', error.response?.data);
        setError(error.response?.data?.error || 'Invalid or expired reset token. Please request a new password reset link.');
        setTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (!tokenValid) {
      setError("Token is not valid");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        { token, password }
      );
      
      if (response.data.success) {
        setMessage('Password has been reset successfully. You can now login with your new password.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("Server error. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cssStyles = `
    .reset-password-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
    }

    .reset-password-container {
      background: white;
      max-width: 500px;
      width: 100%;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }

    .reset-password-icon {
      font-size: 3rem;
      color: #4a6cf7;
      margin-bottom: 1rem;
    }

    .reset-password-title {
      font-family: 'Cinzel', serif;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .reset-password-subtitle {
      color: #7f8c8d;
      margin-bottom: 2rem;
    }

    .reset-password-form .form-label {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .reset-password-form .form-control {
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 12px 15px;
      transition: all 0.3s ease;
    }

    .reset-password-form .form-control:focus {
      border-color: #4a6cf7;
      box-shadow: 0 0 0 0.2rem rgba(74, 108, 247, 0.25);
    }

    .reset-password-btn {
      background: linear-gradient(135deg, #4a6cf7 0%, #3b5bdb 100%);
      border: none;
      border-radius: 8px;
      padding: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .reset-password-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(74, 108, 247, 0.3);
    }

    .reset-password-btn:disabled {
      background: #6c757d;
      transform: none;
      box-shadow: none;
    }

    .password-match {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #dc3545;
    }

    .password-match.valid {
      color: #28a745;
    }

    /* User info card */
    .user-info-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .user-info-card p {
      margin: 5px 0;
      font-size: 14px;
    }

    /* Alert styles */
    .alert {
      border-radius: 8px;
      border: none;
      padding: 12px 15px;
      margin-bottom: 1.5rem;
    }

    .alert-success {
      background-color: #d4edda;
      color: #155724;
    }

    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
    }

    .alert-info {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    /* Loading spinner */
    .verifying-spinner {
      text-align: center;
      padding: 20px;
    }

    /* Responsive design */
    @media (max-width: 576px) {
      .reset-password-container {
        padding: 1.5rem;
        margin: 1rem;
      }
      
      .reset-password-icon {
        font-size: 2.5rem;
      }
      
      .reset-password-title {
        font-size: 1.5rem;
      }
    }
  `;

  // Show loading while verifying token
  if (isVerifying) {
    return (
      <div>
        <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
        <div className="reset-password-page">
          <div className="reset-password-container">
            <div className="verifying-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Verifying reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no token or invalid token
  if (!token || !tokenValid) {
    return (
      <div>
        <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
        <div  
          className="d-flex justify-content-around align-items-center p-3 position-sticky top-0"
          style={{
            backgroundColor: "white",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
            zIndex: 1000
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
              <img src="src/assets/Logo.png" alt="logo" width="60px" height="50px" />
              Remedy
            </h1>
          </div>
          <div className='d-flex justify-content-between align-items-center gap-3'>
            <h6 style={{textShadow: "2px 2px 4px rgba(0,0,0,0.4)"}}>
              <i className="bi bi-telephone text-primary"></i> +91 75000 75000
            </h6> 
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </div>
        </div>
        
        <div className="reset-password-page">
          <div className="reset-password-container">
            <div className="alert alert-danger" role="alert">
              <strong>Invalid Reset Link</strong>
              <p className="mt-2">{error || 'This password reset link is invalid or has expired.'}</p>
            </div>
            <div className="text-center">
              <button 
                className="btn btn-primary me-2"
                onClick={() => navigate('/forgot-password')}
              >
                Get New Reset Link
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div  
        className="d-flex justify-content-around align-items-center p-3 position-sticky top-0"
        style={{
          backgroundColor: "white",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
          zIndex: 1000
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
            <img src="src/assets/Logo.png" alt="logo" width="60px" height="50px" />
            Remedy
          </h1>
        </div>
        <div className='d-flex justify-content-between align-items-center gap-3'>
          <h6 style={{textShadow: "2px 2px 4px rgba(0,0,0,0.4)"}}>
            <i className="bi bi-telephone text-primary"></i> +91 75000 75000
          </h6> 
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
      
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="text-center mb-4">
            <i className="bi bi-shield-lock-fill reset-password-icon"></i>
            <h2 className="reset-password-title">Reset Password</h2>
            <p className="reset-password-subtitle">Enter your new password</p>
          </div>

          {/* User Information */}
          {userInfo && (
            <div className="user-info-card">
              <p><strong>Resetting password for:</strong></p>
              <p><strong>Name:</strong> {userInfo.name}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Role:</strong> {userInfo.role}</p>
            </div>
          )}

          {message && (
            <div className="alert alert-success" role="alert">
              {message}
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="mb-3">
              <label htmlFor="password" className="form-label">New Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="Enter new password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {password !== confirmPassword && confirmPassword && (
                <div className="password-match">
                  Passwords don't match
                </div>
              )}
              {password === confirmPassword && confirmPassword && (
                <div className="password-match valid">
                  Passwords match
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100 fw-bold py-2 reset-password-btn"
              disabled={isLoading || password !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;