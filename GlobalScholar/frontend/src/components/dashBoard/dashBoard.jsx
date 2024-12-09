import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import './dashBoard.css';


const Dashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const [errors, setErrors] = useState({});
  const [universities, setUniversities] = useState([]); // Initialize as an empty array
  const [universityOptions, setUniversityOptions] = useState([]); // All available universities
  const [editIndex, setEditIndex] = useState(null); 
  const [selectedUniversity, setSelectedUniversity] = useState(null); 
  const [newUniversity, setNewUniversity] = useState(null);

  const username = localStorage.getItem("user");
  const userId = localStorage.getItem("userId");

  

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/userInfo/${userId}`);
        setUserInfo(response.data);
        setUniversities(response.data.SelectedUniversities || []);
      } catch (error) {
        console.error("Error fetching user information:", error);
        setErrors((prevErrors) => ({
          ...prevErrors,
          fetch: "Failed to fetch user information. Please try again later.",
        }));
      }
    };

    const fetchUniversities = async () => {
      try {
        const response = await axios.get("http://localhost:5001/universities");
        setUniversityOptions(
          response.data.map((univ) => ({
            value: univ,
            label: univ,
          }))
        );
      } catch (error) {
        console.error("Error fetching university names:", error);
      }
    };

    if (userId) {
      fetchUserInfo();
    }
    fetchUniversities();
  }, [userId]);

  const handleAddUniversity = async () => {
    if (!newUniversity) return;
  
    try {
      const response = await axios.post('http://localhost:5001/addUniversity', {
        userId,
        universityName: newUniversity.value
      });
      if (response.status === 200) {
        setUniversities([...universities, newUniversity.value]);
        setNewUniversity(null);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          addUniversity: error.response.data.error
        }));
      } else {
        console.error("Error adding university:", error);
      }
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setSelectedUniversity({
      value: universities[index],
      label: universities[index],
    });
  };

  const handleDelete = async (index) => {
    const updatedUniversities = [...universities]; // Create a copy of the universities array
    const removedUniversity = updatedUniversities.splice(index, 1)[0]; 
  
    console.log("Removed:", removedUniversity, "Updated List:", updatedUniversities, "User ID:", userId);
  
    try {
      await axios.post(`http://localhost:5001/removeUniversity`, {
        userId,
        university: removedUniversity, 
      });
  
      setUniversities(updatedUniversities); 
    } catch (error) {
      console.error("Error deleting university:", error);
    }
  };
  

  const handleSave = async () => {
    
    const updatedUniversities = [...universities];
    const oldUniversity = updatedUniversities[editIndex]
    const updatedUniversity = selectedUniversity.value;
    updatedUniversities[editIndex] = selectedUniversity.value;
    console.log(userId,oldUniversity,updatedUniversity)
    

    try {
      await axios.post(`http://localhost:5001/updateUniversity`, {
        userId,
        oldUniversity:oldUniversity,
        updatedUniversity:updatedUniversity
      });
      setUniversities(updatedUniversities);
      console.log(updatedUniversities)
      setEditIndex(null);
      setSelectedUniversity(null);
    } catch (error) {
      console.error("Error updating university:", error);
    }
  };

  const handleCancel = () => {
    setEditIndex(null);
    setSelectedUniversity(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleGetMatchingUniversities = () => {
    navigate('/matching-universities');
  };

  const handleViewLivingCosts = () => {
    navigate(`/living-costs/${userId}`); // Navigate to Living Costs page with userId
};

// const handleViewLogs = () => {
//   navigate('/user-logs'); // Navigate to the User Logs page
// };

const handleViewTopDiverseUniversities = () => {
  navigate('/top-diverse-universities');
};

const handleRecommendUniversities = () => {
  navigate('/recommend-universities');
};

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p>Welcome, {username || "Guest"}!</p>

      {errors.fetch && <p style={{ color: "red" }}>{errors.fetch}</p>}
      <button onClick={handleGetMatchingUniversities}>Get all matching universities</button>

      <button onClick={handleViewLivingCosts}>View Living Costs</button>

      {/* <button onClick={handleViewLogs}>View Logs</button> */}
      <button onClick={handleViewTopDiverseUniversities}>View Top Diverse Universities</button>
      <button onClick={handleRecommendUniversities}>Recommend Universities</button>

      <div>
        <Select
          options={universityOptions}
          value={newUniversity}
          onChange={setNewUniversity}
          isSearchable
          placeholder="Select a university to add"
        />
        <button onClick={handleAddUniversity}>Add University</button>
        {errors.addUniversity && <p style={{ color: "red" }}>{errors.addUniversity}</p>}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>University</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {universities.map((university, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {editIndex === index ? (
                  <Select
                    options={universityOptions}
                    value={selectedUniversity}
                    onChange={(option) => setSelectedUniversity(option)}
                    isSearchable
                  />
                ) : (
                  university
                )}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {editIndex === index ? (
                  <>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(index)}>Edit</button>
                    <button onClick={() => handleDelete(index)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
{/* 
      <button onClick={handleLogout}>Logout</button> */}
    </div>
  );
};

export default Dashboard;
