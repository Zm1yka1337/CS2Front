import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/firebaseService';
import '../styles/Navbar.css';

function Navbar({ currentUser, toggleTheme, currentTheme }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          CS2 Гранати
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Карти
          </Link>
          <Link 
            to="/theory" 
            className={location.pathname === '/theory' ? 'active' : ''}
          >
            Теорія
          </Link>
        </div>
        <button onClick={toggleTheme} className="theme-toggle-button" aria-label="Toggle theme">
          <img 
            src="/dark-light/moon.png" 
            alt="Moon icon, switch to dark theme" 
            className={`theme-icon moon-icon ${currentTheme === 'light' ? 'visible' : 'hidden'}`} 
          />
          <img 
            src="/dark-light/sun.png" 
            alt="Sun icon, switch to light theme" 
            className={`theme-icon sun-icon ${currentTheme === 'dark' ? 'visible' : 'hidden'}`} 
          />
        </button>
        <div className="navbar-auth">
          {currentUser ? (
            <>
              <Link 
                to="/profile" 
                className={`nav-link-profile ${location.pathname === '/profile' ? 'active' : ''}`}>
                Профіль ({currentUser.displayName || currentUser.email.split('@')[0]})
              </Link>
              <button onClick={handleLogout} className="btn btn-logout">
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-login">
                Вхід
              </Link>
              <Link to="/register" className="btn btn-register">
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 