import React from "react";
import './AddRoom.css';

const AddRoom = ({ isOpen, onClose, onSuccess }) => {
    // Don't render if not open
    if (!isOpen) return null;

    const [formData, setFormData] = React.useState({
        roomNumber: '',
        floorNumber: '',
        capacity: '4',
        gender: 'male'
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
            const response = await fetch('http://localhost:5000/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert("Room added successfully!");
                // Reset form
                setFormData({
                    roomNumber: '',
                    floorNumber: '',
                    capacity: '4',
                    gender: 'male'
                });
                if (onSuccess) onSuccess();
            } else {
                alert(`Failed to add room: ${data.message || 'Unknown error'}`);
                console.error('Error response:', data);
            }
        } catch (error) {
            alert(`An error occurred while adding the room: ${error.message}`);
            console.error('Request error:', error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="add-room" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>&times;</button>
                <h1>Add New Room</h1>
                <form className="add-room-form" onSubmit={handleSubmit}>

                <label htmlFor="roomNumber">Room Number:</label>
                <input 
                    type="text" 
                    id="roomNumber" 
                    name="roomNumber" 
                    placeholder="e.g., A-101, B-205"
                    required 
                    value={formData.roomNumber}
                    onChange={handleChange}
                />

                <label htmlFor="floorNumber">Floor Number:</label>
                <input 
                    type="number" 
                    id="floorNumber" 
                    name="floorNumber" 
                    placeholder="e.g., 1, 2, 3"
                    required 
                    min="1"
                    value={formData.floorNumber}
                    onChange={handleChange}
                />

                <label htmlFor="capacity">Room Capacity:</label>
                <input 
                    type="number" 
                    id="capacity" 
                    name="capacity" 
                    required 
                    min="1"
                    max="10"
                    value={formData.capacity}
                    onChange={handleChange}
                />

                <label htmlFor="gender">Gender:</label>
                <select 
                    id="gender" 
                    name="gender" 
                    required 
                    value={formData.gender}
                    onChange={handleChange}
                >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>

                <button type="submit">Add Room</button>
            </form>
            </div>
        </div>
    );
};

export default AddRoom;
