import React, { useState } from 'react';
import { Search } from 'lucide-react';
import './StudentManagement.css';


const StudentManagement = ({ setActiveMenu }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const studentsData = [
    {
      id: '223604391',
      name: 'K.M.T.N. Deshapriya',
      room: 'T-14',
      status: 'Checked In',
      checkIn: '07/09/2025 14:30',
      checkOut: '-'
    },
    {
      id: '123600601',
      name: 'A.M.S.G. Athapaththu',
      room: 'S-08',
      status: 'Checked In',
      checkIn: '07/09/2025 12:15',
      checkOut: '-'
    },
    {
      id: '623606783',
      name: 'I.A.D.G.R. Jayaweera',
      room: 'T-15',
      status: 'Checked In',
      checkIn: '07/09/2025 16:20',
      checkOut: '-'
    },
    {
      id: '323606301',
      name: 'L.A.C.D. Lenagala',
      room: 'T-10',
      status: 'Checked In',
      checkIn: '07/09/2025 11:30',
      checkOut: '-'
    },
  ];

  const filteredStudents = studentsData.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.id.includes(searchQuery)
  );

  return (
    <div className="student-management">
      {/* Header */}
      <div className="student-header">
        <div className="student-header-content">
          <h1>Student Management</h1>
          <p>Manage student registrations and profiles</p>
        </div>
        <div className="add-student-container">
          <button className="add-student-btn" onClick={() => setActiveMenu('Register Student')}>Add New Student</button>
        </div>
        
      </div>
      

      {/* Search and Table Section */}
      <div className="student-content">
        {/* Search Bar */}
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search students by name or ID..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Students Table */}
        <div className="table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Room</th>
                <th>Status</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={index}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.room}</td>
                  <td>
                    <span className="status-badge checked-in">
                      {student.status}
                    </span>
                  </td>
                  <td>{student.checkIn}</td>
                  <td>{student.checkOut}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn">View</button>
                      <button className="action-btn edit-btn">Edit</button>
                    </div>
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

export default StudentManagement;