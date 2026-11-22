import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';

/**
 * Página de Cadastro (Register / Signup)
 * Fonte: Sansation
 * Suporta autenticação híbrida: Google OAuth e E-mail/Senha convencional
 */
export default function Register({ onNavigate, onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        name: name.trim() || undefined,
        email: email.trim(),
        password
      });

      setSuccessMessage('Conta criada com sucesso! Redirecionando...');

      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess(response.user);
        }
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || 'Erro ao criar conta. Tente novamente.');
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

        <span className="header-tagline">SUA CARREIRA, EM MOVIMENTO</span>
      </header>

      {/* Main Grid */}
      <main className="main-content">
        {/* Lado Esquerdo (Hero com Benefícios) */}
        <section className="hero-column">
          <span className="hero-tag">SEU PRÓXIMO PASSO, EM VISTA.</span>
          <h1 className="hero-heading">
            Sua carreira,<br />mais organizada.
          </h1>
          <p className="hero-description">
            Centralize suas candidaturas e tenha clareza para seguir em direção à próxima oportunidade.
          </p>

          <div style={{ marginTop: '12px' }}>
            <div className="benefit-row">
              <span className="benefit-badge">01</span>
              <div>
                <h4 className="benefit-title">Todas as oportunidades, em um só lugar</h4>
                <p className="benefit-desc">Reúna vagas de diferentes plataformas no seu painel.</p>
              </div>
            </div>

            <div className="benefit-row">
              <span className="benefit-badge">02</span>
              <div>
                <h4 className="benefit-title">Cada etapa sob controle</h4>
                <p className="benefit-desc">Acompanhe o status de cada processo seletivo.</p>
              </div>
            </div>

            <div className="benefit-row">
              <span className="benefit-badge">03</span>
              <div>
                <h4 className="benefit-title">Tudo pronto para o próximo passo</h4>
                <p className="benefit-desc">Guarde currículos e anotações em cada candidatura.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Lado Direito (Card de Cadastro) */}
        <section className="card-column">
          <div className="auth-card-box">
            <h2 className="card-heading">Crie sua conta no Manta</h2>
            <p className="card-subheading">
              Um espaço para suas candidaturas. Mais organização para sua próxima conquista.
            </p>

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
              <span>ou cadastre-se com e-mail</span>
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

            {/* Formulário de Cadastro */}
            <form onSubmit={handleSubmit} className="auth-form-container" noValidate>
              <div className="field-group">
                <label htmlFor="register-name" className="field-label">Nome completo</label>
                <div className="field-input-wrapper">
                  <span className="field-leading-icon">
                    <User size={18} />
                  </span>
                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-input"
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="register-email" className="field-label">E-mail</label>
                <div className="field-input-wrapper">
                  <span className="field-leading-icon">
                    <Mail size={18} />
                  </span>
                  <input
                    id="register-email"
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
                <label htmlFor="register-password" className="field-label">Senha</label>
                <div className="field-input-wrapper">
                  <span className="field-leading-icon">
                    <Lock size={18} />
                  </span>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    placeholder="Mínimo de 6 caracteres"
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

              {/* Botão Submit */}
              <button
                type="submit"
                disabled={loading}
                className="main-action-btn"
              >
                <span>{loading ? 'Criando conta...' : 'Criar minha conta'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Rodapé do Card */}
            <div className="card-bottom-info">
              <div className="card-switch-prompt">
                <span>Já possui uma conta?</span>
                <button
                  type="button"
                  className="card-switch-action"
                  onClick={() => onNavigate('login')}
                >
                  Entrar na conta
                </button>
              </div>

              <div className="security-badge">
                <Shield size={14} />
                <span>Seu acesso, protegido.</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Page Footer */}
      <footer className="site-footer">
        <span>© 2026 Manta. Sua carreira, mais organizada.</span>
        <div className="footer-nav">
          <a href="#privacidade" onClick={(e) => e.preventDefault()}>Privacidade</a>
          <a href="#termos" onClick={(e) => e.preventDefault()}>Termos de uso</a>
          <a href="#idioma" onClick={(e) => e.preventDefault()}>PT-BR</a>
        </div>
      </footer>
    </div>
  );
}
