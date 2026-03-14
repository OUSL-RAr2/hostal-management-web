import React, { useState, useEffect } from 'react';
import { GraduationCap, Building2, Home, FileText, Clock } from 'lucide-react';
import { getAdminDashboardStats } from '../services/dashboardService';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { icon: GraduationCap, value: 'Loading...', label: 'Total Students', color: 'blue' },
    { icon: Building2, value: 'Loading...', label: 'Total Rooms', color: 'red' },
    { icon: Home, value: 'Loading...', label: 'Occupied Rooms', color: 'green' },
    { icon: FileText, value: 'Loading...', label: 'Pending Complaints', color: 'orange' },
  ]);

  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to fetch dashboard data...');
      const response = await getAdminDashboardStats();
      
      console.log('Dashboard response received:', response);
      if (response.success && response.data) {
        const { stats: statsData, recentCheckIns: checkInsData } = response.data;
        console.log('Stats data:', statsData);
        console.log('Check-ins data:', checkInsData);
        
        // Update stats
        setStats([
          { icon: GraduationCap, value: statsData.totalStudents.toString(), label: 'Total Students', color: 'blue' },
          { icon: Building2, value: statsData.totalRooms.toString(), label: 'Total Rooms', color: 'red' },
          { icon: Home, value: statsData.occupiedRooms.toString(), label: 'Occupied Rooms', color: 'green' },
          { icon: FileText, value: statsData.pendingComplaints.toString(), label: 'Pending Complaints', color: 'orange' },
        ]);
        
        // Update recent check-ins
        setRecentCheckIns(checkInsData || []);
      } else {
        console.warn('Invalid response format:', response);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(`Failed to load dashboard data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>welcome to OUSL Hostel Management System</p>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fca5a5'
        }}>
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Check-ins */}
      <div className="recent-checkins">
        <div className="section-header">
          <div className="section-icon">
            <Clock size={20} />
          </div>
          <h2>Recent-check-ins</h2>
        </div>
        
        <div className="table-container">
          <table className="checkins-table">
            <thead>
              <tr>
                <th>StudentID</th>
                <th>Name</th>
                <th>Room</th>
                <th>Check-in Time</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {recentCheckIns.length > 0 ? (
                recentCheckIns.map((checkIn, index) => (
                  <tr key={index}>
                    <td>{checkIn.studentId}</td>
                    <td>{checkIn.name}</td>
                    <td>{checkIn.room}</td>
                    <td>{new Date(checkIn.checkInTime).toLocaleString()}</td>
                    <td>{checkIn.duration}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                    {loading ? 'Loading...' : 'No recent check-ins'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;