import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Analysis = () => {
  const [userInfo, setUserInfo] = useState({});
  const [analysisData, setAnalysisData] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  const [accommodationBudget, setAccommodationBudget] = useState(null);
  const [tuitionFeeBudget, setTuitionFeeBudget] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/userInfo/${userId}`);
        const userData = response.data;
        setUserInfo(userData);

        if (userData.AccommodationBudget) {
          setAccommodationBudget(userData.AccommodationBudget);
        }
        if (userData.TuitionFeeBudget) {
          setTuitionFeeBudget(userData.TuitionFeeBudget);
        }
      } catch (error) {
        console.error("Error fetching user information:", error);
        setErrors((prevErrors) => ({
          ...prevErrors,
          fetch: "Failed to fetch user information. Please try again later.",
        }));
      }
    };

    fetchUserInfo();
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const fetchAnalysisData = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:5001/getUniversityDetails/${userId}`
          );
          const transformedData = response.data.map((item) => ({
            UniversityName: item['UniversityName'],
            RoomAndBoardCost: item['RoomAndBoardCost'],
            OutOfStateTuitionFees: item['OutOfStateTuitionFees'],
          }));

          setAnalysisData(transformedData);
        } catch (error) {
          console.error("Error fetching university analysis data:", error);
          setErrors((prevErrors) => ({
            ...prevErrors,
            analysis: "Failed to fetch analysis data. Please try again later.",
          }));
        }
        setLoading(false);
      };

      fetchAnalysisData();
    }
  }, [userId]);

  const collegeNames = analysisData.map((data) => data.UniversityName);
  const accommodationCosts = analysisData.map((data) => data.RoomAndBoardCost);
  const tuitionFees = analysisData.map((data) => data.OutOfStateTuitionFees);
  const totalBudgets = analysisData.map(
    (data) => data.RoomAndBoardCost + data.OutOfStateTuitionFees
  );

  return (
    <div className="analysis">
      <h2>University Analysis</h2>

      {errors.fetch && <p style={{ color: "red" }}>{errors.fetch}</p>}
      {errors.analysis && <p style={{ color: "red" }}>{errors.analysis}</p>}

      <div style={{ marginBottom: "20px" }}>
        <label>
          <strong>Accommodation Budget:</strong>
          <input
            value={accommodationBudget || ""}
            onChange={(e) => setAccommodationBudget(Number(e.target.value))}
            style={{ marginLeft: "10px", padding: "5px", width: "100px" }}
            readOnly
          />
        </label>
        <br />
        <label style={{ marginTop: "10px", display: "block" }}>
          <strong>Tuition Fee Budget:</strong>
          <input
            value={tuitionFeeBudget || ""}
            onChange={(e) => setTuitionFeeBudget(Number(e.target.value))}
            style={{ marginLeft: "10px", padding: "5px", width: "100px" }}
            readOnly
          />
        </label>
      </div>

      {loading ? (
        <p>Loading analysis...</p>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>University Name</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Accommodation Cost</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Tuition Fees</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((data, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {data.UniversityName}
                  </td>
                  <td
                    style={{
                      border:
                        data.RoomAndBoardCost > (accommodationBudget || Infinity)
                          ? "3px solid red"
                          : "1px solid #ddd",
                      padding: "8px",
                    }}
                  >
                    ${data.RoomAndBoardCost}
                  </td>
                  <td
                    style={{
                      border:
                        data.OutOfStateTuitionFees > (tuitionFeeBudget || Infinity)
                          ? "3px solid red"
                          : "1px solid #ddd",
                      padding: "8px",
                    }}
                  >
                    ${data.OutOfStateTuitionFees}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Graphs in a single row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "nowrap", // Ensure they stay on a single line
              gap: "20px", // Add spacing between the graphs
            }}
          >
            <div
              style={{
                width: "30%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h4>Total Cost</h4>
              <div style={{ height: "200px", width: "100%" }}>
                <Bar
                  data={{
                    labels: collegeNames,
                    datasets: [
                      {
                        label: "Total Budget",
                        data: totalBudgets,
                        backgroundColor: totalBudgets.map((value) =>
                          value > (accommodationBudget + tuitionFeeBudget) ? "red" : "blue"
                        ),
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { ticks: { font: { size: 10 } } } },
                  }}
                />
              </div>
            </div>

            <div
              style={{
                width: "30%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h4>Tuition Fees</h4>
              <div style={{ height: "200px", width: "100%" }}>
                <Bar
                  data={{
                    labels: collegeNames,
                    datasets: [
                      {
                        label: "Tuition Fees",
                        data: tuitionFees,
                        backgroundColor: tuitionFees.map((value) =>
                          value > tuitionFeeBudget ? "orange" : "green"
                        ),
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { ticks: { font: { size: 10 } } } },
                  }}
                />
              </div>
            </div>

            <div
              style={{
                width: "30%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h4>Accommodation Costs</h4>
              <div style={{ height: "200px", width: "100%" }}>
                <Bar
                  data={{
                    labels: collegeNames,
                    datasets: [
                      {
                        label: "Accommodation Costs",
                        data: accommodationCosts,
                        backgroundColor: accommodationCosts.map((value) =>
                          value > accommodationBudget ? "purple" : "yellow"
                        ),
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { ticks: { font: { size: 10 } } } },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analysis;
