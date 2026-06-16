import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Filter, AlertTriangle, CheckCircle2, 
  Eye, Search, X, Loader2, Send, 
  Check, Plus, AlertCircle, Clock
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { TicketMessage } from '../store/useAppStore';
import apiClient from '../api/apiClient';

export default function TicketsPage() {
  const { 
    tickets,
    activeTicket,
    fetchTickets,
    fetchStudents,
    createTicket,
    replyTicket,
    updateTicketStatus,
    usuarios,
    fetchUsuarios
  } = useAppStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  
  // Modales
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Formulario Nuevo Ticket
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Soporte');
  const [prioridad, setPrioridad] = useState('MEDIA');
  
  // Adjunto de archivo en nuevo ticket
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Formulario Respuesta
  const [replyText, setReplyText] = useState('');

  // Filtros
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategoria, setFilterCategoria] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Chat scroll ref
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchStudents(),
        fetchUsuarios()
      ]);
    };
    loadData();
  }, [fetchStudents, fetchUsuarios]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.mensajes]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Cargar tickets con filtros
  const handleApplyFilters = async () => {
    await fetchTickets({
      tipoTicket: filterTipo || undefined,
      status: filterStatus || undefined,
      categoria: filterCategoria || undefined
    });
  };

  useEffect(() => {
    handleApplyFilters();
  }, [filterTipo, filterStatus, filterCategoria]);

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!asunto.trim() || !descripcion.trim()) {
      showToast('Por favor completa el asunto y la descripción del ticket.', 'error');
      return;
    }

    setIsSaving(true);
    let adjuntoUrl: string | null = null;

    try {
      // Subir archivo a S3 si fue seleccionado
      if (selectedFile) {
        setUploadingFile(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder', 'tickets/adjuntos');
        const cleanName = selectedFile.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        formData.append('fileName', `${cleanName}-${Date.now()}`);

        const uploadRes = await apiClient.post('/uploads/public', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        adjuntoUrl = uploadRes.data.url;
        setUploadingFile(false);
      }

      await createTicket({
        asunto: asunto.trim(),
        descripcion: descripcion.trim(),
        categoria,
        prioridad,
        tipoTicket: 'ADMINISTRATIVO',
        creatorAlumnoId: null,
        adjuntoUrl
      });

      showToast('¡Ticket creado con éxito! 🎫', 'success');
      setShowModal(false);
      
      // Limpiar Formulario
      setAsunto('');
      setDescripcion('');
      setCategoria('Soporte');
      setPrioridad('MEDIA');
      setSelectedFile(null);

      // Recargar
      await fetchTickets();
    } catch (error: any) {
      console.error(error);
      showToast('Error al crear el ticket de soporte.', 'error');
    } finally {
      setIsSaving(false);
      setUploadingFile(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent, changeStatusToResolved = false) => {
    e.preventDefault();
    if (!activeTicket) return;
    if (!replyText.trim() && !changeStatusToResolved) return;

    setIsReplying(true);
    try {
      if (replyText.trim()) {
        await replyTicket({
          ticketId: activeTicket.id,
          contenido: replyText.trim(),
          remitenteTipo: 'ADMIN',
          remitenteNombre: 'Coordinación Escolar'
        });
        setReplyText('');
        showToast('Respuesta enviada.', 'success');
      }

      if (changeStatusToResolved) {
        await updateTicketStatus(activeTicket.id, 'RESUELTO');
        showToast('Ticket resuelto con éxito.', 'success');
      }
    } catch (error) {
      console.error(error);
      showToast('Error al procesar la respuesta del ticket.', 'error');
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!activeTicket) return;
    try {
      await updateTicketStatus(activeTicket.id, newStatus);
      showToast(`Estatus del ticket actualizado a "${newStatus}".`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al cambiar el estatus del ticket.', 'error');
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!activeTicket) return;
    try {
      await updateTicketStatus(activeTicket.id, undefined, newPriority);
      showToast(`Prioridad del ticket actualizada a "${newPriority}".`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al cambiar la prioridad del ticket.', 'error');
    }
  };

  const handleResponsableChange = async (userId: string | null) => {
    if (!activeTicket) return;
    try {
      await updateTicketStatus(activeTicket.id, undefined, undefined, userId);
      showToast('Responsable del ticket actualizado.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al cambiar el responsable del ticket.', 'error');
    }
  };

  // Filtrado por barra de búsqueda local (Asunto, Descripción o Folio)
  const filteredTickets = tickets.filter(t => 
    t.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.folio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tickets-view" style={{ padding: '24px 30px', boxSizing: 'border-box' }}>
      <style>{`
        .bento-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 16px 24px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          z-index: 2000;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .toast-success { background: #10b981; border-left: 5px solid #047857; }
        .toast-error { background: #ef4444; border-left: 5px solid #b91c1c; }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(8, 28, 51, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justifyContent: center;
          z-index: 1000;
        }
        .modal-content {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        }
        .form-select, .form-input, .form-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid var(--border-color);
          border-radius: 10px;
          background: var(--bg-main);
          color: var(--text-primary);
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-select:focus, .form-input:focus, .form-textarea:focus {
          border-color: var(--brand-blue);
        }
        
        .ticket-item {
          padding: 16px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-main);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .ticket-item:hover {
          border-color: var(--brand-blue);
          transform: translateY(-1px);
        }
        .ticket-item.active {
          border-color: var(--brand-blue);
          background: rgba(59, 130, 246, 0.03);
          box-shadow: inset 0 0 10px rgba(59, 130, 246, 0.02);
        }

        .chat-bubble {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.5;
        }
        .chat-bubble.admin {
          background: var(--brand-blue);
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.sender {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }

        @keyframes slideIn {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* TOASTS */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={26} color="var(--brand-blue)" /> Centro de Tickets de Soporte
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Administra tickets internos entre departamentos y gestiona las solicitudes de soporte y aclaraciones enviadas por estudiantes.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          style={{
            background: 'var(--gradient-accent)',
            color: '#081c33',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(229, 169, 59, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={18} /> Registrar Ticket
        </button>
      </div>

      {/* FILTROS GENERALES */}
      <div className="bento-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
          <Filter size={16} color="var(--brand-blue)" /> Filtros:
        </div>

        {/* Filtro Tipo */}
        <select 
          value={filterTipo} 
          onChange={(e) => setFilterTipo(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '12.5px' }}
        >
          <option value="">Todos los Tipos</option>
          <option value="ADMINISTRATIVO">Internos (Admin a Admin)</option>
          <option value="ESTUDIANTE">Alumnos a Administrativos</option>
        </select>

        {/* Filtro Estado */}
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '12.5px' }}
        >
          <option value="">Todos los Estatus</option>
          <option value="ABIERTO">Abierto 🔴</option>
          <option value="EN_PROCESO">En Proceso 🟡</option>
          <option value="RESUELTO">Resuelto 🟢</option>
          <option value="CERRADO">Cerrado ⚫</option>
        </select>

        {/* Filtro Categoria */}
        <select 
          value={filterCategoria} 
          onChange={(e) => setFilterCategoria(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '12.5px' }}
        >
          <option value="">Todos los Departamentos</option>
          <option value="Soporte">Soporte Técnico</option>
          <option value="Finanzas">Finanzas</option>
          <option value="Académico">Académico</option>
          <option value="Control Escolar">Control Escolar</option>
        </select>

        {/* Buscador */}
        <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
          <input 
            type="text" 
            placeholder="Buscar por asunto, folio o descripción..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '6px 12px 6px 32px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '12.5px' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-secondary)' }} />
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: LISTADO Y DETALLE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', height: 'calc(100vh - 280px)', minHeight: '550px' }}>
        
        {/* PANEL IZQUIERDO: LISTA DE TICKETS */}
        <div className="bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
            <Clock size={16} color="var(--brand-blue)" /> Historial de Tickets ({filteredTickets.length})
          </h3>

          {filteredTickets.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', border: '2px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <AlertCircle size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>No se encontraron tickets</h4>
              <p style={{ margin: 0, fontSize: '12px' }}>Intenta ajustando los criterios de búsqueda o filtros.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {filteredTickets.map((t) => {
                const isActive = activeTicket?.id === t.id;
                const formattedDate = new Date(t.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

                return (
                  <div 
                    key={t.id} 
                    className={`ticket-item ${isActive ? 'active' : ''}`}
                    onClick={() => useAppStore.setState({ activeTicket: t })}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--brand-blue)' }}>{t.folio}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{formattedDate}</span>
                    </div>

                    <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.asunto}
                    </h4>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      {/* Badge Categoria */}
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', background: 'rgba(15, 56, 105, 0.06)', color: 'var(--text-secondary)' }}>
                        {t.categoria}
                      </span>
                      {/* Badge Prioridad */}
                      <span style={{
                        fontSize: '9px',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: t.prioridad === 'ALTA' ? 'rgba(239, 68, 68, 0.1)' : t.prioridad === 'MEDIA' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                        color: t.prioridad === 'ALTA' ? '#ef4444' : t.prioridad === 'MEDIA' ? '#3b82f6' : '#64748b'
                      }}>
                        {t.prioridad}
                      </span>
                      {/* Badge Estatus */}
                      <span style={{
                        fontSize: '9px',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: t.status === 'ABIERTO' ? 'rgba(239, 68, 68, 0.08)' : t.status === 'EN_PROCESO' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                        color: t.status === 'ABIERTO' ? '#ef4444' : t.status === 'EN_PROCESO' ? '#f59e0b' : '#10b981'
                      }}>
                        {t.status === 'ABIERTO' ? 'Abierto' : t.status === 'EN_PROCESO' ? 'En Proceso' : 'Resuelto'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PANEL DERECHO: DETALLE DEL TICKET */}
        <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'hidden' }}>
          {!activeTicket ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-secondary)', textAlign: 'center' }}>
              <MessageSquare size={44} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Bandeja de Detalle</h3>
              <p style={{ margin: 0, fontSize: '12px' }}>Selecciona un ticket del historial izquierdo para ver la conversación y dar seguimiento al caso.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              
              {/* CABECERA DETALLE */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--brand-blue)' }}>{activeTicket.folio}</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{activeTicket.asunto}</h3>
                  </div>
                  
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>Creado: <strong>{new Date(activeTicket.createdAt).toLocaleString('es-MX')}</strong></span>
                    <span>Depto: <strong>{activeTicket.categoria}</strong></span>
                    <span>
                      Creador: {' '}
                      <strong>
                        {activeTicket.tipoTicket === 'ADMINISTRATIVO' 
                          ? `Usuario (${activeTicket.creatorUsuario?.nombre})` 
                          : `Alumno (${activeTicket.creatorAlumno?.nombre} - ${activeTicket.creatorAlumno?.curso})`}
                      </strong>
                    </span>
                    {activeTicket.responsableUsuario && (
                      <span>
                        Responsable: <strong>{activeTicket.responsableUsuario.nombre}</strong>
                      </span>
                    )}
                    {activeTicket.status === 'CERRADO' && activeTicket.closedByUsuario && (
                      <span style={{ color: '#ef4444' }}>
                        Cerrado por: <strong>{activeTicket.closedByUsuario.nombre}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* SELECTORES DE ESTADO / PRIORIDAD / RESPONSABLE */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Responsable</label>
                    <select 
                      value={activeTicket.responsableUsuarioId || ''}
                      onChange={(e) => handleResponsableChange(e.target.value || null)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: '700' }}
                    >
                      <option value="">Sin asignar</option>
                      {usuarios.map(u => (
                        <option key={u.id} value={u.id}>{u.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Estatus</label>
                    <select 
                      value={activeTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: '700' }}
                    >
                      <option value="ABIERTO">Abierto</option>
                      <option value="EN_PROCESO">En Proceso</option>
                      <option value="RESUELTO">Resuelto</option>
                      <option value="CERRADO">Cerrado</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Prioridad</label>
                    <select 
                      value={activeTicket.prioridad}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: '700' }}
                    >
                      <option value="BAJA">Baja</option>
                      <option value="MEDIA">Media</option>
                      <option value="ALTA">Alta</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CHAT/CONVERSACIÓN (SCROLLABLE CONTAINER) */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 4px' }}>
                {/* Primer Mensaje (Descripción de Apertura) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(15, 56, 105, 0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(15, 56, 105, 0.08)', paddingBottom: '6px', marginBottom: '6px' }}>
                    <span>Apertura de Ticket</span>
                    <span>{new Date(activeTicket.createdAt).toLocaleString('es-MX')}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{activeTicket.descripcion}</p>
                  
                  {/* Link del Adjunto */}
                  {activeTicket.adjuntoUrl && (
                    <div style={{ marginTop: '10px' }}>
                      <button 
                        onClick={() => window.open(activeTicket.adjuntoUrl!, '_blank')}
                        className="btn-secondary" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '4px 10px', height: 'auto', border: '1px solid var(--border-color)' }}
                      >
                        <Eye size={12} /> Ver archivo adjunto
                      </button>
                    </div>
                  )}
                </div>

                {/* Mensajes Consecuentes */}
                {activeTicket.mensajes?.map((msg: TicketMessage) => {
                  const isAdminMsg = msg.remitenteTipo === 'ADMIN';
                  return (
                    <div 
                      key={msg.id}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignSelf: isAdminMsg ? 'flex-end' : 'flex-start',
                        alignItems: isAdminMsg ? 'flex-end' : 'flex-start',
                        gap: '2px',
                        width: '100%'
                      }}
                    >
                      <div className={`chat-bubble ${isAdminMsg ? 'admin' : 'sender'}`}>
                        {msg.contenido}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', padding: '0 4px' }}>
                        {msg.remitenteNombre} • {new Date(msg.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* RESPUESTA INPUT AREA */}
              <form onSubmit={(e) => handleSendReply(e, false)} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', flexShrink: 0, display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <textarea 
                  rows={2} 
                  placeholder="Escribe tu respuesta oficial para el ticket..." 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{
                    flex: 1,
                    resize: 'none',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-main)',
                    border: '1.5px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply(e, false);
                    }
                  }}
                />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    type="submit" 
                    disabled={isReplying || !replyText.trim()}
                    style={{
                      padding: '10px 18px',
                      background: 'var(--brand-blue)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: replyText.trim() ? 1 : 0.6
                    }}
                  >
                    {isReplying ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    <span>Responder</span>
                  </button>

                  <button 
                    type="button" 
                    disabled={isReplying}
                    onClick={(e) => handleSendReply(e, true)}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1.5px solid rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Check size={12} />
                    <span>Resolver Caso</span>
                  </button>
                </div>
              </form>

            </div>
          )}
        </div>
      </div>

      {/* MODAL: REGISTRAR NUEVO TICKET */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Registrar Solicitud / Ticket de Soporte
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

             <form onSubmit={handleCreateTicketSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Asunto */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Asunto / Título
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: Aclaración de Pago de Mensualidad #3" 
                  value={asunto} 
                  onChange={(e) => setAsunto(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {/* Categoría y Prioridad */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                    Departamento Asignado
                  </label>
                  <select 
                    value={categoria} 
                    onChange={(e) => setCategoria(e.target.value)}
                    className="form-select"
                  >
                    <option value="Soporte">Soporte Técnico</option>
                    <option value="Finanzas">Finanzas / Pagos</option>
                    <option value="Académico">Dirección Académica</option>
                    <option value="Control Escolar">Control Escolar</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                    Prioridad
                  </label>
                  <select 
                    value={prioridad} 
                    onChange={(e) => setPrioridad(e.target.value)}
                    className="form-select"
                  >
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Detalles / Descripción del Caso
                </label>
                <textarea 
                  placeholder="Explique detalladamente el proceso, problema o solicitud..." 
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="form-textarea"
                  rows={4}
                  required
                />
              </div>

              {/* Adjunto de archivo */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Adjuntar Archivo (Opcional - Máximo 5MB)
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="file" 
                    id="ticket-file-upload" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          showToast('El archivo supera el límite de 5MB.', 'error');
                          e.target.value = '';
                        } else {
                          setSelectedFile(file);
                        }
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <button 
                    type="button"
                    onClick={() => document.getElementById('ticket-file-upload')?.click()}
                    className="btn-secondary"
                    style={{ border: '1px solid var(--border-color)', height: '40px', padding: '0 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <UploadIcon size={14} /> Seleccionar Archivo
                  </button>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
                  </span>
                  {selectedFile && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setSelectedFile(null);
                        const fileInput = document.getElementById('ticket-file-upload') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Acciones Modal */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '10px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '16px'
              }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--text-primary)'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving || uploadingFile}
                  style={{
                    background: 'var(--gradient-accent)',
                    color: '#081c33',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 10px rgba(229, 169, 59, 0.2)'
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Abrir Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Icono simple de carga/adjunto para uso local
function UploadIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
