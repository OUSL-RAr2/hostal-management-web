import React, { useState } from 'react';
import { signUp, signIn } from '../services/authService';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    nic: '',
    password: '',
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    nic: '',
    name: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
  });

  // Handle login input change
  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
    setError('');
  };

  // Handle signup input change
  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value,
    });
    setError('');
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!loginData.nic || !loginData.password) {
        setError('NIC and password are required');
        return;
      }

      const response = await signIn(loginData.nic, loginData.password);

      if (response.success) {
        setSuccessMessage('Login successful!');
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle signup submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (
        !signupData.nic ||
        !signupData.name ||
        !signupData.email ||
        !signupData.contactNumber ||
        !signupData.password ||
        !signupData.confirmPassword
      ) {
        setError('All fields are required');
        return;
      }

      if (signupData.password !== signupData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      const response = await signUp(
        signupData.nic,
        signupData.name,
        signupData.email,
        signupData.contactNumber,
        signupData.password,
        signupData.confirmPassword
      );

      if (response.success) {
        setSuccessMessage('Account created successfully! Logged in now...');
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Hostel Management</h1>
          <p>Admin Portal</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="login-tabs">
          <button
            className={`tab-button ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setError('');
              setSignupData({
                nic: '',
                name: '',
                email: '',
                contactNumber: '',
                password: '',
                confirmPassword: '',
              });
            }}
          >
            Login
          </button>
          <button
            className={`tab-button ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setMode('signup');
              setError('');
              setLoginData({ nic: '', password: '' });
            }}
          >
            Create Account
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="login-nic">NIC (National Identity Card)</label>
              <input
                id="login-nic"
                type="text"
                name="nic"
                value={loginData.nic}
                onChange={handleLoginInputChange}
                placeholder="Enter your NIC"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginInputChange}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="signup-nic">NIC (National Identity Card)</label>
              <input
                id="signup-nic"
                type="text"
                name="nic"
                value={signupData.nic}
                onChange={handleSignupInputChange}
                placeholder="Enter your NIC"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-name">Name</label>
              <input
                id="signup-name"
                type="text"
                name="name"
                value={signupData.name}
                onChange={handleSignupInputChange}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleSignupInputChange}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-contact">Contact Number</label>
              <input
                id="signup-contact"
                type="tel"
                name="contactNumber"
                value={signupData.contactNumber}
                onChange={handleSignupInputChange}
                placeholder="Enter your contact number"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleSignupInputChange}
                placeholder="Create a password"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                name="confirmPassword"
                value={signupData.confirmPassword}
                onChange={handleSignupInputChange}
                placeholder="Confirm your password"
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
