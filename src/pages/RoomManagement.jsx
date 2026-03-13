import React, { useState, useEffect } from 'react';
import './RoomManagement.css';

const RoomManagement = ({ setActiveMenu }) => {
  const [rooms, setRooms] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [assigningRoom, setAssigningRoom] = useState(null);
  const [editFormData, setEditFormData] = useState({
    roomNumber: '',
    floorNumber: '',
    capacity: '',
    status: '',
    gender: ''
  });

  // Filter states
  const [filterGender, setFilterGender] = useState('all');
  const [filterFloor, setFilterFloor] = useState('all');

  // Assign modal states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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

  const handleOpenAssignModal = (room) => {
    setAssigningRoom(room);
    setIsAssignModalOpen(true);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedStudent(null);
    setCheckInDate('');
    setCheckOutDate('');
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setAssigningRoom(null);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedStudent(null);
    setCheckInDate('');
    setCheckOutDate('');
  };

  const handleSearchStudents = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search term');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/search-students?query=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.data);
        if (data.data.length === 0) {
          alert('No students found');
        }
      } else {
        alert(`Search failed: ${data.message}`);
      }
    } catch (error) {
      alert(`Search error: ${error.message}`);
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/bookings/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedStudent.UID,
          roomId: assigningRoom.RoomID,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Student assigned successfully!');
        handleCloseAssignModal();
        fetchRooms(); // Refresh rooms
      } else {
        alert(`Assignment failed: ${data.message}`);
      }
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
      console.error('Assignment error:', error);
    }
  };

  // Filter rooms based on selected filters
  const filteredRooms = rooms
    .filter(room => {
      const genderMatch = filterGender === 'all' || room.Gender === filterGender;
      const floorMatch = filterFloor === 'all' || room.FloorNumber.toString() === filterFloor;
      return genderMatch && floorMatch;
    })
    .sort((a, b) => {
      // Define custom floor order: G, F, S, T
      const floorOrder = { 'G': 0, 'F': 1, 'S': 2, 'T': 3 };
      const aPrefix = a.RoomNumber.charAt(0);
      const bPrefix = b.RoomNumber.charAt(0);
      
      // First sort by floor prefix using custom order
      const aOrder = floorOrder[aPrefix] !== undefined ? floorOrder[aPrefix] : 999;
      const bOrder = floorOrder[bPrefix] !== undefined ? floorOrder[bPrefix] : 999;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // Then sort by room number (alphanumeric)
      return a.RoomNumber.localeCompare(b.RoomNumber, undefined, { numeric: true, sensitivity: 'base' });
    });

  // Get unique floor numbers for filter dropdown
  const uniqueFloors = [...new Set(rooms.map(room => room.FloorNumber))].sort((a, b) => a - b);

  const roomStats = [
    { 
      value: filteredRooms.filter(r => r.Status === 'available').length, 
      label: 'Available Rooms', 
      color: 'green' 
    },
    { 
      value: filteredRooms.filter(r => r.Status === 'occupied').length, 
      label: 'Occupied Rooms', 
      color: 'red' 
    },
    { 
      value: filteredRooms.filter(r => r.Status === 'maintenance').length, 
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

      {/* Filter Section */}
      <div className="filter-section">
        <h2 className="section-title">Filter Rooms</h2>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="filter-gender">Gender:</label>
            <select
              id="filter-gender"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-floor">Floor:</label>
            <select
              id="filter-floor"
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Floors</option>
              {uniqueFloors.map((floor) => (
                <option key={floor} value={floor}>
                  Floor {floor}
                </option>
              ))}
            </select>
          </div>

          {(filterGender !== 'all' || filterFloor !== 'all') && (
            <button
              className="clear-filters-btn"
              onClick={() => {
                setFilterGender('all');
                setFilterFloor('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Room Status Cards */}
      <div className="room-status-section">
        <h2 className="section-title">Room Status</h2>
        <div className="room-stats-grid">
          {roomStats.map((stat, index) => (
            <div key={index} className={`room-stat-card ${stat.color}`}>
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
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    {rooms.length === 0 
                      ? 'No rooms found. Add rooms to get started.'
                      : 'No rooms match the selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
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
                          <button 
                            className="action-btn assign-btn"
                            onClick={() => handleOpenAssignModal(room)}
                          >
                            Assign
                          </button>
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

      {/* Assign Student Modal */}
      {isAssignModalOpen && (
        <div className="modal-overlay" onClick={handleCloseAssignModal}>
          <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Student to Room {assigningRoom?.RoomNumber}</h2>
              <button className="close-btn" onClick={handleCloseAssignModal}>&times;</button>
            </div>
            
            <div className="assign-modal-body">
              {/* Search Section */}
              {!selectedStudent && (
                <div className="search-section">
                  <h3>Search Student</h3>
                  <div className="search-input-group">
                    <input
                      type="text"
                      placeholder="Enter student name or registration number"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchStudents()}
                      className="search-input"
                    />
                    <button 
                      className="search-btn" 
                      onClick={handleSearchStudents}
                      disabled={isSearching}
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="search-results">
                      <h4>Search Results:</h4>
                      {searchResults.map((student) => (
                        <div 
                          key={student.UID} 
                          className="search-result-item"
                          onClick={() => handleSelectStudent(student)}
                        >
                          <div className="student-info">
                            <strong>{student.Username}</strong>
                            <span className="reg-number">Reg: {student.Registration_Number}</span>
                          </div>
                          <button className="select-btn">Select</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Student Details */}
              {selectedStudent && (
                <div className="selected-student-section">
                  <div className="section-header">
                    <h3>Student Details</h3>
                    <button 
                      className="change-student-btn"
                      onClick={() => setSelectedStudent(null)}
                    >
                      Change Student
                    </button>
                  </div>
                  
                  <div className="student-details-card">
                    <div className="detail-row">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{selectedStudent.Username}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Registration Number:</span>
                      <span className="detail-value">{selectedStudent.Registration_Number}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">NIC:</span>
                      <span className="detail-value">{selectedStudent.NIC}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Contact:</span>
                      <span className="detail-value">{selectedStudent.Contact_Number}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedStudent.Email || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Faculty:</span>
                      <span className="detail-value">{selectedStudent.Faculty}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Center:</span>
                      <span className="detail-value">{selectedStudent.Center}</span>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="date-selection">
                    <h4>Booking Period</h4>
                    <div className="date-inputs">
                      <div className="form-group">
                        <label htmlFor="checkInDate">Check-in Date:</label>
                        <input
                          type="date"
                          id="checkInDate"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="checkOutDate">Check-out Date:</label>
                        <input
                          type="date"
                          id="checkOutDate"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Assign Button */}
                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={handleCloseAssignModal}>
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="submit-btn assign-submit-btn"
                      onClick={handleAssignStudent}
                    >
                      Assign Student
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;