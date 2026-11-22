import React, { useState, useEffect } from 'react';
import '../App.css';
import { X, Briefcase, Building, Link2, AlertCircle } from 'lucide-react';
import { STATUS_CONFIG } from './ApplicationCard';

/**
 * Modal simplificado para criação e edição de candidaturas
 * A prioridade é gerida exclusivamente via Drag-and-Drop no grid
 * Notas são editadas diretamente no cartão existente
 */
export default function ApplicationModal({ isOpen, onClose, onSave, applicationToEdit }) {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    url: '',
    status: 'IN_PROGRESS',
    workModel: 'Home Office',
    locationType: 'Presencial',
    contractType: 'Tempo integral',
    area: 'Desenvolvimento',
    companySize: 'Empresa Grande',
    location: 'Brasília - DF'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (applicationToEdit) {
      setFormData({
        company: applicationToEdit.company || '',
        role: applicationToEdit.role || applicationToEdit.description || '',
        url: applicationToEdit.url || '',
        status: applicationToEdit.status || 'IN_PROGRESS',
        workModel: applicationToEdit.workModel || 'Home Office',
        locationType: applicationToEdit.locationType || 'Presencial',
        contractType: applicationToEdit.contractType || 'Tempo integral',
        area: applicationToEdit.area || 'Desenvolvimento',
        companySize: applicationToEdit.companySize || 'Empresa Grande',
        location: applicationToEdit.location || 'Brasília - DF'
      });
    } else {
      setFormData({
        company: '',
        role: '',
        url: '',
        status: 'IN_PROGRESS',
        workModel: 'Home Office',
        locationType: 'Presencial',
        contractType: 'Tempo integral',
        area: 'Desenvolvimento',
        companySize: 'Empresa Grande',
        location: 'Brasília - DF'
      });
    }
    setErrorMsg('');
  }, [applicationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company.trim()) {
      setErrorMsg('O nome da empresa é obrigatório.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        // O campo role é salvo em description no backend atual
        description: formData.role.trim() || formData.company.trim(),
        // Mantém a prioridade existente se estiver editando
        ...(applicationToEdit?.priority !== undefined && { priority: applicationToEdit.priority })
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao salvar candidatura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {applicationToEdit ? 'Editar Candidatura' : 'Nova Candidatura'}
          </h3>
          <button type="button" onClick={onClose} className="modal-close-btn" title="Fechar modal">
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="notification-banner notification-error" style={{ margin: '16px 24px 0' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Linha 1: Cargo e Empresa */}
          <div className="modal-grid-2">
            <div className="field-group">
              <label className="field-label">Cargo / Título da Vaga</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Ex: Desenvolvedor Full Stack"
                className="text-input"
                style={{ paddingLeft: '14px' }}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Empresa *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Ex: Empresa Exemplo LTDA"
                className="text-input"
                style={{ paddingLeft: '14px' }}
                required
              />
            </div>
          </div>

          {/* Linha 2: Status, Modelo de Trabalho e Tipo de Contrato */}
          <div className="modal-grid-3">
            <div className="field-group">
              <label className="field-label">Status da Candidatura</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="select-input"
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Modelo de Trabalho</label>
              <select
                name="workModel"
                value={formData.workModel}
                onChange={handleChange}
                className="select-input"
              >
                <option value="Home Office">Home Office</option>
                <option value="Presencial">Presencial</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Tipo de Contrato</label>
              <select
                name="contractType"
                value={formData.contractType}
                onChange={handleChange}
                className="select-input"
              >
                <option value="Tempo integral">Tempo integral</option>
                <option value="Meio período">Meio período</option>
                <option value="PJ">PJ</option>
                <option value="CLT">CLT</option>
                <option value="Estágio">Estágio</option>
              </select>
            </div>
          </div>

          {/* Linha 3: Área e Localização */}
          <div className="modal-grid-2">
            <div className="field-group">
              <label className="field-label">Área de Atuação</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="Ex: Desenvolvimento"
                className="text-input"
                style={{ paddingLeft: '14px' }}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Localização (Cidade - UF)</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Brasília - DF"
                className="text-input"
                style={{ paddingLeft: '14px' }}
              />
            </div>
          </div>

          {/* Linha 4: Link da Vaga (URL) */}
          <div className="field-group">
            <label className="field-label">Link da Vaga (URL)</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://exemplo.com/vaga"
              className="text-input"
              style={{ paddingLeft: '14px' }}
            />
          </div>

          {/* Botões do Modal */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Salvando...' : applicationToEdit ? 'Atualizar' : 'Salvar Candidatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
