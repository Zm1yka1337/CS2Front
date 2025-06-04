import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import app from '../components/firebase';
import { 
  getUserFavoriteNades, 
  removeNadeFromFavorites,
  getUserVideoViewStats,
  getNadeDataForMap
} from '../services/firebaseService';
import '../styles/UserProfilePage.css';
import NadeDetailsModal from '../components/NadeDetailsModal';

const auth = getAuth(app);
const db = getFirestore(app);

// Винесена функція для отримання назви гранати для статистики переглядів
export const getNadeTitleForViewStat = async (viewKey) => {
  const [mapId, nadeId] = viewKey.split('_');
  const mapData = await getNadeDataForMap(mapId);
  const nadeData = mapData?.spots?.flatMap(s => s.nades).find(n => n.id === nadeId);
  return nadeData ? `${nadeData.title} (Мапа: ${mapData.name})` : `Невідома граната (${viewKey})`;
};

function UserProfilePage() {
  const [userData, setUserData] = useState(null);
  const [favoriteNades, setFavoriteNades] = useState([]);
  const [videoViewStats, setVideoViewStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const [showNadeModal, setShowNadeModal] = useState(false);
  const [selectedNadeForModal, setSelectedNadeForModal] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserProfileData(user.uid);
      } else {
        navigate('/login');
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      fetchUserProfileData(currentUser.uid);
    }
    // eslint-disable-next-line
  }, [showNadeModal]);

  useEffect(() => {
    if (currentUser) {
      getUserVideoViewStats(currentUser.uid).then(stats => {
        setVideoViewStats(stats || {});
      });
    }
  }, [currentUser, showNadeModal]);

  const fetchUserProfileData = async (userId) => {
    setLoading(true);
    setError('');
    try {
      const userDocRef = doc(db, "users", userId);
      const docSnap = await getDoc(userDocRef);

      let profileData;
      if (docSnap.exists()) {
        profileData = docSnap.data();
        setUserData(profileData);

        if (profileData.favorites && profileData.favorites.length > 0) {
            const detailedFavorites = [];
            for (const fav of profileData.favorites) {
                const mapData = await getNadeDataForMap(fav.mapId);
                const nadeData = mapData?.spots?.flatMap(s => s.nades).find(n => n.id === fav.nadeId);
                if (nadeData) {
                  detailedFavorites.push({
                    ...fav,
                    title: nadeData.title,
                    mapName: mapData?.name || 'Unknown Map',
                  });
                }
            }
            setFavoriteNades(detailedFavorites);
        } else {
            setFavoriteNades([]);
        }

        setVideoViewStats(profileData.videoViews || {});

      } else {
        console.warn("Документ користувача не знайдено в Firestore, використовуються дані з Auth.");
        const authUser = auth.currentUser;
        if (authUser) {
            profileData = {
                email: authUser.email,
                displayName: authUser.displayName || authUser.email.split('@')[0],
                photoURL: authUser.photoURL,
                createdAt: authUser.metadata.creationTime 
                             ? new Date(authUser.metadata.creationTime).toISOString() 
                             : 'N/A',
                favorites: [],
                videoViews: {}
            };
            setUserData(profileData);
            setFavoriteNades([]);
            setVideoViewStats({});
        } else {
            setError("Не вдалося отримати дані користувача.");
        }
      }
    } catch (err) {
      console.error("Помилка завантаження даних профілю:", err);
      setError("Не вдалося завантажити дані профілю. Спробуйте оновити сторінку.");
      if (!userData && auth.currentUser) {
        const authUser = auth.currentUser;
        setUserData({
            email: authUser.email,
            displayName: authUser.displayName || authUser.email.split('@')[0],
            photoURL: authUser.photoURL,
            createdAt: authUser.metadata.creationTime ? new Date(authUser.metadata.creationTime).toISOString() : 'N/A',
            favorites: [],
            videoViews: {}
        });
        setFavoriteNades([]);
        setVideoViewStats({});
      }
    }
    setLoading(false);
  };

  const handleRemoveFromFavorites = async (mapId, nadeId) => {
    if (!currentUser) return;
    const result = await removeNadeFromFavorites(currentUser.uid, mapId, nadeId);
    if (result.success) {
      fetchUserProfileData(currentUser.uid);
    } else {
      console.error("Помилка видалення з улюблених:", result.error);
      alert("Не вдалося видалити гранату з улюблених.");
    }
  };

  const handleOpenNadeModal = (mapId, nadeId) => {
    setSelectedNadeForModal({ mapId, nadeId });
    setShowNadeModal(true);
  };

  const handleCloseNadeModal = () => {
    setShowNadeModal(false);
    setSelectedNadeForModal(null);
  };

  if (loading) {
    return <div className="loading-container">Завантаження профілю...</div>;
  }

  if (error && !userData) {
    return <div className="error-container">{error}</div>;
  }
  
  if (!userData) {
    return <div className="loading-container">Дані користувача не знайдено. Перенаправлення...</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'Невідомо';
    try {
      if (typeof dateString === 'object' && dateString.seconds) {
        return new Date(dateString.seconds * 1000).toLocaleDateString();
      }
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Невідома дата';
    }
  };

  const totalViews = Object.values(videoViewStats).reduce((sum, count) => sum + count, 0);

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <div className="profile-header">
          {userData.photoURL && (
            <img src={userData.photoURL} alt={userData.displayName || 'Avatar'} className="profile-avatar" />
          )}
          <div className="profile-summary">
            <h1>{userData.displayName || 'Профіль'}</h1>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Дата реєстрації:</strong> {formatDate(userData.createdAt)}</p>
          </div>
        </div>
        
        {error && <p className="error-message full-width-error">{error}</p>}

        <div className="profile-section favorites-section">
          <h2>Улюблені гранати ({favoriteNades.length})</h2>
          {favoriteNades.length > 0 ? (
            <ul className="favorites-list">
              {favoriteNades.map(nade => (
                <li key={`${nade.mapId}-${nade.nadeId}`} className="favorite-item">
                  <div 
                    className="favorite-link" 
                    onClick={() => handleOpenNadeModal(nade.mapId, nade.nadeId)}
                    style={{cursor: 'pointer'}}
                  >
                    <span className="favorite-nade-title">{nade.title}</span>
                    <span className="favorite-map-name">(Мапа: {nade.mapName})</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveFromFavorites(nade.mapId, nade.nadeId)}
                    className="remove-favorite-button"
                  >
                    Видалити
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>У вас ще немає улюблених гранат.</p>
          )}
        </div>

        <div className="profile-section video-stats-section">
          <h2>Статистика переглядів відео (Всього: {totalViews})</h2>
          {Object.keys(videoViewStats).length > 0 ? (
            <ul className="video-stats-list">
              {Object.entries(videoViewStats)
                .sort(([, countA], [, countB]) => countB - countA)
                .map(([nadeKey, count]) => (
                <li key={nadeKey} className="video-stat-item">
                  <AsyncNadeTitle viewKey={nadeKey} />
                  <span className="video-stat-count">Переглядів: {count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Ви ще не переглядали жодного відео з туторіалами.</p>
          )}
        </div>

      </div>
      {showNadeModal && selectedNadeForModal && (
        <NadeDetailsModal 
          mapId={selectedNadeForModal.mapId}
          nadeId={selectedNadeForModal.nadeId}
          currentUser={currentUser}
          onClose={handleCloseNadeModal}
        />
      )}
    </div>
  );
}

function AsyncNadeTitle({ viewKey }) {
  const [title, setTitle] = React.useState('Завантаження...');
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const t = await getNadeTitleForViewStat(viewKey);
      if (mounted) setTitle(t);
    })();
    return () => { mounted = false; };
  }, [viewKey]);
  return <span className="video-stat-title">{title}</span>;
}

export default UserProfilePage; 