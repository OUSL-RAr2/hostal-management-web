import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RoomManagement from './pages/RoomManagement';
import './App.css';
import StudentManagement from './pages/StudentManagement';
import ComplaintsManagement from './pages/ComplaintsManagement';
import Settings from './pages/Settings';
import CheckInOut from './pages/CkeckInOut';
import QRCodeStandalone from './pages/QRCodeStandalone';
import RegisterStudent from './pages/RegisterStudent';
import AddRoom from './pages/AddRoom';
import ViewStudent from './pages/ViewStudent';
import EditStudent from './pages/EditStudent';
import Report from './pages/Report';
import Login from './pages/Login';
import { isAuthenticated } from './services/authService';

// Main App with Sidebar
function MainApp({ onLogout }) {
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  // Render the appropriate page based on activeMenu
  const renderPage = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Room Management':
        return <RoomManagement setActiveMenu={setActiveMenu} />;
      case 'Students':
        return <StudentManagement setActiveMenu={setActiveMenu} />;
      case 'Complaints':
        return <ComplaintsManagement />;
      case 'Check-in/out':
        return <CheckInOut />;
      case 'Reports':
        return <Report />;
      case 'Settings':
        return <Settings onLogout={onLogout} />;
      case 'Register Student':
        return <RegisterStudent />;
      case 'Add Room':
        return <AddRoom />;
      case 'View Student':
        return <ViewStudent />;
      case 'Edit Student':
        return <EditStudent />;
      default:
        return <Dashboard />;
      
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      {renderPage()}
    </div>
  );
}

// App Component with Routes
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    if (isAuthenticated()) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainApp onLogout={handleLogout} />} />
      <Route path="/qr/boys"  element={<QRCodeStandalone hostelType="boys"  />} />
      <Route path="/qr/girls" element={<QRCodeStandalone hostelType="girls" />} />
      <Route path="/*" element={<MainApp onLogout={handleLogout} />} />
    </Routes>
  );
}

export default App;