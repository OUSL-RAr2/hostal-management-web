import React from 'react';
import { Home, Users, Building2, MessageSquare, Clock, FileText, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const menuItems = [
    { icon: Home, label: 'Dashboard' },
    { icon: Users, label: 'Students' },
    { icon: Building2, label: 'Room Management' },  // Make sure this says "Room Management"
    { icon: MessageSquare, label: 'Complaints' },
    { icon: Clock, label: 'Check-in/out' },
    { icon: FileText, label: 'Reports' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">O</div>
          <span className="logo-text">OUSL Hostel Admin</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveMenu(item.label)}
            className={`menu-item ${activeMenu === item.label ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;