import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import { getAllNadeData } from '../services/firebaseService';

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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [maps, setMaps] = useState([]);
  const [mapsLoading, setMapsLoading] = useState(true);

  useEffect(() => {
    const fetchMaps = async () => {
      setMapsLoading(true);
      const data = await getAllNadeData();
      if (data && !data.error) {
        // Firestore повертає об'єкт, а не масив
        setMaps(Object.entries(data).map(([id, map]) => ({ id, ...map })));
      } else {
        setError('Не вдалося завантажити карти з бази даних');
      }
      setMapsLoading(false);
    };
    fetchMaps();
  }, [success]); // Оновлюємо після імпорту

  const handleSeed = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/seed`, { method: 'POST' });
      if (!response.ok) throw new Error('Помилка при імпорті!');
      setSuccess(true);
    } catch (e) {
      setError('Помилка при імпорті!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <h1>CS2 траєкторія гранат</h1>
      {success && <div style={{color: 'green', marginBottom: '1rem'}}>Дані успішно імпортовано!</div>}
      {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
      {mapsLoading ? (
        <div>Завантаження карт...</div>
      ) : (
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
                    {`${getTotalNades(map.spots)} nades`}
                  </span>
                </div>
              </div>
            </Link>
          )) : <div>Немає доступних карт</div>}
        </div>
      )}
    </div>
  );
}

export default Home;