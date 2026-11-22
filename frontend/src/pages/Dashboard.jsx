import React, { useState, useEffect } from 'react';
import '../App.css';
import {
  Plus,
  Search,
  Filter,
  LogOut,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  LayoutGrid
} from 'lucide-react';
import ApplicationCard, { STATUS_CONFIG } from '../components/ApplicationCard';
import ApplicationModal from '../components/ApplicationModal';
import { authService, applicationsService } from '../services/api';

/**
 * Página Principal do Manta — Grid de Candidaturas com Atributos Personalizáveis
 * Layout fiel ao design "Cartão de Candidatura Manta.png" e Dark Theme
 * Suporta Drag & Drop para reorganizar prioridades ordinais (#1, #2, ...)
 */
export default function Dashboard({ user, onLogout }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [notification, setNotification] = useState(null);

  // Estados de Drag & Drop
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [dragOverCardId, setDragOverCardId] = useState(null);

  // Carrega as candidaturas do usuário ao montar e ordena por prioridade ordinal
  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationsService.getAll();
      const rawList = res.data || [];

      // Ordena por prioridade ascendente (1, 2, 3...)
      const sorted = [...rawList].sort((a, b) => {
        const pA = a.priority !== undefined && a.priority !== null && a.priority > 0 ? a.priority : 9999;
        const pB = b.priority !== undefined && b.priority !== null && b.priority > 0 ? b.priority : 9999;
        if (pA !== pB) return pA - pB;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      // Normaliza prioridades ordinais 1..N
      const normalized = sorted.map((app, idx) => ({
        ...app,
        priority: idx + 1
      }));

      setApplications(normalized);
    } catch (err) {
      console.error('Erro ao buscar candidaturas:', err);
      showNotification('error', 'Não foi possível carregar as candidaturas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Salvar (Criar ou Atualizar)
  const handleSaveApplication = async (formData) => {
    try {
      if (editingApplication) {
        // Atualiza
        const updated = await applicationsService.update(editingApplication.id, formData);
        setApplications((prev) =>
          prev.map((app) => (app.id === editingApplication.id ? { ...app, ...formData, ...updated.data } : app))
        );
        showNotification('success', 'Candidatura atualizada com sucesso!');
      } else {
        // Nova candidatura: atribui a próxima prioridade ordinal
        const newPriority = applications.length + 1;
        const payload = {
          ...formData,
          priority: newPriority
        };
        const created = await applicationsService.create(payload);
        const newApp = created.data || {
          id: Date.now().toString(),
          ...payload,
          createdAt: new Date()
        };
        setApplications((prev) => [...prev, newApp]);
        showNotification('success', 'Candidatura adicionada com sucesso!');
      }
    } catch (err) {
      showNotification('error', err.message || 'Erro ao salvar candidatura.');
      throw err;
    }
  };

  // Drag & Drop: Manipuladores para reordenação
  const handleCardDragStart = (id) => {
    setDraggedCardId(id);
  };

  const handleCardDragOver = (id) => {
    if (draggedCardId !== id && dragOverCardId !== id) {
      setDragOverCardId(id);
    }
  };

  const handleCardDrop = async (targetId) => {
    if (!draggedCardId || draggedCardId === targetId) {
      setDraggedCardId(null);
      setDragOverCardId(null);
      return;
    }

    const sourceIdx = applications.findIndex((a) => a.id === draggedCardId);
    const targetIdx = applications.findIndex((a) => a.id === targetId);

    if (sourceIdx === -1 || targetIdx === -1) {
      setDraggedCardId(null);
      setDragOverCardId(null);
      return;
    }

    const reordered = [...applications];
    const [moved] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    // Recalcula números ordinais (#1, #2, #3...)
    const updated = reordered.map((app, idx) => ({
      ...app,
      priority: idx + 1
    }));

    setApplications(updated);
    setDraggedCardId(null);
    setDragOverCardId(null);

    // Sincroniza alterações de prioridade no backend
    try {
      const updates = updated
        .filter((app) => {
          const original = applications.find((a) => a.id === app.id);
          return !original || original.priority !== app.priority;
        })
        .map((app) => applicationsService.update(app.id, { priority: app.priority }));

      if (updates.length > 0) {
        await Promise.allSettled(updates);
      }
    } catch (err) {
      console.error('Erro ao sincronizar prioridades:', err);
    }
  };

  const handleCardDragEnd = () => {
    setDraggedCardId(null);
    setDragOverCardId(null);
  };

  // Atualizar apenas notas inline (ao sair do campo)
  const handleUpdateNotes = async (id, newNotes) => {
    try {
      await applicationsService.update(id, { notes: newNotes });
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, notes: newNotes } : app))
      );
      showNotification('success', 'Nota salva.');
    } catch (err) {
      showNotification('error', 'Não foi possível salvar a nota.');
    }
  };

  // Excluir candidatura
  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Tem certeza de que deseja excluir esta candidatura?')) return;

    try {
      await applicationsService.remove(id);
      const remaining = applications.filter((app) => app.id !== id);
      // Renormaliza prioridades após remoção
      const renormalized = remaining.map((app, idx) => ({
        ...app,
        priority: idx + 1
      }));
      setApplications(renormalized);
      showNotification('success', 'Candidatura excluída.');
    } catch (err) {
      showNotification('error', err.message || 'Erro ao excluir candidatura.');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingApplication(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (app) => {
    setEditingApplication(app);
    setModalOpen(true);
  };

  const handleSignout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Erro ao sair:', err);
    } finally {
      if (onLogout) onLogout();
    }
  };

  // Filtragem local por busca e status
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      (app.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.role || app.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-container">
      {/* Top Header — Logo sem a tagline-badge */}
      <header className="dashboard-header">
        <div className="logo-group">
          <img src="/manta-logo.png" alt="Manta Logo" className="logo-image" />
          <span className="logo-text">Manta</span>
        </div>

        <div className="user-profile-controls">
          <div className="user-info-pill">
            {user?.picture ? (
              <img src={user.picture} alt={user.name || 'Foto'} className="header-avatar" />
            ) : (
              <div className="header-avatar-placeholder">
                {(user?.name || user?.email || 'M').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="user-display-name">{user?.name || user?.email}</span>
          </div>

          <button
            onClick={handleSignout}
            className="action-icon-btn logout-header-btn"
            title="Sair da conta"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Hero & Controls Section */}
      <section className="dashboard-toolbar-section">
        <div className="toolbar-top">
          <div>
            <h1 className="dashboard-page-title">Suas Candidaturas</h1>
            <p className="dashboard-page-desc">
              Gerencie seus processos seletivos. Arraste os cards para reorganizar a prioridade (#1, #2...).
            </p>
          </div>

          <button onClick={handleOpenCreateModal} className="btn-primary-add">
            <Plus size={18} />
            <span>Nova Candidatura</span>
          </button>
        </div>

        {/* Notificações Flutuantes */}
        {notification && (
          <div
            className={`notification-banner ${
              notification.type === 'error' ? 'notification-error' : 'notification-success'
            }`}
            style={{ marginTop: '16px' }}
          >
            {notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Search Bar & Status Filter Tabs estilizadas com SVG Icons */}
        <div className="filters-bar">
          <div className="search-box-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por empresa, cargo ou tecnologia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="status-tabs-scroll">
            {/* Aba: Todas */}
            <button
              type="button"
              className={`status-tab ${selectedStatus === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('ALL')}
            >
              <LayoutGrid size={15} className="tab-svg-icon" />
              <span>Todas</span>
              <span className="tab-count">{applications.length}</span>
            </button>

            {/* Abas individuais de status com SVG Icons correspondentes */}
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const count = applications.filter((a) => a.status === key).length;
              const StatusSvg = config.icon;
              const isActive = selectedStatus === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`status-tab ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedStatus(key)}
                  style={
                    isActive
                      ? {
                          backgroundColor: config.bg,
                          borderColor: config.border,
                          color: config.color,
                          boxShadow: `0 4px 16px ${config.bg}`
                        }
                      : {}
                  }
                >
                  <StatusSvg
                    size={15}
                    className="tab-svg-icon"
                    style={{ color: config.color }}
                  />
                  <span>{config.label}</span>
                  {count > 0 && (
                    <span
                      className="tab-count"
                      style={
                        isActive
                          ? {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              color: '#ffffff'
                            }
                          : {}
                      }
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid de Candidaturas Quadradas com Drag & Drop */}
      <main className="cards-grid-main">
        {loading ? (
          <div className="empty-state-box">
            <p style={{ color: 'var(--text-secondary)' }}>Carregando suas candidaturas...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="empty-state-box">
            <Briefcase size={40} className="empty-icon" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              {applications.length === 0
                ? 'Nenhuma candidatura cadastrada ainda'
                : 'Nenhuma candidatura encontrada com os filtros atuais'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', marginBottom: '20px', fontSize: '0.95rem' }}>
              {applications.length === 0
                ? 'Comece agora adicionando a primeira vaga do seu processo seletivo para organizar seus próximos passos.'
                : 'Tente alterar a busca ou o status selecionado acima.'}
            </p>
            {applications.length === 0 && (
              <button onClick={handleOpenCreateModal} className="btn-primary-add">
                <Plus size={18} />
                <span>Adicionar Primeira Vaga</span>
              </button>
            )}
          </div>
        ) : (
          <div className="applications-grid">
            {filteredApplications.map((app, index) => (
              <ApplicationCard
                key={app.id}
                application={app}
                index={index}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteApplication}
                onUpdateNotes={handleUpdateNotes}
                onDragStartCard={handleCardDragStart}
                onDragOverCard={handleCardDragOver}
                onDropCard={handleCardDrop}
                onDragEndCard={handleCardDragEnd}
                isDragging={draggedCardId === app.id}
                isDragOver={dragOverCardId === app.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de Criação / Edição */}
      <ApplicationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveApplication}
        applicationToEdit={editingApplication}
      />

      {/* Page Footer */}
      <footer className="site-footer" style={{ marginTop: '60px' }}>
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
