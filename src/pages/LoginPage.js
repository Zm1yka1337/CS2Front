import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithGoogle } from '../services/firebaseService';
import '../styles/LoginPage.css';
import { Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Будь ласка, введіть email та пароль.');
      return;
    }
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error.message || 'Помилка входу через Google.');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Не вдалося увійти через Google. Спробуйте ще раз.');
      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Вхід</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleEmailLogin} className="login-form">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-login" disabled={loading}>
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>
        <button className="btn btn-google" onClick={handleGoogleLogin} disabled={loading}>
          Увійти через Google
        </button>
        <div className="register-link">
          Ще не маєте акаунту? <Link to="/register">Зареєструватися</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 