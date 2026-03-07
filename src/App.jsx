import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RoomManagement from './pages/RoomManagement';
import './App.css';
import StudentManagement from './pages/StudentManagement';
import ComplaintsManagement from './pages/ComplaintsManagement';
import Settings from './pages/Settings';
import CheckInOut from './pages/CkeckInOut';
import QRCodeDisplay from './pages/QRCodeDisplay';
import QRCodeStandalone from './pages/QRCodeStandalone';
import RegisterStudent from './pages/RegisterStudent';
import AddRoom from './pages/AddRoom';

// Main App with Sidebar
function MainApp() {
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
        return <div className="coming-soon">Reports Page - Coming Soon</div>;
      case 'Settings':
        return <Settings/>;
      case 'Register Student':
        return <RegisterStudent />;
      case 'Add Room':
        return <AddRoom />;
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
  return (
    <Routes>
      {/* Standalone QR Code Pages - No Sidebar */}
      <Route path="/qr/boys" element={<QRCodeStandalone hostelType="boys" />} />
      <Route path="/qr/girls" element={<QRCodeStandalone hostelType="girls" />} />
      <Route path="/qr" element={<QRCodeStandalone />} />
      
      {/* Main App with Sidebar - All other routes */}
      <Route path="/*" element={<MainApp />} />
    </Routes>
  );
}

export default App;