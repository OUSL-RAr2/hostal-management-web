import { buildUrl } from '../config/api.config.js';
import { getAuthToken } from './authService.js';

export const getAdminDashboardStats = async () => {
  try {
    const url = buildUrl('/api/dashboard/admin/stats');
    console.log('Fetching dashboard stats from:', url);

    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      console.error('API error:', data.message);
      throw new Error(data.message || 'Failed to fetch dashboard stats');
    }

    return data;
  } catch (error) {
    console.error('Dashboard Service Error:', error);
    throw error;
  }
};
