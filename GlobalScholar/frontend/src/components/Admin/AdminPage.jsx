import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './AdminPage.css';

const AdminPage = () => {
  const [universityData, setUniversityData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(null); // State to track which row is being edited
  const [editedUniversity, setEditedUniversity] = useState({}); // Store edited university details
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [universityToDelete, setUniversityToDelete] = useState(null);

  const navigate = useNavigate();

  const handleViewTransactionResult = () => {
    navigate('/Lowerbudgettran'); // Navigate to the Transaction Result page
  };

  useEffect(() => {
    fetch('http://localhost:5001/university-details')
      .then((response) => response.json())
      .then((data) => setUniversityData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  // Filter university data based on search query
  const filteredData = universityData.filter((univ) =>
    univ.UniversityName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle edit button click
  const handleEditClick = (univ) => {
    setEditMode(univ.UniversityName);
    setEditedUniversity({
      UniversityName: univ.UniversityName,
      State: univ.State,
      InStateTuitionFees: univ.InStateTuitionFees,
      OutOfStateTuitionFees: univ.OutOfStateTuitionFees,
      RoomAndBoardCost: univ.RoomAndBoardCost,
    });
  };

  // Handle input change in the editable fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUniversity((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submit after editing
  const handleSubmitEdit = () => {
    // Send edited data to backend
    fetch('http://localhost:5001/modify-university', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedUniversity),
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the frontend with the modified data
        setUniversityData((prevData) =>
          prevData.map((univ) =>
            univ.UniversityName === editedUniversity.UniversityName
              ? editedUniversity
              : univ
          )
        );
        setEditMode(null); // Exit edit mode
      })
      .catch((error) => console.error('Error editing university:', error));
  };

  // Handle delete button click
  const handleDeleteClick = (universityName) => {
    setUniversityToDelete(universityName);
    setShowConfirmDelete(true);
  };

  // Handle confirming the delete action
  const handleDeleteConfirm = () => {
    fetch(`http://localhost:5001/delete-university/${universityToDelete}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then(() => {
        // Remove deleted university from frontend data
        setUniversityData((prevData) =>
          prevData.filter((univ) => univ.UniversityName !== universityToDelete)
        );
        setShowConfirmDelete(false);
      })
      .catch((error) => console.error('Error deleting university:', error));
  };

  // Handle canceling the delete action
  const handleDeleteCancel = () => {
    setShowConfirmDelete(false);
    setUniversityToDelete(null);
  };

  const handleViewLogs = () => {
    navigate('/user-logs'); // Navigate to the User Logs page
  };

  return (
    <div className="admin-page">

<h1>User Logs</h1>

<button onClick={handleViewLogs}>View Logs</button>
<p></p>
<p></p>
      <h1>Users with lower budget</h1>

      <button onClick={handleViewTransactionResult}>View Users</button>
     <p></p>
     <p></p>
      <h1>University Details</h1>
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by University Name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />

      <table className="data-table">
        <thead>
          <tr>
            <th>University Name</th>
            <th>State</th>
            <th>In-State Tuition Fees</th>
            <th>Out-of-State Tuition Fees</th>
            <th>Room and Board Cost</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((univ, index) => (
            <tr key={index}>
              <td>
                {editMode === univ.UniversityName ? (
                  <input
                    type="text"
                    name="UniversityName"
                    value={editedUniversity.UniversityName}
                    onChange={handleInputChange}
                  />
                ) : (
                  univ.UniversityName
                )}
              </td>
              <td>
                {editMode === univ.UniversityName ? (
                  <input
                    type="text"
                    name="State"
                    value={editedUniversity.State}
                    onChange={handleInputChange}
                  />
                ) : (
                  univ.State || 'N/A'
                )}
              </td>
              <td>
                {editMode === univ.UniversityName ? (
                  <input
                    type="text"
                    name="InStateTuitionFees"
                    value={editedUniversity.InStateTuitionFees}
                    onChange={handleInputChange}
                  />
                ) : (
                  univ.InStateTuitionFees || 'N/A'
                )}
              </td>
              <td>
                {editMode === univ.UniversityName ? (
                  <input
                    type="text"
                    name="OutOfStateTuitionFees"
                    value={editedUniversity.OutOfStateTuitionFees}
                    onChange={handleInputChange}
                  />
                ) : (
                  univ.OutOfStateTuitionFees || 'N/A'
                )}
              </td>
              <td>
                {editMode === univ.UniversityName ? (
                  <input
                    type="text"
                    name="RoomAndBoardCost"
                    value={editedUniversity.RoomAndBoardCost}
                    onChange={handleInputChange}
                  />
                ) : (
                  univ.RoomAndBoardCost || 'N/A'
                )}
              </td>
              <td>
                {editMode === univ.UniversityName ? (
                  <button onClick={handleSubmitEdit}>Submit</button>
                ) : (
                  <button onClick={() => handleEditClick(univ)}>Modify</button>
                )}
                <button onClick={() => handleDeleteClick(univ.UniversityName)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Delete Popup */}
      {showConfirmDelete && (
        <div className="confirmation-popup">
          <p>Are you sure you want to delete this university?</p>
          <button onClick={handleDeleteConfirm}>Yes</button>
          <button onClick={handleDeleteCancel}>No</button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
