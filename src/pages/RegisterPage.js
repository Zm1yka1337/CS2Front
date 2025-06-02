import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerWithEmailAndPassword } from '../services/firebaseService';
import '../styles/RegisterPage.css';

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
        <h2>Реєстрація</h2>
        <form onSubmit={handleEmailRegister}>
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
          <div className="form-group">
            <label htmlFor="confirmPassword">Підтвердіть Пароль</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Підтвердіть пароль"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="displayName">Ім'я</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ваше ім'я"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn btn-primary">Зареєструватися</button>
        </form>
        <p className="switch-form-text">
          Вже є акаунт? <a href="/login">Увійти</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage; 