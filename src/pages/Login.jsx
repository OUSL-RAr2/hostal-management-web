import React, { useState } from 'react';
import { signIn } from '../services/authService';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    nic: '',
    password: '',
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

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Hostel Management</h1>
          <p>Admin Portal</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

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
      </div>
    </div>
  );
};

export default Login;
