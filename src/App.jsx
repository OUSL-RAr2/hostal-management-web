import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RoomManagement from './pages/RoomManagement';
import './App.css';
import StudentManagement from './pages/StudentManagement';
import ComplaintsManagement from './pages/ComplaintsManagement';
import Settings from './pages/Settings';

function App() {
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  // Render the appropriate page based on activeMenu
  const renderPage = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Room Management':
        return <RoomManagement />;
      case 'Students':
        return <StudentManagement />;
      case 'Complaints':
        return <ComplaintsManagement />;
      case 'Check-in/out':
        return <div className="coming-soon">Check-in/out Page - Coming Soon</div>;
      case 'Reports':
        return <div className="coming-soon">Reports Page - Coming Soon</div>;
      case 'Settings':
        return <Settings/>;
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

export default App;