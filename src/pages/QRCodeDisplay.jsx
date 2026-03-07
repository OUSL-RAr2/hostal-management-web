import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, MapPin, Clock, Users } from 'lucide-react';
import { API_CONFIG, buildUrl } from '../config/api.config';
import './QRCodeDisplay.css';

const QRCodeDisplay = () => {
  const [qrCodes, setQrCodes] = useState({
    boysHostel: null,
    girlsHostel: null
  });
  const [loading, setLoading] = useState({ boys: false, girls: false });
  const [error, setError] = useState({ boys: null, girls: null });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [statistics, setStatistics] = useState(null);

  // Device configurations
  const devices = [
    { id: 'boys-hostel', location: 'Boys Hostel', key: 'boysHostel', color: '#2196F3' },
    { id: 'girls-hostel', location: 'Girls Hostel', key: 'girlsHostel', color: '#E91E63' }
  ];

  // Generate QR code for a specific device
  const generateQRCode = async (deviceId, location, key) => {
    setLoading(prev => ({ ...prev, [key.replace('Hostel', '')]: true }));
    setError(prev => ({ ...prev, [key.replace('Hostel', '')]: null }));

    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.QR.GENERATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: Add authentication token here if needed
          // 'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ deviceId, location })
      });

      const data = await response.json();

      if (data.success) {
        setQrCodes(prev => ({
          ...prev,
          [key]: {
            ...data.data,
            generatedAt: new Date()
          }
        }));
      } else {
        setError(prev => ({ 
          ...prev, 
          [key.replace('Hostel', '')]: data.message || 'Failed to generate QR code' 
        }));
      }
    } catch (err) {
      console.error('Generate QR Error:', err);
      setError(prev => ({ 
        ...prev, 
        [key.replace('Hostel', '')]: 'Network error. Please try again.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key.replace('Hostel', '')]: false }));
    }
  };

  // Get active QR code for a device
  const getActiveQRCode = async (deviceId, key) => {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.QR.GET_ACTIVE}/${deviceId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        setQrCodes(prev => ({
          ...prev,
          [key]: {
            ...data.data,
            generatedAt: new Date(data.data.createdAt || Date.now())
          }
        }));
      } else {
        // No active QR code, generate a new one
        const device = devices.find(d => d.key === key);
        if (device) {
          generateQRCode(device.id, device.location, key);
        }
      }
    } catch (err) {
      console.error('Get QR Error:', err);
      // If error, try to generate new one
      const device = devices.find(d => d.key === key);
      if (device) {
        generateQRCode(device.id, device.location, key);
      }
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.QR.STATISTICS), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (err) {
      console.error('Fetch statistics error:', err);
    }
  };

  // Initialize - load existing QR codes or generate new ones
  useEffect(() => {
    devices.forEach(device => {
      getActiveQRCode(device.id, device.key);
    });
    fetchStatistics();
  }, []);

  // Auto-refresh QR codes when they expire
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      devices.forEach(device => {
        const qrCode = qrCodes[device.key];
        if (qrCode && qrCode.expiresAt) {
          const expiryTime = new Date(qrCode.expiresAt).getTime();
          const now = Date.now();
          
          // Refresh 10 seconds before expiry or if already expired
          if (expiryTime - now < 10000) {
            generateQRCode(device.id, device.location, device.key);
          }
        }
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, qrCodes]);

  // Calculate time remaining
  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'N/A';
    const now = Date.now();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="qr-display-page">
      {/* Header */}
      <div className="qr-header">
        <div className="qr-header-content">
          <h1>QR Code Check-In/Out System</h1>
          <p>Display QR codes for student check-in and check-out</p>
        </div>
        <div className="qr-header-actions">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="qr-stats">
          <div className="stat-card">
            <Users size={24} className="stat-icon" />
            <div className="stat-info">
              <div className="stat-value">{statistics.total || 0}</div>
              <div className="stat-label">Total Activities</div>
            </div>
          </div>
          <div className="stat-card stat-success">
            <div className="stat-icon">✓</div>
            <div className="stat-info">
              <div className="stat-value">{statistics.checkIns || 0}</div>
              <div className="stat-label">Check-ins</div>
            </div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-icon">✗</div>
            <div className="stat-info">
              <div className="stat-value">{statistics.checkOuts || 0}</div>
              <div className="stat-label">Check-outs</div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Display Grid */}
      <div className="qr-grid">
        {devices.map(device => {
          const qrData = qrCodes[device.key];
          const isLoading = loading[device.key.replace('Hostel', '')];
          const errorMsg = error[device.key.replace('Hostel', '')];
          const timeRemaining = qrData ? getTimeRemaining(qrData.expiresAt) : null;

          return (
            <div key={device.id} className="qr-card" style={{ borderTopColor: device.color }}>
              <div className="qr-card-header">
                <div className="qr-location">
                  <MapPin size={20} style={{ color: device.color }} />
                  <h2>{device.location}</h2>
                </div>
                <button
                  className="refresh-btn"
                  onClick={() => generateQRCode(device.id, device.location, device.key)}
                  disabled={isLoading}
                >
                  <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
                  Refresh
                </button>
              </div>

              <div className="qr-card-body">
                {isLoading && (
                  <div className="qr-loading">
                    <div className="spinner"></div>
                    <p>Generating QR code...</p>
                  </div>
                )}

                {!isLoading && errorMsg && (
                  <div className="qr-error">
                    <p>⚠️ {errorMsg}</p>
                    <button onClick={() => generateQRCode(device.id, device.location, device.key)}>
                      Try Again
                    </button>
                  </div>
                )}

                {!isLoading && !errorMsg && qrData && (
                  <>
                    <div className="qr-code-container">
                      <img 
                        src={qrData.qrCodeImage} 
                        alt={`QR Code for ${device.location}`}
                        className="qr-code-image"
                      />
                    </div>

                    <div className="qr-info">
                      <div className="qr-info-item">
                        <Clock size={16} />
                        <span className={timeRemaining === 'Expired' ? 'expired' : ''}>
                          Expires in: <strong>{timeRemaining}</strong>
                        </span>
                      </div>
                      <div className="qr-info-item">
                        <QrCode size={16} />
                        <span>Used: <strong>{qrData.usedCount || 0} times</strong></span>
                      </div>
                      {qrData.generatedAt && (
                        <div className="qr-info-item">
                          <span className="qr-generated-time">
                            Generated: {new Date(qrData.generatedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="qr-card-footer">
                <div className="qr-instructions">
                  <p>📱 Students can scan this QR code using the mobile app to check in/out</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="qr-help-section">
        <h3>How it works:</h3>
        <ol>
          <li>Each hostel has a unique QR code displayed on this screen</li>
          <li>Students scan the QR code using their mobile app when entering or leaving</li>
          <li>The system automatically toggles between check-in and check-out based on the student's last action</li>
          <li>QR codes refresh automatically after being used or when they expire</li>
          <li>All check-in/out activities are logged and can be viewed in the dashboard</li>
        </ol>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
