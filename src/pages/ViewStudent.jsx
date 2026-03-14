import React, { useState, useEffect } from "react";
import './ViewStudent.css';

const ViewStudent = ({ isOpen, onClose, studentId, student }) => {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && (studentId || student?.uid)) {
            fetchStudentData();
        }
    }, [isOpen, studentId, student]);

    const parseApiResponse = async (response) => {
        const raw = await response.text();
        if (!raw) return {};

        try {
            return JSON.parse(raw);
        } catch {
            if (raw.trim().startsWith('<')) {
                throw new Error('Server returned an HTML response. Check backend server state.');
            }
            throw new Error('Server returned invalid JSON.');
        }
    };

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const uid = studentId || student?.uid;
            const response = await fetch(`http://localhost:5000/api/users/panel/${uid}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await parseApiResponse(response);

            if (response.ok) {
                setStudentData(data.data || null);
                setError(null);
            } else {
                setError(data.message || 'Failed to fetch student data');
            }
        } catch (err) {
            console.error('Error fetching student:', err);
            setError(err.message || 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="view-student" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>&times;</button>
                <h1>Student Details</h1>

                {loading && (
                    <div className="loading-message">Loading student data...</div>
                )}

                {error && (
                    <div className="error-message">{error}</div>
                )}

                {!loading && !error && studentData && (
                    <div className="student-details">
                        <div className="detail-row">
                            <label>NIC:</label>
                            <span>{studentData.NIC}</span>
                        </div>
                        <div className="detail-row">
                            <label>Username:</label>
                            <span>{studentData.Username}</span>
                        </div>
                        <div className="detail-row">
                            <label>Registration Number:</label>
                            <span>{studentData.Registration_Number}</span>
                        </div>
                        <div className="detail-row">
                            <label>Center:</label>
                            <span>{studentData.Center}</span>
                        </div>
                        <div className="detail-row">
                            <label>Faculty:</label>
                            <span>{studentData.Faculty}</span>
                        </div>
                        <div className="detail-row">
                            <label>Distance From Home:</label>
                            <span>{studentData.Distance_from_home} KM</span>
                        </div>
                        <div className="detail-row">
                            <label>Contact Number:</label>
                            <span>{studentData.Contact_Number}</span>
                        </div>
                        <div className="detail-row">
                            <label>Emergency Contact:</label>
                            <span>{studentData.Emergency_Contact}</span>
                        </div>
                        <div className="detail-row">
                            <label>Email:</label>
                            <span>{studentData.Email || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <label>Role:</label>
                            <span className={`role-badge ${studentData.Role}`}>
                                {studentData.Role === 'admin' ? 'Admin' : 'Student'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewStudent;
