import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { authService } from './services/api';

/**
 * Componente Raiz da Aplicação
 * Gerencia a navegação entre as páginas (Login, Register, Dashboard)
 * e valida a sessão ativa com o Backend
 */
export default function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' | 'register' | 'dashboard'
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function verifySession() {
      // 1. Verifica se houve retorno do Google OAuth com erro na URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlError = urlParams.get('error');

      if (urlError) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // 2. Tenta recuperar os dados da sessão ativa no Backend via Cookie HttpOnly
      try {
        const response = await authService.getMe();
        if (response && response.data) {
          setCurrentUser(response.data);
          setCurrentPage('dashboard');
        }
      } catch (err) {
        // Usuário não autenticado, permanece na tela de login
      } finally {
        setCheckingAuth(false);
      }
    }

    verifySession();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  if (checkingAuth) {
    return (
      <div className="page-wrapper" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Carregando Manta...</p>
      </div>
    );
  }

  if (currentPage === 'dashboard' && currentUser) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
  }

  if (currentPage === 'register') {
    return (
      <Register
        onNavigate={(page) => setCurrentPage(page)}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  return (
    <Login
      onNavigate={(page) => setCurrentPage(page)}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}
