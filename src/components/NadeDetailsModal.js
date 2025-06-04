import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate might be needed for login redirect
import { getAuth } from 'firebase/auth';
import { 
  addNadeToFavorites, 
  removeNadeFromFavorites, 
  getUserFavoriteNades,
  recordNadeView,
  getNadeDataForMap,
  addCommentToNade,
  getNadeComments,
  deleteNadeComment
  // TODO: Add comment functions if/when implemented: addCommentToNade, getNadeComments, deleteNadeComment
} from '../services/firebaseService';
import '../styles/NadeDetails.css'; // Reusing the same styles for the modal content

const auth = getAuth();

// Helper function to extract YouTube Video ID from various URL formats
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      if (urlObj.pathname === '/watch') {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.substring(7);
      }
    } else if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.substring(1);
    }
  } catch (e) {
    console.error("Error parsing video URL:", e);
    // Fallback for simple embed URL if parsing fails
    const embedMatch = url.match(/youtube\.com\/embed\/([^?#&]+)/);
    if (embedMatch) return embedMatch[1];
    return null;
  }
  return videoId;
};

function NadeDetailsModal({ mapId, nadeId, currentUser, onClose }) {
  const navigate = useNavigate();
  const [nadeData, setNadeData] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const playerRef = useRef(null); // Ref for the YouTube player instance
  const playerDivRef = useRef(null); // Ref for the div where the player will be mounted
  const [isViewRecorded, setIsViewRecorded] = useState(false); // To track if view is recorded in this modal session
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const playerMountId = `yt-player-mount-${nadeId || Date.now()}`; // Unique ID for the player mount point

  useEffect(() => {
    getNadeDataForMap(mapId).then(data => {
      if (data && data.spots) {
        const nade = data.spots.flatMap(s => s.nades).find(n => n.id === nadeId);
        if (nade) {
          setNadeData(nade);
          const extractedVideoId = getYouTubeVideoId(nade.videoUrl);
          setCurrentVideoId(extractedVideoId);
          setIsViewRecorded(false); // Reset view recorded state when nade changes

          if (currentUser) {
            checkIfFavorite(currentUser.uid, mapId, nadeId);
          } else {
            setIsLoadingFavorite(false);
          }
        } else {
          console.error("Nade not found in modal for:", mapId, nadeId);
          setNadeData(null);
          setCurrentVideoId(null);
        }
      } else {
        console.error("No spots found in the map data for:", mapId);
        setNadeData(null);
        setCurrentVideoId(null);
      }
    }).catch(err => {
      console.error("Error fetching nade data for map:", err);
      setNadeData(null);
      setCurrentVideoId(null);
    });
    // Cleanup function for player will be in a separate useEffect
  }, [mapId, nadeId, currentUser]);

  // YouTube Player API related useEffect
  useEffect(() => {
    if (!currentVideoId) { // Removed playerDivRef.current check here, as the mount point is now by ID
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      return;
    }

    // Function to initialize the player
    const initPlayer = () => {
      if (playerRef.current) { // Destroy existing player if any
        playerRef.current.destroy();
        playerRef.current = null;
      }
      try {
        playerRef.current = new window.YT.Player(playerMountId, { // Use the unique ID of the inner div
          // Removed explicit height and width, CSS will handle via .video-container iframe styles
          videoId: currentVideoId,
          playerVars: {
            playsinline: 1, // Important for iOS
            // modestbranding: 1,
            // rel: 0, // Don't show related videos
          },
          events: {
            'onStateChange': onPlayerStateChange,
            // 'onReady': onPlayerReady, // Optional: if you need to do something when player is ready
          }
        });
      } catch (error) {
        console.error("Error creating YouTube player:", error);
        // This might happen if YT object is not yet available or div is not proper
      }
    };

    // Load YouTube API script if not already loaded
    if (!window.YT) { // Check if YT object exists
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else { // If API is already loaded
      initPlayer();
    }

    // Cleanup: destroy player when component unmounts or videoId changes
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying player during cleanup:", e);
        }
        playerRef.current = null;
      }
    };
  }, [currentVideoId]); // Re-run if videoId changes

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING && !isViewRecorded && currentUser && nadeData) {
      // Video started playing and view not yet recorded for this session
      console.log("Video started playing. Setting 1s timer to record view.");
      setTimeout(() => {
        if (playerRef.current && typeof playerRef.current.getPlayerState === 'function' && playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
          if (!isViewRecorded) { // Double check, in case state changed rapidly
            console.log("1s passed, video still playing. Recording view.");
            recordNadeView(currentUser.uid, mapId, nadeId)
              .then(result => {
                if (result.success) {
                  console.log(`View for ${nadeId} (modal) recorded via player. New count: ${result.newViewCount}`);
                  setIsViewRecorded(true); // Mark as recorded for this session
                }
              })
              .catch(err => console.error("Failed to record view (modal, player):", err));
          }
        } else {
          console.log("1s passed, video no longer playing or player not available. View not recorded.");
        }
      }, 1000); // 1 second
    }
  };

  const checkIfFavorite = async (userId, currentMapId, currentNadeId) => {
    setIsLoadingFavorite(true);
    const favorites = await getUserFavoriteNades(userId);
    if (favorites && !favorites.error) {
      setIsFavorite(favorites.some(fav => fav.mapId === currentMapId && fav.nadeId === currentNadeId));
    } else {
      console.error("Error checking favorites (modal):", favorites.error);
    }
    setIsLoadingFavorite(false);
  };

  const handleToggleFavorite = async () => {
    if (!currentUser || !nadeData) return;
    if (!currentUser) {
      navigate('/login'); // Consider if login redirect is appropriate from a modal
      return;
    }
    setIsLoadingFavorite(true);
    let result;
    if (isFavorite) {
      result = await removeNadeFromFavorites(currentUser.uid, nadeData.mapName, nadeData.id); // Use mapName and nadeId from nadeData
    } else {
      result = await addNadeToFavorites(currentUser.uid, nadeData.mapName, nadeData.id);
    }

    if (result.success) {
      setIsFavorite(!isFavorite);
    } else {
      console.error("Error updating favorite status (modal):", result.error);
    }
    setIsLoadingFavorite(false);
  };

  // Fetch comments when nade changes
  useEffect(() => {
    if (mapId && nadeId) {
      fetchComments();
    }
    // eslint-disable-next-line
  }, [mapId, nadeId]);

  const fetchComments = async () => {
    const result = await getNadeComments(mapId, nadeId);
    if (Array.isArray(result)) {
      setComments(result);
    } else {
      setComments([]);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    setIsSubmittingComment(true);
    const result = await addCommentToNade(
      mapId,
      nadeId,
      currentUser.uid,
      currentUser.displayName || currentUser.email,
      newComment.trim()
    );
    if (result.success && result.comment) {
      setNewComment('');
      fetchComments();
    } else {
      alert('Не вдалося додати коментар.');
    }
    setIsSubmittingComment(false);
  };

  const handleDeleteComment = async (commentId, userId) => {
    if (!currentUser || currentUser.uid !== userId) return;
    const result = await deleteNadeComment(mapId, commentId, userId);
    if (result.success) {
      fetchComments();
    } else {
      alert('Не вдалося видалити коментар.');
    }
  };

  if (!nadeData) {
    // Optional: better loading state within the modal, or rely on parent to not open modal until data is ready
    return (
      <div className="tutorial-modal-overlay" onClick={onClose}> {/* Allow closing by clicking overlay */}
        <div className="tutorial-modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking content */}
          <div className="loading-container">Завантаження даних гранати...</div>
        </div>
      </div>
    );
  }

  const { title, description /*, videoUrl */ } = nadeData; // videoUrl is now handled by currentVideoId and player

  return (
    <div className="tutorial-modal-overlay" onClick={onClose}>
      <div className="tutorial-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tutorial-modal-header">
          <h2>{title} - Tutorial</h2>
          <button className="close-tutorial-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="tutorial-modal-body">
          <div className="modal-layout-container">
            <div className="modal-left-column">
              {/* currentUser && (
                <button 
                  onClick={handleToggleFavorite} 
                  className={`favorite-button modal-favorite-button ${isFavorite ? 'is-favorite' : ''}`}
                  disabled={isLoadingFavorite}
                >
                  {isLoadingFavorite ? 'Обробка...' : (isFavorite ? '★ Забрати з улюблених' : '☆ Додати до улюблених')}
                </button>
              ) */}
              {description && (
                <div className="nade-description">
                  <h3>Повна інструкція:</h3>
                  <p>{description}</p>
                </div>
              )}
              {/* Comments Section */}
              <div className="comments-section">
                <h3>Коментарі</h3>
                <div className="comments-list">
                  {comments.length === 0 && <div className="no-comments">Коментарів ще немає.</div>}
                  {comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-user">{comment.userName || 'Користувач'}</span>
                        <span className="comment-date">{comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleString() : ''}</span>
                        {currentUser && comment.userId === currentUser.uid && (
                          <button className="delete-comment-btn" onClick={() => handleDeleteComment(comment.id, comment.userId)} title="Видалити">×</button>
                        )}
                      </div>
                      <div className="comment-text">{comment.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-right-column">
              {currentVideoId ? (
                <div ref={playerDivRef} className="video-container"> {/* Outer container for aspect ratio */}
                  <div id={playerMountId}></div> {/* Inner div that will be replaced by iframe */}
                </div>
              ) : (
                <div className="video-placeholder">
                  <p>{nadeData && nadeData.videoUrl ? 'Некоректний URL відео або відео не знайдено.' : 'Відео для цієї гранати не надано.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NadeDetailsModal; 