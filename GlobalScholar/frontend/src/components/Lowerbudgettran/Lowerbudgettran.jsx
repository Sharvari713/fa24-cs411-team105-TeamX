import React, { useEffect, useState } from "react";
import axios from "axios";

const Lowerbudgettran = () => {
  const [transactionResult, setTransactionResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactionResult = async () => {
      try {
        const response = await axios.get("http://localhost:5001/transaction-result");
        setTransactionResult(response.data.result);
      } catch (err) {
        console.error("Error fetching transaction result:", err);
        setError("Failed to fetch transaction result. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionResult();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="Lowerbudgettran">
      <h2>Users having lower tuition fee budget</h2>
      {transactionResult.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>First Name</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Last Name</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Tuition Fee Budget</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Average In-State Tuition</th>
            </tr>
          </thead>
          <tbody>
            {transactionResult.map((row, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.FirstName}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.LastName}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>${row.TuitionFeeBudget}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>${row.avg_state_tuition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default Lowerbudgettran;