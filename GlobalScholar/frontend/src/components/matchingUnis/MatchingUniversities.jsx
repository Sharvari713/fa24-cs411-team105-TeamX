import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatchingUniversities = () => {
  const [matchingUniversities, setMatchingUniversities] = useState([]);
  const [loading, setLoading] = useState(true);  // Initially set to true to show loading indicator
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const userId = localStorage.getItem("userId");

  // Function to fetch all matching universities
  const fetchMatchingUniversities = async (keyword = '') => {
    try {
      setLoading(true);
      const url = keyword
        ? `http://localhost:5001/matching-universities/search/${userId}/${keyword}`
        : `http://localhost:5001/matching-universities/${userId}`;
      const response = await axios.get(url);
      setMatchingUniversities(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching matching universities:", error);
      setError("Failed to fetch matching universities. Please try again later.");
      setLoading(false);
    }
  };

  // Function to handle the change in the search bar
  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  // Function to handle the search button click
  const handleSearchClick = () => {
    fetchMatchingUniversities(searchKeyword);
  };

  // useEffect to load the data when the component mounts (initial load)
  useEffect(() => {
    fetchMatchingUniversities();  // Fetch all universities initially
  }, [userId]);

  if (loading) return <div>Loading...</div>;  // Show loading until data is fetched
  if (error) return <div>{error}</div>;  // Show error message if there is an issue

  return (
    <div className="matching-universities">
      <h2>Matching Universities</h2>
      
      {/* Search bar to enter the keyword */}
      <input 
        type="text" 
        placeholder="Search for universities..." 
        value={searchKeyword} 
        onChange={handleSearchChange} 
      />
      <button onClick={handleSearchClick}>Search</button>

      {/* Table to display the matching universities */}
      <table>
        <thead>
          <tr>
            <th>University Name</th>
            <th>In-State Tuition Fees</th>
            <th>Room and Board Cost</th>
          </tr>
        </thead>
        <tbody>
          {matchingUniversities.map((university, index) => (
            <tr key={index}>
              <td>{university.UniversityName}</td>
              <td>${university.InStateTuitionFees}</td>
              <td>${university.RoomAndBoardCost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatchingUniversities;
