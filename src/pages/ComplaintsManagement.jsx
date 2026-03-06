import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, User, Home } from 'lucide-react';
import './ComplaintsManagement.css';

const ComplaintsManagement = () => {
  const [filter, setFilter] = useState('all');
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch complaints from API
  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setComplaints(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch complaints');
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/complaints/stats', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'New',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  };

  const updateComplaintStatus = async (complaintId, newStatus, adminResponse = null) => {
    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${complaintId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          adminResponse: adminResponse
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh complaints and stats
        fetchComplaints();
        fetchStats();
        alert('Complaint status updated successfully');
      } else {
        alert(data.message || 'Failed to update complaint status');
      }
    } catch (err) {
      console.error('Error updating complaint:', err);
      alert('Failed to connect to server');
    }
  };

  const handleResolve = (complaintId) => {
    const response = prompt('Enter resolution notes (optional):');
    if (response !== null) {
      updateComplaintStatus(complaintId, 'resolved', response || 'Complaint resolved');
    }
  };

  const handleInvestigate = (complaintId) => {
    updateComplaintStatus(complaintId, 'in_progress');
  };

  const handleReply = (complaintId) => {
    const response = prompt('Enter your response:');
    if (response) {
      updateComplaintStatus(complaintId, 'in_progress', response);
    }
  };

  const statsDisplay = [
    { label: 'Total Complaints', value: stats.total.toString(), icon: AlertCircle, color: 'blue' },
    { label: 'Pending', value: (stats.pending + stats.inProgress).toString(), icon: Clock, color: 'orange' },
    { label: 'Resolved', value: stats.resolved.toString(), icon: CheckCircle, color: 'green' },
  ];

  const filteredComplaints = filter === 'all' 
    ? complaints 
    : complaints.filter(c => {
        if (filter === 'new') return c.Status === 'pending';
        if (filter === 'in-progress') return c.Status === 'in_progress';
        return false;
      });

  if (loading) {
    return (
      <div className="complaints-management">
        <div className="complaints-header">
          <div>
            <h1>Complaints Management</h1>
            <p>Loading complaints...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="complaints-management">
        <div className="complaints-header">
          <div>
            <h1>Complaints Management</h1>
            <p style={{ color: 'red' }}>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

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
        {statsDisplay.map((stat, index) => (
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
          {filteredComplaints.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
              <p>No complaints found</p>
            </div>
          ) : (
            filteredComplaints.map((complaint, index) => (
              <div key={index} className={`complaint-card-modern priority-${complaint.Priority}`}>
                <div className="complaint-header-modern">
                  <div className="complaint-id-section">
                    <span className="complaint-id-modern">#{complaint.ComplaintID.slice(0, 8)}</span>
                    <span className={`priority-badge priority-${complaint.Priority}`}>
                      {complaint.Priority.charAt(0).toUpperCase() + complaint.Priority.slice(1)} Priority
                    </span>
                  </div>
                  <span className={`status-badge-modern status-${complaint.Status === 'pending' ? 'new' : 'progress'}`}>
                    {getStatusDisplay(complaint.Status)}
                  </span>
                </div>
                
                <div className="complaint-body">
                  <h3 className="complaint-issue">{complaint.Title}</h3>
                  <p className="complaint-description">{complaint.Description}</p>
                  
                  <div className="complaint-meta">
                    <div className="meta-item">
                      <Home size={16} />
                      <span>Room: {complaint.Room ? complaint.Room.RoomNumber : 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <User size={16} />
                      <span>{complaint.User ? complaint.User.Username : 'Anonymous'}</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>{formatDate(complaint.createdAt)} {formatTime(complaint.createdAt)}</span>
                    </div>
                  </div>
                  
                  {complaint.AdminResponse && (
                    <div className="admin-response">
                      <strong>Admin Response:</strong> {complaint.AdminResponse}
                    </div>
                  )}
                </div>
                
                <div className="complaint-footer">
                  {complaint.Status === 'pending' && (
                    <button
                      className="action-btn-modern investigate-btn-modern"
                      onClick={() => handleInvestigate(complaint.ComplaintID)}
                    >
                      Investigate
                    </button>
                  )}
                  {(complaint.Status === 'pending' || complaint.Status === 'in_progress') && (
                    <>
                      <button
                        className="action-btn-modern reply-btn-modern"
                        onClick={() => handleReply(complaint.ComplaintID)}
                      >
                        Reply
                      </button>
                      <button
                        className="action-btn-modern resolve-btn-modern"
                        onClick={() => handleResolve(complaint.ComplaintID)}
                      >
                        Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsManagement;