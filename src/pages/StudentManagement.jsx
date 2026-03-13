import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import './StudentManagement.css';
import RegisterStudent from './RegisterStudent';
import ViewStudent from './ViewStudent';
import EditStudent from './EditStudent';


const StudentManagement = ({ setActiveMenu }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const parseApiResponse = async (response) => {
    const raw = await response.text();

    if (!raw) return {};

    try {
      return JSON.parse(raw);
    } catch {
      if (raw.trim().startsWith('<')) {
        throw new Error('Server returned an HTML response. Check that backend API is running on port 5000.');
      }
      throw new Error('Server returned an invalid JSON response.');
    }
  };

  // Fetch students data when component mounts
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await parseApiResponse(response);

      if (response.ok) {
        // Map backend data to frontend format
        const mappedStudents = data.data.map(booking => ({
          id: booking.User?.NIC || 'N/A',
          name: booking.User?.Username || 'Unknown',
          registrationNumber: booking.User?.Registration_Number || 'N/A',
          room: booking.Room?.RoomNumber || 'N/A',
          status: booking.Status,
          checkIn: booking.CheckInDate ? new Date(booking.CheckInDate).toLocaleString() : '-',
          checkOut: booking.CheckOutDate ? new Date(booking.CheckOutDate).toLocaleString() : '-',
          uid: booking.User?.UID,
          bookingId: booking.BookingID
        }));
        setStudentsData(mappedStudents);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = studentsData.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.id.includes(searchQuery) ||
    (student.registrationNumber && student.registrationNumber.toString().includes(searchQuery))
  );

  // Format status display
  const formatStatus = (status) => {
    switch(status) {
      case 'checked_in':
        return 'Checked In';
      case 'checked_out':
        return 'Checked Out';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch(status) {
      case 'checked_in':
        return 'checked-in';
      case 'checked_out':
        return 'checked-out';
      case 'pending':
        return 'pending';
      case 'cancelled':
        return 'cancelled';
      default:
        return '';
    }
  };

  // Handle view student
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setSelectedStudentId(student?.uid || null);
    setIsViewModalOpen(true);
  };

  // Handle edit student
  const handleEditStudent = (studentId) => {
    setSelectedStudentId(studentId);
    setIsEditModalOpen(true);
  };

  // Handle delete student
  const handleDeleteStudent = async (bookingId, studentName) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete student');
      }

      await fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
      window.alert(err.message || 'Failed to delete student');
    }
  };

  return (
    <div className="student-management">
      {/* Header */}
      <div className="student-header">
        <div className="student-header-content">
          <h1>Student Management</h1>
          <p>Manage student registrations and profiles</p>
        </div>
        <div className="add-student-container">
          <button className="add-student-btn" onClick={() => setIsModalOpen(true)}>Add New Student</button>
        </div>
        
      </div>
      

      {/* Search and Table Section */}
      <div className="student-content">
        {/* Search Bar */}
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search students by name or NIC..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-message">
            Loading students data...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Students Table */}
        {!loading && !error && (
          <div className="table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>NIC</th>
                  <th>Name</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      {searchQuery ? 'No students found matching your search' : 'No students data available'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr key={student.bookingId || index}>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.room}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(student.status)}`}>
                          {formatStatus(student.status)}
                        </span>
                      </td>
                      <td>{student.checkIn}</td>
                      <td>{student.checkOut}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => handleViewStudent(student)}
                          >
                            View
                          </button>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => handleEditStudent(student.uid)}
                          >
                            Edit
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteStudent(student.bookingId, student.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Student Modal */}
      <RegisterStudent 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchStudents(); // Refresh the student list
        }}
      />

      {/* View Student Modal */}
      <ViewStudent 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        studentId={selectedStudentId}
        student={selectedStudent}
      />

      {/* Edit Student Modal */}
      <EditStudent 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        studentId={selectedStudentId}
        onSuccess={() => {
          setIsEditModalOpen(false);
          fetchStudents(); // Refresh the student list
        }}
      />
    </div>
  );
};

export default StudentManagement;