import React, { useState } from 'react';
import '../App.css';
import {
  Briefcase,
  Flame,
  Building,
  Calendar,
  ExternalLink,
  Check,
  Tag,
  Laptop,
  Database,
  Users,
  MapPin,
  Globe,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Video,
  Award,
  XCircle,
  MinusCircle,
  GripVertical
} from 'lucide-react';

/**
 * Status mapping com cores, ícones e rótulos
 */
export const STATUS_CONFIG = {
  IN_PROGRESS: {
    label: 'Em andamento',
    icon: CheckCircle2,
    color: '#4ade80',
    bg: 'rgba(34, 197, 94, 0.14)',
    border: 'rgba(34, 197, 94, 0.32)'
  },
  WAITING_RESPONSE: {
    label: 'Aguardando retorno',
    icon: Clock,
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.14)',
    border: 'rgba(245, 158, 11, 0.32)'
  },
  WAITING_INTERVIEW: {
    label: 'Esperando entrevista',
    icon: Calendar,
    color: '#c084fc',
    bg: 'rgba(168, 85, 247, 0.14)',
    border: 'rgba(168, 85, 247, 0.32)'
  },
  INTERVIEW: {
    label: 'Em entrevista',
    icon: Video,
    color: '#818cf8',
    bg: 'rgba(99, 102, 241, 0.14)',
    border: 'rgba(99, 102, 241, 0.32)'
  },
  APPROVED: {
    label: 'Aprovado',
    icon: Award,
    color: '#34d399',
    bg: 'rgba(16, 185, 129, 0.18)',
    border: 'rgba(16, 185, 129, 0.35)'
  },
  REJECTED: {
    label: 'Reprovado',
    icon: XCircle,
    color: '#f87171',
    bg: 'rgba(239, 68, 68, 0.14)',
    border: 'rgba(239, 68, 68, 0.32)'
  },
  WITHDRAWN: {
    label: 'Desistência',
    icon: MinusCircle,
    color: '#9ca3af',
    bg: 'rgba(156, 163, 175, 0.14)',
    border: 'rgba(156, 163, 175, 0.32)'
  }
};

/**
 * Componente de Cartão de Candidatura Quadrado com suporte a Drag & Drop
 * O número ordinal (#1, #2...) reflete a prioridade ordenada no grid
 */
export default function ApplicationCard({
  application,
  index,
  onEdit,
  onDelete,
  onUpdateNotes,
  onDragStartCard,
  onDragOverCard,
  onDropCard,
  onDragEndCard,
  isDragging,
  isDragOver
}) {
  const [notes, setNotes] = useState(application.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Status configuration
  const currentStatus = STATUS_CONFIG[application.status] || STATUS_CONFIG.IN_PROGRESS;
  const StatusIcon = currentStatus.icon;

  // Formata data de cadastro
  const formattedDate = application.createdAt
    ? new Date(application.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : '20/11/2026';

  // Extrai cargo ou utiliza valor padrão/descrição
  const roleTitle = application.role || application.description || 'Desenvolvedor Full Stack';

  // Salva notas no blur
  const handleBlurNotes = async () => {
    if (notes !== (application.notes || '')) {
      setIsSavingNotes(true);
      try {
        await onUpdateNotes(application.id, notes);
      } finally {
        setIsSavingNotes(false);
      }
    }
  };

  // Drag start handler com proteção para inputs, links e botões
  const handleDragStart = (e) => {
    if (
      e.target.tagName === 'TEXTAREA' ||
      e.target.tagName === 'INPUT' ||
      e.target.closest('button') ||
      e.target.closest('a')
    ) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', application.id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStartCard) onDragStartCard(application.id);
  };

  // Número ordinal de prioridade
  const displayPriority = application.priority ?? (index !== undefined ? index + 1 : 1);

  return (
    <div
      className={`manta-app-card ${isDragging ? 'is-dragging' : ''} ${isDragOver ? 'is-drag-over' : ''}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (onDragOverCard) onDragOverCard(application.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (onDropCard) onDropCard(application.id);
      }}
      onDragEnd={() => {
        if (onDragEndCard) onDragEndCard();
      }}
      title="Arraste o cartão para reorganizar a prioridade no grid"
    >
      {/* Top Badges Row */}
      <div className="card-top-row">
        <div className="top-pills-group">
          {/* Categoria */}
          <span className="pill-badge pill-category">
            <Briefcase size={13} />
            <span>{application.category || 'Vaga de Tecnologia'}</span>
          </span>

          {/* Modelo de Trabalho */}
          <span className="pill-badge pill-work-model">
            <Flame size={13} />
            <span>{application.workModel || 'Home Office'}</span>
          </span>
        </div>

        {/* Status + Drag Handle + Priority (#1, #2, etc.) */}
        <div className="top-status-group">
          <div
            className="status-pill"
            style={{
              backgroundColor: currentStatus.bg,
              borderColor: currentStatus.border,
              color: currentStatus.color
            }}
          >
            <StatusIcon size={14} />
            <span>{currentStatus.label}</span>
          </div>

          <div className="priority-container" title="Prioridade ordinal (arraste para alterar)">
            <GripVertical size={16} className="drag-handle-icon" />
            <span className="priority-indicator">#{displayPriority}</span>
          </div>
        </div>
      </div>

      {/* Main Role Title & External Link */}
      <div className="card-title-section">
        <div className="title-row">
          {application.url ? (
            <a
              href={application.url}
              target="_blank"
              rel="noopener noreferrer"
              className="role-link"
              title="Acessar link da vaga"
            >
              <h3 className="role-heading">{roleTitle}</h3>
              <ExternalLink size={18} className="external-link-icon" />
            </a>
          ) : (
            <h3 className="role-heading">{roleTitle}</h3>
          )}

          {/* Menu de Ações rápidas */}
          <div className="card-actions-wrapper">
            <button
              type="button"
              className="action-icon-btn"
              onClick={() => onEdit(application)}
              title="Editar candidatura"
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              className="action-icon-btn delete-btn"
              onClick={() => onDelete(application.id)}
              title="Excluir candidatura"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Empresa */}
        <div className="company-info-row">
          <Building size={16} className="info-icon" />
          <span className="company-name">{application.company || 'Empresa'}</span>
        </div>

        {/* Data de Cadastro */}
        <div className="date-info-row">
          <Calendar size={14} className="info-icon" />
          <span className="date-text">Vaga cadastrada em: {formattedDate}</span>
        </div>
      </div>

      {/* Customizable Attribute Pills Grid */}
      <div className="attributes-pills-wrap">
        {/* Presencial / Remoto */}
        <span className="attr-pill attr-green">
          <Check size={13} strokeWidth={3} />
          <span>{application.locationType || 'Presencial'}</span>
        </span>

        {/* Tipo de Contrato */}
        <span className="attr-pill attr-green">
          <Check size={13} strokeWidth={3} />
          <span>{application.contractType || 'Tempo integral'}</span>
        </span>

        {/* Área */}
        {application.area && (
          <span className="attr-pill attr-gray">
            <Tag size={13} />
            <span>{application.area}</span>
          </span>
        )}

        {/* Porte da Empresa */}
        {application.companySize && (
          <span className="attr-pill attr-gray">
            <Users size={13} />
            <span>{application.companySize}</span>
          </span>
        )}

        {/* Localização */}
        {application.location && (
          <span className="attr-pill attr-gray">
            <MapPin size={13} />
            <span>{application.location}</span>
          </span>
        )}

        {/* Tech 1 (se existente) */}
        {application.tech1 && (
          <span className="attr-pill attr-gray">
            <Laptop size={13} />
            <span>{application.tech1}</span>
          </span>
        )}

        {/* Tech 2 (se existente) */}
        {application.tech2 && (
          <span className="attr-pill attr-gray">
            <Database size={13} />
            <span>{application.tech2}</span>
          </span>
        )}

        {/* Website / Link */}
        {application.url && (
          <a
            href={application.url}
            target="_blank"
            rel="noopener noreferrer"
            className="attr-pill attr-gray attr-link"
          >
            <Globe size={13} />
            <span className="truncate-url">
              {application.url.replace(/^https?:\/\//, '')}
            </span>
          </a>
        )}
      </div>

      {/* Bottom Notes Section (Editável diretamente no card) */}
      <div className="card-notes-section">
        <div className="notes-header">
          <label htmlFor={`notes-${application.id}`} className="notes-title">
            Notas
          </label>
          {isSavingNotes && <span className="notes-saving-badge">Salvando...</span>}
        </div>
        <textarea
          id={`notes-${application.id}`}
          className="notes-textarea"
          placeholder="Adicione suas observações sobre esta candidatura..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleBlurNotes}
          rows={2}
        />
      </div>
    </div>
  );
}
