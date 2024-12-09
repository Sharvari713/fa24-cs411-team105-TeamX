import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import axios from 'axios';
import Draggable from 'react-draggable';
import './Map.css'; // Separate CSS file for styles

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas/states-10m.json';

const Map = () => {
  const [statesData, setStatesData] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [stateDetails, setStateDetails] = useState([]);

  // Fetch summary data for all states
  useEffect(() => {
    axios.get('http://localhost:5001/get_states_data')
      .then(response => {
        setStatesData(response.data);
      })
      .catch(error => {
        console.error("Error fetching states data:", error);
      });
  }, []);

  // Fetch details for a specific state
  const fetchStateDetails = (stateName) => {
    axios.get(`http://localhost:5001/get_state_details/${stateName}`)
      .then(response => {
        setStateDetails(response.data);
        setSelectedState(stateName);
      })
      .catch(error => {
        console.error("Error fetching state details:", error);
      });
  };

  return (
    <div className="map-container">
      <h1 className="title">University and Cost of Living Analysis</h1>

      <div className="map-wrapper">
        <ComposableMap projection="geoAlbersUsa">
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const stateData = statesData.find(state => state.State === geo.properties.name);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => fetchStateDetails(geo.properties.name)}
                    style={{
                      default: {
                        fill: stateData ? '#9DFAFD' : '#EEE',
                        stroke: '#00008B',
                        strokeWidth: 1,
                        outline: 'none',
                      },
                      hover: {
                        fill: '#2c3e50',
                        stroke: '#00008B',
                        strokeWidth: 1,
                        outline: 'none',
                      },
                      pressed: {
                        fill: '#1b2a41',
                        stroke: '#00008B',
                        strokeWidth: 1,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {selectedState && (
        <div>
          {/* Draggable Sidebar for Cost of Living */}
          <Draggable>
            <div className="sidebar cost-of-living-sidebar">
              <h2>Cost of Living for {selectedState}</h2>
              {stateDetails.length > 0 ? (
                <div className="cost-of-living">
                  <ul>
                    <li><strong>Housing Cost:</strong> ${stateDetails[0].HousingCost}</li>
                    <li><strong>Food Cost:</strong> ${stateDetails[0].FoodCost}</li>
                    <li><strong>Transportation Cost:</strong> ${stateDetails[0].TransportationCost}</li>
                    <li><strong>Healthcare Cost:</strong> ${stateDetails[0].HealthcareCost}</li>
                  </ul>
                </div>
              ) : (
                <p>Loading state details...</p>
              )}
            </div>
          </Draggable>

          {/* Draggable Sidebar for Universities */}
          <Draggable>
            <div className="sidebar universities-sidebar">
              <h2>Universities in {selectedState}</h2>
              {stateDetails.length > 0 ? (
                <div className="universities">
                  <ul>
                    {stateDetails.map((uni, index) => (
                      <li key={index}>{uni.UniversityName}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>Loading universities...</p>
              )}
            </div>
          </Draggable>
        </div>
      )}
    </div>
  );
};

export default Map;
