import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithGoogle } from '../services/firebaseService';
import '../styles/LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Будь ласка, введіть email та пароль.');
      return;
    }
    try {
      const result = await signInWithEmailAndPassword(email, password);
      if (result.error) {
        let errorMessage = "Помилка входу. ";
        if (result.error.code) {
          switch (result.error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              errorMessage += "Неправильний email або пароль.";
              break;
            case 'auth/invalid-email':
              errorMessage += "Неправильний формат email.";
              break;
            case 'auth/user-disabled':
              errorMessage += "Обліковий запис користувача вимкнено.";
              break;
            default:
              errorMessage += "Перевірте ваші дані або спробуйте пізніше.";
          }
        } else {
          errorMessage += result.error.message || "Перевірте ваші дані.";
        }
        setError(errorMessage);
        console.error("Login page error:", result.error);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Не вдалося увійти. Спробуйте ще раз.');
      console.error("Login error:", err);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error.message || 'Помилка входу через Google.');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Не вдалося увійти через Google. Спробуйте ще раз.');
      console.error("Google login error:", err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Вхід</h2>
        <form onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ваш email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ваш пароль"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn btn-primary">Увійти</button>
        </form>
        <p className="or-divider"><span>АБО</span></p>
        <button onClick={handleGoogleLogin} className="btn btn-google">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" />
          Увійти через Google
        </button>
        <p className="switch-form-text">
          Немає акаунту? <a href="/register">Зареєструватися</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage; 