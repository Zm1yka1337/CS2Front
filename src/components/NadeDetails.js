import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { maps } from '../data/nades';
import { getAuth } from 'firebase/auth';
import { 
  addNadeToFavorites, 
  removeNadeFromFavorites, 
  getUserFavoriteNades,
  recordNadeView
} from '../services/firebaseService';
import '../styles/NadeDetails.css';

const auth = getAuth();

function NadeDetails() {
  const { mapId, nadeId } = useParams();
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [nadeData, setNadeData] = useState(null);

  useEffect(() => {
    const map = maps.find(m => m.id === mapId);
    const nade = map?.spots.flatMap(spot => 
      spot.nades.map(n => ({...n, spotName: spot.name, mapName: map.name }))
    ).find(n => n.id === nadeId);
    setNadeData(nade);

    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user && nade) {
        checkIfFavorite(user.uid, mapId, nadeId);
      } else {
        setIsLoadingFavorite(false);
      }
    });
    return () => unsubscribe();
  }, [mapId, nadeId]);

  const checkIfFavorite = async (userId, currentMapId, currentNadeId) => {
    setIsLoadingFavorite(true);
    const favorites = await getUserFavoriteNades(userId);
    if (favorites && !favorites.error) {
      setIsFavorite(favorites.some(fav => fav.mapId === currentMapId && fav.nadeId === currentNadeId));
    } else {
      console.error("Error checking favorites:", favorites.error);
    }
    setIsLoadingFavorite(false);
  };

  const handleToggleFavorite = async () => {
    if (!currentUser || !nadeData) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setIsLoadingFavorite(true);
    let result;
    if (isFavorite) {
      result = await removeNadeFromFavorites(currentUser.uid, mapId, nadeId);
    } else {
      result = await addNadeToFavorites(currentUser.uid, mapId, nadeId);
    }

    if (result.success) {
      setIsFavorite(!isFavorite);
    } else {
      console.error("Error updating favorite status:", result.error);
    }
    setIsLoadingFavorite(false);
  };

  const handleOpenTutorial = () => {
    setShowTutorial(true);
    if (currentUser && nadeData) {
      recordNadeView(currentUser.uid, mapId, nadeId)
        .then(result => {
          if (result.success) {
            console.log(`View for ${nadeId} recorded (from tutorial open). New count: ${result.newViewCount}`);
          }
        })
        .catch(err => console.error("Failed to record view (from tutorial open):", err));
    }
  };

  if (!nadeData) return <div className="loading-container">Завантаження деталей гранати...</div>;

  const { title, spotName, startPosition, endPosition, type, technique, difficulty, tickrate, videoUrl, description, mapName } = nadeData;

  const formatPosition = (pos) => {
    if (pos && typeof pos.x !== 'undefined' && typeof pos.y !== 'undefined') {
      return `(X: ${pos.x}%, Y: ${pos.y}%)`;
    }
    return 'N/A';
  };

  return (
    <div className="nade-details-page">
      <button className="back-button" onClick={() => navigate(`/map/${mapId}`)}>
        ← Back to {mapName || mapId}
      </button>

      <div className="nade-content">
        <h1>{title}</h1>
        
        <div className="nade-info-grid">
          <div className="info-card">
            <h3>Location</h3>
            <p><strong>From:</strong> {spotName}</p>
            <p><strong>Start (approx.):</strong> {formatPosition(startPosition)}</p>
            <p><strong>End (target):</strong> {formatPosition(endPosition)}</p>
          </div>

          <div className="info-card">
            <h3>Technique</h3>
            <p><strong>Type:</strong> {type}</p>
            <p><strong>Throw:</strong> {technique}</p>
            <p><strong>Difficulty:</strong> {difficulty}</p>
          </div>

          <div className="info-card">
            <h3>Details</h3>
            <p><strong>Tickrate:</strong> {tickrate}</p>
            <p><strong>Spot:</strong> {spotName}</p>
          </div>
        </div>

        {videoUrl && !showTutorial && (
          <button className="watch-tutorial-button" onClick={handleOpenTutorial}>
            Watch Tutorial (Video & Instructions)
          </button>
        )}

        {showTutorial && videoUrl && (
          <div className="tutorial-modal-overlay">
            <div className="tutorial-modal-content">
              <div className="tutorial-modal-header">
                <h2>{title} - Tutorial</h2>
                <button className="close-tutorial-button" onClick={() => setShowTutorial(false)}>
                  &times;
                </button>
              </div>
              <div className="tutorial-modal-body">
                <div className="modal-layout-container">
                  <div className="modal-left-column">
                    {currentUser && (
                      <button 
                        onClick={handleToggleFavorite} 
                        className={`favorite-button modal-favorite-button ${isFavorite ? 'is-favorite' : ''}`}
                        disabled={isLoadingFavorite}
                      >
                        {isLoadingFavorite ? 'Processing...' : (isFavorite ? '★ Remove from Favorites' : '☆ Add to Favorites')}
                      </button>
                    )}
                    {description && (
                      <div className="nade-description">
                        <h3>Full Instructions:</h3>
                        <p>{description}</p>
                      </div>
                    )}
                    <div className="comments-placeholder">
                      <h3>Comments</h3>
                      <p><em>(Comment section coming soon)</em></p>
                    </div>
                  </div>
                  <div className="modal-right-column">
                    <div className="video-section">
                      <div className="video-container">
                        <iframe
                          src={videoUrl}
                          title={`${title} Lineup Tutorial`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NadeDetails; 