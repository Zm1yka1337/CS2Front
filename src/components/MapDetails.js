import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { maps, nadeTypes } from '../data/nades';
import '../styles/MapDetails.css';
import { getAuth } from 'firebase/auth';
import { 
  addNadeToFavorites, 
  removeNadeFromFavorites, 
  getUserFavoriteNades,
  addCommentToNade,
  getNadeComments,
  deleteNadeComment
} from '../services/firebaseService';

// Re-adding direct icon imports
import smokeTIcon from '../assets/endGrenadeIcons/SmokeT.png';
import smokeCtIcon from '../assets/endGrenadeIcons/SmokeCT.png';
import flashIcon from '../assets/endGrenadeIcons/flash.png'; // Assuming flash.png for both teams
import molotovIcon from '../assets/endGrenadeIcons/molotov.png'; // Assuming molotov.png for both teams
import heIcon from '../assets/endGrenadeIcons/he.png'; // Assuming he.png for both teams

// Update grenadeIcons object to use imported variables
const grenadeIcons = {
  smoke: {
    T: smokeTIcon,
    CT: smokeCtIcon
  },
  flash: {
    T: flashIcon,
    CT: flashIcon // Use the same flashIcon for CT, or import a specific one if available
  },
  molotov: {
    T: molotovIcon,
    CT: molotovIcon // Use the same molotovIcon for CT, or import a specific one
  },
  he: {
    T: heIcon,
    CT: heIcon // Use the same heIcon for CT, or import a specific one
  }
};

const auth = getAuth();

function MapDetails() {
  const { mapId } = useParams();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedNade, setSelectedNade] = useState(null);
  const [isTutorialDetailExpanded, setIsTutorialDetailExpanded] = useState(false);

  // Нові стани для функціоналу "Улюблене"
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  // State for comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const textareaRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch comments when selectedNade or mapId changes
  const fetchComments = useCallback(async () => {
    if (selectedNade && mapId) {
      console.log("[MapDetails] fetchComments: Fetching for", { mapId, nadeId: selectedNade.id });
      const result = await getNadeComments(mapId, selectedNade.id);
      console.log("[MapDetails] fetchComments: Result from getNadeComments:", result);

      if (result && result.needsIndex) {
        console.error("Firestore Error: Missing composite index for comments query.", result.error);
        setComments([]); 
      } else if (Array.isArray(result)) {
        console.log("[MapDetails] fetchComments: Setting comments state with:", result);
        setComments(result);
      } else if (result && result.error) {
        console.error("Error fetching comments:", result.error);
        // Decide if you want to clear comments or leave them as is on error
        // setComments([]); 
      } else {
        console.error("Unexpected result when fetching comments:", result);
        setComments([]);
      }
    } else {
      console.log("[MapDetails] fetchComments: No selectedNade or mapId, clearing comments.");
      setComments([]);
    }
  }, [selectedNade, mapId]);

  useEffect(() => {
    if (!selectedNade) {
      setIsTutorialDetailExpanded(false);
      setIsFavorite(false);
      setComments([]); // Clear comments when nade is deselected
      return;
    }
    if (currentUser && selectedNade) {
      checkIfFavorite(currentUser.uid, mapId, selectedNade.id);
    }
    fetchComments(); // Fetch comments for the selected nade
  }, [selectedNade, currentUser, mapId, fetchComments]);

  // Auto-grow textarea - MOVED HERE
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; 
    }
  }, [newComment]); 

  const checkIfFavorite = async (userId, currentMapId, currentNadeId) => {
    if (!currentNadeId) return;
    setIsLoadingFavorite(true);
    const favorites = await getUserFavoriteNades(userId);
    if (favorites && !favorites.error) {
      setIsFavorite(favorites.some(fav => fav.mapId === currentMapId && fav.nadeId === currentNadeId));
    } else {
      console.error("Error checking favorites in MapDetails:", favorites?.error);
      setIsFavorite(false); // На випадок помилки
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
    console.log("handleCommentSubmit called");
    console.log("Current user:", currentUser);
    console.log("Selected nade:", selectedNade);
    console.log("New comment text:", newComment);

    if (!newComment.trim()) {
      console.log("Comment text is empty or only whitespace.");
      return;
    }
    if (!currentUser) {
      console.log("User is not logged in (currentUser is null).");
      return;
    }
    if (!selectedNade) {
      console.log("No nade selected (selectedNade is null).");
      return;
    }

    setIsSubmittingComment(true);
    console.log("Submitting comment with:", { mapId, nadeId: selectedNade.id, userId: currentUser.uid, userName: currentUser.displayName || currentUser.email, text: newComment });
    
    const result = await addCommentToNade(
      mapId, 
      selectedNade.id, 
      currentUser.uid, 
      currentUser.displayName || currentUser.email, 
      newComment
    );

    console.log("Result from addCommentToNade:", result);

    if (result.success && result.comment) {
      console.log("Comment successfully added, updating state.");
      setComments(prevComments => [result.comment, ...prevComments]); // Keep optimistic update
      setNewComment(""); 
      fetchComments(); // Fetch fresh comments after successful submission
    } else {
      console.error("Error submitting comment from handleCommentSubmit:", result?.error);
      alert(`Failed to submit comment: ${result?.error || 'Unknown error'}`); // Temporary alert for debugging
    }
    setIsSubmittingComment(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser || !selectedNade || !mapId || !commentId) {
      console.error("Missing data for comment deletion.");
      return;
    }
    // Optionally, add a confirmation dialog here
    // const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    // if (!confirmDelete) return;

    console.log(`Attempting to delete comment ${commentId} on map ${mapId} by user ${currentUser.uid}`);
    const result = await deleteNadeComment(mapId, commentId, currentUser.uid);

    if (result.success) {
      console.log("Comment deleted successfully from Firestore. Updating UI.");
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    } else {
      console.error("Error deleting comment (from MapDetails):", result.error);
      // Optionally, show an error message to the user
      alert(`Failed to delete comment: ${result.error}`);
    }
  };

  const map = maps.find((m) => m.id === mapId);
  if (!map) return <div>Map not found</div>;

  const filteredNades = map.spots.flatMap(spot => 
    spot.nades.filter(nade => 
      selectedType === 'all' || nade.type === selectedType
    ).map(nade => ({...nade, spotName: spot.name}))
  );

  const handleNadeClick = (nade) => {
    if (selectedNade?.id === nade.id) {
    } else {
      setSelectedNade(nade);
      setIsTutorialDetailExpanded(false);
    }
  };

  const toggleTutorialExpansion = (e) => {
    e.stopPropagation();
    setIsTutorialDetailExpanded(!isTutorialDetailExpanded);
  };

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

      <div className="map-container">
        <div className="map-wrapper">
          <img src={map.image} alt={map.name} className="map-image" />
          
          {/* Spots markers */}
          {map.spots.map(spot => (
            <div
              key={spot.id}
              className="spot-marker"
              style={{
                left: `${spot.position.x}%`,
                top: `${spot.position.y}%`
              }}
              onClick={() => console.log('Spot clicked:', spot.name)}
            >
              <div className="spot-name">{spot.name}</div>
            </div>
          ))}

          {/* Nade trajectories */}
          {filteredNades.map(nade => {
            const nadeTypeData = nadeTypes.find(type => type.id === nade.type);
            const iconSrc = grenadeIcons[nade.type]?.[nade.team] || grenadeIcons[nade.type]?.T;

            return (
              <div key={nade.id}>
                <div
                  className={`nade-marker start ${selectedNade?.id === nade.id ? 'active' : ''}`}
                  style={{
                    left: `${nade.startPosition.x}%`,
                    top: `${nade.startPosition.y}%`,
                    backgroundColor: nadeTypeData?.color
                  }}
                  onClick={() => handleNadeClick(nade)}
                >
                  <div className="nade-tooltip">
                    <strong>{nade.title}</strong>
                    <p>{nade.technique}</p>
                  </div>
                </div>

                <div
                  className={`nade-marker end ${selectedNade?.id === nade.id ? 'active' : ''}`}
                  style={{
                    left: `${nade.endPosition.x}%`,
                    top: `${nade.endPosition.y}%`,
                    backgroundImage: iconSrc ? `url(${iconSrc})` : 'none'
                  }}
                />

                <svg className="trajectory-line" preserveAspectRatio="none">
                  <line
                    x1={`${nade.startPosition.x}%`}
                    y1={`${nade.startPosition.y}%`}
                    x2={`${nade.endPosition.x}%`}
                    y2={`${nade.endPosition.y}%`}
                    stroke={nadeTypeData?.color}
                    strokeWidth={selectedNade?.id === nade.id ? "3" : "2"}
                    strokeDasharray={selectedNade?.id === nade.id ? "none" : "5,5"}
                  />
                </svg>
              </div>
            );
          })}

          <div className="map-info">
            <h2 className="map-name">{map.name}</h2>
            <div className="lineups-count">
              {map.spots.reduce((total, spot) => total + spot.nades.length, 0)} lineups
            </div>
          </div>
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
                <span>Difficulty:</span>
                <span>{selectedNade.difficulty}</span>
              </div>
              <div className="info-item">
                <span>Technique:</span>
                <span>{selectedNade.technique}</span>
              </div>
              <div className="info-item">
                <span>Tickrate:</span>
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
                    <h3 className="full-description-header">Full Instructions:</h3>
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
                          <p><em>Please log in to leave a comment.</em></p>
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
                                    Delete
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <p><em>No comments yet. Be the first to comment!</em></p>
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