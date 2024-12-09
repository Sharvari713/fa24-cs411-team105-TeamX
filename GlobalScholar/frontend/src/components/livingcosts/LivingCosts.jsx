import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const LivingCosts = () => {
  const { userId } = useParams(); // Get userId from URL params
  const [livingCosts, setLivingCosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLivingCosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/getUserLivingCosts/${userId}`);
        setLivingCosts(response.data);
      } catch (err) {
        setError("Failed to fetch living costs. Please try again later.");
        console.error(err);
      }
    };

    fetchLivingCosts();
  }, [userId]);

  return (
    <div>
      <h2>Living Costs</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {livingCosts.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {/* <th style={{ border: "1px solid #ddd", padding: "8px" }}>First Name</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Last Name</th> */}
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>University</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Total Living Cost</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Total Budget</th>
            </tr>
          </thead>
          <tbody>
            {livingCosts.map((cost, index) => (
              <tr key={index}>
                {/* <td style={{ border: "1px solid #ddd", padding: "8px" }}>{cost.FirstName}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{cost.LastName}</td> */}
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{cost.UniversityName}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{cost.TotalLivingCost}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{cost.TotalBudget}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !error && <p>No matching living costs found.</p>
      )}
    </div>
  );
};

export default LivingCosts;