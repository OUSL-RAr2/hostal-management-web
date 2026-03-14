import { buildUrl } from '../config/api.config.js';

// Token management
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseApiResponse = async (response) => {
  const raw = await response.text();
  const contentType = response.headers.get('content-type') || '';

  if (!raw) {
    return { data: null, raw: '' };
  }

  if (contentType.includes('application/json')) {
    try {
      return { data: JSON.parse(raw), raw };
    } catch {
      return { data: null, raw };
    }
  }

  try {
    return { data: JSON.parse(raw), raw };
  } catch {
    return { data: null, raw };
  }
};

const getApiErrorMessage = (response, data, raw, fallbackMessage) => {
  if (data?.message) return data.message;

  if (raw && raw.trim().startsWith('<!DOCTYPE')) {
    return 'Server returned HTML instead of JSON. Check backend URL and ensure API server is running.';
  }

  return `${fallbackMessage} (HTTP ${response.status})`;
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// API calls

export const signIn = async (nic, password) => {
  const url = buildUrl('/api/admin-auth/sign-in');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nic, password }),
  });

  const { data, raw } = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, data, raw, 'Sign in failed'));
  }

  if (!data) {
    throw new Error('Sign in failed: server did not return valid JSON');
  }

  // Store token
  if (data.data && data.data.token) {
    setAuthToken(data.data.token);
  }

  if (data.data && data.data.admin) {
    localStorage.setItem('adminInfo', JSON.stringify(data.data.admin));
  }

  return data;
};

export const signOut = () => {
  removeAuthToken();
  localStorage.removeItem('adminInfo');
};

export const getAdminProfile = async () => {
  const url = buildUrl('/api/admin-auth/profile');
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const { data, raw } = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, data, raw, 'Failed to fetch profile'));
  }

  if (!data) {
    throw new Error('Failed to fetch profile: server did not return valid JSON');
  }

  return data;
};

export const updateAdminProfile = async ({ name, email, contactNumber }) => {
  const url = buildUrl('/api/admin-auth/profile');
  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, email, contactNumber }),
  });

  const { data, raw } = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, data, raw, 'Failed to update profile'));
  }

  if (!data) {
    throw new Error('Failed to update profile: server did not return valid JSON');
  }

  if (data.data) {
    localStorage.setItem('adminInfo', JSON.stringify(data.data));
  }

  return data;
};

export const changeAdminPassword = async ({ currentPassword, newPassword, confirmPassword }) => {
  const url = buildUrl('/api/admin-auth/change-password');
  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });

  const { data, raw } = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, data, raw, 'Failed to change password'));
  }

  if (!data) {
    throw new Error('Failed to change password: server did not return valid JSON');
  }

  return data;
};

export const getAllAdmins = async () => {
  const url = buildUrl('/api/admin-auth/admins');
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const { data, raw } = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, data, raw, 'Failed to fetch admins'));
  }

  if (!data) {
    throw new Error('Failed to fetch admins: server did not return valid JSON');
  }

  return data;
};

export const createAdminAccount = async ({ nic, name, email, contactNumber, password, confirmPassword }) => {
  const url = buildUrl('/api/admin-auth/admins');
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ nic, name, email, contactNumber, password, confirmPassword }),
  });

  const { data, raw } = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, data, raw, 'Failed to create admin account'));
  }

  if (!data) {
    throw new Error('Failed to create admin account: server did not return valid JSON');
  }

  return data;
};

export const deleteAdminAccount = async (adminId) => {
  const url = buildUrl(`/api/admin-auth/admins/${adminId}`);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const { data, raw } = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, data, raw, 'Failed to delete admin account'));
  }

  if (!data) {
    throw new Error('Failed to delete admin account: server did not return valid JSON');
  }

  return data;
};
