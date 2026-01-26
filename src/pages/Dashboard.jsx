import React from 'react';
import { GraduationCap, Building2, Home, FileText, Clock } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    { icon: GraduationCap, value: '147', label: 'Total Students', color: 'blue' },
    { icon: Building2, value: '38', label: 'Total Rooms', color: 'red' },
    { icon: Home, value: '33', label: 'Occupied Rooms', color: 'green' },
    { icon: FileText, value: '7', label: 'Pending Complaints', color: 'orange' },
  ];

  const recentCheckIns = [
    { id: '223604291', name: 'K.M.T.N.Deshappriya', room: 'T-14', time: '14:30 Today', duration: '3 Days' },
    { id: '123600601', name: 'A.M.S.G.Athapaththu', room: 'S-08', time: '12:30 Today', duration: '1 Days' },
    { id: '723602367', name: 'G.A.C.Kawishka', room: 'F-24', time: '09:37 Today', duration: '2 Days' },
    { id: '623606783', name: 'L.A.C.D.Lenagala', room: 'T-15', time: '08:48 Today', duration: '5 Days' },
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>welcome to OUSL Hostel Management System</p>
      </div>

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
              {recentCheckIns.map((checkIn, index) => (
                <tr key={index}>
                  <td>{checkIn.id}</td>
                  <td>{checkIn.name}</td>
                  <td>{checkIn.room}</td>
                  <td>{checkIn.time}</td>
                  <td>{checkIn.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;