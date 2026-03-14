import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Shield, Mail, Phone, Save, LogOut, Loader2, UserPlus, Users as UsersIcon, X } from 'lucide-react';
import './Settings.css';
import { useNotification } from '../components/ui/useNotification';
import {
  changeAdminPassword,
  createAdminAccount,
  deleteAdminAccount,
  getAllAdmins,
  getAdminProfile,
  updateAdminProfile,
} from '../services/authService';

const Settings = ({ onLogout }) => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [currentAdminRole, setCurrentAdminRole] = useState('admin');
  const [currentAdminId, setCurrentAdminId] = useState('');
  const [adminUsers, setAdminUsers] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nic: '',
  });

  const [newAdmin, setNewAdmin] = useState({
    nic: '',
    name: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await getAdminProfile();
        const admin = response?.data;

        setFormData({
          fullName: admin?.Name || '',
          email: admin?.Email || '',
          phone: admin?.ContactNumber || '',
          nic: admin?.NIC || '',
        });
        setCurrentAdminRole(admin?.Role || 'admin');
        setCurrentAdminId(admin?.AdminID || '');
      } catch (error) {
        notify.error(error.message || 'Failed to load profile');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [notify]);

  const loadAdmins = useCallback(async () => {
    try {
      setIsLoadingAdmins(true);
      const response = await getAllAdmins();
      setAdminUsers(response?.data || []);
    } catch (error) {
      notify.error(error.message || 'Failed to load admin users');
    } finally {
      setIsLoadingAdmins(false);
    }
  }, [notify]);

  useEffect(() => {
    if (currentAdminRole === 'super_admin' && activeTab === 'admins') {
      loadAdmins();
    }
  }, [activeTab, currentAdminRole, loadAdmins]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewAdminChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSave = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      notify.error('Name, email and phone are required');
      return;
    }

    try {
      setIsSavingProfile(true);
      await updateAdminProfile({
        name: formData.fullName,
        email: formData.email,
        contactNumber: formData.phone,
      });
      notify.success('Profile updated successfully');
    } catch (error) {
      notify.error(error.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      notify.error('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notify.error('New passwords do not match');
      return;
    }

    try {
      setIsSavingPassword(true);
      await changeAdminPassword(passwordData);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      notify.success('Password updated successfully');
    } catch (error) {
      notify.error(error.message || 'Failed to update password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.nic || !newAdmin.name || !newAdmin.email || !newAdmin.contactNumber || !newAdmin.password || !newAdmin.confirmPassword) {
      notify.error('All fields are required');
      return;
    }

    if (newAdmin.password !== newAdmin.confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }

    try {
      setIsCreatingAdmin(true);
      await createAdminAccount(newAdmin);
      notify.success('Admin account created successfully');
      setShowAddAdminModal(false);
      setNewAdmin({
        nic: '',
        name: '',
        email: '',
        contactNumber: '',
        password: '',
        confirmPassword: '',
      });
      await loadAdmins();
    } catch (error) {
      notify.error(error.message || 'Failed to create admin account');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (admin) => {
    const confirmed = await notify.confirm({
      title: 'Delete Admin',
      message: `Are you sure you want to delete ${admin.Name}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminAccount(admin.AdminID);
      notify.success('Admin account deleted successfully');
      await loadAdmins();
    } catch (error) {
      notify.error(error.message || 'Failed to delete admin account');
    }
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
    ...(currentAdminRole === 'super_admin' ? [{ id: 'admins', label: 'Admin Users', icon: UsersIcon }] : []),
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
          {isLoadingProfile ? (
            <div className="settings-section">
              <h2 className="section-title">
                <Loader2 size={24} className="spin" />
                Loading Settings
              </h2>
              <p className="section-description">Fetching your profile from server...</p>
            </div>
          ) : (
            <>
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
                  <label htmlFor="nic">
                    NIC
                  </label>
                  <input
                    type="text"
                    id="nic"
                    name="nic"
                    value={formData.nic}
                    disabled
                    placeholder="NIC"
                  />
                </div>
              </div>

              <button className="save-btn" onClick={handleProfileSave} disabled={isSavingProfile}>
                {isSavingProfile ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
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
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
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
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
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
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button className="save-btn" onClick={handlePasswordSave} disabled={isSavingPassword}>
                {isSavingPassword ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                {isSavingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}

          {activeTab === 'admins' && currentAdminRole === 'super_admin' && (
            <div className="settings-section">
              <div className="admin-header">
                <div>
                  <h2 className="section-title">
                    <UsersIcon size={24} />
                    Admin Users
                  </h2>
                  <p className="section-description">Super admin can add and view admin accounts</p>
                </div>
                <button className="add-admin-btn" onClick={() => setShowAddAdminModal(true)}>
                  <UserPlus size={18} />
                  Add New Admin
                </button>
              </div>

              {isLoadingAdmins ? (
                <p className="section-description">Loading admin users...</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>NIC</th>
                        <th>Contact</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((admin) => (
                        <tr key={admin.AdminID}>
                          <td>{admin.Name}</td>
                          <td>{admin.Email}</td>
                          <td>{admin.NIC}</td>
                          <td>{admin.ContactNumber}</td>
                          <td>
                            <span className="role-badge">{admin.Role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                          </td>
                          <td>
                            {admin.Role !== 'super_admin' && admin.AdminID !== currentAdminId ? (
                              <button className="delete-admin-btn" onClick={() => handleDeleteAdmin(admin)}>
                                Delete
                              </button>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
            </>
          )}
        </div>
      </div>

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
                <label htmlFor="adminNic">NIC</label>
                <input
                  type="text"
                  id="adminNic"
                  name="nic"
                  value={newAdmin.nic}
                  onChange={handleNewAdminChange}
                  placeholder="Enter NIC"
                />
              </div>
              <div className="form-group">
                <label htmlFor="adminName">Full Name</label>
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
                <label htmlFor="adminEmail">Email Address</label>
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
                <label htmlFor="adminPhone">Phone Number</label>
                <input
                  type="tel"
                  id="adminPhone"
                  name="contactNumber"
                  value={newAdmin.contactNumber}
                  onChange={handleNewAdminChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="adminPassword">Password</label>
                <input
                  type="password"
                  id="adminPassword"
                  name="password"
                  value={newAdmin.password}
                  onChange={handleNewAdminChange}
                  placeholder="Enter password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="adminConfirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="adminConfirmPassword"
                  name="confirmPassword"
                  value={newAdmin.confirmPassword}
                  onChange={handleNewAdminChange}
                  placeholder="Confirm password"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddAdminModal(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleAddAdmin} disabled={isCreatingAdmin}>
                {isCreatingAdmin ? <Loader2 size={18} className="spin" /> : <UserPlus size={18} />}
                {isCreatingAdmin ? 'Creating...' : 'Add Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;