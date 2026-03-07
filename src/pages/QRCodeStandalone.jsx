import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, Clock } from 'lucide-react';
import { API_CONFIG, buildUrl } from '../config/api.config';
import './QRCodeStandalone.css';

const QRCodeStandalone = ({ hostelType }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Device configurations
  const allDevices = {
    boys: { id: 'boys-hostel', location: 'Boys Hostel', key: 'boysHostel', color: '#f59e0b' },
    girls: { id: 'girls-hostel', location: 'Girls Hostel', key: 'girlsHostel', color: '#F66D14' }
  };

  // Determine which device(s) to show
  const devicesToShow = hostelType 
    ? [allDevices[hostelType]] 
    : [allDevices.boys, allDevices.girls];

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Generate QR code for a specific device
  const generateQRCode = async (deviceId, location) => {
    setLoading(true);

    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.QR.GENERATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId, location })
      });

      const data = await response.json();

      if (data.success) {
        setQrData({
          ...data.data,
          generatedAt: new Date(),
          deviceId,
          location
        });
      }
    } catch (err) {
      console.error('Generate QR Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get active QR code for a device
  const getActiveQRCode = async (deviceId, location) => {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.QR.GET_ACTIVE}/${deviceId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        setQrData({
          ...data.data,
          generatedAt: new Date(data.data.createdAt || Date.now()),
          deviceId,
          location
        });
      } else {
        generateQRCode(deviceId, location);
      }
    } catch (err) {
      console.error('Get QR Error:', err);
      generateQRCode(deviceId, location);
    }
  };

  // Initialize - load existing QR code or generate new one
  useEffect(() => {
    if (devicesToShow.length === 1) {
      const device = devicesToShow[0];
      getActiveQRCode(device.id, device.location);
    }
  }, [hostelType]);

  // Auto-refresh QR code when it expires
  useEffect(() => {
    const interval = setInterval(() => {
      if (qrData && qrData.expiresAt) {
        const expiryTime = new Date(qrData.expiresAt).getTime();
        const now = Date.now();
        
        // Refresh 10 seconds before expiry or if already expired
        if (expiryTime - now < 10000) {
          generateQRCode(qrData.deviceId, qrData.location);
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [qrData]);

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

  // Format current time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="qr-standalone-page">
      {/* Header with Time */}
      <div className="qr-standalone-header">
        <div className="header-content">
          <h1>OUSL Hostel Management</h1>
          <p>Check-in / Check-out System</p>
        </div>
        <div className="header-time">
          <div className="current-date">{formatDate(currentTime)}</div>
          <div className="current-time">{formatTime(currentTime)}</div>
        </div>
      </div>

      {/* QR Code Display - Single or Dual */}
      <div className={`qr-standalone-grid ${hostelType ? 'single' : ''}`}>
        {devicesToShow.map(device => {
          const timeRemaining = qrData ? getTimeRemaining(qrData.expiresAt) : null;

          return (
            <div key={device.id} className="qr-standalone-card">
              {/* Location Header */}
              <div className="qr-location-header" style={{ backgroundColor: device.color }}>
                <h2>{device.location}</h2>
                <div className="qr-icon">
                  <QrCode size={32} />
                </div>
              </div>

              {/* QR Code Display */}
              <div className="qr-code-section">
                {loading ? (
                  <div className="qr-loading-state">
                    <div className="loading-spinner"></div>
                    <p>Generating QR Code...</p>
                  </div>
                ) : qrData ? (
                  <>
                    <div className="qr-code-wrapper">
                      <img 
                        src={qrData.qrCodeImage} 
                        alt={`QR Code for ${device.location}`}
                        className="qr-code-img"
                      />
                    </div>
                    
                    {/* Timer Display */}
                    <div className="qr-timer">
                      <Clock size={24} />
                      <div className="timer-content">
                        <span className="timer-label">Valid for:</span>
                        <span className={`timer-value ${timeRemaining === 'Expired' ? 'expired' : ''}`}>
                          {timeRemaining}
                        </span>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="qr-instructions">
                      <p>📱 Scan this QR code using the mobile app</p>
                      <p>🔄 Code refreshes automatically</p>
                    </div>
                  </>
                ) : (
                  <div className="qr-error-state">
                    <p>Unable to load QR code</p>
                    <button onClick={() => generateQRCode(device.id, device.location)}>
                      <RefreshCw size={18} />
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="qr-standalone-footer">
        <p>Open University of Sri Lanka - Hostel Management System</p>
      </div>
    </div>
  );
};

export default QRCodeStandalone;
