import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RoomManagement from './pages/RoomManagement';
import './App.css';
import StudentManagement from './pages/StudentManagement';
import ComplaintsManagement from './pages/ComplaintsManagement';
import Settings from './pages/Settings';
import CheckInOut from './pages/CkeckInOut';
import RegisterStudent from './pages/RegisterStudent';

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