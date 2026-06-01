import React, { useState, useMemo } from 'react';
import { 
  HeartHandshake, Search, Plus, List, Grid, MapPin, 
  Phone, Mail, GraduationCap, Calendar, X, Send, 
  Trash2, Edit3, Smartphone, ExternalLink, MessageSquare, 
  TrendingUp, Check, AlertCircle, Clock, User, FileSpreadsheet
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { CRMProspect, CRMFollowUpLog } from '../store/useAppStore';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

export default function CRMPage() {
  const { 
    prospects, 
    addProspect, 
    updateProspect, 
    deleteProspect, 
    addProspectFollowUp 
  } = useAppStore();

  // Estados de control de vista y filtros
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [modalityFilter, setModalityFilter] = useState<string>('All');

  // Estados para Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<CRMProspect | null>(null);

  // Estados para Alertas y Confirmaciones Reutilizables
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'alert' | 'success' | 'warning';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm'
  });

  // Auxiliares para mostrar diálogos sin usar alert o confirm nativos
  const triggerAlert = (title: string, message: string, type: 'alert' | 'success' | 'warning' = 'alert') => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: undefined
    });
  };

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm
    });
  };

  // Estado para Notificaciones Flotantes (Toasts) Premium
  const [toastConfig, setToastConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToastConfig({
      isOpen: true,
      message,
      type
    });
  };

  // Estados de Formulario de Prospecto (Crear / Editar)
  const [isEditing, setIsEditing] = useState(false);
  const [editingProspectId, setEditingProspectId] = useState<string | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formCorreo, setFormCorreo] = useState('');
  const [formProcedencia, setFormProcedencia] = useState('');
  const [formModalidad, setFormModalidad] = useState<'Digital' | 'Presencial'>('Presencial');
  const [formCurso, setFormCurso] = useState('Ingreso UNAM');
  const [formEstatus, setFormEstatus] = useState<'Prospecto' | 'Contactado' | 'Demostración' | 'Inscrito' | 'Descartado'>('Prospecto');
  const [formComoTeEnteraste, setFormComoTeEnteraste] = useState('Redes Sociales');
  const [formEntidadFederativa, setFormEntidadFederativa] = useState('Ciudad de México');

  // Control de errores de validación de formulario
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estados de Formulario de Seguimiento
  const [newFollowUpNote, setNewFollowUpNote] = useState('');
  const [newFollowUpStatus, setNewFollowUpStatus] = useState<string>('');

  // Estadísticas calculadas en tiempo real
  const stats = useMemo(() => {
    const total = prospects.length;
    const active = prospects.filter(p => p.estatus !== 'Inscrito' && p.estatus !== 'Descartado').length;
    const enrolled = prospects.filter(p => p.estatus === 'Inscrito').length;
    const conversion = total > 0 ? Math.round((enrolled / total) * 100) : 0;
    
    const presencial = prospects.filter(p => p.modalidad === 'Presencial').length;
    const digital = prospects.filter(p => p.modalidad === 'Digital').length;
    
    return { total, active, enrolled, conversion, presencial, digital };
  }, [prospects]);

  // Filtrado de prospectos
  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      const matchesSearch = 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.procedencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.telefono.includes(searchTerm) ||
        (p.correo && p.correo.toLowerCase().includes(searchTerm.toLowerCase()));
        
      const matchesStatus = statusFilter === 'All' || p.estatus === statusFilter;
      const matchesModality = modalityFilter === 'All' || p.modalidad === modalityFilter;

      return matchesSearch && matchesStatus && matchesModality;
    });
  }, [prospects, searchTerm, statusFilter, modalityFilter]);

  // Función para abrir modal de registro
  const openAddModal = () => {
    setIsEditing(false);
    setEditingProspectId(null);
    setFormNombre('');
    setFormTelefono('');
    setFormCorreo('');
    setFormProcedencia('');
    setFormModalidad('Presencial');
    setFormCurso('Ingreso UNAM');
    setFormEstatus('Prospecto');
    setFormComoTeEnteraste('Redes Sociales');
    setFormEntidadFederativa('Ciudad de México');
    setErrors({});
    setIsAddModalOpen(true);
  };

  // Función para abrir modal de edición
  const openEditModal = (prospect: CRMProspect, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingProspectId(prospect.id);
    setFormNombre(prospect.nombre);
    setFormTelefono(prospect.telefono);
    setFormCorreo(prospect.correo || '');
    setFormProcedencia(prospect.procedencia);
    setFormModalidad(prospect.modalidad);
    setFormCurso(prospect.cursoInteres || 'Ingreso UNAM');
    setFormEstatus(prospect.estatus);
    setFormComoTeEnteraste(prospect.comoTeEnteraste || 'Redes Sociales');
    setFormEntidadFederativa(prospect.entidadFederativa || 'Ciudad de México');
    setErrors({});
    setIsAddModalOpen(true);
  };

  // Función para guardar el prospecto (Agregar / Modificar)
  const handleSaveProspect = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones detalladas del formulario
    const newErrors: Record<string, string> = {};
    
    // 1. Nombre Completo
    if (!formNombre.trim()) {
      newErrors.nombre = 'El nombre completo es obligatorio.';
    } else if (formNombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe contener al menos 3 caracteres.';
    }

    // 2. Teléfono móvil (10 dígitos en México)
    const rawPhone = formTelefono.replace(/\s+/g, '');
    if (!rawPhone) {
      newErrors.telefono = 'El teléfono móvil es obligatorio.';
    } else if (!/^\d+$/.test(rawPhone)) {
      newErrors.telefono = 'El teléfono debe contener únicamente números.';
    } else if (rawPhone.length !== 10) {
      newErrors.telefono = 'El teléfono debe contener exactamente 10 dígitos.';
    }

    // 3. Correo Electrónico (Opcional, validar formato si se provee)
    if (formCorreo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formCorreo.trim())) {
      newErrors.correo = 'El formato del correo electrónico no es válido.';
    }

    // 4. Procedencia
    if (!formProcedencia.trim()) {
      newErrors.procedencia = 'La procedencia o escuela de origen es obligatoria.';
    }

    // Si existen errores, detener flujo y avisar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Por favor corrige los errores del formulario.', 'error');
      return;
    }

    // Limpiar errores si todo está ok
    setErrors({});

    const payload = {
      nombre: formNombre.trim(),
      telefono: rawPhone,
      correo: formCorreo.trim() || undefined,
      procedencia: formProcedencia.trim(),
      modalidad: formModalidad,
      cursoInteres: formCurso,
      estatus: formEstatus,
      comoTeEnteraste: formComoTeEnteraste,
      entidadFederativa: formEntidadFederativa
    };

    if (isEditing && editingProspectId) {
      updateProspect(editingProspectId, payload);
      showToast(`Ficha de "${formNombre}" actualizada con éxito.`, 'success');
    } else {
      addProspect(payload);
      showToast(`Prospecto "${formNombre}" registrado con éxito.`, 'success');
    }

    setIsAddModalOpen(false);
  };

  // Función para exportar prospectos a un archivo Excel (CSV con UTF-8 BOM)
  const generateCRMExcelReport = (filterType: 'current' | 'all' | 'digital' | 'presencial') => {
    let listToExport = prospects;
    
    if (filterType === 'current') {
      listToExport = filteredProspects;
    } else if (filterType === 'digital') {
      listToExport = prospects.filter(p => p.modalidad === 'Digital');
    } else if (filterType === 'presencial') {
      listToExport = prospects.filter(p => p.modalidad === 'Presencial');
    }
    
    if (listToExport.length === 0) {
      showToast('No hay prospectos para exportar con el filtro seleccionado.', 'warning');
      return;
    }

    // Encabezados
    const headers = [
      'ID',
      'Nombre del Prospecto',
      'Teléfono',
      'Correo Electrónico',
      'Procedencia / Escuela',
      'Modalidad',
      'Curso de Interés',
      'Estatus Administrativo',
      '¿Cómo se enteró?',
      'Entidad Federativa',
      'Fecha de Registro',
      'Historial de Notas'
    ];

    // Mapear filas
    const rows = listToExport.map(p => {
      // Unir el historial de seguimiento en una sola celda legible
      const trackingHistory = p.historialSeguimiento
        .map(h => `[${h.fecha}] ${h.usuario}: ${h.nota}${h.nuevoEstatus ? ` (Estatus: ${h.nuevoEstatus})` : ''}`)
        .join(' | ');

      return [
        p.id,
        p.nombre,
        p.telefono,
        p.correo || 'No registrado',
        p.procedencia,
        p.modalidad,
        p.cursoInteres || 'General',
        p.estatus,
        p.comoTeEnteraste || 'No registrado',
        p.entidadFederativa || 'No registrado',
        p.fechaRegistro,
        trackingHistory
      ];
    });

    // Formatear en CSV (escapando comillas)
    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    // Crear Blob con BOM para UTF-8 (Excel lo necesita para caracteres latinos como á, é, í, ó, ú, ñ)
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Crear elemento de descarga temporal
    const link = document.createElement('a');
    link.href = url;
    
    // Nombre del archivo descriptivo
    const dateStr = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    let filename = `Reporte_CRM_Todos_${dateStr}.csv`;
    if (filterType === 'current') {
      filename = `Reporte_CRM_Filtrado_${dateStr}.csv`;
    } else if (filterType === 'digital') {
      filename = `Reporte_CRM_Digital_${dateStr}.csv`;
    } else if (filterType === 'presencial') {
      filename = `Reporte_CRM_Presencial_${dateStr}.csv`;
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast(`Reporte Excel generado con éxito (${listToExport.length} registros).`, 'success');
  };

  // Eliminar prospecto
  const handleDeleteProspect = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerConfirm(
      'Confirmar Eliminación',
      `¿Estás seguro de que deseas eliminar permanentemente a "${name}"? Esta acción borrará permanentemente sus datos y todo el historial de seguimiento registrado.`,
      () => {
        deleteProspect(id);
        if (selectedProspect && selectedProspect.id === id) {
          setIsFollowUpModalOpen(false);
          setSelectedProspect(null);
        }
        showToast(`Lead "${name}" eliminado con éxito.`, 'success');
      }
    );
  };

  // Abrir modal de Seguimiento y Historial
  const openFollowUpModal = (prospect: CRMProspect) => {
    const freshProspect = prospects.find(p => p.id === prospect.id) || prospect;
    setSelectedProspect(freshProspect);
    setNewFollowUpNote('');
    setNewFollowUpStatus('');
    setIsFollowUpModalOpen(true);
  };

  // Agregar entrada de seguimiento
  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProspect) return;
    if (!newFollowUpNote.trim()) {
      triggerAlert(
        'Nota de Seguimiento Vacía',
        'Por favor ingresa una nota o reporte de la llamada antes de registrarla en la línea de tiempo.',
        'warning'
      );
      return;
    }

    const logPayload = {
      nota: newFollowUpNote,
      usuario: 'David Toris (DT)',
      nuevoEstatus: newFollowUpStatus || undefined
    };

    addProspectFollowUp(selectedProspect.id, logPayload);

    // Refrescar prospecto seleccionado en el modal
    const updatedProspect = useAppStore.getState().prospects.find(p => p.id === selectedProspect.id);
    if (updatedProspect) {
      setSelectedProspect(updatedProspect);
    }

    setNewFollowUpNote('');
    setNewFollowUpStatus('');
    showToast('Seguimiento comercial registrado y sellado con éxito.', 'success');
  };

  // Cambiar estatus directamente desde el panel del modal
  const handleQuickStatusChange = (status: 'Prospecto' | 'Contactado' | 'Demostración' | 'Inscrito' | 'Descartado') => {
    if (!selectedProspect) return;
    updateProspect(selectedProspect.id, { estatus: status });
    const updatedProspect = useAppStore.getState().prospects.find(p => p.id === selectedProspect.id);
    if (updatedProspect) {
      setSelectedProspect(updatedProspect);
    }
  };

  // Columnas para Kanban
  const kanbanColumns: { id: typeof formEstatus; label: string; color: string; bg: string }[] = [
    { id: 'Prospecto', label: 'Prospectos', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
    { id: 'Contactado', label: 'Contactados', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
    { id: 'Demostración', label: 'Clase Muestra', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.08)' },
    { id: 'Inscrito', label: 'Inscritos 🎉', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
    { id: 'Descartado', label: 'Descartados', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' }
  ];

  return (
    <div className="crm-view" style={{ padding: '0 40px 40px', minHeight: 'calc(100vh - 80px)' }}>
      {/* 1. Header con botones de control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>Módulo de Ventas y CRM</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>
            Lleva el control de prospectos comerciales de CRECE e historial de seguimiento institucional.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setIsExportModalOpen(true)}
            style={{ 
              padding: '12px 24px', 
              background: 'rgba(16, 185, 129, 0.08)', 
              color: '#10b981', 
              border: '1px solid rgba(16, 185, 129, 0.2)', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: '600', 
              fontSize: '15px',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <FileSpreadsheet size={18} /> Reporte Excel
          </button>
          <button 
            className="btn-primary" 
            onClick={openAddModal}
            style={{ 
              padding: '12px 24px', 
              background: 'var(--gradient-accent)', 
              color: '#081c33', 
              border: 'none', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: '600', 
              fontSize: '15px',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(229, 169, 59, 0.25)',
              transition: 'var(--transition)'
            }}
          >
            <Plus size={18} /> Registrar Prospecto
          </button>
        </div>
      </div>

      {/* 2. Panel de Estadísticas (Bento Grid) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        {/* Card 1: Total */}
        <div className="bento-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(15, 56, 105, 0.06)', color: 'var(--brand-blue)', padding: '12px', borderRadius: '12px' }}>
            <HeartHandshake size={24} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Prospectos Totales</span>
            <h3 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{stats.total}</h3>
          </div>
        </div>

        {/* Card 2: Leads Activos */}
        <div className="bento-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(229, 169, 59, 0.1)', color: 'var(--brand-yellow)', padding: '12px', borderRadius: '12px' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Embudo Activo</span>
            <h3 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{stats.active}</h3>
          </div>
        </div>

        {/* Card 3: Conversión */}
        <div className="bento-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '12px' }}>
            <Check size={24} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Tasa de Conversión</span>
            <h3 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{stats.conversion}%</h3>
          </div>
        </div>

        {/* Card 4: Modalidad */}
        <div className="bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '8px' }}>Distribución de Modalidad</span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
                <span style={{ color: 'var(--brand-blue)' }}>Presencial: {stats.presencial}</span>
                <span style={{ color: '#8b5cf6' }}>Digital: {stats.digital}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(15, 56, 105, 0.08)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${stats.total > 0 ? (stats.presencial / stats.total) * 100 : 50}%`, background: 'var(--brand-blue)', height: '100%' }}></div>
                <div style={{ width: `${stats.total > 0 ? (stats.digital / stats.total) * 100 : 50}%`, background: '#8b5cf6', height: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filtros y Selector de Vista */}
      <div className="bento-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        {/* Buscador */}
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '260px' }}>
          <div className="search-bar" style={{ width: '100%', maxWidth: '400px', display: 'flex', alignItems: 'center', padding: '0 16px', background: 'rgba(15, 56, 105, 0.04)', border: '1px solid rgba(15, 56, 105, 0.08)', borderRadius: '12px', height: '40px' }}>
            <Search size={16} style={{ color: 'var(--text-secondary)', marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Buscar prospecto por nombre, procedencia..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '14px', fontFamily: 'inherit' }}
            />
          </div>

          {/* Filtro de Modalidad */}
          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            style={{ 
              padding: '0 16px', 
              borderRadius: '12px', 
              border: '1px solid rgba(15, 56, 105, 0.1)', 
              background: 'var(--bg-card)', 
              color: 'var(--text-primary)', 
              fontSize: '14px',
              fontFamily: 'inherit',
              fontWeight: '500',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">Todas las Modalidades</option>
            <option value="Presencial">Presencial</option>
            <option value="Digital">Digital</option>
          </select>

          {/* Filtro de Estatus (Solo en vista de lista) */}
          {viewMode === 'list' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ 
                padding: '0 16px', 
                borderRadius: '12px', 
                border: '1px solid rgba(15, 56, 105, 0.1)', 
                background: 'var(--bg-card)', 
                color: 'var(--text-primary)', 
                fontSize: '14px',
                fontFamily: 'inherit',
                fontWeight: '500',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">Todos los Estatus</option>
              <option value="Prospecto">Prospecto</option>
              <option value="Contactado">Contactado</option>
              <option value="Demostración">Clase Muestra</option>
              <option value="Inscrito">Inscrito</option>
              <option value="Descartado">Descartado</option>
            </select>
          )}
        </div>

        {/* Toggle de Modo de Vista */}
        <div style={{ display: 'flex', background: 'rgba(15, 56, 105, 0.05)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
          <button 
            onClick={() => setViewMode('kanban')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 14px', 
              borderRadius: '8px', 
              border: 'none', 
              background: viewMode === 'kanban' ? 'var(--bg-card)' : 'transparent',
              color: viewMode === 'kanban' ? 'var(--brand-blue)' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: viewMode === 'kanban' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <Grid size={15} /> Funnel Kanban
          </button>
          <button 
            onClick={() => setViewMode('list')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 14px', 
              borderRadius: '8px', 
              border: 'none', 
              background: viewMode === 'list' ? 'var(--bg-card)' : 'transparent',
              color: viewMode === 'list' ? 'var(--brand-blue)' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <List size={15} /> Vista de Lista
          </button>
        </div>
      </div>

      {/* 4. Contenido Principal Alternable (Kanban / Lista) */}
      {viewMode === 'kanban' ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '16px', 
          overflowX: 'auto', 
          alignItems: 'start',
          paddingBottom: '16px'
        }}>
          {kanbanColumns.map((col) => {
            const colProspects = filteredProspects.filter(p => p.estatus === col.id);
            return (
              <div 
                key={col.id} 
                style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', 
                  padding: '16px',
                  minHeight: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Cabecera de la columna */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: col.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {col.label}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '700', background: col.bg, color: col.color, padding: '4px 10px', borderRadius: '20px' }}>
                    {colProspects.length}
                  </span>
                </div>

                {/* Lista de tarjetas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '550px', padding: '2px' }}>
                  {colProspects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 12px', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      Sin prospectos
                    </div>
                  ) : (
                    colProspects.map((prospect) => (
                      <div 
                        key={prospect.id} 
                        onClick={() => openFollowUpModal(prospect)}
                        style={{ 
                          padding: '14px', 
                          background: 'var(--bg-main)', 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '12px', 
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(15,56,105,0.02)',
                          transition: 'var(--transition)',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                          e.currentTarget.style.borderColor = 'rgba(15, 56, 105, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(15,56,105,0.02)';
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                      >
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.4' }}>
                          {prospect.nombre}
                        </h4>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '600', background: prospect.modalidad === 'Presencial' ? 'rgba(15, 56, 105, 0.08)' : 'rgba(139, 92, 246, 0.1)', color: prospect.modalidad === 'Presencial' ? 'var(--brand-blue)' : '#8b5cf6', padding: '2px 6px', borderRadius: '4px' }}>
                            {prospect.modalidad}
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: '600', background: 'rgba(229, 169, 59, 0.12)', color: '#b47b18', padding: '2px 6px', borderRadius: '4px' }}>
                            {prospect.cursoInteres || 'Gral.'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} style={{ flexShrink: 0 }} /> 
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prospect.procedencia}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={11} /> {prospect.telefono}
                          </div>
                        </div>

                        {/* Botón de Seguimiento rápido */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(15,56,105,0.05)' }}>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Calendar size={10} /> {prospect.fechaRegistro}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={(e) => openEditModal(prospect, e)}
                              style={{ background: 'none', border: 'none', padding: '4px', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '4px' }}
                              title="Editar"
                              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-blue)'}
                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                              <Edit3 size={12} />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteProspect(prospect.id, prospect.nombre, e)}
                              style={{ background: 'none', border: 'none', padding: '4px', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '4px' }}
                              title="Eliminar"
                              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista de Lista (Tabla) */
        <div className="bento-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 56, 105, 0.02)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Nombre</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Contacto</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Procedencia</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Curso de Interés</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Modalidad</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Fecha Registro</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Estatus</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProspects.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No se encontraron prospectos que coincidan con la búsqueda o filtros.
                    </td>
                  </tr>
                ) : (
                  filteredProspects.map((prospect) => {
                    // Colores de estatus
                    let statusColor = '#3b82f6';
                    let statusBg = 'rgba(59, 130, 246, 0.1)';
                    if (prospect.estatus === 'Contactado') {
                      statusColor = '#f59e0b';
                      statusBg = 'rgba(245, 158, 11, 0.1)';
                    } else if (prospect.estatus === 'Demostración') {
                      statusColor = '#a855f7';
                      statusBg = 'rgba(168, 85, 247, 0.1)';
                    } else if (prospect.estatus === 'Inscrito') {
                      statusColor = '#10b981';
                      statusBg = 'rgba(16, 185, 129, 0.1)';
                    } else if (prospect.estatus === 'Descartado') {
                      statusColor = '#ef4444';
                      statusBg = 'rgba(239, 68, 68, 0.1)';
                    }

                    return (
                      <tr 
                        key={prospect.id} 
                        onClick={() => openFollowUpModal(prospect)}
                        style={{ 
                          borderBottom: '1px solid var(--border-color)', 
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                        className="table-row-hover"
                      >
                        {/* Nombre */}
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(15, 56, 105, 0.05)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>
                              {prospect.nombre.charAt(0)}
                            </div>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{prospect.nombre}</span>
                          </div>
                        </td>

                        {/* Contacto */}
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                            <span style={{ fontWeight: '500', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} style={{ color: 'var(--text-secondary)' }} /> {prospect.telefono}
                            </span>
                            {prospect.correo && (
                              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Mail size={12} /> {prospect.correo}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Procedencia */}
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} /> {prospect.procedencia}
                          </div>
                        </td>

                        {/* Curso */}
                        <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <GraduationCap size={13} style={{ color: 'var(--brand-yellow)' }} /> {prospect.cursoInteres || 'General'}
                          </div>
                        </td>

                        {/* Modalidad */}
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', background: prospect.modalidad === 'Presencial' ? 'rgba(15, 56, 105, 0.08)' : 'rgba(139, 92, 246, 0.1)', color: prospect.modalidad === 'Presencial' ? 'var(--brand-blue)' : '#8b5cf6', padding: '4px 10px', borderRadius: '6px' }}>
                            {prospect.modalidad}
                          </span>
                        </td>

                        {/* Fecha */}
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} /> {prospect.fechaRegistro}
                          </div>
                        </td>

                        {/* Estatus */}
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', background: statusBg, color: statusColor, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                            {prospect.estatus === 'Demostración' ? 'Clase Muestra' : prospect.estatus}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: '16px 24px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={(e) => openEditModal(prospect, e)}
                              className="icon-btn-edit" 
                              style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(15, 56, 105, 0.05)', border: 'none', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
                              title="Editar Ficha"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteProspect(prospect.id, prospect.nombre, e)}
                              className="icon-btn-delete"
                              style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.05)', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
                              title="Eliminar Lead"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: REGISTRO Y EDICIÓN DE PROSPECTOS (FORMULARIO)
          ======================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isEditing ? 'Editar Ficha del Prospecto' : 'Registrar Nuevo Prospecto'}
        icon={<HeartHandshake size={22} style={{ color: 'var(--brand-yellow)' }} />}
        maxWidth="520px"
      >
        <form onSubmit={handleSaveProspect} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Campo Nombre */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Nombre Completo *
            </label>
            <input 
              type="text" 
              className="search-input"
              placeholder="Ej. Sofía Ramírez Díaz"
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
              style={{ width: '100%', height: '42px', border: errors.nombre ? '1px solid #ef4444' : '1px solid var(--border-color)', borderRadius: '10px', padding: '0 14px', fontSize: '14px', color: 'var(--text-primary)', background: 'var(--bg-main)' }}
            />
            {errors.nombre && (
              <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '500', marginTop: '4px', display: 'block' }}>
                {errors.nombre}
              </span>
            )}
          </div>

          {/* Fila Teléfono y Correo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Teléfono Móvil (10 dígitos) *
              </label>
              <input 
                type="tel" 
                placeholder="Ej. 5512345678"
                value={formTelefono}
                onChange={(e) => setFormTelefono(e.target.value)}
                style={{ width: '100%', height: '42px', border: errors.telefono ? '1px solid #ef4444' : '1px solid var(--border-color)', borderRadius: '10px', padding: '0 14px', fontSize: '14px', color: 'var(--text-primary)', background: 'var(--bg-main)' }}
              />
              {errors.telefono && (
                <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '500', marginTop: '4px', display: 'block' }}>
                  {errors.telefono}
                </span>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Correo Electrónico
              </label>
              <input 
                type="email" 
                placeholder="Ej. sofia@correo.com"
                value={formCorreo}
                onChange={(e) => setFormCorreo(e.target.value)}
                style={{ width: '100%', height: '42px', border: errors.correo ? '1px solid #ef4444' : '1px solid var(--border-color)', borderRadius: '10px', padding: '0 14px', fontSize: '14px', color: 'var(--text-primary)', background: 'var(--bg-main)' }}
              />
              {errors.correo && (
                <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '500', marginTop: '4px', display: 'block' }}>
                  {errors.correo}
                </span>
              )}
            </div>
          </div>

          {/* Fila Escuela de Procedencia y Curso */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Procedencia (Escuela / Recomendación) *
              </label>
              <input 
                type="text" 
                placeholder="Ej. Prepa 9 UNAM"
                value={formProcedencia}
                onChange={(e) => setFormProcedencia(e.target.value)}
                style={{ width: '100%', height: '42px', border: errors.procedencia ? '1px solid #ef4444' : '1px solid var(--border-color)', borderRadius: '10px', padding: '0 14px', fontSize: '14px', color: 'var(--text-primary)', background: 'var(--bg-main)' }}
              />
              {errors.procedencia && (
                <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '500', marginTop: '4px', display: 'block' }}>
                  {errors.procedencia}
                </span>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Curso de Interés
              </label>
              <select 
                value={formCurso}
                onChange={(e) => setFormCurso(e.target.value)}
                style={{ width: '100%', height: '42px', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0 14px', fontSize: '14px', color: 'var(--text-primary)', background: 'var(--bg-main)', outline: 'none', cursor: 'pointer' }}
              >
                <option value="Ingreso UNAM">Ingreso UNAM</option>
                <option value="COMIPEMS 2024">COMIPEMS 2024</option>
                <option value="UAM">UAM</option>
                <option value="IPN">IPN</option>
              </select>
            </div>
          </div>

          {/* Fila Modalidad y Estatus */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Modalidad preferida
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1, height: '42px', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: formModalidad === 'Presencial' ? 'rgba(15, 56, 105, 0.08)' : 'var(--bg-card)', bordercolor: formModalidad === 'Presencial' ? 'var(--brand-blue)' : 'var(--border-color)', fontSize: '14px', fontWeight: '600', color: formModalidad === 'Presencial' ? 'var(--brand-blue)' : 'var(--text-secondary)', transition: 'var(--transition)' }}>
                  <input 
                    type="radio" 
                    name="formModalidad"
                    checked={formModalidad === 'Presencial'}
                    onChange={() => setFormModalidad('Presencial')}
                    style={{ display: 'none' }} 
                  />
                  Presencial
                </label>
                <label style={{ flex: 1, height: '42px', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: formModalidad === 'Digital' ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-card)', bordercolor: formModalidad === 'Digital' ? '#8b5cf6' : 'var(--border-color)', fontSize: '14px', fontWeight: '600', color: formModalidad === 'Digital' ? '#8b5cf6' : 'var(--text-secondary)', transition: 'var(--transition)' }}>
                  <input 
                    type="radio" 
                    name="formModalidad"
                    checked={formModalidad === 'Digital'}
                    onChange={() => setFormModalidad('Digital')}
                    style={{ display: 'none' }} 
                  />
                  Digital
                </label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Estatus del Embudo
              </label>
              <select 
                value={formEstatus}
                onChange={(e) => setFormEstatus(e.target.value as any)}
                style={{ width: '100%', height: '42px', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0 14px', fontSize: '14px', color: 'var(--text-primary)', background: 'var(--bg-main)', outline: 'none', cursor: 'pointer' }}
              >
                <option value="Prospecto">Prospecto</option>
                <option value="Contactado">Contactado</option>
                <option value="Demostración">Clase Muestra</option>
                <option value="Inscrito">Inscrito</option>
                <option value="Descartado">Descartado</option>
              </select>
            </div>
          </div>

          {/* Fila Cómo te enteraste y Entidad Federativa */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                ¿Cómo te enteraste de nosotros? *
              </label>
              <select 
                value={formComoTeEnteraste}
                onChange={(e) => setFormComoTeEnteraste(e.target.value)}
                style={{ width: '100%', height: '42px', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0 14px', fontSize: '14px', color: 'var(--text-primary)', background: 'var(--bg-main)', outline: 'none', cursor: 'pointer' }}
              >
                <option value="Redes Sociales">Redes Sociales (Facebook, Instagram, etc.)</option>
                <option value="Recomendación">Recomendación (Familiar / Alumno)</option>
                <option value="Volante">Volante / Publicidad Física</option>
                <option value="Sitio Web">Sitio Web</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Entidad Federativa *
              </label>
              <select 
                value={formEntidadFederativa}
                onChange={(e) => setFormEntidadFederativa(e.target.value)}
                style={{ width: '100%', height: '42px', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0 14px', fontSize: '14px', color: 'var(--text-primary)', background: 'var(--bg-main)', outline: 'none', cursor: 'pointer' }}
              >
                <option value="Ciudad de México">Ciudad de México</option>
                <option value="Estado de México">Estado de México</option>
                <option value="Puebla">Puebla</option>
                <option value="Querétaro">Querétaro</option>
                <option value="Jalisco">Jalisco</option>
                <option value="Nuevo León">Nuevo León</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Botón de Envío */}
          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => setIsAddModalOpen(false)}
              style={{ padding: '10px 24px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              style={{ padding: '10px 32px', background: 'var(--brand-blue)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 10px rgba(15, 56, 105, 0.15)' }}
            >
              {isEditing ? 'Guardar Cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================
          MODAL 2: FICHA DE DETALLE Y TIMELINE DE SEGUIMIENTO (PREMIUM)
          ======================================================== */}
      <Modal
        isOpen={isFollowUpModalOpen && selectedProspect !== null}
        onClose={() => setIsFollowUpModalOpen(false)}
        title="Ficha de Seguimiento Comercial"
        subtitle={selectedProspect && `ID: ${selectedProspect.id} • Registro: ${selectedProspect.fechaRegistro}`}
        maxWidth="960px"
        maxHeight="90vh"
      >
        {selectedProspect && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', height: 'calc(90vh - 120px)', maxHeight: '600px', overflow: 'hidden', margin: '-24px' }}>
            {/* COLUMNA IZQUIERDA: Ficha del Prospecto y Controles de Estado */}
            <div style={{ 
              borderRight: '1px solid var(--border-color)', 
              background: 'rgba(15, 56, 105, 0.01)', 
              padding: '24px', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              height: '100%'
            }}>
              {/* Nombre y Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(15, 56, 105, 0.08)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700' }}>
                  {selectedProspect.nombre.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedProspect.nombre}</h4>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: selectedProspect.modalidad === 'Presencial' ? 'var(--brand-blue)' : '#8b5cf6' }}>
                    Modalidad {selectedProspect.modalidad}
                  </span>
                </div>
              </div>

              {/* Campos de Contacto */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <Phone size={15} style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Teléfono Móvil</span>
                    <a href={`tel:${selectedProspect.telefono}`} style={{ color: 'var(--brand-blue)', fontWeight: '600', textDecoration: 'none' }}>
                      {selectedProspect.telefono}
                    </a>
                  </div>
                </div>
                {selectedProspect.correo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <Mail size={15} style={{ color: 'var(--text-secondary)' }} />
                    <div>
                      <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Correo Electrónico</span>
                      <a href={`mailto:${selectedProspect.correo}`} style={{ color: 'var(--brand-blue)', fontWeight: '500', textDecoration: 'none' }}>
                        {selectedProspect.correo}
                      </a>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <MapPin size={15} style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Escuela de Origen</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{selectedProspect.procedencia}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <GraduationCap size={15} style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Curso de Interés</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{selectedProspect.cursoInteres || 'General'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <Search size={15} style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>¿Cómo se enteró?</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{selectedProspect.comoTeEnteraste || 'No registrado'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <MapPin size={15} style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Entidad Federativa</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{selectedProspect.entidadFederativa || 'No registrado'}</span>
                  </div>
                </div>
              </div>

              {/* Accesos rápidos telefónicos o WhatsApp */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <a 
                  href={`https://wa.me/52${selectedProspect.telefono.replace(/\s+/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                    height: '38px', borderRadius: '8px', border: '1px solid #25d366', 
                    background: 'rgba(37, 211, 102, 0.05)', color: '#128c7e', fontSize: '13px', 
                    fontWeight: '600', textDecoration: 'none', cursor: 'pointer' 
                  }}
                >
                  <MessageSquare size={14} /> WhatsApp
                </a>
                <button 
                  onClick={() => showToast(
                    `Marcando al ${selectedProspect.telefono} (${selectedProspect.nombre})...`,
                    'info'
                  )}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                    height: '38px', borderRadius: '8px', border: '1px solid var(--brand-blue)', 
                    background: 'rgba(15, 56, 105, 0.05)', color: 'var(--brand-blue)', fontSize: '13px', 
                    fontWeight: '600', cursor: 'pointer' 
                  }}
                >
                  <Smartphone size={14} /> Llamada
                </button>
              </div>

              {/* Estatus Actual */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Estatus de Seguimiento Rápido
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(['Prospecto', 'Contactado', 'Demostración', 'Inscrito', 'Descartado'] as const).map((st) => {
                    const isActive = selectedProspect.estatus === st;
                    let activeStyle = { border: '1px solid rgba(15,56,105,0.15)', background: 'var(--bg-card)' };
                    
                    if (isActive) {
                      if (st === 'Prospecto') activeStyle = { border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.08)' };
                      else if (st === 'Contactado') activeStyle = { border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.08)' };
                      else if (st === 'Demostración') activeStyle = { border: '1px solid #a855f7', background: 'rgba(168, 85, 247, 0.08)' };
                      else if (st === 'Inscrito') activeStyle = { border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.08)' };
                      else if (st === 'Descartado') activeStyle = { border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.08)' };
                    }

                    return (
                      <button
                        key={st}
                        onClick={() => handleQuickStatusChange(st)}
                        style={{
                          height: '36px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          textAlign: 'left',
                          padding: '0 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          transition: 'var(--transition)',
                          ...activeStyle
                        }}
                      >
                        <span>{st === 'Demostración' ? 'Clase Muestra' : st}</span>
                        {isActive && <Check size={14} style={{ color: 'inherit' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Acciones de eliminación en modal */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', gap: '8px' }}>
                <button 
                  onClick={(e) => openEditModal(selectedProspect, e)}
                  style={{ 
                    flex: 1, height: '36px', border: '1px solid var(--border-color)', 
                    borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--brand-blue)', 
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', gap: '4px' 
                  }}
                >
                  <Edit3 size={13} /> Editar Ficha
                </button>
                <button 
                  onClick={(e) => handleDeleteProspect(selectedProspect.id, selectedProspect.nombre, e)}
                  style={{ 
                    flex: 1, height: '36px', border: '1px solid rgba(239, 68, 68, 0.2)', 
                    borderRadius: '8px', background: 'rgba(239, 68, 68, 0.03)', color: '#ef4444', 
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', gap: '4px' 
                  }}
                >
                  <Trash2 size={13} /> Eliminar Lead
                </button>
              </div>
            </div>

            {/* COLUMNA DERECHA: Línea de Tiempo de Historial y Formulario de Nueva Nota */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              
              {/* Visualizador de Timeline de Notas (Scrollable) */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Historial del Prospecto ({selectedProspect.historialSeguimiento.length} registros)
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingLeft: '8px', position: 'relative' }}>
                  {/* Línea vertical de fondo */}
                  <div style={{ position: 'absolute', top: '8px', bottom: '8px', left: '16px', width: '2px', background: 'rgba(15, 56, 105, 0.08)' }}></div>

                  {selectedProspect.historialSeguimiento.map((log) => {
                    let tagColor = '#3b82f6';
                    let tagBg = 'rgba(59, 130, 246, 0.08)';
                    
                    if (log.nuevoEstatus) {
                      if (log.nuevoEstatus === 'Contactado') { tagColor = '#f59e0b'; tagBg = 'rgba(245, 158, 11, 0.08)'; }
                      else if (log.nuevoEstatus === 'Demostración') { tagColor = '#a855f7'; tagBg = 'rgba(168, 85, 247, 0.08)'; }
                      else if (log.nuevoEstatus === 'Inscrito') { tagColor = '#10b981'; tagBg = 'rgba(16, 185, 129, 0.08)'; }
                      else if (log.nuevoEstatus === 'Descartado') { tagColor = '#ef4444'; tagBg = 'rgba(239, 68, 68, 0.08)'; }
                    }

                    return (
                      <div key={log.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                        {/* Nodo de la línea de tiempo */}
                        <div style={{ 
                          width: '18px', height: '18px', borderRadius: '50%', 
                          background: log.nuevoEstatus ? tagColor : 'var(--brand-blue)', 
                          border: '4px solid var(--bg-card)', 
                          boxShadow: '0 0 0 2px rgba(15, 56, 105, 0.1)', 
                          zIndex: 1, flexShrink: 0, marginTop: '2px', marginLeft: '7px' 
                        }}></div>

                        {/* Contenedor de la nota */}
                        <div style={{ 
                          flex: 1, padding: '14px', background: 'var(--bg-main)', 
                          border: '1px solid var(--border-color)', borderRadius: '12px'
                        }}>
                          {/* Cabecera de la nota */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <User size={11} /> {log.usuario}
                              </span>
                              {log.nuevoEstatus && (
                                <span style={{ fontSize: '9px', fontWeight: '700', background: tagBg, color: tagColor, padding: '2px 8px', borderRadius: '20px' }}>
                                  {log.nuevoEstatus === 'Demostración' ? 'Clase Muestra' : log.nuevoEstatus}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={11} /> {log.fecha}
                            </span>
                          </div>

                          {/* Contenido de la nota */}
                          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                            {log.nota}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Formulario Integrado Abajo para agregar seguimiento */}
              <div style={{ 
                padding: '20px 24px', 
                borderTop: '1px solid var(--border-color)', 
                background: 'rgba(15, 56, 105, 0.02)',
                flexShrink: 0
              }}>
                <form onSubmit={handleAddFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Registrar Nuevo Seguimiento</span>
                    
                    {/* Dropdown de cambio de estatus opcional */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>Actualizar Estatus:</span>
                      <select
                        value={newFollowUpStatus}
                        onChange={(e) => setNewFollowUpStatus(e.target.value)}
                        style={{ 
                          padding: '4px 10px', 
                          borderRadius: '8px', 
                          border: '1px solid rgba(15, 56, 105, 0.15)', 
                          background: 'var(--bg-card)', 
                          color: 'var(--text-primary)', 
                          fontSize: '11px',
                          fontWeight: '600',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Mantener Actual ({selectedProspect.estatus})</option>
                        <option value="Prospecto">Prospecto</option>
                        <option value="Contactado">Contactado</option>
                        <option value="Demostración">Clase Muestra</option>
                        <option value="Inscrito">Inscrito</option>
                        <option value="Descartado">Descartado</option>
                      </select>
                    </div>
                  </div>

                  {/* Caja de nota */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <textarea 
                      rows={2}
                      placeholder="Escribe aquí los detalles del seguimiento (ej. Se le llamó hoy y se agendó clase muestra presencial el próximo sábado...)"
                      value={newFollowUpNote}
                      onChange={(e) => setNewFollowUpNote(e.target.value)}
                      required
                      style={{ 
                        flex: 1, 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '10px', 
                        padding: '10px 14px', 
                        fontSize: '13px', 
                        color: 'var(--text-primary)', 
                        background: 'var(--bg-card)', 
                        resize: 'none',
                        outline: 'none',
                        fontFamily: 'inherit',
                        lineHeight: '1.4'
                      }}
                    />
                    <button 
                      type="submit"
                      style={{ 
                        width: '46px', 
                        height: '46px', 
                        borderRadius: '10px', 
                        background: 'var(--brand-blue)', 
                        border: 'none', 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        flexShrink: 0,
                        boxShadow: '0 4px 8px rgba(15, 56, 105, 0.15)',
                        alignSelf: 'flex-end',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      title="Enviar Seguimiento"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================
          MODAL DE EXPORTACIÓN EXCEL PREMIUM
          ======================================================== */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Exportar Reporte Excel CRM"
        icon={<FileSpreadsheet size={22} style={{ color: '#10b981' }} />}
        maxWidth="580px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
            Selecciona la modalidad y el alcance del reporte de ventas que deseas generar. Se descargará un archivo CSV codificado con UTF-8 BOM, totalmente compatible con Microsoft Excel y Numbers.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '8px' }}>
            {/* Tarjeta 1: Vista Actual Filtrada */}
            <div 
              onClick={() => { generateCRMExcelReport('current'); setIsExportModalOpen(false); }}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                background: 'var(--bg-main)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'var(--bg-main)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '700', fontSize: '14px' }}>
                <Search size={16} /> Vista Actual Filtrada
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '1.4', margin: 0 }}>
                Respeta los buscadores y filtros que tengas activos en pantalla en este instante.
              </p>
            </div>

            {/* Tarjeta 2: Modalidad Digital */}
            <div 
              onClick={() => { generateCRMExcelReport('digital'); setIsExportModalOpen(false); }}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                background: 'var(--bg-main)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#8b5cf6';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'var(--bg-main)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', fontWeight: '700', fontSize: '14px' }}>
                <Smartphone size={16} /> Sólo Modalidad Digital
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '1.4', margin: 0 }}>
                Exporta únicamente los prospectos que prefieren cursar de forma 100% online.
              </p>
            </div>

            {/* Tarjeta 3: Modalidad Presencial */}
            <div 
              onClick={() => { generateCRMExcelReport('presencial'); setIsExportModalOpen(false); }}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                background: 'var(--bg-main)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-blue)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.background = 'rgba(15, 56, 105, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'var(--bg-main)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-blue)', fontWeight: '700', fontSize: '14px' }}>
                <MapPin size={16} /> Sólo Modalidad Presencial
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '1.4', margin: 0 }}>
                Exporta únicamente los prospectos que asistirán a clases físicas e interacciones presenciales.
              </p>
            </div>

            {/* Tarjeta 4: Histórico Completo */}
            <div 
              onClick={() => { generateCRMExcelReport('all'); setIsExportModalOpen(false); }}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                background: 'var(--bg-main)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-yellow)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.background = 'rgba(229, 169, 59, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'var(--bg-main)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-yellow)', fontWeight: '700', fontSize: '14px' }}>
                <FileSpreadsheet size={16} /> Histórico Completo
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '1.4', margin: 0 }}>
                Descarga de forma incondicional toda la base de datos de prospectos sin ningún filtro de modalidad.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              style={{ padding: '8px 20px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================
          MODAL 3: CONFIRMACIONES Y ALERTAS PREMIUM (REUTILIZABLE)
          ======================================================== */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
      />

      {/* ========================================================
          TOAST FLOATING NOTIFICATIONS (REUTILIZABLE)
          ======================================================== */}
      <Toast
        isOpen={toastConfig.isOpen}
        onClose={() => setToastConfig({ ...toastConfig, isOpen: false })}
        message={toastConfig.message}
        type={toastConfig.type}
      />

    </div>
  );
}
