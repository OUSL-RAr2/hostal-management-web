import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, Shield, Globe, Moon, Mail, Phone, MapPin, Save, UserPlus, Users as UsersIcon, X, LogOut } from 'lucide-react';
import './Settings.css';
import { useNotification } from '../components/ui/useNotification';

const Settings = ({ onLogout }) => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [activeTab, setActiveTab] = useState('profile');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [formData, setFormData] = useState({
    // Profile
    fullName: 'Admin User',
    email: 'admin@ousl.lk',
    phone: '+94 77 123 4567',
    address: 'OUSL Campus, Nawala',
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    complaintAlerts: true,
    checkInAlerts: true,
  });

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'admin'
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNewAdminChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    notify.success('Settings saved successfully!');
  };

  const handleAddAdmin = () => {
    notify.success(`New admin added: ${newAdmin.name}`);
    setShowAddAdminModal(false);
    setNewAdmin({ name: '', email: '', phone: '', role: 'admin' });
  };

  const handleLogout = async () => {
    const confirmLogout = await notify.confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      tone: 'primary'
    });
    if (confirmLogout) {
      // clear token & user data
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminInfo');
      if (onLogout) {
        onLogout();
      }
      // redirect to login page
      navigate('/');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'admins', label: 'Admin Users', icon: UsersIcon },
  ];

  const adminUsers = [
    { id: 1, name: 'Admin User', email: 'admin@ousl.lk', role: 'Super Admin', status: 'Active' },
    { id: 2, name: 'John Doe', email: 'john@ousl.lk', role: 'Admin', status: 'Active' },
    { id: 3, name: 'Jane Smith', email: 'jane@ousl.lk', role: 'Admin', status: 'Active' },
  ];

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account settings and preferences</p>
        </div>
        <button className="logout-btn-header" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="settings-container">
        {/* Sidebar Tabs */}
        <div className="settings-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="settings-content">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2 className="section-title">
                <User size={24} />
                Profile Information
              </h2>
              <p className="section-description">Update your personal information and contact details</p>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="fullName">
                    <User size={16} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">
                    <MapPin size={16} />
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              <button className="save-btn" onClick={handleSave}>
                <Save size={18} />
                Save Changes
              </button>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2 className="section-title">
                <Shield size={24} />
                Security Settings
              </h2>
              <p className="section-description">Manage your password and security preferences</p>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="currentPassword">
                    <Lock size={16} />
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">
                    <Lock size={16} />
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <Lock size={16} />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="security-options">
                <div className="security-option">
                  <div className="option-info">
                    <h3>Login History</h3>
                    <p>View recent login activity</p>
                  </div>
                  <button className="view-btn">View</button>
                </div>
              </div>

              <button className="save-btn" onClick={handleSave}>
                <Save size={18} />
                Update Password
              </button>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2 className="section-title">
                <Bell size={24} />
                Notification Preferences
              </h2>
              <p className="section-description">Choose how you want to be notified</p>

              <div className="notification-options">
                <div className="notification-option">
                  <div className="option-info">
                    <h3>Complaint Alerts</h3>
                    <p>Get notified when new complaints are submitted</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="complaintAlerts"
                      checked={formData.complaintAlerts}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-option">
                  <div className="option-info">
                    <h3>Check-in Alerts</h3>
                    <p>Get notified for student check-ins and check-outs</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="checkInAlerts"
                      checked={formData.checkInAlerts}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <button className="save-btn" onClick={handleSave}>
                <Save size={18} />
                Save Preferences
              </button>
            </div>
          )}

          {/* Admin Users Tab */}
          {activeTab === 'admins' && (
            <div className="settings-section">
              <div className="admin-header">
                <div>
                  <h2 className="section-title">
                    <UsersIcon size={24} />
                    Admin Users
                  </h2>
                  <p className="section-description">Manage administrator accounts</p>
                </div>
                <button className="add-admin-btn" onClick={() => setShowAddAdminModal(true)}>
                  <UserPlus size={18} />
                  Add New Admin
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((admin) => (
                      <tr key={admin.id}>
                        <td>{admin.name}</td>
                        <td>{admin.email}</td>
                        <td>
                          <span className="role-badge">{admin.role}</span>
                        </td>
                        <td>
                          <span className="status-badge active">{admin.status}</span>
                        </td>
                        <td>
                          <button className="edit-admin-btn">Edit</button>
                          <button className="delete-admin-btn">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="modal-overlay" onClick={() => setShowAddAdminModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Admin</h3>
              <button className="modal-close" onClick={() => setShowAddAdminModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="adminName">
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  id="adminName"
                  name="name"
                  value={newAdmin.name}
                  onChange={handleNewAdminChange}
                  placeholder="Enter admin name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="adminEmail">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  id="adminEmail"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleNewAdminChange}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="adminPhone">
                  <Phone size={16} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="adminPhone"
                  name="phone"
                  value={newAdmin.phone}
                  onChange={handleNewAdminChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="adminRole">
                  <Shield size={16} />
                  Role
                </label>
                <select
                  id="adminRole"
                  name="role"
                  value={newAdmin.role}
                  onChange={handleNewAdminChange}
                >
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddAdminModal(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleAddAdmin}>
                <UserPlus size={18} />
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;