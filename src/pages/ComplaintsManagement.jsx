import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, Clock, CheckCircle, User, Home, X, Send, Wifi, WifiOff } from 'lucide-react';
import io from 'socket.io-client';
import './ComplaintsManagement.css';

const ComplaintsManagement = () => {
  const [filter, setFilter] = useState('new');
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
  
  // Real-time sync state
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds (fallback)
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const toastTimeoutRef = useRef(null);

  // Fetch complaints from API (initial load)
  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, []);

  // WebSocket real-time connection
  useEffect(() => {
    // Initialize Socket.IO connection
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      showToast('Connected to real-time server', 'success');
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
      showToast('Lost connection to server', 'error');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Real-time complaint events
    socket.on('complaint:created', (newComplaint) => {
      console.log('🆕 New complaint received:', newComplaint);
      setComplaints(prev => [newComplaint, ...prev]);
      refreshStats();
      showToast('New complaint received', 'success');
    });

    socket.on('complaint:updated', (updatedComplaint) => {
      console.log('🔄 Complaint updated:', updatedComplaint);
      setComplaints(prev => 
        prev.map(c => 
          c.ComplaintID === updatedComplaint.ComplaintID ? updatedComplaint : c
        )
      );
      refreshStats();
    });

    socket.on('complaint:deleted', ({ ComplaintID }) => {
      console.log('🗑️ Complaint deleted:', ComplaintID);
      setComplaints(prev => prev.filter((c) => c.ComplaintID !== ComplaintID));
      refreshStats();
      showToast('Complaint deleted', 'success');
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      console.log('WebSocket disconnected (cleanup)');
    };
  }, []);

  // Fallback polling (in case WebSocket fails) - less frequent
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Stop polling when tab is hidden
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else {
        // Resume polling when tab becomes visible (only if not connected via WebSocket)
        if (!showModal && !isConnected) {
          refreshData();
          startPolling();
        }
      }
    };

    const startPolling = () => {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Only poll if WebSocket is not connected
      if (!isConnected) {
        pollingIntervalRef.current = setInterval(() => {
          if (!document.hidden && !showModal && !isConnected) {
            refreshData();
          }
        }, AUTO_REFRESH_INTERVAL);
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Start fallback polling if WebSocket not connected
    if (!isConnected && !document.hidden) {
      startPolling();
    }

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [showModal, isConnected]);

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

  // Toast notification helper
  const showToast = useCallback((message, type = 'success') => {
    // Clear existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    setToast({ show: true, message, type });
    
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  }, []);

  // Refresh data (silent background sync)
  const refreshData = useCallback(async () => {
    try {
      await Promise.all([fetchComplaintsQuiet(), fetchStatsQuiet()]);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
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

  // Quiet fetch without loading state (for background sync)
  const fetchComplaintsQuiet = async () => {
    try {
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
      }
    } catch (err) {
      console.error('Error fetching complaints (quiet):', err);
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

  // Quiet fetch stats without loading state
  const fetchStatsQuiet = async () => {
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
      console.error('Error fetching stats (quiet):', err);
    }
  };

  // Refresh stats only (for WebSocket updates)
  const refreshStats = async () => {
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
      console.error('Error refreshing stats:', err);
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

  const isAnonymousComplaint = (complaint) => {
    const description = complaint?.Description || '';
    return description.startsWith('[Anonymous Request]');
  };

  const getReporterLabel = (complaint) => {
    if (isAnonymousComplaint(complaint)) return 'Anonymous';
    return complaint?.User?.Username || 'Anonymous';
  };

  const getStudentReplies = (complaint) => {
    const description = complaint?.Description || '';
    return description
      .split('\n')
      .filter((line) => line.trim().startsWith('[Student Reply'))
      .map((line) => {
        const separatorIndex = line.indexOf(']:');
        if (separatorIndex === -1) return line;
        return line.slice(separatorIndex + 2).trim();
      })
      .filter(Boolean);
  };

  const getCleanComplaintDescription = (complaint) => {
    const description = complaint?.Description || '';

    const cleaned = description
      .split('\n')
      .filter((line) => !line.trim().startsWith('[Student Reply'))
      .join('\n')
      .trim();

    return cleaned || 'No description provided.';
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
        // Immediate refresh after update to sync all clients
        await refreshData();
        showToast('Complaint status updated successfully', 'success');
      } else {
        showToast(data.message || 'Failed to update complaint status', 'error');
      }
    } catch (err) {
      console.error('Error updating complaint:', err);
      showToast('Failed to connect to server', 'error');
    }
  };

  const handleResolve = (complaint) => {
    setSelectedComplaint(complaint);
    setModalType('resolve');
    setResponseText('');
    setShowModal(true);
  };

  const handleInvestigate = async (complaintId) => {
    await updateComplaintStatus(complaintId, 'in_progress');
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
      showToast('Please enter a response', 'error');
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
        if (filter === 'resolved') return c.Status === 'resolved';
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
        <div className="header-actions">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? (
              <>
                <Wifi size={16} />
                <span>Live</span>
              </>
            ) : (
              <>
                <WifiOff size={16} />
                <span>Offline</span>
              </>
            )}
          </div>
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
          <button 
            className={`filter-tab ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </button>
        </div>

        {/* Complaints Grid */}
        <div className="complaints-grid">
          {filteredComplaints.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
              <p>No complaints found</p>
            </div>
          ) : (
            filteredComplaints.map((complaint, index) => {
              const studentReplies = getStudentReplies(complaint);
              const cleanDescription = getCleanComplaintDescription(complaint);

              return (
              <div key={index} className={`complaint-card-modern priority-${complaint.Priority}`}>
                <div className="complaint-header-modern">
                  <div className="complaint-id-section">
                    <span className="complaint-id-modern">#{complaint.ComplaintID.slice(0, 8)}</span>
                    <span className={`priority-badge priority-${complaint.Priority}`}>
                      {complaint.Priority.charAt(0).toUpperCase() + complaint.Priority.slice(1)} Priority
                    </span>
                  </div>
                  <span className={`status-badge-modern ${
                    complaint.Status === 'pending'
                      ? 'status-new'
                      : complaint.Status === 'resolved'
                        ? 'status-resolved'
                        : complaint.Status === 'rejected'
                          ? 'status-rejected'
                          : 'status-progress'
                  }`}>
                    {getStatusDisplay(complaint.Status)}
                  </span>
                </div>
                
                <div className="complaint-body">
                  <h3 className="complaint-issue">{complaint.Title}</h3>
                  <p className="complaint-description">{cleanDescription}</p>
                  
                  <div className="complaint-meta">
                    <div className="meta-item">
                      <Home size={16} />
                      <span>Room: {complaint.Room ? complaint.Room.RoomNumber : 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <User size={16} />
                      <span>{getReporterLabel(complaint)}</span>
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

                  {studentReplies.length > 0 && (
                    <div className="student-response-box">
                      <strong>Student Reply:</strong>
                      {studentReplies.map((reply, replyIndex) => (
                        <p key={replyIndex} className="student-response-text">{reply}</p>
                      ))}
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
            )})
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
                {(() => {
                  const cleanDescription = getCleanComplaintDescription(selectedComplaint);
                  const studentReplies = getStudentReplies(selectedComplaint);

                  return (
                    <>
                <h3>{selectedComplaint.Title}</h3>
                <p className="modal-complaint-desc">{cleanDescription}</p>
                {selectedComplaint.AdminResponse && (
                  <div className="admin-response">
                    <strong>Admin Response:</strong> {selectedComplaint.AdminResponse}
                  </div>
                )}
                {studentReplies.length > 0 && (
                  <div className="student-response-box">
                    <strong>Student Reply:</strong>
                    {studentReplies.map((reply, replyIndex) => (
                      <p key={replyIndex} className="student-response-text">{reply}</p>
                    ))}
                  </div>
                )}
                <div className="modal-complaint-meta">
                  <span>📋 #{selectedComplaint.ComplaintID.slice(0, 8)}</span>
                  <span>👤 {getReporterLabel(selectedComplaint)}</span>
                  <span>🏠 Room {selectedComplaint.Room?.RoomNumber || 'N/A'}</span>
                </div>
                    </>
                  );
                })()}
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

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? '✓' : '✕'}
          </div>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default ComplaintsManagement;