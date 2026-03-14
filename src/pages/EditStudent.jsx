import React, { useState, useEffect } from "react";
import './EditStudent.css';

const EditStudent = ({ isOpen, onClose, studentId, onSuccess }) => {
    const [formData, setFormData] = useState({
        nic: '',
        username: '',
        registration_number: '',
        center: '',
        distance_from_home: '',
        faculty: '',
        contact_number: '',
        emergency_contact: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && studentId) {
            fetchStudentData();
        }
    }, [isOpen, studentId]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/users/${studentId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                setFormData({
                    nic: data.data.NIC,
                    username: data.data.Username,
                    registration_number: data.data.Registration_Number,
                    center: data.data.Center,
                    distance_from_home: data.data.Distance_from_home,
                    faculty: data.data.Faculty,
                    contact_number: data.data.Contact_number,
                    emergency_contact: data.data.Emergency_Contact,
                    email: data.data.Email || ''
                });
                setError(null);
            } else {
                setError(data.message || 'Failed to fetch student data');
            }
        } catch (err) {
            console.error('Error fetching student:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            // Convert numeric fields to numbers
            const dataToSend = {
                ...formData,
                registration_number: parseInt(formData.registration_number),
                distance_from_home: parseInt(formData.distance_from_home)
            };

            const response = await fetch(`http://localhost:5000/api/users/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(dataToSend)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Student updated successfully!");
                if (onSuccess) onSuccess();
            } else {
                alert(`Failed to update student: ${data.message || data || 'Unknown error'}`);
            }
        } catch (error) {
            alert("An error occurred while updating the student: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-student" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>&times;</button>
                <h1>Edit Student</h1>

                {error && (
                    <div className="error-message">{error}</div>
                )}

                <form className="edit-form" onSubmit={handleSubmit}>
                    <label htmlFor="nic">NIC:<span className="required">*</span></label>
                    <input 
                        type="text" 
                        id="nic" 
                        name="nic" 
                        required 
                        onChange={handleChange} 
                        value={formData.nic}
                        disabled
                    />

                    <label htmlFor="username">User Name:<span className="required">*</span></label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        required 
                        onChange={handleChange} 
                        value={formData.username}
                    />

                    <label htmlFor="registration_number">Registration Number:<span className="required">*</span></label>
                    <input 
                        type="number" 
                        id="registration_number" 
                        name="registration_number" 
                        required 
                        onChange={handleChange} 
                        value={formData.registration_number}
                    />

                    <label htmlFor="center">Center:<span className="required">*</span></label>
                    <select 
                        id="center" 
                        name="center" 
                        required 
                        onChange={handleChange} 
                        value={formData.center}
                    >
                        <option value="">Select Center</option>
                        <option value="Colombo">Colombo</option>
                        <option value="Kandy">Kandy</option>
                        <option value="Matara">Matara</option>
                        <option value="Jaffna">Jaffna</option>
                        <option value="Anuradhapura">Anuradhapura</option>
                        <option value="Batticaloa">Batticaloa</option>
                        <option value="Kurunegala">Kurunegala</option>
                        <option value="Badulla">Badulla</option>
                        <option value="Ratnapura">Ratnapura</option>
                    </select>

                    <label htmlFor="distance_from_home">Distance From Home (KM):<span className="required">*</span></label>
                    <input 
                        type="number" 
                        id="distance_from_home" 
                        name="distance_from_home" 
                        required 
                        onChange={handleChange} 
                        value={formData.distance_from_home}
                    />

                    <label htmlFor="faculty">Faculty:<span className="required">*</span></label>
                    <select 
                        id="faculty" 
                        name="faculty" 
                        required 
                        onChange={handleChange} 
                        value={formData.faculty}
                    >
                        <option value="">Select Faculty</option>
                        <option value="Education">Education</option>
                        <option value="Engineering Technology">Engineering Technology</option>
                        <option value="Health Sciences">Health Sciences</option>
                        <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
                        <option value="Management Studies">Management Studies</option>
                        <option value="Natural Sciences">Natural Sciences</option>
                    </select>

                    <label htmlFor="contact_number">Contact Number:<span className="required">*</span></label>
                    <input 
                        type="text" 
                        id="contact_number" 
                        name="contact_number" 
                        required 
                        onChange={handleChange} 
                        value={formData.contact_number}
                    />

                    <label htmlFor="emergency_contact">Emergency Contact:<span className="required">*</span></label>
                    <input 
                        type="text" 
                        id="emergency_contact" 
                        name="emergency_contact" 
                        required 
                        onChange={handleChange} 
                        value={formData.emergency_contact}
                    />

                    <label htmlFor="email">Email:</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        onChange={handleChange} 
                        value={formData.email}
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Student'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditStudent;
