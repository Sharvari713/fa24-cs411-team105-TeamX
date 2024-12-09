// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const RecommendUniversities = () => {
//   const [preferredState, setPreferredState] = useState('');
//   const [diversityImportance, setDiversityImportance] = useState(0.5);
//   const [recommendations, setRecommendations] = useState([]);
//   const navigate = useNavigate();
//   const userId = localStorage.getItem("userId");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:5001/recommend_universities', {
//         userId,
//         preferredState,
//         diversityImportance
//       });
//       setRecommendations(response.data);
//     } catch (error) {
//       console.error('Error fetching recommendations:', error);
//     }
//   };

//   return (
//     <div className="recommend-universities">
//       <h2>Recommend Universities</h2>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label htmlFor="preferredState">Preferred State:</label>
//           <input
//             type="text"
//             id="preferredState"
//             value={preferredState}
//             onChange={(e) => setPreferredState(e.target.value)}
//           />
//         </div>
//         <div>
//           <label htmlFor="diversityImportance">Diversity Importance (0-1):</label>
//           <input
//             type="range"
//             id="diversityImportance"
//             min="0"
//             max="1"
//             step="0.1"
//             value={diversityImportance}
//             onChange={(e) => setDiversityImportance(parseFloat(e.target.value))}
//           />
//           <span>{diversityImportance}</span>
//         </div>
//         <button type="submit">Get Recommendations</button>
//       </form>

//       {recommendations.length > 0 && (
//         <div className="recommendations">
//           <h3>Recommended Universities</h3>
//           <table>
//             <thead>
//               <tr>
//                 <th>University Name</th>
//                 <th>State</th>
//                 <th>Total Cost</th>
//                 <th>Diversity Score</th>
//                 <th>Match Score</th>
//               </tr>
//             </thead>
//             <tbody>
//               {recommendations.map((uni, index) => (
//                 <tr key={index}>
//                   <td>{uni.UniversityName}</td>
//                   <td>{uni.State}</td>
//                   <td>${uni.TotalCost}</td>
//                   <td>{uni.DiversityScore}</td>
//                   <td>{uni.MatchScore}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RecommendUniversities;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RecommendUniversities = () => {
  const [preferredState, setPreferredState] = useState('');
  const [diversityImportance, setDiversityImportance] = useState(0.5);
  const [states, setStates] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get('http://localhost:5001/states');
        setStates(response.data);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };
    fetchStates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/recommend_universities', {
        userId,
        preferredState,
        diversityImportance
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  return (
    <div className="recommend-universities">
      <h2>Recommend Universities</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="preferredState">Preferred State:</label>
          <select
            id="preferredState"
            value={preferredState}
            onChange={(e) => setPreferredState(e.target.value)}
          >
            <option value="">Top 10 states</option>
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="diversityImportance">Diversity Importance (0-1):</label>
          <input
            type="range"
            id="diversityImportance"
            min="0"
            max="1"
            step="0.1"
            value={diversityImportance}
            onChange={(e) => setDiversityImportance(parseFloat(e.target.value))}
          />
          <span>{diversityImportance}</span>
        </div>
        <button type="submit">Get Recommendations</button>
      </form>

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h3>Recommended Universities</h3>
          <table>
            <thead>
              <tr>
                <th>University Name</th>
                <th>State</th>
                <th>Total Cost</th>
                <th>Diversity Score</th>
                <th>Match Score</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((uni, index) => (
                <tr key={index}>
                  <td>{uni.UniversityName}</td>
                  <td>{uni.State}</td>
                  <td>${uni.TotalCost}</td>
                  <td>{uni.DiversityScore.toFixed(2)}</td>
                  <td>{uni.MatchScore.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecommendUniversities;