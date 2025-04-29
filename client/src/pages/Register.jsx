// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Register Component
 * Handles user registration
 */
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to home
  const from = location.state?.from || '/';
  
  // Destructure form data
  const { name, email, password, confirmPassword } = formData;
  
  // If already authenticated, redirect to the intended page
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Use your auth context to register
      // This assumes you have a register function in your auth context
      // If not, you'll need to implement it similar to the login function
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'client' // Default role
        })
      });
      
      // Navigate happens in the useEffect above when isAuthenticated changes
      // Assuming successful registration will log the user in automatically
      // You might need to adjust this based on your backend behavior
      
      // If your backend doesn't log in automatically after registration
      // you can redirect to login page:
      // navigate('/login', { replace: true });
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Create an Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;