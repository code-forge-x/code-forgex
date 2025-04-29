// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/**
 * ForgotPassword Component
 * Handles password reset requests
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      // Send password reset request to the backend
      await axios.post('/api/auth/forgot-password', { email });
      
      // Show success message
      setSuccess(true);
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Reset Password</h2>
        
        {success && (
          <div className="success-message">
            Password reset link has been sent to your email address.
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading || success}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;