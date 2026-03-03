import React from "react";
import './RegisterStudent.css'

const RegisterStudent = () => {

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
        role: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/sign-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                alert("Student registered successfully!");
            } else {
                alert("Failed to register student.");
            }
        } catch (error) {
            alert("An error occurred while registering the student.", error);
        }
    };

  return (
    <div className="register-student">
        <h1>Register New Student</h1>
        <form className="register-form" onSubmit={handleSubmit}>

            <label htmlFor="nic">NIC:</label>
            <input type="text" id="nic" name="nic" required onChange={handleChange}/>

            <label htmlFor="username">User Name:</label>
            <input type="text" id="username" name="username" required onChange={handleChange} />

            <label htmlFor="registration_number">Registration Number:</label>
            <input type="number" id="registration_number" name="registration_number" required onChange={handleChange} />

            <label htmlFor="center">Center:</label>
            <input type="text" id="center" name="center" required onChange={handleChange} />

            <label htmlFor="distance_from_home">Distance From Home:</label>
            <input type="number" id="distance_from_home" name="distance_from_home" required onChange={handleChange} />

            <label htmlFor="faculty">Faculty:</label>
            <input type="text" id="faculty" name="faculty" required onChange={handleChange} />

            <label htmlFor="contact_number">Contact Number:</label>
            <input type="text" id="contact_number" name="contact_number" required onChange={handleChange} />

            <label htmlFor="emergency_contact">Emergency Contact:</label>
            <input type="text" id="emergency_contact" name="emergency_contact" required onChange={handleChange} />

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" onChange={handleChange} />

            <label htmlFor="Password">Password:</label>
            <input type="password" id="password" name="password" required onChange={handleChange} />

            <label htmlFor="role">Role:</label>
            <select id="role" name="role" required onChange={handleChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>

            <button type="submit">Register</button>
        </form>
    </div>
  );
}

export default RegisterStudent;