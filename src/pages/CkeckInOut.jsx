import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCheck, UserX, Calendar, Clock, User } from 'lucide-react';
import { io } from 'socket.io-client';
import './CheckInOut.css';

const CheckInOut = () => {
  const [activeTab, setActiveTab] = useState('check-in');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ inside: 0, outside: 0 });
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchData();

    // Initialize WebSockets
    socketRef.current = io('http://localhost:5000', {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Listen for QR refresh events (which happen on successful scan)
    socketRef.current.on('qr-refresh', (data) => {
      console.log('Real-time update received:', data);
      fetchData();
    });

    // Handle connection
    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
      setError(null);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch students status
      const statusRes = await fetch('http://localhost:5000/api/qr/students-status');
      
      if (!statusRes.ok) {
        console.error('API responded with status:', statusRes.status);
        setError(`Failed to fetch data. Server returned status ${statusRes.status}`);
        setStudents([]);
        setStats({ inside: 0, outside: 0 });
        setRecentActivities([]);
        return;
      }

      const statusData = await statusRes.json();

      if (statusData.success && statusData.data) {
        setStudents(statusData.data.students || []);
        setStats(statusData.data.summary || { inside: 0, outside: 0 });

        // Derive recent activities from student logs if available
        if (Array.isArray(statusData.data.students)) {
          const activities = statusData.data.students
            .filter(s => s.lastTimestamp)
            .sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp))
            .slice(0, 10)
            .map(s => ({
                id: s.registrationNumber || s.userId,
                name: s.username,
                action: s.lastAction === 'check_in' ? 'Check-in' : 'Check-out',
                time: new Date(s.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date(s.lastTimestamp).toLocaleDateString()
            }));
          setRecentActivities(activities);
        } else {
          setRecentActivities([]);
        }
        setError(null);
      } else {
        setError('Invalid response format from server');
        setStudents([]);
        setStats({ inside: 0, outside: 0 });
        setRecentActivities([]);
      }
    } catch (error) {
      console.error('Error fetching check-in/out data:', error);
      setError(`Error: ${error.message || 'Failed to fetch data'}`);
      setStudents([]);
      setStats({ inside: 0, outside: 0 });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAction = async (userId, action) => {
    try {
      const dbAction = action === 'Check-in' ? 'check_in' : 'check_out';
      
      const response = await fetch('http://localhost:5000/api/qr/admin-student-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, action: dbAction })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (error) {
      console.error('Action failed:', error);
      alert('Network error while processing status update');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading check-in/out data...</div>;
  }

  if (error) {
    return (
      <div className="checkinout-page">
        <div className="checkinout-header">
          <h1>Check-in / Check-out Management</h1>
          <p>Monitor real-time student presence in the hostel</p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f', fontSize: '16px' }}>
          <p>⚠️ {error}</p>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Please ensure the backend server is running and try again.
          </p>
          <button 
            onClick={() => fetchData()} 
            style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredStudents = (students || []).filter(s => {
    if (!s) return false;
    const nameMatch = (s.username || '').toLowerCase().includes(searchQuery.toLowerCase());
    const nicMatch = (s.nic || '').includes(searchQuery);
    const regMatch = s.registrationNumber && String(s.registrationNumber).includes(searchQuery);
    return nameMatch || nicMatch || regMatch;
  });

  const availableForCheckIn = filteredStudents.filter(s => s.currentStatus === 'outside');
  const availableForCheckOut = filteredStudents.filter(s => s.currentStatus === 'inside');

  return (
    <div className="checkinout-page">
      <div className="checkinout-header">
        <h1>Check-in / Check-out Management</h1>
        <p>Monitor real-time student presence in the hostel</p>
      </div>

      <div className="checkinout-stats">
        <div className="stat-card stat-blue">
          <div className="stat-icon-wrapper">
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.inside}</div>
            <div className="stat-label">Students Inside</div>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-icon-wrapper">
            <UserX size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.outside}</div>
            <div className="stat-label">Students Outside</div>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon-wrapper">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{recentActivities.length}</div>
            <div className="stat-label">Recent Activities</div>
          </div>
        </div>
      </div>

      <div className="checkinout-container">
        <div className="checkinout-form-section">
          <div className="checkinout-tabs">
            <button
              className={`tab-btn ${activeTab === 'check-in' ? 'active' : ''}`}
              onClick={() => setActiveTab('check-in')}
            >
              <UserCheck size={20} />
              Check-in (Inside)
            </button>
            <button
              className={`tab-btn ${activeTab === 'check-out' ? 'active' : ''}`}
              onClick={() => setActiveTab('check-out')}
            >
              <UserX size={20} />
              Check-out (Outside)
            </button>
          </div>

          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by student ID or name..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="student-list">
            {activeTab === 'check-in' && (
              <>
                <h3 className="list-title">Students Outside Hostel (Can Check In)</h3>
                {availableForCheckIn.length === 0 ? (
                  <p className="no-results">No students are currently outside hostel</p>
                ) : (
                  availableForCheckIn.map((student) => (
                    <div key={student.userId} className="student-card">
                      <div className="student-info">
                        <div className="student-name">{student.username}</div>
                        <div className="student-details">
                          <span className="detail-item">
                            <User size={14} />
                            ID: {student.registrationNumber || student.userId}
                          </span>
                        </div>
                      </div>
                      <button className="checkin-btn" onClick={() => handleCheckAction(student.userId, 'Check-in')}>
                        <UserCheck size={18} />
                        Mark as Inside
                      </button>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'check-out' && (
              <>
                <h3 className="list-title">Students Inside Hostel (Can Check Out)</h3>
                {availableForCheckOut.length === 0 ? (
                  <p className="no-results">No students are currently inside hostel</p>
                ) : (
                  availableForCheckOut.map((student) => (
                    <div key={student.userId} className="student-card">
                      <div className="student-info">
                        <div className="student-name">{student.username}</div>
                        <div className="student-details">
                          <span className="detail-item">
                            <User size={14} />
                            ID: {student.registrationNumber || student.userId}
                          </span>
                        </div>
                      </div>
                      <button className="checkout-btn" onClick={() => handleCheckAction(student.userId, 'Check-out')}>
                        <UserX size={18} />
                        Mark as Outside
                      </button>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        <div className="recent-activities-section">
          <h3 className="section-title">
            <Clock size={20} />
            Recent Activities
          </h3>
          <div className="activities-list">
            {recentActivities.length === 0 ? (
              <p className="no-results">No recent activities</p>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={index} className={`activity-card ${activity.action === 'Check-in' ? 'checkin' : 'checkout'}`}>
                  <div className="activity-icon">
                    {activity.action === 'Check-in' ? <UserCheck size={20} /> : <UserX size={20} />}
                  </div>
                  <div className="activity-info">
                    <div className="activity-student">{activity.name}</div>
                    <div className="activity-details">
                      <span className="activity-action">{activity.action}</span>
                    </div>
                    <div className="activity-time">
                      <Calendar size={12} />
                      {activity.time} - {activity.date}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInOut;
