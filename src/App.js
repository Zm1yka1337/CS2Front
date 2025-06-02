import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import MapDetails from './components/MapDetails';
import NadeDetails from './components/NadeDetails';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import { onAuthStatusChanged } from './services/firebaseService';
import './styles/App.css';

// Компонент для перевірки статусу аутентифікації
const AuthStatusChecker = ({ children, currentUser }) => {
  if (currentUser === undefined) {
    // Стан аутентифікації ще не визначено (початкове завантаження)
    return <div>Перевірка автентифікації...</div>; 
  }
  if (!currentUser) {
    // Користувач не увійшов, перенаправлення на логін
    return <Navigate to="/login" replace />;
  }
  // Користувач увійшов, рендеримо дочірній компонент
  return children;
};

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme : 'light'; // Default to light theme
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStatusChanged((user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (loadingAuth) {
    return <div>Завантаження...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Navbar toggleTheme={toggleTheme} currentTheme={theme} currentUser={currentUser} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map/:mapId" element={<MapDetails />} />
            <Route path="/map/:mapId/nade/:nadeId" element={<NadeDetails />} />
            <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/profile" />} />
            <Route path="/register" element={!currentUser ? <RegisterPage /> : <Navigate to="/profile" />} />
            <Route 
              path="/profile"
              element={
                <AuthStatusChecker currentUser={currentUser}>
                  <UserProfilePage />
                </AuthStatusChecker>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
