import React, { useState, useEffect, useRef } from 'react';
import { QrCode, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { io } from 'socket.io-client';
import { API_CONFIG, buildUrl } from '../config/api.config';
import './QRCodeStandalone.css';

// Device config driven by hostelType prop passed from router
const DEVICE_CONFIG = {
  boys:  { id: 'boys-hostel',  location: 'Boys Hostel',  color: '#f59e0b' },
  girls: { id: 'girls-hostel', location: 'Girls Hostel', color: '#E91E63' },
};

const QRCodeStandalone = ({ hostelType = 'boys' }) => {
  const device = DEVICE_CONFIG[hostelType] ?? DEVICE_CONFIG.boys;

  const [qrData, setQrData]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const socketRef = useRef(null);

  // ── Clock ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── WebSocket + initial QR load ────────────────────────────────────────────
  useEffect(() => {
    // 1. Load initial QR
    fetchOrGenerateQR();

    // 2. Open WebSocket
    const socket = io(API_CONFIG.BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`✅ WebSocket connected (${device.location}):`, socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket error:', err.message);
      setIsConnected(false);
    });

    // 3. Listen for new QR pushed by backend after a successful scan
    socket.on('qr-refresh', (data) => {
      console.log('🔄 qr-refresh received:', data);
      if (data.deviceId === device.id && data.newQrCode) {
        console.log(`✨ Instant QR update for ${device.location}`);
        setQrData({
          ...data.newQrCode,
          generatedAt: new Date(),
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [hostelType]); // re-run if hostelType changes (route navigation)

  // ── Fetch active QR, or generate one if none exists ───────────────────────
  const fetchOrGenerateQR = async () => {
    setLoading(true);
    try {
      const res  = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.QR.GET_ACTIVE}/${device.id}`));
      const data = await res.json();
      if (data.success) {
        setQrData({ ...data.data, generatedAt: new Date() });
      } else {
        await generateQR();
      }
    } catch {
      await generateQR();
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async () => {
    try {
      const res  = await fetch(buildUrl(API_CONFIG.ENDPOINTS.QR.GENERATE), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ deviceId: device.id, location: device.location }),
      });
      const data = await res.json();
      if (data.success) {
        setQrData({ ...data.data, generatedAt: new Date() });
      }
    } catch (err) {
      console.error('Generate QR error:', err);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatTime = (d) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const formatDate = (d) =>
    d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="qr-standalone-page">

      {/* ── Header ── */}
      <div className="qr-standalone-header">
        <div className="header-content">
          <h1>OUSL Hostel Management</h1>
          <p>Check-in / Check-out System</p>
        </div>
        <div className="header-right">
          <div className={`ws-status-badge ${isConnected ? 'ws-on' : 'ws-off'}`}>
            {isConnected ? <Wifi size={15} /> : <WifiOff size={15} />}
            <span>{isConnected ? 'Live' : 'Disconnected'}</span>
          </div>
          <div className="header-time">
            <div className="current-date">{formatDate(currentTime)}</div>
            <div className="current-time">{formatTime(currentTime)}</div>
          </div>
        </div>
      </div>

      {/* ── QR Card ── */}
      <div className="qr-standalone-grid single">
        <div className="qr-standalone-card">

          <div className="qr-location-header" style={{ backgroundColor: device.color }}>
            <h2>{device.location}</h2>
            <div className="qr-icon"><QrCode size={32} /></div>
          </div>

          <div className="qr-code-section">
            {loading ? (
              <div className="qr-loading-state">
                <div className="loading-spinner" />
                <p>Loading QR Code…</p>
              </div>
            ) : qrData ? (
              <>
                <div className="qr-code-wrapper">
                  <img
                    src={qrData.qrCodeImage}
                    alt={`QR for ${device.location}`}
                    className="qr-code-img"
                  />
                </div>
                <div className="qr-instructions">
                  <p>📱 Scan this QR code using the mobile app</p>
                  <p>🔄 Code refreshes instantly after each scan</p>
                </div>
              </>
            ) : (
              <div className="qr-error-state">
                <p>Unable to load QR code</p>
                <button onClick={fetchOrGenerateQR}>
                  <RefreshCw size={18} /> Retry
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <div className="qr-standalone-footer">
        <p>Open University of Sri Lanka - Hostel Management System</p>
      </div>

    </div>
  );
};

export default QRCodeStandalone;
