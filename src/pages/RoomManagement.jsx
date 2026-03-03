import React, { useState, useEffect } from 'react';
import './RoomManagement.css';

const RoomManagement = ({ setActiveMenu }) => {
  const [rooms, setRooms] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editFormData, setEditFormData] = useState({
    roomNumber: '',
    floorNumber: '',
    capacity: '',
    status: '',
    gender: ''
  });

  // Fetch rooms from API
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        setRooms(data.data);
      } else {
        console.error('Failed to fetch rooms:', data.message);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleAddRoom = () => {
    setActiveMenu('Add Room');
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setEditFormData({
      roomNumber: room.RoomNumber,
      floorNumber: room.FloorNumber,
      capacity: room.Capacity,
      status: room.Status,
      gender: room.Gender
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${editingRoom.RoomID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(editFormData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Room updated successfully!');
        setIsEditModalOpen(false);
        fetchRooms(); // Refresh the rooms list
      } else {
        alert(`Failed to update room: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`An error occurred while updating the room: ${error.message}`);
      console.error('Update error:', error);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingRoom(null);
  };

  const roomStats = [
    { 
      value: rooms.filter(r => r.Status === 'available').length, 
      label: 'Available Rooms', 
      color: 'green' 
    },
    { 
      value: rooms.filter(r => r.Status === 'occupied').length, 
      label: 'Occupied Rooms', 
      color: 'red' 
    },
    { 
      value: rooms.filter(r => r.Status === 'maintenance').length, 
      label: 'Under Maintenance', 
      color: 'yellow' 
    },
  ];

  return (
    <div className="room-management">
      {/* Header */}
      <div className="room-header">
        <div className="room-header-content">
          <h1>Room Management</h1>
          <p>Monitor room occupancy and allocation</p>
        </div>
        <div className="add-room-container">
          <button className="add-room-btn" onClick={handleAddRoom}>Add New Room</button>
        </div>
      </div>

      {/* Room Status Cards */}
      <div className="room-status-section">
        <h2 className="section-title">Room Status</h2>
        <div className="room-stats-grid">
          {roomStats.map((stat, index) => (
            <div key={index} className="room-stat-card">
              <div className={`status-indicator ${stat.color}`}></div>
              <div className="room-stat-value">{stat.value}</div>
              <div className="room-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rooms Table */}
      <div className="rooms-table-section">
        <div className="table-container">
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Floor</th>
                <th>Capacity</th>
                <th>Occupied</th>
                <th>Status</th>
                <th>Gender</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No rooms found. Add rooms to get started.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.RoomID}>
                    <td>{room.RoomNumber}</td>
                    <td>{room.FloorNumber}</td>
                    <td>{room.Capacity}</td>
                    <td>{room.CurrentOccupancy}</td>
                    <td>
                      <span className={`status-badge ${room.Status.toLowerCase()}`}>
                        {room.Status.charAt(0).toUpperCase() + room.Status.slice(1)}
                      </span>
                    </td>
                    <td>{room.Gender ? room.Gender.charAt(0).toUpperCase() + room.Gender.slice(1) : '-'}</td>
                    <td>
                      <div className="action-buttons">
                        {room.Status === 'occupied' ? (
                          <button className="action-btn view-btn">View Details</button>
                        ) : (
                          <button className="action-btn assign-btn">Assign</button>
                        )}
                        <button 
                          className="action-btn edit-btn" 
                          onClick={() => handleEditRoom(room)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Room Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Room</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleEditFormSubmit} className="edit-room-form">
              <div className="form-group">
                <label htmlFor="edit-roomNumber">Room Number:</label>
                <input
                  type="text"
                  id="edit-roomNumber"
                  name="roomNumber"
                  value={editFormData.roomNumber}
                  onChange={handleEditFormChange}
                  placeholder="e.g., A-101, B-205"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-floorNumber">Floor Number:</label>
                <input
                  type="number"
                  id="edit-floorNumber"
                  name="floorNumber"
                  value={editFormData.floorNumber}
                  onChange={handleEditFormChange}
                  placeholder="e.g., 1, 2, 3"
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-capacity">Room Capacity:</label>
                <input
                  type="number"
                  id="edit-capacity"
                  name="capacity"
                  value={editFormData.capacity}
                  onChange={handleEditFormChange}
                  required
                  min="1"
                  max="10"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-status">Status:</label>
                <select
                  id="edit-status"
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditFormChange}
                  required
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-gender">Gender:</label>
                <select
                  id="edit-gender"
                  name="gender"
                  value={editFormData.gender}
                  onChange={handleEditFormChange}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;