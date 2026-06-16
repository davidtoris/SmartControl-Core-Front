import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Wallet, Calendar, CheckCircle2,
  AlertCircle, Clipboard, Play, LogOut, Target, ChevronRight,
  BookOpen, Clock, FileCheck, ArrowLeft, MessageSquare, Mail, Eye, Sparkles,
  Sun, Moon, Download, Upload, LifeBuoy, Send, Plus
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Student, ExamAttempt, TicketMessage } from '../store/useAppStore';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip
} from 'recharts';
import apiClient from '../api/apiClient';

export default function EstudiantePortalPage() {
  const navigate = useNavigate();
  const { 
    students, 
    studentMessages, 
    markMessageAsRead, 
    servicios, 
    fetchStudents, 
    fetchServicios,
    fetchStudentMessages,
    studentTickets,
    fetchStudentTickets,
    createTicket,
    replyTicket
  } = useAppStore();

  const [activeStudentId, setActiveStudentId] = useState<string | number | null>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramId = searchParams.get('studentId');
    if (paramId) {
      return isNaN(Number(paramId)) ? paramId : Number(paramId);
    }
    return null;
  });

  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null
  });

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', type: null });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback.message]);

  useEffect(() => {
    if (students.length === 0) {
      fetchStudents();
    }
    if (servicios.length === 0) {
      fetchServicios();
    }
  }, [students.length, servicios.length, fetchStudents, fetchServicios]);

  // Estado para la columna derecha (Comunicados vs Soporte)
  const [rightPanelTab, setRightPanelTab] = useState<'comunicados' | 'tickets'>('comunicados');
  const [selectedPortalTicketId, setSelectedPortalTicketId] = useState<string | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState<boolean>(false);

  // Formulario Nuevo Ticket Estudiante
  const [ticketAsunto, setTicketAsunto] = useState('');
  const [ticketDescripcion, setTicketDescripcion] = useState('');
  const [ticketCategoria, setTicketCategoria] = useState('Soporte');
  const [ticketPrioridad, setTicketPrioridad] = useState('MEDIA');
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [isSavingTicket, setIsSavingTicket] = useState(false);

  // Respuesta a Ticket Estudiante
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [isReplyingTicket, setIsReplyingTicket] = useState(false);

  useEffect(() => {
    if (activeStudentId) {
      fetchStudentMessages(activeStudentId);
    }
  }, [activeStudentId, fetchStudentMessages]);

  useEffect(() => {
    if (activeStudentId && rightPanelTab === 'tickets') {
      fetchStudentTickets(activeStudentId);
    }
  }, [activeStudentId, rightPanelTab, fetchStudentTickets]);

  // Tema Claro / Oscuro (con persistencia)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('crece-portal-theme');
    return saved === 'dark'; // default to false (light theme)
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('crece-portal-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Mensaje seleccionado localmente para expansión
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

  // Modal para ver los intentos registrados
  const [showAttemptsModal, setShowAttemptsModal] = useState<boolean>(false);
  // Intento seleccionado para ver el desglose completo
  const [reviewAttempt, setReviewAttempt] = useState<ExamAttempt | null>(null);


  // Alumno logueado actualmente
  const activeStudent = students.find(s => s.id === activeStudentId);

  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    if (!ticketAsunto.trim() || !ticketDescripcion.trim()) {
      setFeedback({ message: 'Por favor completa el asunto y la descripción de la solicitud.', type: 'error' });
      return;
    }

    setIsSavingTicket(true);
    let adjuntoUrl: string | null = null;
    try {
      if (ticketFile) {
        const formData = new FormData();
        formData.append('file', ticketFile);
        formData.append('folder', `tickets/adjuntos`);
        const cleanName = ticketFile.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        formData.append('fileName', `${cleanName}-${Date.now()}`);

        const uploadRes = await apiClient.post('/uploads/public', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        adjuntoUrl = uploadRes.data.url;
      }

      await createTicket({
        asunto: ticketAsunto.trim(),
        descripcion: ticketDescripcion.trim(),
        categoria: ticketCategoria,
        prioridad: ticketPrioridad,
        tipoTicket: 'ESTUDIANTE',
        creatorAlumnoId: activeStudent.id,
        adjuntoUrl
      });

      setFeedback({ message: '¡Tu solicitud de soporte ha sido enviada con éxito! 🎫', type: 'success' });
      setShowNewTicketForm(false);
      
      // Limpiar Formulario
      setTicketAsunto('');
      setTicketDescripcion('');
      setTicketCategoria('Soporte');
      setTicketPrioridad('MEDIA');
      setTicketFile(null);

      // Recargar
      if (activeStudentId) {
        await fetchStudentTickets(activeStudentId);
      }
    } catch (error) {
      console.error(error);
      setFeedback({ message: 'Error al enviar la solicitud de soporte.', type: 'error' });
    } finally {
      setIsSavingTicket(false);
    }
  };

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortalTicketId || !ticketReplyText.trim()) return;

    setIsReplyingTicket(true);
    try {
      await replyTicket({
        ticketId: selectedPortalTicketId,
        contenido: ticketReplyText.trim(),
        remitenteTipo: 'ALUMNO',
        remitenteNombre: activeStudent?.name || 'Estudiante'
      });
      setTicketReplyText('');
      setFeedback({ message: 'Mensaje enviado.', type: 'success' });
      
      // Recargar tickets del alumno para actualizar la conversación
      if (activeStudentId) {
        await fetchStudentTickets(activeStudentId);
      }
    } catch (error) {
      console.error(error);
      setFeedback({ message: 'Error al enviar el mensaje.', type: 'error' });
    } finally {
      setIsReplyingTicket(false);
    }
  };

  const handleViewDocument = async (url?: string) => {
    if (!url) {
      setFeedback({ message: 'No se encontró la URL del documento.', type: 'error' });
      return;
    }
    try {
      if (url.startsWith('http') && url.includes('amazonaws.com') && !url.includes('Signature=')) {
        const res = await apiClient.get(`/uploads/presigned?url=${encodeURIComponent(url)}`);
        window.open(res.data.url, '_blank');
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Error al firmar URL:', err);
      window.open(url, '_blank');
    }
  };

  const handleUploadDocument = async (docName: string, file: File) => {
    if (!activeStudent) return;

    // Validar límite de 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ message: 'El archivo supera el límite de 5MB.', type: 'error' });
      return;
    }

    try {
      setUploadingDocs(prev => ({ ...prev, [docName]: true }));

      // 1. Subir archivo a S3 en la carpeta del alumno
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `alumnos/id/${activeStudent.id}/documentos`);

      const cleanDocName = docName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const targetName = `${cleanDocName}-${Date.now()}`;
      formData.append('fileName', targetName);

      const uploadRes = await apiClient.post('/uploads/public', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const uploadedUrl = uploadRes.data.url;

      // Construir la nueva lista de documentos y limpiar comentarios
      const updatedDocs = (activeStudent.documents || []).map((d: any) => {
        if (d.name === docName) {
          return { ...d, status: 'Subido', url: uploadedUrl, comentario: null };
        }
        return d;
      });

      // Si por alguna razón el documento no estaba en la lista requerida del alumno, lo agregamos
      if (!updatedDocs.find((d: any) => d.name === docName)) {
        updatedDocs.push({ name: docName, status: 'Subido', url: uploadedUrl, comentario: null });
      }

      // Actualizar a través del Zustand Store
      await useAppStore.getState().updateStudentTracking(activeStudent.id, {
        documents: updatedDocs
      });

      setFeedback({ message: `¡Documento "${docName}" subido con éxito! 📄`, type: 'success' });
    } catch (err) {
      console.error('Error al subir el documento:', err);
      setFeedback({ message: 'Error al subir el archivo. Intente de nuevo.', type: 'error' });
    } finally {
      setUploadingDocs(prev => ({ ...prev, [docName]: false }));
    }
  };

  // Filtrar mensajes del alumno activo
  const activeStudentMessages = studentMessages.filter(msg => msg.studentId === activeStudentId);
  const unreadMessagesCount = activeStudentMessages.filter(msg => !msg.readAt).length;

  const handleLogout = () => {
    setActiveStudentId(null);
    setExpandedMessageId(null);
  };

  const getFinancialInfo = (student: Student) => {
    const paid = student.paymentPlan.amountPaid;
    const total = student.paymentPlan.totalCost;
    const debt = total - paid;
    const isOverdue = student.nextPaymentDate ? new Date('2026-05-26').getTime() - new Date(student.nextPaymentDate).getTime() > 0 : false;

    return { paid, total, debt, isOverdue };
  };

  const handleMessageClick = (msgId: string) => {
    if (expandedMessageId === msgId) {
      setExpandedMessageId(null);
    } else {
      setExpandedMessageId(msgId);
      markMessageAsRead(msgId);
    }
  };

  const getPerformanceData = (student: Student) => {
    if (!student.examAttempts || student.examAttempts.length === 0) {
      return [];
    }

    return student.examAttempts.map((attempt, index) => ({
      name: `Int. ${index + 1}`,
      aciertos: attempt.cheatingCanceled ? 0 : attempt.score,
      maxPosible: attempt.max
    }));
  };

  const selectedTicket = studentTickets.find(t => t.id === selectedPortalTicketId);

  return (
    <div className={`portal-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`} style={{
      minHeight: '100vh',
      width: '100%',
      background: 'var(--portal-bg)',
      color: 'var(--portal-color)',
      fontFamily: "'Outfit', sans-serif",
      padding: '24px 30px',
      position: 'relative',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      {styleTag()}



      {/* Contenedor de Luces de fondo decorativas (con overflow hidden para evitar scrollbars fantasmas) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <div style={{ position: 'absolute', width: '450px', height: '450px', background: 'var(--portal-glow-1)', borderRadius: '50%', filter: 'blur(100px)', top: '-100px', left: '-100px', transition: 'background 0.3s ease' }}></div>
        <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'var(--portal-glow-2)', borderRadius: '50%', filter: 'blur(120px)', bottom: '-150px', right: '-100px', transition: 'background 0.3s ease' }}></div>
      </div>

      {/* 1. MODO: SELECTOR DE ALUMNO (LOGIN SIMULADO) */}
      {!activeStudent ? (
        <div style={{ maxWidth: '680px', margin: '80px auto', position: 'relative', zIndex: 10 }}>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '24px',
              background: 'var(--gradient-card)',
              color: 'var(--brand-yellow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 8px 24px rgba(15, 56, 105, 0.25)',
              border: '2px solid var(--brand-yellow)'
            }}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <path d="M12 2L2 7.5L12 13L22 7.5L12 2Z" fill="var(--brand-yellow)" />
                <path d="M17 10.25V14.5C17 16.5 14.75 18 12 18C9.25 18 7 16.5 7 14.5V10.25L12 13L17 10.25Z" fill="#ffffff" />
                <path d="M18 7.5V12.5" stroke="var(--brand-yellow)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M17 12.5H19V14.5H17V12.5Z" fill="var(--brand-yellow)" />
              </svg>
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              CRECE Portal del Estudiante
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '16px', marginTop: '10px', maxWidth: '500px', marginInline: 'auto' }}>
              Ingresa al simulador del portal del alumno. Selecciona un estudiante para cargar sus calificaciones, alertas de adeudos y centro de mensajería reactiva.
            </p>
          </div>

          <div className="login-card" style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '28px',
            padding: '36px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2563eb', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} /> Selecciona un Expediente
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {students.map(student => {
                const { debt, isOverdue } = getFinancialInfo(student);
                const sMsgs = studentMessages.filter(m => m.studentId === student.id);
                const unread = sMsgs.filter(m => !m.readAt).length;

                return (
                  <div
                    key={student.id}
                    onClick={() => setActiveStudentId(student.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '18px 24px',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    className="student-card-selector"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: 'rgba(15, 56, 105, 0.08)',
                        color: 'var(--brand-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '16px',
                        border: '1px solid rgba(15, 56, 105, 0.15)'
                      }}>
                        {student.avatar || student.name.charAt(0)}
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{student.name}</span>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>{student.curso}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {unread > 0 && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '100px',
                            background: '#ef4444',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            animation: 'pulse-badge 2s infinite'
                          }}>
                            <Mail size={11} /> {unread}
                          </span>
                        )}

                        {debt > 0 ? (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '3px 10px',
                            borderRadius: '100px',
                            background: isOverdue ? 'rgba(239, 68, 68, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                            color: isOverdue ? '#f87171' : '#fbbf24'
                          }}>
                            {isOverdue ? 'Pendiente ⚠️' : 'Al Corriente'}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>
                            Liquidado ✅
                          </span>
                        )}
                      </div>
                      <ChevronRight size={18} color="#4b5563" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '28px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2563eb',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={14} /> Volver a la Administración de CRECE
              </button>
            </div>
          </div>
        </div>
      ) : (

        // 2. PORTAL DE ALUMNO COMPLETO (VISTA DE PANTALLA COMPLETA - ESPECTACULAR DISEÑO DE 3 COLUMNAS)
        <div style={{
          maxWidth: '1560px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          minHeight: 'calc(100vh - 48px)',
          boxSizing: 'border-box'
        }}>

          {/* Header del Alumno - Rediseño Académico Corporativo con el Azul Fuerte del Sidebar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-sidebar)', /* Usamos el azul fuerte del sidebar */
            border: '1px solid rgba(229, 169, 59, 0.28)',
            padding: '18px 28px',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(8, 28, 51, 0.35)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'var(--gradient-accent)',
                color: '#081c33',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '20px',
                boxShadow: '0 4px 14px rgba(229, 169, 59, 0.25)',
                border: '1.5px solid var(--brand-blue)'
              }}>
                {activeStudent.avatar || activeStudent.name.charAt(0)}
              </div>
              <div>
                <h2 className="portal-header-title text-white">
                  Bienvenido, {activeStudent.name}
                </h2>
                <span className="portal-header-subtitle">
                  <span className="portal-header-badge">CRECE</span>
                  <BookOpen size={14} color="var(--brand-yellow)" /> <span className="portal-header-course">{activeStudent.curso}</span> • Portal del Alumno
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Alerta de Mensajes No Leídos */}
              {unreadMessagesCount > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: 'pulse-border 2.5s infinite'
                }}>
                  <Mail size={16} className="shake-icon" />
                  <span>{unreadMessagesCount} {unreadMessagesCount === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}</span>
                </div>
              )}

              {/* Selector de Tema Claro / Oscuro en Header */}
              <button
                onClick={toggleTheme}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease-in-out',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
                className="btn-theme-toggle"
                title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              >
                {isDarkMode ? (
                  <>
                    <Sun size={14} color="#facc15" fill="#facc15" />
                    <span>Claro</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} color="#facc15" fill="#facc15" />
                    <span>Oscuro</span>
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="btn-exit-portal"
              >
                <LogOut size={14} /> Salir del Simulador
              </button>
            </div>
          </div>

          {/* Grid de Contenido Principal (3 columnas: Finanzas/Expediente, Académico/Meta, Mensajes) */}
          <div className="portal-grid">

            {/* ================= COLUMNA 1 (IZQUIERDA): FINANZAS Y EXPEDIENTE DIGITAL ================= */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

              {/* Card 1: Estado Financiero */}
              {(() => {
                const { paid, total, debt, isOverdue } = getFinancialInfo(activeStudent);
                const percentPaid = total > 0 ? Math.round((paid / total) * 100) : 0;
                return (
                  <div className="glass-card brand-accent-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Wallet size={18} color="#10b981" /> Estado de Cuenta
                    </h3>

                    {/* Alerta de Pago */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: debt > 0 ? (isOverdue ? 'rgba(239, 68, 68, 0.08)' : 'rgba(234, 179, 8, 0.08)') : 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid ' + (debt > 0 ? (isOverdue ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)') : 'rgba(16, 185, 129, 0.15)'),
                      marginBottom: '16px'
                    }}>
                      {debt > 0 ? (
                        isOverdue ? (
                          <>
                            <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0 }} />
                            <span className="alert-text-overdue" style={{ fontSize: '12px', color: '#f87171', fontWeight: '600' }}>
                              Mensualidad Vencida. Favor de regularizar.
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} color="#facc15" style={{ flexShrink: 0 }} />
                            <span className="alert-text-ontime" style={{ fontSize: '12px', color: '#facc15', fontWeight: '600' }}>
                              Al corriente. Próxima fecha: {activeStudent.nextPaymentDate ? new Date(activeStudent.nextPaymentDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : 'S/D'}
                            </span>
                          </>
                        )
                      ) : (
                        <>
                          <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0 }} />
                          <span className="alert-text-paid" style={{ fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
                            ¡Curso completamente liquidado! Gracias.
                          </span>
                        </>
                      )}
                    </div>

                    {/* Progresos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#9ca3af' }}>Costo Total:</span>
                        <strong style={{ color: '#ffffff' }}>${total.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#9ca3af' }}>Total Cubierto:</span>
                        <strong style={{ color: '#34d399' }}>${paid.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#9ca3af' }}>Saldo Deudor:</span>
                        <strong style={{ color: debt > 0 ? '#facc15' : '#ffffff' }}>${debt.toLocaleString()}</strong>
                      </div>

                      {/* Progreso slider */}
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: '#9ca3af' }}>Avance de Pagos</span>
                          <span style={{ color: '#ffffff', fontWeight: '600' }}>{percentPaid}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentPaid}%`, height: '100%', background: '#34d399', borderRadius: '100px' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Card 2: Documentos de Inscripción */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCheck size={18} color="#2563eb" /> Documentos del Expediente
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeStudent.documents.map((doc, idx) => {
                    const showUploadButton = doc.status === 'Rechazado' || doc.status === 'Faltante' || !doc.status;
                    
                    // Match student service to look up document characteristics
                    const studentService = servicios.find((s: any) => 
                      activeStudent?.curso?.toLowerCase().includes(s.nombre.toLowerCase()) ||
                      s.nombre.toLowerCase().includes(activeStudent?.curso?.replace('Ingreso ', '')?.toLowerCase())
                    );
                    const matchedDocConfig = studentService?.documentosConfig?.find((d: any) => d.nombre === doc.name);
                    const characteristics = matchedDocConfig?.caracteristicas || '';

                    return (
                      <div
                        key={idx}
                        className="inner-accent-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', flex: 1, marginRight: '16px' }}>
                          <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500' }}>
                            {doc.name}
                          </span>
                          {characteristics && (
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                              {characteristics}
                            </span>
                          )}
                          {doc.status === 'Rechazado' && doc.comentario && (
                            <span style={{ fontSize: '11px', color: '#f87171', marginTop: '4px', fontWeight: '500', display: 'block' }}>
                              Motivo de rechazo: {doc.comentario}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          {doc.url && (
                            <button
                              type="button"
                              onClick={() => handleViewDocument(doc.url)}
                              title="Ver documento"
                              style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#34d399',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                              }}
                            >
                              <Eye size={12} />
                            </button>
                          )}

                          {showUploadButton && (
                            <>
                              <input 
                                type="file"
                                id={`student-doc-file-${idx}`}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleUploadDocument(doc.name, file);
                                  }
                                }}
                              />
                              {uploadingDocs[doc.name] ? (
                                <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '500' }}>
                                  Subiendo...
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => document.getElementById(`student-doc-file-${idx}`)?.click()}
                                  style={{
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '8px',
                                    color: '#60a5fa',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '4px 10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Upload size={12} /> Subir
                                </button>
                              )}
                            </>
                          )}

                          {/* Badge de Estatus */}
                          {doc.status === 'Verificado' && (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '600',
                              padding: '2px 8px',
                              borderRadius: '100px',
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: '#34d399'
                            }}>
                              Verificado ✓
                            </span>
                          )}

                          {doc.status === 'Subido' && (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '600',
                              padding: '2px 8px',
                              borderRadius: '100px',
                              background: 'rgba(59, 130, 246, 0.12)',
                              color: '#60a5fa'
                            }}>
                              En Revisión ⏳
                            </span>
                          )}

                          {doc.status === 'Rechazado' && (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '600',
                              padding: '2px 8px',
                              borderRadius: '100px',
                              background: 'rgba(239, 68, 68, 0.12)',
                              color: '#f87171'
                            }}>
                              Rechazado ❌
                            </span>
                          )}

                          {(doc.status === 'Faltante' || !doc.status) && (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '600',
                              padding: '2px 8px',
                              borderRadius: '100px',
                              background: 'rgba(156, 163, 175, 0.12)',
                              color: '#9ca3af'
                            }}>
                              Pendiente ❌
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: Repositorio de Materiales y Guías Dinámicas */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color="var(--brand-yellow)" /> Repositorio de Materiales
                </h3>

                {(() => {
                  const matchingServicio = servicios.find((s: any) => 
                    activeStudent?.curso?.toLowerCase().includes(s.nombre.toLowerCase()) ||
                    s.nombre.toLowerCase().includes(activeStudent?.curso?.replace('Ingreso ', '')?.toLowerCase())
                  );
                  const materiales = matchingServicio?.materiales || [];

                  if (materiales.length === 0) {
                    return (
                      <div style={{ padding: '24px 12px', border: '1px dashed var(--inner-card-border)', borderRadius: '12px', textAlign: 'center', background: 'var(--inner-card-bg)' }}>
                        <BookOpen size={28} color="var(--text-secondary)" style={{ marginBottom: '8px', opacity: 0.6, marginInline: 'auto' }} />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>Sin Guías Asignadas</span>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                          No se han configurado documentos descargables para este curso. Solicita tus guías a coordinación.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {materiales.map((material, idx) => {
                        let size = '1.8 MB';
                        if (material.includes('Matemáticas')) size = '2.4 MB';
                        else if (material.includes('Español')) size = '2.1 MB';
                        else if (material.includes('Bienvenida')) size = '1.5 MB';
                        else if (material.includes('Reglamento')) size = '0.9 MB';
                        else if (material.includes('Examen')) size = '1.1 MB';
                        else if (material.includes('COMIPEMS')) size = '3.2 MB';

                        const matchedMatConfig = matchingServicio?.materialesConfig?.find((m: any) => m.nombre === material);
                        const characteristics = matchedMatConfig?.caracteristicas || '';
                        const fileUrl = matchedMatConfig?.url || null;

                        const bgIcon = idx % 2 === 0 ? 'rgba(234, 179, 8, 0.1)' : 'rgba(59, 130, 246, 0.1)';
                        const colorIcon = idx % 2 === 0 ? '#ca8a04' : '#2563eb';

                        return (
                          <div
                            key={idx}
                            className="inner-accent-card"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 14px',
                              borderRadius: '14px',
                              background: 'var(--inner-card-bg)',
                              border: '1px solid var(--inner-card-border)',
                              transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                          >
                            <div style={{ padding: '8px', background: bgIcon, color: colorIcon, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <BookOpen size={16} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={material}>
                                {material}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                                <span>PDF • {size}</span>
                                {characteristics && (
                                  <>
                                    <span>•</span>
                                    <span style={{ color: 'var(--brand-blue, #2563eb)' }}>{characteristics}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (fileUrl) {
                                  window.open(fileUrl, '_blank');
                                } else {
                                  setFeedback({ message: 'Este material de estudio se encuentra en preparación. Por favor, solicítalo en coordinación académica o inténtalo más tarde.', type: 'error' });
                                }
                              }}
                              style={{
                                background: 'transparent',
                                border: `1.5px solid ${fileUrl ? 'var(--brand-blue, #2563eb)' : 'var(--text-secondary, #94a3b8)'}`,
                                borderRadius: '8px',
                                color: fileUrl ? 'var(--brand-blue, #2563eb)' : 'var(--text-secondary, #94a3b8)',
                                cursor: fileUrl ? 'pointer' : 'not-allowed',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease-in-out'
                              }}
                              title={fileUrl ? "Descargar / Ver material" : "Archivo no disponible"}
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* ================= COLUMNA 2 (CENTRO): METAS E HISTÓRICO ACADÉMICO ================= */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

              {/* Card 1: Meta de Admisión */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={18} color="var(--brand-blue)" /> Meta de Admisión
                  </h3>
                  <span style={{ fontSize: '12px', background: 'rgba(15, 56, 105, 0.08)', color: 'var(--brand-blue)', padding: '4px 12px', borderRadius: '100px', fontWeight: '600', border: '1px solid rgba(15, 56, 105, 0.15)' }}>
                    Objetivo: {activeStudent.curso === 'COMIPEMS' ? '128' : '120'} aciertos
                  </span>
                </div>

                <div className="inner-accent-card" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>Puntaje más alto obtenido</span>
                    <strong style={{ fontSize: '16px', color: '#34d399' }}>
                      {activeStudent.examAttempts && activeStudent.examAttempts.length > 0
                        ? Math.max(...activeStudent.examAttempts.map(a => a.score))
                        : '0'} aciertos
                    </strong>
                  </div>

                  <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{
                      width: activeStudent.examAttempts && activeStudent.examAttempts.length > 0
                        ? `${(Math.max(...activeStudent.examAttempts.map(a => a.score)) / (activeStudent.curso === 'COMIPEMS' ? 128 : 120)) * 100}%`
                        : '0%',
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--brand-blue) 0%, #34d399 100%)',
                      borderRadius: '100px'
                    }}></div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/examen?studentId=${activeStudent.id}&portal=true`)}
                  style={{
                    width: '100%',
                    background: 'var(--gradient-accent)',
                    border: 'none',
                    color: '#081c33',
                    padding: '14px 20px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '700',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(229, 169, 59, 0.25)',
                    transition: 'all 0.2s'
                  }}
                  className="btn-start-exam"
                >
                  <Play size={14} fill="#081c33" stroke="none" /> Iniciar Examen Simulacro
                </button>
              </div>

              {/* Card 2: Evolución Académica */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="var(--brand-blue)" /> Histórico Académico
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>Curva de Desempeño</span>
                    <button
                      onClick={() => setShowAttemptsModal(true)}
                      style={{
                        background: 'rgba(15, 56, 105, 0.05)',
                        border: '1px solid rgba(15, 56, 105, 0.1)',
                        color: 'var(--text-primary)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      className="btn-ver-detalles"
                    >
                      <Eye size={12} />
                      <span>Ver detalles</span>
                    </button>
                  </div>
                </div>

                <div style={{ width: '100%', height: '300px', margin: '10px 0' }}>
                  {(() => {
                    const performanceData = getPerformanceData(activeStudent);

                    if (performanceData.length === 0) {
                      return (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1.5px dashed rgba(255,255,255,0.06)',
                          borderRadius: '16px',
                          boxSizing: 'border-box'
                        }}>
                          <TrendingUp size={32} color="rgba(255,255,255,0.15)" />
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', opacity: 0.5 }}>Sin datos académicos aún</span>
                            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.5, marginTop: '4px' }}>Realiza tu primer examen simulacro para ver tu evolución aquí.</span>
                          </div>
                        </div>
                      );
                    }

                    // Calcular máximo real del eje Y
                    const maxPosible = Math.max(...(activeStudent.examAttempts || []).map(a => a.max));
                    const yDomain: [number, number] = [0, maxPosible > 0 ? maxPosible : 10];

                    return (
                      <ResponsiveContainer>
                        <AreaChart data={performanceData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorAciertos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--brand-blue)" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="var(--brand-blue)" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15, 56, 105, 0.06)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} />
                          <YAxis domain={yDomain} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: '1px solid rgba(15,56,105,0.1)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'Outfit' }}
                            formatter={(value: any, _name: any, props: any) => [
                              `${value} de ${props?.payload?.maxPosible ?? '?'} aciertos`,
                              'Puntaje'
                            ]}
                          />
                          <Area type="monotone" dataKey="aciertos" stroke="var(--brand-blue)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAciertos)" dot={{ r: 4, fill: 'var(--brand-blue)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </div>

            </div>

            {/* ================= COLUMNA 3 (DERECHA): MENSAJES Y SOPORTE ================= */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

              <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* TABS SELECTOR */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--inner-card-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <button
                    onClick={() => {
                      setRightPanelTab('comunicados');
                      setSelectedPortalTicketId(null);
                      setShowNewTicketForm(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: rightPanelTab === 'comunicados' ? 'var(--inner-card-bg)' : 'transparent',
                      border: '1px solid ' + (rightPanelTab === 'comunicados' ? 'var(--inner-card-border)' : 'transparent'),
                      borderRadius: '12px',
                      color: rightPanelTab === 'comunicados' ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <MessageSquare size={15} />
                    <span>Avisos</span>
                  </button>

                  <button
                    onClick={() => {
                      setRightPanelTab('tickets');
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: rightPanelTab === 'tickets' ? 'var(--inner-card-bg)' : 'transparent',
                      border: '1px solid ' + (rightPanelTab === 'tickets' ? 'var(--inner-card-border)' : 'transparent'),
                      borderRadius: '12px',
                      color: rightPanelTab === 'tickets' ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <LifeBuoy size={15} />
                    <span>Soporte y Tickets</span>
                  </button>
                </div>

                {rightPanelTab === 'comunicados' ? (
                  /* VISTA COMUNICADOS */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Bandeja de Entrada</span>
                      {unreadMessagesCount > 0 && (
                        <span style={{
                          fontSize: '10px',
                          background: '#ef4444',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '100px',
                          fontWeight: '700',
                          animation: 'pulse-badge 2s infinite'
                        }}>
                          {unreadMessagesCount} nuevo{unreadMessagesCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '500px', paddingRight: '2px' }}>
                      {activeStudentMessages.length > 0 ? (
                        activeStudentMessages.map(msg => {
                          const isUnread = !msg.readAt;
                          const isExpanded = expandedMessageId === msg.id;

                          return (
                            <div
                              key={msg.id}
                              onClick={() => handleMessageClick(msg.id)}
                              style={{
                                background: isUnread ? 'rgba(59, 130, 246, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                                border: '1px solid ' + (isUnread ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)'),
                                borderRadius: '12px',
                                padding: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease-in-out',
                                position: 'relative'
                              }}
                              className={`message-card ${isUnread ? 'unread-glow' : ''}`}
                            >
                              {isUnread && (
                                <div style={{
                                  position: 'absolute',
                                  left: '6px',
                                  top: '16px',
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: '#3b82f6',
                                  boxShadow: '0 0 6px #3b82f6'
                                }}></div>
                              )}

                              <div style={{ paddingLeft: isUnread ? '8px' : '0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px', fontSize: '9.5px', color: '#9ca3af' }}>
                                  <span style={{ fontWeight: '700', color: isUnread ? '#3b82f6' : '#9ca3af' }}>
                                    {msg.sender}
                                  </span>
                                  <span>
                                    {(msg.sentAt || '').split(',')[0]}
                                  </span>
                                </div>

                                <h5 style={{
                                  fontSize: '12.5px',
                                  fontWeight: isUnread ? '700' : '600',
                                  color: isUnread ? '#ffffff' : '#d1d5db',
                                  margin: '0 0 4px 0',
                                  lineHeight: '1.3'
                                }}>
                                  {msg.title}
                                </h5>

                                {isExpanded ? (
                                  <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                                    <p style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 8px 0' }}>
                                      {msg.content}
                                    </p>

                                    <div style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      fontSize: '9px',
                                      background: 'rgba(0,0,0,0.15)',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      color: '#9ca3af'
                                    }}>
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <Eye size={10} /> Leído
                                      </span>
                                      <span>
                                        Leído: {msg.readAt || 'Procesando...'}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <p style={{
                                    fontSize: '11.5px',
                                    color: '#9ca3af',
                                    margin: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}>
                                    {msg.content}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
                          Sin comunicados en la bandeja.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* VISTA TICKETS / SOPORTE */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    {showNewTicketForm ? (
                      /* FORMULARIO DE NUEVO TICKET */
                      <form onSubmit={handleCreateTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setShowNewTicketForm(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: 0 }}
                          >
                            <ArrowLeft size={14} /> Volver
                          </button>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Nueva Solicitud de Soporte</span>
                        </div>

                        {/* Asunto */}
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                            Asunto / Título
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Duda sobre mi saldo o factura"
                            value={ticketAsunto}
                            onChange={(e) => setTicketAsunto(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: 'var(--inner-card-bg)',
                              border: '1.5px solid var(--inner-card-border)',
                              color: 'var(--text-primary)',
                              fontSize: '12.5px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                            required
                          />
                        </div>

                        {/* Departamento y Prioridad */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                              Departamento
                            </label>
                            <select
                              value={ticketCategoria}
                              onChange={(e) => setTicketCategoria(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                background: 'var(--inner-card-bg)',
                                border: '1.5px solid var(--inner-card-border)',
                                color: 'var(--text-primary)',
                                fontSize: '12px',
                                outline: 'none'
                              }}
                            >
                              <option value="Soporte">Soporte Técnico</option>
                              <option value="Finanzas">Finanzas / Pagos</option>
                              <option value="Académico">Académico</option>
                              <option value="Control Escolar">Control Escolar</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                              Prioridad
                            </label>
                            <select
                              value={ticketPrioridad}
                              onChange={(e) => setTicketPrioridad(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                background: 'var(--inner-card-bg)',
                                border: '1.5px solid var(--inner-card-border)',
                                color: 'var(--text-primary)',
                                fontSize: '12px',
                                outline: 'none'
                              }}
                            >
                              <option value="BAJA">Baja</option>
                              <option value="MEDIA">Media</option>
                              <option value="ALTA">Alta</option>
                            </select>
                          </div>
                        </div>

                        {/* Descripción */}
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                            Descripción detallada
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Detalla tu duda o problema aquí..."
                            value={ticketDescripcion}
                            onChange={(e) => setTicketDescripcion(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: 'var(--inner-card-bg)',
                              border: '1.5px solid var(--inner-card-border)',
                              color: 'var(--text-primary)',
                              fontSize: '12.5px',
                              outline: 'none',
                              resize: 'none',
                              lineHeight: '1.4',
                              boxSizing: 'border-box'
                            }}
                            required
                          />
                        </div>

                        {/* Adjunto */}
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                            Adjuntar captura o archivo (Opcional)
                          </label>
                          <input
                            type="file"
                            id="student-ticket-file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            style={{ display: 'none' }}
                            onChange={(e) => setTicketFile(e.target.files?.[0] || null)}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                              type="button"
                              onClick={() => document.getElementById('student-ticket-file')?.click()}
                              style={{
                                padding: '8px 14px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--inner-card-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Upload size={12} />
                              <span>{ticketFile ? 'Cambiar archivo' : 'Seleccionar archivo'}</span>
                            </button>
                            {ticketFile && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                                {ticketFile.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSavingTicket}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'var(--brand-blue, #2563eb)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: isSavingTicket ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: isSavingTicket ? 0.7 : 1,
                            marginTop: '8px'
                          }}
                        >
                          {isSavingTicket ? 'Enviando solicitud...' : 'Enviar Solicitud 🎫'}
                        </button>
                      </form>
                    ) : selectedPortalTicketId && selectedTicket ? (
                      /* DETALLE / CONVERSACIÓN DEL TICKET */
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '550px', gap: '12px' }}>
                        {/* Cabecera del ticket */}
                        <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--inner-card-border)', paddingBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedPortalTicketId(null)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                            >
                              <ArrowLeft size={16} />
                            </button>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--brand-blue, #2563eb)' }}>{selectedTicket.folio}</span>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: '700',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: selectedTicket.status === 'ABIERTO' ? 'rgba(239, 68, 68, 0.08)' : selectedTicket.status === 'EN_PROCESO' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                              color: selectedTicket.status === 'ABIERTO' ? '#ef4444' : selectedTicket.status === 'EN_PROCESO' ? '#f59e0b' : '#10b981',
                              marginLeft: 'auto'
                            }}>
                              {selectedTicket.status === 'ABIERTO' ? 'Abierto' : selectedTicket.status === 'EN_PROCESO' ? 'En Proceso' : 'Resuelto'}
                            </span>
                          </div>
                          <h5 style={{ margin: '4px 0 2px 0', fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {selectedTicket.asunto}
                          </h5>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            Depto: <strong>{selectedTicket.categoria}</strong> • Prioridad: <strong>{selectedTicket.prioridad}</strong>
                          </span>
                        </div>

                        {/* Mensajes del Ticket */}
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '6px 2px', minHeight: '180px', maxHeight: '320px' }}>
                          {/* Descripción de apertura del ticket */}
                          <div style={{ background: 'rgba(15, 56, 105, 0.03)', border: '1px solid var(--inner-card-border)', borderRadius: '10px', padding: '10px 12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', borderBottom: '1px solid rgba(15, 56, 105, 0.08)', paddingBottom: '4px', marginBottom: '6px' }}>
                              <span>Descripción Inicial</span>
                              <span>{new Date(selectedTicket.createdAt).toLocaleDateString('es-MX')}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{selectedTicket.descripcion}</p>
                            {selectedTicket.adjuntoUrl && (
                              <div style={{ marginTop: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleViewDocument(selectedTicket.adjuntoUrl || undefined)}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid var(--inner-card-border)',
                                    borderRadius: '6px',
                                    color: '#34d399',
                                    cursor: 'pointer',
                                    fontSize: '10px',
                                    padding: '4px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Eye size={10} />
                                  <span>Ver adjunto</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Lista de Respuestas */}
                          {selectedTicket.mensajes?.map((msg: TicketMessage) => {
                            const isStudentMsg = msg.remitenteTipo === 'ALUMNO';
                            return (
                              <div
                                key={msg.id}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignSelf: isStudentMsg ? 'flex-end' : 'flex-start',
                                  alignItems: isStudentMsg ? 'flex-end' : 'flex-start',
                                  gap: '2px',
                                  width: '100%'
                                }}
                              >
                                <div
                                  style={{
                                    maxWidth: '85%',
                                    padding: '10px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    lineHeight: '1.4',
                                    background: isStudentMsg ? 'var(--brand-blue, #2563eb)' : 'rgba(255,255,255,0.03)',
                                    border: isStudentMsg ? 'none' : '1px solid var(--inner-card-border)',
                                    color: isStudentMsg ? 'white' : 'var(--text-primary)',
                                    alignSelf: isStudentMsg ? 'flex-end' : 'flex-start',
                                    borderBottomRightRadius: isStudentMsg ? '2px' : '12px',
                                    borderBottomLeftRadius: isStudentMsg ? '12px' : '2px'
                                  }}
                                >
                                  {msg.contenido}
                                </div>
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)', padding: '0 4px' }}>
                                  {isStudentMsg ? 'Tú' : msg.remitenteNombre} • {new Date(msg.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Responder Formulario */}
                        {selectedTicket.status !== 'CERRADO' ? (
                          <form onSubmit={handleSendTicketReply} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--inner-card-border)', paddingTop: '10px' }}>
                            <input
                              type="text"
                              placeholder="Escribe tu mensaje..."
                              value={ticketReplyText}
                              onChange={(e) => setTicketReplyText(e.target.value)}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: 'var(--inner-card-bg)',
                                border: '1.5px solid var(--inner-card-border)',
                                color: 'var(--text-primary)',
                                fontSize: '12px',
                                outline: 'none'
                              }}
                              required
                            />
                            <button
                              type="submit"
                              disabled={isReplyingTicket || !ticketReplyText.trim()}
                              style={{
                                padding: '8px 14px',
                                background: 'var(--brand-blue, #2563eb)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Send size={12} />
                            </button>
                          </form>
                        ) : (
                          <div style={{ padding: '8px', textAlign: 'center', background: 'rgba(0,0,0,0.1)', border: '1px dashed var(--inner-card-border)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            Este ticket ha sido cerrado y no admite más mensajes.
                          </div>
                        )}
                      </div>
                    ) : (
                      /* LISTADO DE TICKETS DEL ALUMNO */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Tus Tickets de Soporte</span>
                          <button
                            onClick={() => setShowNewTicketForm(true)}
                            style={{
                              background: 'var(--gradient-accent)',
                              color: '#081c33',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '5px 10px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 6px rgba(229, 169, 59, 0.2)'
                            }}
                          >
                            <Plus size={12} /> Nueva Solicitud
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '450px', paddingRight: '2px' }}>
                          {studentTickets && studentTickets.length > 0 ? (
                            studentTickets.map(t => {
                              const dateStr = new Date(t.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
                              return (
                                <div
                                  key={t.id}
                                  onClick={() => setSelectedPortalTicketId(t.id)}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.01)',
                                    border: '1px solid var(--inner-card-border)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease-in-out'
                                  }}
                                  className="message-card"
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--brand-blue, #2563eb)' }}>{t.folio}</span>
                                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{dateStr}</span>
                                  </div>

                                  <h5 style={{ margin: '0 0 6px 0', fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {t.asunto}
                                  </h5>

                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(15, 56, 105, 0.05)', color: 'var(--text-muted)' }}>
                                      {t.categoria}
                                    </span>
                                    <span style={{
                                      fontSize: '9px',
                                      fontWeight: '700',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      background: t.status === 'ABIERTO' ? 'rgba(239, 68, 68, 0.08)' : t.status === 'EN_PROCESO' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                      color: t.status === 'ABIERTO' ? '#ef4444' : t.status === 'EN_PROCESO' ? '#f59e0b' : '#10b981',
                                      marginLeft: 'auto'
                                    }}>
                                      {t.status === 'ABIERTO' ? 'Abierto' : t.status === 'EN_PROCESO' ? 'En Proceso' : 'Resuelto'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ padding: '30px 10px', textAlign: 'center', border: '1px dashed var(--inner-card-border)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                              <LifeBuoy size={24} style={{ opacity: 0.4, marginBottom: '6px', marginInline: 'auto' }} />
                              <span>¿Necesitas ayuda?</span>
                              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                                Crea un ticket de soporte para contactar a control escolar o resolver dudas académicas/financieras.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Modal de Intentos Registrados */}
          {showAttemptsModal && (
            <div
              onClick={() => setShowAttemptsModal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
                boxSizing: 'border-box',
                animation: 'fadeIn 0.25s ease-out'
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="glass-card animate-modal"
                style={{
                  width: '100%',
                  maxWidth: '540px',
                  maxHeight: '80vh',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '24px',
                  boxShadow: 'var(--card-shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  animation: 'slideUp 0.25s ease-out',
                  overflow: 'hidden'
                }}
              >
                {/* Cabecera del Modal */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--inner-card-border)',
                  background: 'rgba(255, 255, 255, 0.015)'
                }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clipboard size={20} color="#f59e0b" /> Intentos Registrados
                    </h3>
                    <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px', display: 'block' }}>
                      Historial de simulacros de {activeStudent.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAttemptsModal(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '18px',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                      transition: 'transform 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    ✕
                  </button>
                </div>


                {/* Contenido / Lista */}
                <div style={{
                  padding: '24px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxSizing: 'border-box'
                }}>
                  {activeStudent.examAttempts && activeStudent.examAttempts.length > 0 ? (
                    activeStudent.examAttempts.map((attempt, index) => {
                      const percentage = Math.round((attempt.score / attempt.max) * 100);
                      const scoreColor = percentage >= 80 ? '#34d399' : percentage >= 60 ? '#facc15' : '#f87171';
                      const dur = attempt.durationSeconds > 0
                        ? `${Math.floor(attempt.durationSeconds / 60)}m ${attempt.durationSeconds % 60}s`
                        : 'N/A';
                      return (
                        <div
                          key={attempt.id}
                          className="inner-accent-card"
                          style={{
                            background: 'rgba(255, 255, 255, 0.01)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '14px',
                            padding: '14px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                                {attempt.examName} <span style={{ color: '#9ca3af', fontWeight: '400', fontSize: '11px' }}>(Int. {index + 1})</span>
                              </span>
                              <span style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                                <Calendar size={11} /> {new Date(attempt.endedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} • <Clock size={11} /> {dur}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ display: 'block', fontSize: '16px', fontWeight: '800', color: scoreColor }}>
                                {attempt.cheatingCanceled ? '—' : `${attempt.score}/${attempt.max}`}
                              </span>
                              <span style={{ fontSize: '10px', color: '#9ca3af' }}>{attempt.cheatingCanceled ? 'Anulado' : `${percentage}% de aciertos`}</span>
                            </div>
                          </div>

                          {/* Botón Ver desglose */}
                          <button
                            onClick={() => {
                              setShowAttemptsModal(false);
                              setReviewAttempt(attempt);
                            }}
                            style={{
                              width: '100%',
                              background: 'rgba(15, 56, 105, 0.12)',
                              border: '1px solid rgba(15, 56, 105, 0.25)',
                              color: 'var(--brand-blue, #2563eb)',
                              borderRadius: '8px',
                              padding: '8px 14px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Eye size={13} /> Ver desglose completo de respuestas
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{
                      padding: '36px 24px',
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1.5px dashed rgba(255, 255, 255, 0.04)',
                      borderRadius: '12px'
                    }}>
                      <span style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>Ningún examen simulacro realizado aún.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== MODAL DESGLOSE COMPLETO DE RESPUESTAS ===== */}
          {reviewAttempt && (
            <div
              onClick={() => setReviewAttempt(null)}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1100, padding: '20px', boxSizing: 'border-box',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="glass-card animate-modal"
                style={{
                  width: '100%', maxWidth: '680px', maxHeight: '88vh',
                  background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                  borderRadius: '24px', boxShadow: 'var(--card-shadow)',
                  display: 'flex', flexDirection: 'column',
                  animation: 'slideUp 0.25s ease-out', overflow: 'hidden'
                }}
              >
                {/* Header del Modal Desglose */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '20px 24px', borderBottom: '1px solid var(--inner-card-border)',
                  background: 'rgba(255,255,255,0.015)', flexShrink: 0
                }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clipboard size={19} color="#f59e0b" /> Desglose de Respuestas
                    </h3>
                    <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '3px', display: 'block' }}>
                      {reviewAttempt.examName} — {new Date(reviewAttempt.endedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Mini resumen */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '18px', fontWeight: '800', color: reviewAttempt.cheatingCanceled ? '#f87171' : (reviewAttempt.score / reviewAttempt.max >= 0.8 ? '#34d399' : '#facc15') }}>
                        {reviewAttempt.cheatingCanceled ? 'Anulado' : `${reviewAttempt.score} / ${reviewAttempt.max}`}
                      </span>
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                        {reviewAttempt.cheatingCanceled ? '0%' : `${Math.round((reviewAttempt.score / reviewAttempt.max) * 100)}% de aciertos`}
                      </span>
                    </div>
                    <button
                      onClick={() => setReviewAttempt(null)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '20px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', lineHeight: 1 }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >✕</button>
                  </div>
                </div>

                {/* Contenido scrollable */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reviewAttempt.questionsSnapshot && reviewAttempt.questionsSnapshot.length > 0 ? (
                    reviewAttempt.questionsSnapshot.map((q, idx) => {
                      const studentAnswer = reviewAttempt.answers[idx];
                      const isCorrect = studentAnswer === q.correct;
                      const isUnanswered = !studentAnswer;

                      return (
                        <div
                          key={idx}
                          style={{
                            background: isCorrect ? 'rgba(16, 185, 129, 0.04)' : isUnanswered ? 'rgba(255,255,255,0.01)' : 'rgba(239, 68, 68, 0.04)',
                            border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : isUnanswered ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.2)'}`,
                            borderRadius: '12px',
                            padding: '14px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          {/* Cabecera: número, materia, resultado */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', opacity: 0.5 }}>#{idx + 1}</span>
                              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '100px', color: '#9ca3af', fontWeight: '600' }}>
                                {q.subject}
                              </span>
                            </div>
                            <span style={{
                              fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '100px',
                              background: isCorrect ? 'rgba(16,185,129,0.12)' : isUnanswered ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.12)',
                              color: isCorrect ? '#34d399' : isUnanswered ? '#9ca3af' : '#f87171'
                            }}>
                              {isCorrect ? '✓ Correcto' : isUnanswered ? '— Sin responder' : '✗ Incorrecto'}
                            </span>
                          </div>

                          {/* Texto de la pregunta */}
                          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                            {q.question}
                          </p>

                          {/* Opciones */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            {Object.entries(q.options).map(([key, val]) => {
                              const isKeyCorrect = key === q.correct;
                              const isKeyStudent = key === studentAnswer;
                              let bg = 'rgba(255,255,255,0.02)';
                              let border = 'rgba(255,255,255,0.06)';
                              let color = '#9ca3af';
                              if (isKeyCorrect) { bg = 'rgba(16,185,129,0.1)'; border = '#34d399'; color = '#34d399'; }
                              else if (isKeyStudent && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = '#f87171'; color = '#f87171'; }

                              return (
                                <div key={key} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '7px 10px', fontSize: '12px', color, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                  <span style={{ fontWeight: '800', flexShrink: 0 }}>{key}.</span>
                                  <span style={{ lineHeight: 1.4 }}>
                                    {typeof val === 'string' && val.startsWith('/') ? <em style={{ color: '#9ca3af' }}>[imagen]</em> : val}
                                    {isKeyCorrect && <span style={{ marginLeft: '4px' }}>✓</span>}
                                    {isKeyStudent && !isCorrect && <span style={{ marginLeft: '4px' }}>← tu respuesta</span>}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explicación */}
                          {q.explanation && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px 12px', fontSize: '11.5px', color: '#9ca3af', lineHeight: 1.5 }}>
                              <strong style={{ color: 'var(--text-primary)', opacity: 0.7 }}>Explicación: </strong>{q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <Clipboard size={32} color="rgba(255,255,255,0.15)" />
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', opacity: 0.5 }}>Desglose no disponible</span>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
                        Este intento fue realizado antes de que se habilitara el registro detallado de respuestas. Los próximos exámenes que realices guardarán el desglose completo automáticamente.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer — botón para volver a la lista */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--inner-card-border)', flexShrink: 0, background: 'rgba(255,255,255,0.01)' }}>
                  <button
                    onClick={() => { setReviewAttempt(null); setShowAttemptsModal(true); }}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    ← Volver a todos los intentos
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Footer del Portal para anclar y balancear el espacio vertical */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 8px 8px 8px',
            borderTop: '1px solid var(--inner-card-border)',
            marginTop: 'auto',
            fontSize: '12px',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '12px',
            transition: 'border-color 0.3s ease'
          }}>
            <span>© 2026 CRECE - Portal del Alumno. Todos los derechos reservados.</span>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span>Sesión activa: <strong>{activeStudent.name}</strong></span>
              <span style={{
                background: 'var(--inner-card-bg)',
                padding: '3px 10px',
                borderRadius: '100px',
                border: '1px solid var(--inner-card-border)',
                fontWeight: '600'
              }}>ID: {activeStudent.id}</span>
            </div>
          </div>

        </div>
      )}

      {/* TOAST / FEEDBACK DE ACCIONES */}
      {feedback.message && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
          borderRadius: '12px',
          padding: '16px 24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'white',
          zIndex: 99999,
          fontSize: '14px',
          fontWeight: '600',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}

function styleTag() {
  return (
    <style>{`
      @keyframes pulse-badge {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
        }
        50% {
          transform: scale(1.04);
          box-shadow: 0 0 6px 1px rgba(239, 68, 68, 0.5);
        }
      }
      @keyframes pulse-border {
        0%, 100% {
          border-color: rgba(239, 68, 68, 0.15);
        }
        50% {
          border-color: rgba(239, 68, 68, 0.5);
          box-shadow: 0 0 6px rgba(239, 68, 68, 0.1);
        }
      }
      .dark-theme {
        --text-primary: #ffffff;
        --text-secondary: var(--brand-yellow);
        --text-muted: #cbd5e1;
        --portal-bg: linear-gradient(135deg, #041021 0%, #081c33 100%);
        --portal-color: #f3f4f6;
        --portal-glow-1: rgba(15, 56, 105, 0.4);
        --portal-glow-2: rgba(229, 169, 59, 0.15);
        --card-bg: rgba(8, 28, 51, 0.75);
        --card-border: rgba(229, 169, 59, 0.15);
        --card-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5);
        --inner-card-bg: rgba(15, 56, 105, 0.2);
        --inner-card-border: rgba(15, 56, 105, 0.3);
        --header-bg: rgba(8, 28, 51, 0.65);
        --selector-bg: rgba(4, 16, 33, 0.9);
        --selector-border: rgba(229, 169, 59, 0.2);
        --selector-card-bg: rgba(15, 56, 105, 0.3);
        --selector-card-border: rgba(15, 56, 105, 0.4);
        --toggle-bg: rgba(8, 28, 51, 0.8);
        --toggle-border: rgba(229, 169, 59, 0.25);
      }
      .light-theme {
        --text-primary: #0f3869; /* Azul marino escolar como primario */
        --text-secondary: #475569;
        --text-muted: #5a7184;
        --portal-bg: #faf9f5; /* Fondo crema pergamino insignia de la marca */
        --portal-color: #0f172a;
        --portal-glow-1: rgba(15, 56, 105, 0.05);
        --portal-glow-2: rgba(229, 169, 59, 0.04);
        --card-bg: #ffffff;
        --card-border: rgba(15, 56, 105, 0.08);
        --card-shadow: 0 10px 25px rgba(15, 56, 105, 0.04);
        --inner-card-bg: #faf9f6;
        --inner-card-border: rgba(15, 56, 105, 0.06);
        --header-bg: #ffffff;
        --selector-bg: #ffffff;
        --selector-border: rgba(15, 56, 105, 0.1);
        --selector-card-bg: #ffffff;
        --selector-card-border: rgba(15, 56, 105, 0.08);
        --toggle-bg: #f1ebd9;
        --toggle-border: rgba(229, 169, 59, 0.25);
      }
      .brand-accent-card {
        background: var(--gradient-card) !important;
        border: 1px double rgba(229, 169, 59, 0.3) !important;
        border-radius: 20px;
        box-shadow: 0 10px 25px -5px rgba(15, 56, 105, 0.3) !important;
        color: #ffffff !important;
        transition: all 0.3s ease;
      }
      .brand-accent-card h3,
      .brand-accent-card strong,
      .brand-accent-card span,
      .light-theme .brand-accent-card h3,
      .light-theme .brand-accent-card strong,
      .light-theme .brand-accent-card span {
        color: #ffffff !important;
      }
      .brand-accent-card .alert-text-overdue,
      .light-theme .brand-accent-card .alert-text-overdue {
        color: #f87171 !important;
      }
      .brand-accent-card .alert-text-ontime,
      .light-theme .brand-accent-card .alert-text-ontime {
        color: var(--brand-yellow) !important;
      }
      .brand-accent-card .alert-text-paid,
      .light-theme .brand-accent-card .alert-text-paid {
        color: #34d399 !important;
      }
      .brand-accent-card .inner-accent-card {
        background: rgba(255, 255, 255, 0.08) !important;
        border-color: rgba(255, 255, 255, 0.12) !important;
      }
      .glass-card {
        background: var(--card-bg); 
        border: 1px solid var(--card-border); 
        border-radius: 20px; 
        backdrop-filter: blur(14px);
        box-shadow: var(--card-shadow);
        transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
      }
      /* Light theme overrides for general textual elements using inline colors */
      .light-theme h1,
      .light-theme h2,
      .light-theme h3,
      .light-theme h4,
      .light-theme h5,
      .light-theme strong,
      .light-theme .text-white {
        color: var(--brand-blue) !important; /* Todos los títulos en azul marino oficial */
      }
      .light-theme span,
      .light-theme p,
      .light-theme .text-gray {
        color: var(--text-secondary) !important;
      }
      .light-theme .login-card {
        background: var(--selector-bg) !important;
        border-color: var(--selector-border) !important;
        box-shadow: var(--card-shadow) !important;
      }
      .light-theme .student-card-selector {
        background: var(--selector-card-bg) !important;
        border-color: var(--selector-card-border) !important;
      }
      .light-theme .student-card-selector:hover {
        background: rgba(15, 56, 105, 0.04) !important;
        border-color: rgba(229, 169, 59, 0.25) !important;
      }
      .light-theme .inner-accent-card {
        background: var(--inner-card-bg) !important;
        border-color: var(--inner-card-border) !important;
      }
      .light-theme .message-card {
        background: #ffffff !important;
        border-color: var(--card-border) !important;
        box-shadow: var(--card-shadow) !important;
      }
      .light-theme .message-card:hover {
        background: #faf9f6 !important;
        border-color: rgba(229, 169, 59, 0.2) !important;
      }
      .student-card-selector {
        transition: all 0.2s ease-in-out;
      }
      .student-card-selector:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(15, 56, 105, 0.06);
      }
      .message-card {
        transition: all 0.15s ease-in-out;
      }
      .message-card:hover {
        background: rgba(255,255,255,0.02) !important;
        border-color: rgba(255,255,255,0.06) !important;
      }
      .unread-glow {
        box-shadow: inset 0 0 4px rgba(15, 56, 105, 0.03);
      }
      .shake-icon {
        animation: shake 3s infinite;
      }
      @keyframes shake {
        0%, 90%, 100% { transform: rotate(0deg); }
        92% { transform: rotate(10deg); }
        94% { transform: rotate(-10deg); }
        96% { transform: rotate(10deg); }
        98% { transform: rotate(-10deg); }
      }
      .btn-exit-portal:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(255, 255, 255, 0.25) !important;
      }
      .btn-start-exam {
        background: var(--gradient-accent) !important;
        color: #081c33 !important; /* Máxima legibilidad */
        border-radius: var(--radius-md) !important;
        font-weight: 700 !important;
        font-size: 14px !important;
        transition: all 0.2s ease-in-out !important;
        border: none !important;
        box-shadow: 0 4px 12px rgba(229, 169, 59, 0.2) !important;
      }
      .btn-start-exam:hover {
        opacity: 0.95 !important;
        transform: translateY(-1.5px) !important;
        box-shadow: 0 6px 16px rgba(229, 169, 59, 0.35) !important;
      }
      .light-theme .btn-exit-portal {
        background: rgba(255, 255, 255, 0.12) !important;
        border: 1px solid rgba(255, 255, 255, 0.25) !important;
        color: #ffffff !important;
        border-radius: var(--radius-md) !important;
        font-weight: 600 !important;
        transition: all 0.2s ease-in-out !important;
      }
      .light-theme .btn-exit-portal:hover {
        background: rgba(255, 255, 255, 0.2) !important;
        border-color: rgba(255, 255, 255, 0.4) !important;
      }
      .portal-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
      }
      @media (min-width: 1024px) {
        .portal-grid {
          grid-template-columns: 1.2fr 1.6fr 1.2fr;
        }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .btn-ver-detalles {
        transition: all 0.2s ease-in-out !important;
      }
      .btn-ver-detalles:hover {
        background: rgba(255, 255, 255, 0.12) !important;
        border-color: rgba(255, 255, 255, 0.25) !important;
        transform: translateY(-1px);
      }
      .light-theme .btn-ver-detalles {
        background: rgba(15, 56, 105, 0.05) !important;
        border-color: rgba(15, 56, 105, 0.1) !important;
        color: var(--brand-blue) !important;
      }
      .light-theme .btn-ver-detalles:hover {
        background: rgba(15, 56, 105, 0.08) !important;
        border-color: rgba(15, 56, 105, 0.18) !important;
      }
      /* Forzar legibilidad blanca y dorada en cabecera del portal */
      .portal-header-title {
        color: #ffffff !important;
        font-size: 20px;
        font-weight: 800;
        margin: 0;
        letter-spacing: -0.01em;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
      .portal-header-subtitle {
        color: #ffffff !important;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 5px;
      }
      .portal-header-badge {
        background: var(--gradient-accent) !important;
        color: #081c33 !important;
        padding: 2px 8px;
        border-radius: 6px;
        font-weight: 800;
        font-size: 11px;
        margin-right: 4px;
        box-shadow: 0 2px 6px rgba(229, 169, 59, 0.2);
        letter-spacing: 0.05em;
        display: inline-block;
      }
      .portal-header-course {
        color: #ffffff !important;
        font-weight: 600 !important;
      }
    `}</style>
  );
}
