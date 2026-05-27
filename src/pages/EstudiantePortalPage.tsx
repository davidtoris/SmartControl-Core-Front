import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Wallet, Calendar, CheckCircle2,
  AlertCircle, Clipboard, Play, LogOut, Target, ChevronRight,
  BookOpen, Clock, FileCheck, ArrowLeft, MessageSquare, Mail, Eye, Sparkles,
  Sun, Moon
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Student } from '../store/useAppStore';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip
} from 'recharts';

export default function EstudiantePortalPage() {
  const navigate = useNavigate();
  const { students, studentMessages, markMessageAsRead } = useAppStore();
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);

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

  // Alumno logueado actualmente
  const activeStudent = students.find(s => s.id === activeStudentId);

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
      return [
        { name: 'Diag.', aciertos: 45 },
        { name: 'Sim. 1', aciertos: 62 },
        { name: 'Sim. 2', aciertos: 78 },
        { name: 'Meta', aciertos: student.curso === 'COMIPEMS' ? 128 : 120 }
      ];
    }

    return student.examAttempts.map((attempt, index) => ({
      name: `Int. ${index + 1}`,
      aciertos: attempt.score,
      max: attempt.max
    }));
  };

  return (
    <div className={`portal-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`} style={{
      minHeight: '100vh',
      width: '100vw',
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



      {/* Luces de fondo decorativas */}
      <div style={{ position: 'absolute', width: '450px', height: '450px', background: 'var(--portal-glow-1)', borderRadius: '50%', filter: 'blur(100px)', top: '-100px', left: '-100px', pointerEvents: 'none', transition: 'background 0.3s ease' }}></div>
      <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'var(--portal-glow-2)', borderRadius: '50%', filter: 'blur(120px)', bottom: '-150px', right: '-100px', pointerEvents: 'none', transition: 'background 0.3s ease' }}></div>

      {/* 1. MODO: SELECTOR DE ALUMNO (LOGIN SIMULADO) */}
      {!activeStudent ? (
        <div style={{ maxWidth: '680px', margin: '80px auto', position: 'relative', zIndex: 10 }}>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: '#eab308',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 8px 24px rgba(30, 58, 138, 0.35)',
              border: '2px solid #eab308'
            }}>
              <span style={{ fontSize: '32px', fontWeight: '900', fontFamily: "'Outfit', sans-serif" }}>C</span>
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
                        background: 'rgba(30, 58, 138, 0.12)',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '16px',
                        border: '1px solid rgba(30, 58, 138, 0.2)'
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
        <div style={{ maxWidth: '1560px', margin: '0 auto', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Header del Alumno */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '16px 28px',
            borderRadius: '24px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '20px',
                boxShadow: '0 4px 14px rgba(30, 58, 138, 0.25)',
                border: '1.5px solid rgba(255,255,255,0.1)'
              }}>
                {activeStudent.avatar || activeStudent.name.charAt(0)}
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '-0.01em' }}>
                  Bienvenido, {activeStudent.name}
                </h2>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    color: '#eab308',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: '800',
                    fontSize: '11px',
                    marginRight: '4px',
                    boxShadow: '0 2px 6px rgba(30, 58, 138, 0.2)',
                    letterSpacing: '0.05em'
                  }}>CRECE</span>
                  <BookOpen size={14} color="var(--accent-primary, #3b82f6)" /> {activeStudent.curso} • Portal del Alumno
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Alerta de Mensajes No Leídos */}
              {unreadMessagesCount > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
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

              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  color: '#d1d5db',
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

          {/* Grid de Contenido Principal (3 columnas: 1.6fr Académico Principal, 1.2fr Finanzas, 1.2fr Mensajes) */}
          <div className="portal-grid">

            {/* ================= COLUMNA 1 (IZQUIERDA): ACADÉMICO ================= */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

              {/* Card 1: Meta de Admisión */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={18} color="#3b82f6" /> Meta de Admisión
                  </h3>
                  <span style={{ fontSize: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 12px', borderRadius: '100px', fontWeight: '600', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
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
                      background: 'linear-gradient(90deg, #2563eb 0%, #34d399 100%)',
                      borderRadius: '100px'
                    }}></div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/examen')}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
                    transition: 'all 0.2s'
                  }}
                  className="btn-start-exam"
                >
                  <Play size={14} fill="white" /> Iniciar Examen Simulacro
                </button>
              </div>

              {/* Card 2: Evolución Académica */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="#3b82f6" /> Histórico Académico
                  </h3>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>Curva de Desempeño</span>
                </div>

                <div style={{ width: '100%', height: '220px', margin: '10px 0' }}>
                  <ResponsiveContainer>
                    <AreaChart data={getPerformanceData(activeStudent)} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAciertos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: '#1e293b', color: 'white' }}
                        formatter={(value: any) => [`${value} aciertos`, 'Puntaje']}
                      />
                      <Area type="monotone" dataKey="aciertos" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAciertos)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 3: Historial de Intentos anteriores */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clipboard size={18} color="#f59e0b" /> Intentos Registrados
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeStudent.examAttempts && activeStudent.examAttempts.length > 0 ? (
                    activeStudent.examAttempts.map((attempt, index) => {
                      const percentage = Math.round((attempt.score / attempt.max) * 100);
                      return (
                        <div
                          key={attempt.id}
                          className="inner-accent-card"
                          style={{
                            background: 'rgba(255, 255, 255, 0.01)',
                            border: '1px solid rgba(255, 255, 255, 0.03)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <span style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                              {attempt.examName} <span style={{ color: '#9ca3af', fontWeight: '400', fontSize: '11px' }}>(Int. {index + 1})</span>
                            </span>
                            <span style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                              <Calendar size={11} /> {new Date(attempt.endedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} • <Clock size={11} /> {Math.floor(attempt.durationSeconds / 60)}m {attempt.durationSeconds % 60}s
                            </span>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: percentage >= 80 ? '#34d399' : percentage >= 60 ? '#facc15' : '#f87171' }}>
                              {attempt.score}/{attempt.max}
                            </span>
                            <span style={{ fontSize: '10px', color: '#9ca3af' }}>{percentage}% de aciertos</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{
                      padding: '24px',
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1.5px dashed rgba(255, 255, 255, 0.04)',
                      borderRadius: '12px'
                    }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>Ningún examen simulacro realizado aún.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ================= COLUMNA 2 (CENTRO): FINANZAS Y EXPEDIENTE DIGITAL ================= */}
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
                    const isUploaded = doc.status === 'Subido' || doc.status === 'Verificado';
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
                        <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500' }}>
                          {doc.name}
                        </span>

                        <span style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '2px 8px',
                          borderRadius: '100px',
                          background: isUploaded ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.1)',
                          color: isUploaded ? '#34d399' : '#f87171'
                        }}>
                          {isUploaded ? 'Recibido ✓' : 'Pendiente ❌'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ================= COLUMNA 3 (DERECHA - MÁS ANGOSTA): MENSAJES CRECE (SIDE-RAIL ELEGANTE) ================= */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

              <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--inner-card-border)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={16} color="var(--text-secondary, #3b82f6)" /> Mensajes CRECE
                  </h4>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Botón Claro / Oscuro al lado de los mensajes */}
                    <button
                      onClick={toggleTheme}
                      style={{
                        background: 'var(--toggle-bg)',
                        border: '1px solid var(--toggle-border)',
                        color: 'var(--text-primary)',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease-in-out',
                        backdropFilter: 'blur(10px)',
                        fontWeight: '600',
                        fontSize: '11px'
                      }}
                      className="btn-theme-toggle"
                      title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
                    >
                      {isDarkMode ? (
                        <>
                          <Sun size={12} color="#facc15" fill="#facc15" />
                          <span>Claro</span>
                        </>
                      ) : (
                        <>
                          <Moon size={12} color="#2563eb" fill="#2563eb" />
                          <span>Oscuro</span>
                        </>
                      )}
                    </button>

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
                </div>

                {/* Feed scrollable con altura maximizada para aprovechar la columna */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '580px', paddingRight: '2px' }}>
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
                                {msg.sentAt.split(',')[0]}
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
                      Sin mensajes en la bandeja.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

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
        --text-secondary: #93c5fd; /* brand soft blue */
        --text-muted: #cbd5e1;
        --portal-bg: linear-gradient(135deg, #060b1e 0%, #0c1735 100%); /* CRECE deep blue */
        --portal-color: #f3f4f6;
        --portal-glow-1: rgba(30, 58, 138, 0.25); /* brand blue glow */
        --portal-glow-2: rgba(234, 179, 8, 0.08); /* brand gold glow */
        --card-bg: rgba(12, 22, 53, 0.55);
        --card-border: rgba(30, 58, 138, 0.2);
        --card-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5);
        --inner-card-bg: rgba(30, 58, 138, 0.1);
        --inner-card-border: rgba(30, 58, 138, 0.15);
        --header-bg: rgba(12, 22, 53, 0.65);
        --selector-bg: rgba(6, 11, 30, 0.85);
        --selector-border: rgba(30, 58, 138, 0.3);
        --selector-card-bg: rgba(30, 58, 138, 0.15);
        --selector-card-border: rgba(30, 58, 138, 0.2);
        --toggle-bg: rgba(12, 22, 53, 0.7);
        --toggle-border: rgba(30, 58, 138, 0.3);
      }
      .light-theme {
        --text-primary: #1e293b; /* CRECE main text charcoal */
        --text-secondary: #64748b; /* CRECE slate text */
        --text-muted: #475569;
        --portal-bg: #f5f7fb; /* CRECE official background from screenshot */
        --portal-color: #1e293b;
        --portal-glow-1: rgba(30, 58, 138, 0.03);
        --portal-glow-2: rgba(234, 179, 8, 0.02);
        --card-bg: #ffffff; /* Solid white dashboard cards from screenshot */
        --card-border: #e2e8f0; /* Soft borders from screenshot */
        --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); /* Soft shadows */
        --inner-card-bg: #f8fafc; /* inner accent lists */
        --inner-card-border: #e2e8f0;
        --header-bg: #ffffff;
        --selector-bg: #ffffff;
        --selector-border: #e2e8f0;
        --selector-card-bg: #ffffff;
        --selector-card-border: #e2e8f0;
        --toggle-bg: #f1f5f9;
        --toggle-border: #cbd5e1;
      }
      .brand-accent-card {
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 20px;
        box-shadow: 0 10px 25px -5px rgba(30, 58, 138, 0.25) !important;
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
        color: #fbbf24 !important;
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
        color: var(--text-primary) !important;
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
        background: rgba(30, 58, 138, 0.04) !important;
        border-color: rgba(30, 58, 138, 0.15) !important;
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
        background: #f8fafc !important;
        border-color: rgba(30, 58, 138, 0.15) !important;
      }
      .student-card-selector {
        transition: all 0.2s ease-in-out;
      }
      .student-card-selector:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(59, 130, 246, 0.08);
      }
      .message-card {
        transition: all 0.15s ease-in-out;
      }
      .message-card:hover {
        background: rgba(255,255,255,0.02) !important;
        border-color: rgba(255,255,255,0.06) !important;
      }
      .unread-glow {
        box-shadow: inset 0 0 4px rgba(59, 130, 246, 0.03);
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
        background: rgba(255, 255, 255, 0.05) !important;
        border-color: rgba(255, 255, 255, 0.08) !important;
      }
      .btn-start-exam {
        background: #1e3a8a !important; /* Solid CRECE deep blue! */
        color: #ffffff !important;
        border-radius: 9999px !important; /* Fully rounded capsule button! */
        font-weight: 700 !important;
        font-size: 13px !important;
        transition: all 0.2s ease-in-out !important;
        border: none !important;
        box-shadow: 0 4px 12px rgba(30, 58, 138, 0.15) !important;
      }
      .btn-start-exam:hover {
        background: #1d4ed8 !important; /* Solid vibrant blue hover! */
        transform: translateY(-1.5px) !important;
        box-shadow: 0 6px 16px rgba(30, 58, 138, 0.25) !important;
      }
      .light-theme .btn-exit-portal {
        background: #ffffff !important;
        border: 1px solid #cbd5e1 !important;
        color: #1e3a8a !important;
        border-radius: 9999px !important; /* Also capsule! */
        font-weight: 600 !important;
        transition: all 0.2s ease-in-out !important;
      }
      .light-theme .btn-exit-portal:hover {
        background: #f1f5f9 !important;
        border-color: #94a3b8 !important;
      }
      .portal-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
      }
      @media (min-width: 1024px) {
        .portal-grid {
          grid-template-columns: 1.6fr 1.2fr 1.2fr;
        }
      }
    `}</style>
  );
}
