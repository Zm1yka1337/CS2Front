import React from 'react';
import { Link } from 'react-router-dom';
import { maps } from '../data/nades';
import '../styles/Home.css';

// Helper function to calculate total nades for a map
const getTotalNades = (mapSpots) => {
  if (!mapSpots) return 0;
  let total = 0;
  mapSpots.forEach(spot => {
    if (spot.nades && spot.nades.length > 0) {
      total += spot.nades.length;
    }
  });
  return total;
};

function Home() {
  return (
    <div className="home">
      <h1>CS2 Grenade Lineups</h1>
      <div className="maps-grid">
        {maps && maps.length > 0 ? maps.map((map) => (
          <Link to={`/map/${map.id}`} key={map.id} className="map-card">
            <div className="map-image-container">
              <img 
                src={map.backgroundImage} 
                alt={map.name} 
                className="map-background" 
              />
              <div className="map-overlay">
                <img 
                  src={map.icon} 
                  alt={`${map.name} icon`} 
                  className="map-icon" 
                />
              </div>
              <div className="map-info">
                <h2>{map.name}</h2>
                <span className="map-stats">
                  {/* Use the helper function to display total nades */}
                  {`${getTotalNades(map.spots)} nades`}
                </span>
              </div>
            </div>
          </Link>
        )) : <div>No maps available</div>}
      </div>
    </div>
  );
}

export default Home;