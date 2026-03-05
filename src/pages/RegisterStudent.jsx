import React from "react";
import './RegisterStudent.css'

const RegisterStudent = ({ isOpen, onClose, onSuccess }) => {
    // Don't render if not open
    if (!isOpen) return null;

    const [formData, setFormData] = React.useState({
        nic: '',
        username: '',
        registration_number: '',
        center: '',
        distance_from_home: '',
        faculty: '',
        contact_number: '',
        emergency_contact: '',
        email: '',
        password: '',
        role: 'user'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Auto-generate password when NIC is entered
        if (name === 'nic') {
            setFormData({
                ...formData,
                [name]: value,
                password: 'U' + value
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Convert numeric fields to numbers
            const dataToSend = {
                ...formData,
                registration_number: parseInt(formData.registration_number),
                distance_from_home: parseInt(formData.distance_from_home)
            };

            const response = await fetch('http://localhost:5000/api/auth/sign-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(dataToSend)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Student registered successfully!");
                // Reset form
                setFormData({
                    nic: '',
                    username: '',
                    registration_number: '',
                    center: '',
                    distance_from_home: '',
                    faculty: '',
                    contact_number: '',
                    emergency_contact: '',
                    email: '',
                    password: '',
                    role: 'user'
                });
                // Call success callback to close modal and refresh
                if (onSuccess) onSuccess();
            } else {
                alert(`Failed to register student: ${data.message || data || 'Unknown error'}`);
            }
        } catch (error) {
            alert("An error occurred while registering the student: " + error.message);
        }
    };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="register-student" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        <h1>Register New Student</h1>
        <form className="register-form" onSubmit={handleSubmit}>

            <label htmlFor="nic">NIC:<span className="required">*</span></label>
            <input type="text" id="nic" name="nic" required onChange={handleChange} value={formData.nic}/>

            <label htmlFor="username">User Name:<span className="required">*</span></label>
            <input type="text" id="username" name="username" required onChange={handleChange} value={formData.username} />

            <label htmlFor="registration_number">Registration Number:<span className="required">*</span></label>
            <input type="number" id="registration_number" name="registration_number" required onChange={handleChange} value={formData.registration_number} />

            <label htmlFor="center">Center:<span className="required">*</span></label>
            <select id="center" name="center" required onChange={handleChange} value={formData.center}>
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
            <input type="number" id="distance_from_home" name="distance_from_home" required onChange={handleChange} value={formData.distance_from_home} />

            <label htmlFor="faculty">Faculty:<span className="required">*</span></label>
            <select id="faculty" name="faculty" required onChange={handleChange} value={formData.faculty}>
                <option value="">Select Faculty</option>
                <option value="Education">Education</option>
                <option value="Engineering Technology">Engineering Technology</option>
                <option value="Health Sciences">Health Sciences</option>
                <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
                <option value="Management Studies">Management Studies</option>
                <option value="Natural Sciences">Natural Sciences</option>
            </select>

            <label htmlFor="contact_number">Contact Number:<span className="required">*</span></label>
            <input type="text" id="contact_number" name="contact_number" required onChange={handleChange} value={formData.contact_number} />

            <label htmlFor="emergency_contact">Emergency Contact:<span className="required">*</span></label>
            <input type="text" id="emergency_contact" name="emergency_contact" required onChange={handleChange} value={formData.emergency_contact} />

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" onChange={handleChange} value={formData.email} />

            <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterStudent;