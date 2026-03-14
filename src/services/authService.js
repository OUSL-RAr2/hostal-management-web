import { buildUrl } from '../config/api.config.js';

// Token management
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// API calls
export const signUp = async (nic, name, email, contactNumber, password, confirmPassword) => {
  try {
    const url = buildUrl('/api/admin-auth/sign-up');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nic,
        name,
        email,
        contactNumber,
        password,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Sign up failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (nic, password) => {
  try {
    const url = buildUrl('/api/admin-auth/sign-in');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nic, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Sign in failed');
    }

    // Store token
    if (data.data && data.data.token) {
      setAuthToken(data.data.token);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const signOut = () => {
  removeAuthToken();
};
