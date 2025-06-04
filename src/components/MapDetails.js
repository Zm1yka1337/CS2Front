import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { nadeTypes } from '../data/nades';
import '../styles/MapDetails.css';
import { getAuth } from 'firebase/auth';
import { 
  addNadeToFavorites, 
  removeNadeFromFavorites, 
  getUserFavoriteNades,
  addCommentToNade,
  getNadeComments,
  deleteNadeComment,
  getNadeDataForMap,
  recordNadeView
} from '../services/firebaseService';

// Icon imports
import smokeTIcon from '../assets/endGrenadeIcons/SmokeT.png';
import smokeCtIcon from '../assets/endGrenadeIcons/SmokeCT.png';
import flashIcon from '../assets/endGrenadeIcons/flash.png';
import molotovIcon from '../assets/endGrenadeIcons/molotov.png';
import heIcon from '../assets/endGrenadeIcons/he.png';

const grenadeIcons = {
  smoke: {
    T: smokeTIcon,
    CT: smokeCtIcon
  },
  flash: {
    T: flashIcon,
    CT: flashIcon
  },
  molotov: {
    T: molotovIcon,
    CT: molotovIcon
  },
  he: {
    T: heIcon,
    CT: heIcon
  }
};

const auth = getAuth();

function MapDetails() {
  const { mapId } = useParams();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedNade, setSelectedNade] = useState(null);
  const [isTutorialDetailExpanded, setIsTutorialDetailExpanded] = useState(false);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0, scale: 1, offsetX: 0, offsetY: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [map, setMap] = useState(null);
  
  const mapContainerRef = useRef(null);
  const mapImageRef = useRef(null);
  const textareaRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [selectedTrajectory, setSelectedTrajectory] = useState(null);

  // Utility functions
  const convertToScreenCoordinates = (x, y) => {
    if (!mapDimensions.scale) return { x: 0, y: 0 };

    // Convert from map coordinates (0-1024) to screen coordinates
    // Normalize coordinates to 0-1 range first, then scale to container size
    const normalizedX = x / 1024;
    const normalizedY = y / 1024;
    
    const screenX = (normalizedX * mapDimensions.width) + mapDimensions.offsetX;
    const screenY = (normalizedY * mapDimensions.height) + mapDimensions.offsetY;

    return { x: screenX, y: screenY };
  };

  const createTrajectoryPath = (points) => {
    if (!points || points.length < 2 || !mapDimensions.scale) return '';

    const start = points[0];
    const end = points[points.length - 1];

    const startPos = convertToScreenCoordinates(start.x, start.y);
    const endPos = convertToScreenCoordinates(end.x, end.y);

    // Create a simple line from start to end
    return `M ${startPos.x} ${startPos.y} L ${endPos.x} ${endPos.y}`;
  };

  // Event handlers
  const handleNadeClick = (nade) => {
    if (selectedNade?.id === nade.id) {
      return;
    }
    setSelectedNade(nade);
    setIsTutorialDetailExpanded(false);
  };

  const toggleTutorialExpansion = (e) => {
    e.stopPropagation();
    setIsTutorialDetailExpanded(!isTutorialDetailExpanded);
  };

  const checkIfFavorite = async (userId, currentMapId, currentNadeId) => {
    if (!currentNadeId) return;
    setIsLoadingFavorite(true);
    const favorites = await getUserFavoriteNades(userId);
    if (favorites && !favorites.error) {
      setIsFavorite(favorites.some(fav => fav.mapId === currentMapId && fav.nadeId === currentNadeId));
    } else {
      console.error("Error checking favorites in MapDetails:", favorites?.error);
      setIsFavorite(false);
    }
    setIsLoadingFavorite(false);
  };

  const handleToggleFavorite = async () => {
    if (!currentUser || !selectedNade) {
      console.log("User not logged in or nade not selected for favorite action");
      return;
    }
    setIsLoadingFavorite(true);
    let result;
    if (isFavorite) {
      result = await removeNadeFromFavorites(currentUser.uid, mapId, selectedNade.id);
    } else {
      result = await addNadeToFavorites(currentUser.uid, mapId, selectedNade.id);
    }

    if (result && result.success) {
      setIsFavorite(!isFavorite);
    } else {
      console.error("Error updating favorite status in MapDetails:", result?.error);
    }
    setIsLoadingFavorite(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !selectedNade) {
      return;
    }

    setIsSubmittingComment(true);
    const result = await addCommentToNade(
      mapId, 
      selectedNade.id, 
      currentUser.uid, 
      currentUser.displayName || currentUser.email, 
      newComment
    );

    if (result.success && result.comment) {
      setComments(prevComments => [result.comment, ...prevComments]);
      setNewComment("");
      fetchComments();
    } else {
      console.error("Error submitting comment:", result?.error);
      alert(`Failed to submit comment: ${result?.error || 'Unknown error'}`);
    }
    setIsSubmittingComment(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser || !selectedNade || !mapId || !commentId) {
      console.error("Missing data for comment deletion.");
      return;
    }

    const result = await deleteNadeComment(mapId, commentId, currentUser.uid);
    if (result.success) {
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    } else {
      console.error("Error deleting comment:", result.error);
      alert(`Failed to delete comment: ${result.error}`);
    }
  };

  // Fetch comments callback
  const fetchComments = useCallback(async () => {
    if (selectedNade && mapId) {
      const result = await getNadeComments(mapId, selectedNade.id);
      if (result && result.needsIndex) {
        console.error("Firestore Error: Missing composite index for comments query.", result.error);
        setComments([]);
      } else if (Array.isArray(result)) {
        setComments(result);
      } else if (result && result.error) {
        console.error("Error fetching comments:", result.error);
      } else {
        setComments([]);
      }
    } else {
      setComments([]);
    }
  }, [selectedNade, mapId]);

  const handleTrajectoryClick = (nade, e) => {
    e.stopPropagation();
    setSelectedTrajectory(selectedTrajectory === nade.id ? null : nade.id);
    handleNadeClick(nade);
  };

  const handleMapClick = () => {
    setSelectedTrajectory(null);
  };

  // Effects
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateMapDimensions = () => {
      if (!mapImageRef.current || !imageLoaded || !mapContainerRef.current) return;

      const container = mapContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Use the smaller dimension to maintain aspect ratio
      const containerSize = Math.min(containerRect.width, containerRect.height);
      
      // Calculate scale based on the original 1024x1024 map size
      const scale = containerSize / 1024;
      
      // Calculate offsets to center the map
      const offsetX = (containerRect.width - containerSize) / 2;
      const offsetY = (containerRect.height - containerSize) / 2;

      setMapDimensions({
        width: containerSize,
        height: containerSize,
        scale,
        offsetX,
        offsetY
      });
    };

    const resizeObserver = new ResizeObserver(updateMapDimensions);
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    window.addEventListener('resize', updateMapDimensions);
    updateMapDimensions();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateMapDimensions);
    };
  }, [imageLoaded]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newComment]);

  useEffect(() => {
    if (!selectedNade) {
      setIsTutorialDetailExpanded(false);
      setIsFavorite(false);
      setComments([]);
      return;
    }
    if (currentUser && selectedNade) {
      checkIfFavorite(currentUser.uid, mapId, selectedNade.id);
    }
    fetchComments();
  }, [selectedNade, currentUser, mapId, fetchComments]);

  useEffect(() => {
    async function fetchMap() {
      const data = await getNadeDataForMap(mapId);
      setMap(data);
    }
    fetchMap();
  }, [mapId]);

  useEffect(() => {
    if (
      isTutorialDetailExpanded &&
      currentUser &&
      selectedNade &&
      selectedNade.id &&
      mapId
    ) {
      recordNadeView(currentUser.uid, mapId, selectedNade.id)
        .then(result => {
          if (result.success) {
            console.log(`View for ${selectedNade.id} recorded (from MapDetails expanded). New count: ${result.newViewCount}`);
          }
        })
        .catch(err => console.error("Failed to record view (from MapDetails expanded):", err));
    }
  }, [isTutorialDetailExpanded, currentUser, selectedNade, mapId]);

  // Render functions
  const renderTrajectories = () => {
    if (!imageLoaded || !mapDimensions.scale || !map) return null;

    const filteredNades = map.spots.flatMap(spot => 
      spot.nades.filter(nade => 
        selectedType === 'all' || nade.type === selectedType
      )
    );

    return (
      <div 
        className={`trajectory-container ${selectedTrajectory ? 'trajectory-active' : ''}`}
        onClick={handleMapClick}
      >
        <svg
          className="trajectory-line"
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {filteredNades.map((nade, index) => {
            if (!nade.trajectory || nade.trajectory.length < 2) return null;

            const isActive = selectedNade?.id === nade.id;
            const isTrajectorySelected = selectedTrajectory === nade.id;
            const opacity = (selectedNade && !isActive) || (selectedTrajectory && !isTrajectorySelected) ? 0.3 : 1;

            return (
              <g 
                key={index} 
                className={`trajectory-group ${isActive ? 'active' : ''}`}
                onClick={(e) => handleTrajectoryClick(nade, e)}
              >
                {/* Draw shadow for better visibility */}
                <path
                  d={createTrajectoryPath(nade.trajectory)}
                  className="trajectory-shadow"
                  style={{
                    stroke: 'rgba(0, 0, 0, 0.5)',
                    strokeWidth: (isActive || isTrajectorySelected) ? 5 : 3,
                    opacity: opacity * 0.5
                  }}
                />
                {/* Draw main trajectory path */}
                <path
                  d={createTrajectoryPath(nade.trajectory)}
                  className={`trajectory-path ${nade.type}`}
                  style={{
                    opacity,
                    strokeWidth: (isActive || isTrajectorySelected) ? 4 : 2
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderMarkers = () => {
    if (!imageLoaded || !mapDimensions.scale || !map) return null;

    const filteredNades = map.spots.flatMap(spot => 
      spot.nades.filter(nade => 
        selectedType === 'all' || nade.type === selectedType
      )
    );

    return filteredNades.map((nade, index) => {
      if (!nade.trajectory || nade.trajectory.length < 2) return null;

      const startPoint = convertToScreenCoordinates(nade.trajectory[0].x, nade.trajectory[0].y);
      const endPoint = convertToScreenCoordinates(
        nade.trajectory[nade.trajectory.length - 1].x,
        nade.trajectory[nade.trajectory.length - 1].y
      );

      const isActive = selectedNade?.id === nade.id;
      const isTrajectorySelected = selectedTrajectory === nade.id;
      const opacity = (selectedNade && !isActive) || (selectedTrajectory && !isTrajectorySelected) ? 0.3 : 1;
      const scale = isActive ? 1.2 : 1;

      return (
        <React.Fragment key={index}>
          <div
            className={`nade-marker start ${isActive ? 'active' : ''}`}
            style={{
              left: startPoint.x,
              top: startPoint.y,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
              transition: 'all 0.2s ease'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleNadeClick(nade);
            }}
          >
            <div className="nade-tooltip">
              <strong>{nade.title}</strong>
              <div className="tooltip-detail">{nade.technique}</div>
            </div>
          </div>
          <div
            className={`nade-marker end ${nade.type} ${nade.team} ${isActive ? 'active' : ''}`}
            style={{
              left: endPoint.x,
              top: endPoint.y,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
              transition: 'all 0.2s ease',
              backgroundImage: `url(${grenadeIcons[nade.type][nade.team]})`
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleNadeClick(nade);
            }}
          >
            <div className="nade-tooltip">
              <strong>{nade.title}</strong>
              <div className="tooltip-detail">{nade.description}</div>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  // Main render
  if (!map) return <div>Карту не знайдено</div>;

  const filteredNades = map.spots.flatMap(spot => 
    spot.nades.filter(nade => 
      selectedType === 'all' || nade.type === selectedType
    ).map(nade => ({...nade, spotName: spot.name}))
  );

  return (
    <div className={`map-details ${isTutorialDetailExpanded ? 'tutorial-panel-expanded' : ''}`}>
      <div className="map-header">
        <h1>{map.name}</h1>
        <div className="nade-type-filter">
          <button
            className={selectedType === 'all' ? 'active' : ''}
            onClick={() => setSelectedType('all')}
          >
            All
          </button>
          {nadeTypes.map(type => (
            <button
              key={type.id}
              className={selectedType === type.id ? 'active' : ''}
              onClick={() => setSelectedType(type.id)}
              style={{ backgroundColor: type.color }}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      <div className="map-container" ref={mapContainerRef}>
        <div className="map-wrapper">
          <img
            ref={mapImageRef}
            src={map.image}
            alt={map.name}
            className="map-image"
            onLoad={() => setImageLoaded(true)}
          />
          {imageLoaded && mapDimensions.scale && (
            <>
              {renderTrajectories()}
              {renderMarkers()}
            </>
          )}
        </div>
      </div>

      {selectedNade && (
        <div 
          className={`nade-details-panel ${selectedNade ? 'active' : ''} ${isTutorialDetailExpanded ? 'expanded' : ''}`}
        >
          <div className="panel-content-wrapper">
            <div className="panel-header">
              <h2>{selectedNade.title}</h2>
              <button onClick={() => setSelectedNade(null)} className="close-panel-button">&times;</button>
            </div>
            <p className="nade-short-description">{selectedNade.description.substring(0, 100)}{selectedNade.description.length > 100 ? '...' : ''}</p>
            <div className="nade-info-grid">
              <div className="info-item">
                <span>Складність:</span>
                <span>{selectedNade.difficulty}</span>
              </div>
              <div className="info-item">
                <span>техніка:</span>
                <span>{selectedNade.technique}</span>
              </div>
              <div className="info-item">
                <span>Тікрейт:</span>
                <span>{selectedNade.tickrate}</span>
              </div>
            </div>
            
            {selectedNade.videoUrl && (
              <button onClick={toggleTutorialExpansion} className="watch-tutorial-toggle-button">
                {isTutorialDetailExpanded ? 'Hide Tutorial' : 'Watch Tutorial'}
              </button>
            )}

            <div className="tutorial-expanded-content">
              {isTutorialDetailExpanded && (
                <div className="tutorial-columns-layout">
                  <div className="tutorial-left-column">
                    {selectedNade.videoUrl && (
                      <div className="video-container-expanded">
                        <iframe
                          src={selectedNade.videoUrl}
                          title={`${selectedNade.title} Tutorial`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                  <div className="tutorial-right-column">
                    <h3 className="full-description-header">Повна інструкція:</h3>
                    <p className="nade-full-description">{selectedNade.description}</p>
                    
                    <div className="actions-and-comments-placeholder">
                      {currentUser && selectedNade && (
                        <button 
                          onClick={handleToggleFavorite}
                          className={`favorite-button map-details-favorite-button ${isFavorite ? 'is-favorite' : ''}`}
                          disabled={isLoadingFavorite}
                        >
                          {isLoadingFavorite ? 'Processing...' : (isFavorite ? '★ In Favorites' : '☆ Add to Favorites')}
                        </button>
                      )}
                      <div className="comments-section-mapdetails">
                        <h4>Comments</h4>
                        {currentUser ? (
                          <form onSubmit={handleCommentSubmit} className="comment-form">
                            <textarea
                              ref={textareaRef}
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Write a comment..."
                              rows="3"
                              disabled={isSubmittingComment}
                            />
                            <button type="submit" disabled={isSubmittingComment || !newComment.trim()}>
                              {isSubmittingComment ? "Submitting..." : "Submit Comment"}
                            </button>
                          </form>
                        ) : (
                          <p><em>Увійдіть, щоб залишити коментар.</em></p>
                        )}
                        <div className="comments-list">
                          {comments.length > 0 ? (
                            comments.map(comment => (
                              <div key={comment.id} className="comment-item">
                                <div className="comment-content">
                                  <p className="comment-author">
                                    <strong>{comment.userName}</strong> 
                                    <span className="comment-date">
                                      {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleDateString() : ''}
                                    </span>
                                  </p>
                                  <p className="comment-text">{comment.text}</p>
                                </div>
                                {currentUser && currentUser.uid === comment.userId && (
                                  <button 
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="delete-comment-button"
                                  >
                                    Видалити
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <p><em>Поки що немає коментарів. Будьте першим, хто залишить коментар!</em></p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapDetails; 