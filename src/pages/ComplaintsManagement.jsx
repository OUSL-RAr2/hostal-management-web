import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, User, Home, X, Send } from 'lucide-react';
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
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'reply' or 'resolve'
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch complaints from API
  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, []);

  // Handle modal keyboard events and body scroll
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showModal) return;
      
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isSubmitting) {
        e.preventDefault();
        handleModalSubmit();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [showModal, isSubmitting]);

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

  const handleResolve = (complaint) => {
    setSelectedComplaint(complaint);
    setModalType('resolve');
    setResponseText('');
    setShowModal(true);
  };

  const handleInvestigate = (complaintId) => {
    updateComplaintStatus(complaintId, 'in_progress');
  };

  const handleReply = (complaint) => {
    setSelectedComplaint(complaint);
    setModalType('reply');
    setResponseText('');
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    if (!selectedComplaint) return;
    
    if (modalType === 'reply' && !responseText.trim()) {
      alert('Please enter a response');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (modalType === 'resolve') {
        await updateComplaintStatus(
          selectedComplaint.ComplaintID, 
          'resolved', 
          responseText.trim() || 'Complaint resolved'
        );
      } else if (modalType === 'reply') {
        await updateComplaintStatus(
          selectedComplaint.ComplaintID, 
          'in_progress', 
          responseText.trim()
        );
      }
      closeModal();
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    setShowModal(false);
    setModalType('');
    setSelectedComplaint(null);
    setResponseText('');
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
                        onClick={() => handleReply(complaint)}
                      >
                        Reply
                      </button>
                      <button
                        className="action-btn-modern resolve-btn-modern"
                        onClick={() => handleResolve(complaint)}
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

      {/* Admin Response Modal */}
      {showModal && (
        <div 
          className="modal-overlay" 
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 id="modal-title">
                {modalType === 'resolve' ? '✅ Resolve Complaint' : '💬 Reply to Complaint'}
              </h2>
              <button 
                className="modal-close-btn" 
                onClick={closeModal}
                aria-label="Close modal"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>
            
            {selectedComplaint && (
              <div className="modal-complaint-info">
                <h3>{selectedComplaint.Title}</h3>
                <p className="modal-complaint-desc">{selectedComplaint.Description}</p>
                <div className="modal-complaint-meta">
                  <span>📋 #{selectedComplaint.ComplaintID.slice(0, 8)}</span>
                  <span>👤 {selectedComplaint.User?.Username || 'Anonymous'}</span>
                  <span>🏠 Room {selectedComplaint.Room?.RoomNumber || 'N/A'}</span>
                </div>
              </div>
            )}
            
            <div className="modal-body">
              <label htmlFor="admin-response">
                {modalType === 'resolve' 
                  ? 'Resolution Notes (Optional)' 
                  : 'Your Response *'}
              </label>
              <textarea
                id="admin-response"
                className="modal-textarea"
                placeholder={
                  modalType === 'resolve'
                    ? 'Enter notes about how this complaint was resolved...'
                    : 'Enter your response to the student...'
                }
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={6}
                autoFocus
                disabled={isSubmitting}
                aria-required={modalType === 'reply'}
              />
              <p className="keyboard-hint">💡 Tip: Press Ctrl+Enter to submit quickly</p>
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-btn modal-cancel-btn" 
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="modal-btn modal-submit-btn" 
                onClick={handleModalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    {modalType === 'resolve' ? 'Resolving...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {modalType === 'resolve' ? 'Mark as Resolved' : 'Send Reply'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsManagement;