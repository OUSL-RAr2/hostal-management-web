import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCheck, UserX, Calendar, Clock, Home, User, Filter } from 'lucide-react';
import { io } from 'socket.io-client';
import './CheckInOut.css';

const CheckInOut = () => {
  const [activeTab, setActiveTab] = useState('check-in');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ inside: 0, outside: 0 });
  const socketRef = useRef(null);

  useEffect(() => {
    fetchData();

    // Initialize WebSockets
    socketRef.current = io('http://localhost:5000', {
      withCredentials: true
    });

    // Listen for QR refresh events (which happen on successful scan)
    socketRef.current.on('qr-refresh', (data) => {
      console.log('Real-time update received:', data);
      // Re-fetch data to sync all stats and student statuses
      fetchData();
    });

    // Handle connection
    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
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
      // Fetch students status
      const statusRes = await fetch('http://localhost:5000/api/qr/students-status');
      const statusData = await statusRes.json();
      
      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/qr/statistics');
      const statsResData = await statsRes.json();

      if (statusData.success) {
        setStudents(statusData.data.students);
        setStats(statusData.data.summary);

        // Derive recent activities from student logs if available
        const activities = statusData.data.students
          .filter(s => s.lastTimestamp)
          .sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp))
          .slice(0, 10)
          .map(s => ({
              id: s.registrationNumber || s.userId,
              name: s.username,
              room: 'N/A', 
              action: s.lastAction === 'check_in' ? 'Check-in' : 'Check-out',
              time: new Date(s.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date(s.lastTimestamp).toLocaleDateString()
          }));
        setRecentActivities(activities);
      }
    } catch (error) {
      console.error('Error fetching check-in/out data:', error);
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
        // Refresh local data
        fetchData();
        // Force re-fetch the other dashboard stats for full consistency
        // (already happens in fetchData)
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (error) {
      console.error('Action failed:', error);
      alert('Network error while processing status update');
    }
  };

  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.nic.includes(searchQuery) ||
    (student.registrationNumber && student.registrationNumber.toString().includes(searchQuery))
  );

  const availableForCheckIn = filteredStudents.filter(s => s.currentStatus === 'outside');
  const availableForCheckOut = filteredStudents.filter(s => s.currentStatus === 'inside');

  if (loading) {
    return <div className="loading-container">Loading check-in/out data...</div>;
  }
  const [selectedStudent, setSelectedStudent] = useState(null);

  const studentsData = [
    { id: '223604291', name: 'K.M.T.N. Deshapriya', room: 'T-14', status: 'checked-out' },
    { id: '123600601', name: 'A.M.S.G. Athapaththu', room: 'S-08', status: 'checked-out' },
    { id: '723602367', name: 'G.A.C.Kawishka', room: 'F-24', status: 'checked-in' },
    { id: '623606783', name: 'L.A.C.D. Lenagala', room: 'T-15', status: 'checked-in' },
    { id: '523604291', name: 'P.A.S. Perera', room: 'B-201', status: 'checked-out' },
    { id: '423600601', name: 'N.K. Silva', room: 'A-102', status: 'checked-in' },
  ];

  const recentActivities = [
    { id: '223604291', name: 'K.M.T.N. Deshapriya', room: 'T-14', action: 'Check-in', time: '2 hours ago', date: '2025-03-03' },
    { id: '123600601', name: 'A.M.S.G. Athapaththu', room: 'S-08', action: 'Check-out', time: '3 hours ago', date: '2025-03-03' },
    { id: '723602367', name: 'G.A.C.Kawishka', room: 'F-24', action: 'Check-in', time: '5 hours ago', date: '2025-03-03' },
    { id: '623606783', name: 'L.A.C.D. Lenagala', room: 'T-15', action: 'Check-out', time: '1 day ago', date: '2025-03-02' },
  ];

  const handleCheckIn = (student) => {
    alert(`Check-in successful for ${student.name} - Room ${student.room}`);
  };

  const handleCheckOut = (student) => {
    alert(`Check-out successful for ${student.name} - Room ${student.room}`);
  };

  const filteredStudents = studentsData.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.id.includes(searchQuery) ||
    student.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableForCheckIn = filteredStudents.filter(s => s.status === 'checked-out');
  const availableForCheckOut = filteredStudents.filter(s => s.status === 'checked-in');

  return (
    <div className="checkinout-page">
      {/* Header */}
      <div className="checkinout-header">
        <h1>Check-in / Check-out Management</h1>
        <p>Manage student check-ins and check-outs</p>
      </div>

      {/* Stats Cards */}
      <div className="checkinout-stats">
        <div className="stat-card stat-blue">
          <div className="stat-icon-wrapper">
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{studentsData.filter(s => s.status === 'checked-in').length}</div>
            <div className="stat-label">Checked In</div>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-icon-wrapper">
            <UserX size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{studentsData.filter(s => s.status === 'checked-out').length}</div>
            <div className="stat-label">Checked Out</div>
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
        {/* Left Side - Check-in/out Form */}
        <div className="checkinout-form-section">
          {/* Tabs */}
          <div className="checkinout-tabs">
            <button
              className={`tab-btn ${activeTab === 'check-in' ? 'active' : ''}`}
              onClick={() => setActiveTab('check-in')}
            >
              <UserCheck size={20} />
              Check-in
            </button>
            <button
              className={`tab-btn ${activeTab === 'check-out' ? 'active' : ''}`}
              onClick={() => setActiveTab('check-out')}
            >
              <UserX size={20} />
              Check-out
            </button>
          </div>

          {/* Search */}
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by student ID, name, or room..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Student List */}
          <div className="student-list">
            {activeTab === 'check-in' && (
              <>
                <h3 className="list-title">Available for Check-in</h3>
                {availableForCheckIn.length === 0 ? (
                  <p className="no-results">No students available for check-in</p>
                ) : (
                  availableForCheckIn.map((student) => (
                    <div key={student.id} className="student-card">
                      <div className="student-info">
                        <div className="student-name">{student.name}</div>
                        <div className="student-details">
                          <span className="detail-item">
                            <User size={14} />
                            ID: {student.id}
                          </span>
                          <span className="detail-item">
                            <Home size={14} />
                            Room: {student.room}
                          </span>
                        </div>
                      </div>
                      <button className="checkin-btn" onClick={() => handleCheckIn(student)}>
                        <UserCheck size={18} />
                        Check In
                      </button>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'check-out' && (
              <>
                <h3 className="list-title">Available for Check-out</h3>
                {availableForCheckOut.length === 0 ? (
                  <p className="no-results">No students available for check-out</p>
                ) : (
                  availableForCheckOut.map((student) => (
                    <div key={student.id} className="student-card">
                      <div className="student-info">
                        <div className="student-name">{student.name}</div>
                        <div className="student-details">
                          <span className="detail-item">
                            <User size={14} />
                            ID: {student.id}
                          </span>
                          <span className="detail-item">
                            <Home size={14} />
                            Room: {student.room}
                          </span>
                        </div>
                      </div>
                      <button className="checkout-btn" onClick={() => handleCheckOut(student)}>
                        <UserX size={18} />
                        Check Out
                      </button>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Side - Recent Activities */}
        <div className="recent-activities-section">
          <h3 className="section-title">
            <Clock size={20} />
            Recent Activities
          </h3>
          <div className="activities-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className={`activity-card ${activity.action === 'Check-in' ? 'checkin' : 'checkout'}`}>
                <div className="activity-icon">
                  {activity.action === 'Check-in' ? <UserCheck size={20} /> : <UserX size={20} />}
                </div>
                <div className="activity-info">
                  <div className="activity-student">{activity.name}</div>
                  <div className="activity-details">
                    <span className="activity-room">Room: {activity.room}</span>
                    <span className="activity-action">{activity.action}</span>
                  </div>
                  <div className="activity-time">
                    <Calendar size={12} />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInOut;