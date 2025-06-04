import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerWithEmailAndPassword } from '../services/firebaseService';
import '../styles/RegisterPage.css';
import { Link } from 'react-router-dom';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirmPassword || !displayName) {
      setError('Будь ласка, заповніть усі поля, включаючи ім\'я.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Паролі не співпадають.');
      return;
    }

    try {
      const result = await registerWithEmailAndPassword(email, password, displayName);
      if (result.error) {
        let errorMessage = "Не вдалося зареєструватися. ";
        if (result.error.code) {
            switch (result.error.code) {
                case 'auth/email-already-in-use':
                    errorMessage += "Цей email вже використовується.";
                    break;
                case 'auth/invalid-email':
                    errorMessage += "Неправильний формат email.";
                    break;
                case 'auth/weak-password':
                    errorMessage += "Пароль занадто слабкий (мінімум 6 символів).";
                    break;
                default:
                    errorMessage += "Спробуйте ще раз.";
            }
        } else {
            errorMessage += result.error.message || 'Помилка реєстрації.';
        }
        setError(errorMessage);
        console.error("Register page error:", result.error);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Не вдалося зареєструватися. Спробуйте ще раз.');
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Реєстрація</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleEmailRegister} className="register-form">
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
          <label htmlFor="confirmPassword">Підтвердіть Пароль</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <label htmlFor="displayName">Ім'я користувача</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-register">Зареєструватися</button>
        </form>
        <button className="btn btn-google">Зареєструватися через Google</button>
        <div className="login-link">
          Вже маєте акаунт? <Link to="/login">Увійти</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage; 