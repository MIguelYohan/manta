import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';

/**
 * Página de Login — Baseada fielmente no design de referência
 * Fonte: Sansation
 * Suporta autenticação híbrida: Google OAuth e E-mail/Senha convencional
 */
export default function Login({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Carrega e-mail salvo previamente caso o usuário tenha marcado "Lembrar de mim"
  useEffect(() => {
    const savedEmail = localStorage.getItem('manta_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        email: email.trim(),
        password
      });

      // Gerencia "Lembrar de mim"
      if (rememberMe) {
        localStorage.setItem('manta_remembered_email', email.trim());
      } else {
        localStorage.removeItem('manta_remembered_email');
      }

      setSuccessMessage('Login realizado com sucesso! Redirecionando...');

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(response.user);
        }
      }, 600);
    } catch (err) {
      setErrorMessage(err.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Top Header */}
      <header className="site-header">
        <div className="logo-group" onClick={() => onNavigate('login')}>
          <img src="/manta-logo.png" alt="Manta Logo" className="logo-image" />
          <span className="logo-text">Manta</span>
        </div>

        <div className="header-action-text">
          <span>Ainda não tem uma conta?</span>
          <button
            type="button"
            className="header-action-link"
            onClick={() => onNavigate('register')}
          >
            Criar conta ↗
          </button>
        </div>
      </header>

      {/* Main Grid: Left Hero + Right Auth Card */}
      <main className="main-content">
        {/* Lado Esquerdo (Hero) */}
        <section className="hero-column">
          <h1 className="hero-heading">
            Todas as suas vagas<br />em um só lugar.
          </h1>
          <p className="hero-description">
            Acompanhe o andamento dos seus processos seletivos, organize entrevistas e tenha clareza em cada etapa da sua busca por emprego.
          </p>
          <div className="hero-subtag">
            SEUS PROCESSOS SELETIVOS SOB CONTROLE.
          </div>
        </section>

        {/* Lado Direito (Card de Login) */}
        <section className="card-column">
          <div className="auth-card-box">
            <h2 className="card-heading">Acesse sua conta</h2>
            <p className="card-subheading">Entre para gerenciar suas vagas e candidaturas.</p>

            {/* Botão Oficial do Google OAuth */}
            <a href={authService.loginWithGoogleUrl} className="google-auth-button">
              <svg className="google-svg-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com Google</span>
            </a>

            {/* Separador */}
            <div className="form-separator">
              <span>ou entre com e-mail</span>
            </div>

            {/* Alertas */}
            {errorMessage && (
              <div className="notification-banner notification-error">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="notification-banner notification-success">
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Formulário de Login Convencional */}
            <form onSubmit={handleSubmit} className="auth-form-container" noValidate>
              <div className="field-group">
                <label htmlFor="login-email" className="field-label">E-mail</label>
                <div className="field-input-wrapper">
                  <span className="field-leading-icon">
                    <Mail size={18} />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-input"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="login-password" className="field-label">Senha</label>
                <div className="field-input-wrapper">
                  <span className="field-leading-icon">
                    <Lock size={18} />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="password-toggle-btn"
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Opções: Lembrar de mim e Esqueceu a senha */}
              <div className="aux-options-row">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Lembrar de mim</span>
                </label>
                <a
                  href="#recuperar-senha"
                  className="forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setErrorMessage('Para redefinir sua senha, utilize a redefinição via e-mail ou entre com o Google.');
                  }}
                >
                  Esqueceu a senha?
                </a>
              </div>

              {/* Botão Submit */}
              <button
                type="submit"
                disabled={loading}
                className="main-action-btn"
              >
                <span>{loading ? 'Entrando...' : 'Entrar na conta'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Rodapé do Card */}
            <div className="card-bottom-info">
              <div className="card-switch-prompt">
                <span>Novo por aqui?</span>
                <button
                  type="button"
                  className="card-switch-action"
                  onClick={() => onNavigate('register')}
                >
                  Crie sua conta
                </button>
              </div>

              <div className="security-badge">
                <Shield size={14} />
                <span>Suas candidaturas salvas com segurança.</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Page Footer */}
      <footer className="site-footer">
        <span>© 2026 Manta — Gerenciador de Candidaturas. Todos os direitos reservados.</span>
        <div className="footer-nav">
          <a href="#privacidade" onClick={(e) => e.preventDefault()}>Privacidade</a>
          <a href="#termos" onClick={(e) => e.preventDefault()}>Termos de uso</a>
          <a href="#idioma" onClick={(e) => e.preventDefault()}>PT-BR</a>
        </div>
      </footer>
    </div>
  );
}
