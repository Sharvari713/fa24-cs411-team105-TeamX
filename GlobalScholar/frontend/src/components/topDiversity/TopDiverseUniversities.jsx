// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const TopDiverseUniversities = () => {
//   const [universities, setUniversities] = useState([]);
//   const [raceCategories, setRaceCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [topN, setTopN] = useState(10);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchRaceCategories();
//   }, []);

//   const fetchRaceCategories = async () => {
//     try {
//       const response = await axios.get('http://localhost:5001/race-categories');
//       setRaceCategories(['All', ...response.data]);
//     } catch (err) {
//       console.error('Error fetching race categories:', err);
//       setError('Failed to fetch race categories.');
//     }
//   };

//   const fetchTopDiverseUniversities = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const category = selectedCategory === 'All' ? null : selectedCategory;
//       console.log(`Fetching data with raceCategory: ${category}, topN: ${topN}`);
//       const response = await axios.get(`http://localhost:5001/top-diverse-universities`, {
//         params: { raceCategory: category, topN }
//       });
//       console.log(response.data);
//       setUniversities(response.data);
//     } catch (err) {
//       console.error('Error details:', err.response ? err.response.data : err.message);
//       setError('Failed to fetch data. Please check the console for more details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h2>Top Diverse Universities</h2>
//       <div>
//         <select 
//           value={selectedCategory} 
//           onChange={(e) => setSelectedCategory(e.target.value)}
//         >
//           {raceCategories.map((category, index) => (
//             <option key={index} value={category}>{category}</option>
//           ))}
//         </select>
//         <input 
//           type="number" 
//           value={topN} 
//           onChange={(e) => setTopN(e.target.value)} 
//           placeholder="Top N"
//         />
//         <button onClick={fetchTopDiverseUniversities}>Fetch Data</button>
//       </div>
//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       {Array.isArray(universities) && universities.length > 0 && (
//         <table>
//           <thead>
//             <tr>
//               <th>University Name</th>
//               <th>Race Category</th>
//               <th>Total Enrollment</th>
//               <th>Race-wise Enrollment</th>
//               <th>Enrollment Percentage</th>
//             </tr>
//           </thead>
//           <tbody>
//             {universities.map((uni, index) => (
//               <tr key={index}>
//                 <td>{uni.UniversityName}</td>
//                 <td>{uni.RaceCategory}</td>
//                 <td>{uni.TotalEnrollment}</td>
//                 <td>{uni.RaceWiseEnrollment}</td>
//                 <td>{parseFloat(uni.EnrollmentPercentage).toFixed(2)}%</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default TopDiverseUniversities;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TopDiverseUniversities = () => {
  const [universities, setUniversities] = useState([]);
  const [raceCategories, setRaceCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRaceCategories();
  }, []);

  const fetchRaceCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5001/race-categories');
      setRaceCategories(['All', ...response.data]);
    } catch (err) {
      console.error('Error fetching race categories:', err);
      setError('Failed to fetch race categories.');
    }
  };

  const fetchTopDiverseUniversities = async () => {
    setLoading(true);
    setError(null);
    try {
      const category = selectedCategory === 'All' ? null : selectedCategory;
      console.log(`Fetching data with raceCategory: ${category}, topN: ${topN}`);
      const response = await axios.get(`http://localhost:5001/top-diverse-universities`, {
        params: { raceCategory: category, topN }
      });
      console.log(response.data);
      setUniversities(response.data);
    } catch (err) {
      console.error('Error details:', err.response ? err.response.data : err.message);
      setError('Failed to fetch data. Please check the console for more details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Top Diverse Universities</h2>
      <div>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {raceCategories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>
        <input 
          type="number" 
          value={topN} 
          onChange={(e) => setTopN(e.target.value)} 
          placeholder="Top N"
        />
        <button onClick={fetchTopDiverseUniversities}>Fetch Data</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {Array.isArray(universities) && universities.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>University Name</th>
              <th>Race Category</th>
              <th>Total Enrollment</th>
              <th>Race-wise Enrollment</th>
              <th>Enrollment Percentage</th>
            </tr>
          </thead>
          <tbody>
            {universities.map((uni, index) => (
              <tr key={index}>
                <td>{uni.UniversityName}</td>
                <td>{uni.RaceCategory}</td>
                <td>{uni.TotalEnrollment}</td>
                <td>{uni.RaceWiseEnrollment}</td>
                <td>{parseFloat(uni.EnrollmentPercentage).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TopDiverseUniversities;