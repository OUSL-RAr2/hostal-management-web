import React from 'react';
import './RoomManagement.css';

const RoomManagement = () => {
  const roomStats = [
    { value: '8', label: 'Available Rooms', color: 'green' },
    { value: '28', label: 'Occupied Rooms', color: 'red' },
    { value: '0', label: 'Under Maintenance', color: 'yellow' },
  ];

  const roomsData = [
    {
      roomNumber: 'A-101',
      capacity: 4,
      occupied: 3,
      status: 'Occupied',
      occupants: '223604391, 1230000901, 723602367'
    },
    {
      roomNumber: 'A-102',
      capacity: 4,
      occupied: 0,
      status: 'Available',
      occupants: ''
    },
    {
      roomNumber: 'A-103',
      capacity: 4,
      occupied: 4,
      status: 'Occupied',
      occupants: '223604291, 123600601, 723602367, 623606783'
    },
    {
      roomNumber: 'B-201',
      capacity: 2,
      occupied: 0,
      status: 'Available',
      occupants: ''
    },
    {
      roomNumber: 'B-202',
      capacity: 2,
      occupied: 2,
      status: 'Occupied',
      occupants: '523604291, 823600601'
    },
  ];

  return (
    <div className="room-management">
      {/* Header */}
      <div className="room-header">
        <h1>Room Management</h1>
        <p>Monitor room occupancy and allocation</p>
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
                <th>Capacity</th>
                <th>Occupied</th>
                <th>Status</th>
                <th>Current Occupants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roomsData.map((room, index) => (
                <tr key={index}>
                  <td>{room.roomNumber}</td>
                  <td>{room.capacity}</td>
                  <td>{room.occupied}</td>
                  <td>
                    <span className={`status-badge ${room.status.toLowerCase()}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="occupants-cell">{room.occupants || '-'}</td>
                  <td>
                    {room.status === 'Occupied' ? (
                      <button className="action-btn view-btn">View Details</button>
                    ) : (
                      <button className="action-btn assign-btn">Assign</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;