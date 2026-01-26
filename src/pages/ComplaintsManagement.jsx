import React, { useState } from 'react';
import { AlertCircle, Clock, CheckCircle, User, Home } from 'lucide-react';
import './ComplaintsManagement.css';

const ComplaintsManagement = () => {
  const [filter, setFilter] = useState('all');

  const complaintsData = [
    {
      id: '#C-001',
      date: '06/08/2025',
      time: '14:30',
      room: 'A-101',
      studentName: 'K.M.T.N. Deshapriya',
      issue: 'Air Condition not working properly',
      description: 'The AC unit is making loud noises and not cooling the room effectively.',
      status: 'In Progress',
      priority: 'high',
      actions: ['Resolve', 'Reply']
    },
    {
      id: '#C-002',
      date: '06/08/2025',
      time: '12:15',
      room: 'Anonymous',
      studentName: 'Anonymous',
      issue: 'Noise disturbance during study hours',
      description: 'Excessive noise from neighboring rooms during evening study hours.',
      status: 'New',
      priority: 'medium',
      actions: ['Investigate']
    },
    {
      id: '#C-003',
      date: '06/07/2025',
      time: '16:45',
      room: 'B-205',
      studentName: 'A.M.S.G. Athapaththu',
      issue: 'Water leakage in bathroom',
      description: 'Water is leaking from the shower area, causing floor damage.',
      status: 'In Progress',
      priority: 'high',
      actions: ['Resolve', 'Reply']
    },
    {
      id: '#C-004',
      date: '06/06/2025',
      time: '09:20',
      room: 'T-14',
      studentName: 'L.A.C.D. Lenagala',
      issue: 'Broken window lock',
      description: 'Window lock is broken, security concern.',
      status: 'New',
      priority: 'medium',
      actions: ['Investigate']
    },
  ];

  const stats = [
    { label: 'Total Complaints', value: '24', icon: AlertCircle, color: 'blue' },
    { label: 'Pending', value: '7', icon: Clock, color: 'orange' },
    { label: 'Resolved', value: '17', icon: CheckCircle, color: 'green' },
  ];

  const filteredComplaints = filter === 'all' 
    ? complaintsData 
    : complaintsData.filter(c => c.status.toLowerCase().replace(' ', '-') === filter);

  return (
    <div className="complaints-management">
      {/* Header */}
      <div className="complaints-header">
        <div>
          <h1>Complaints Management</h1>
          <p>Handle student complaints and feedback</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="complaints-stats">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon-wrapper">
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="complaints-content">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Complaints
          </button>
          <button 
            className={`filter-tab ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            New
          </button>
          <button 
            className={`filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            In Progress
          </button>
        </div>

        {/* Complaints Grid */}
        <div className="complaints-grid">
          {filteredComplaints.map((complaint, index) => (
            <div key={index} className={`complaint-card-modern priority-${complaint.priority}`}>
              <div className="complaint-header-modern">
                <div className="complaint-id-section">
                  <span className="complaint-id-modern">{complaint.id}</span>
                  <span className={`priority-badge priority-${complaint.priority}`}>
                    {complaint.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                  </span>
                </div>
                <span className={`status-badge-modern status-${complaint.status === 'New' ? 'new' : 'progress'}`}>
                  {complaint.status}
                </span>
              </div>
              
              <div className="complaint-body">
                <h3 className="complaint-issue">{complaint.issue}</h3>
                <p className="complaint-description">{complaint.description}</p>
                
                <div className="complaint-meta">
                  <div className="meta-item">
                    <Home size={16} />
                    <span>Room: {complaint.room}</span>
                  </div>
                  <div className="meta-item">
                    <User size={16} />
                    <span>{complaint.studentName}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{complaint.date} {complaint.time}</span>
                  </div>
                </div>
              </div>
              
              <div className="complaint-footer">
                {complaint.actions.map((action, idx) => (
                  <button
                    key={idx}
                    className={`action-btn-modern ${
                      action === 'Resolve' ? 'resolve-btn-modern' :
                      action === 'Reply' ? 'reply-btn-modern' :
                      'investigate-btn-modern'
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsManagement;