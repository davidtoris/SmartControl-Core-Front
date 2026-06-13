import React, { useState, useEffect, useMemo } from 'react';
import { 
  UploadCloud, UserCheck, AlertTriangle, Check, X, Clock, 
  BookOpen, FileText, Download, Bell, Calendar, Search, Users, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Student } from '../store/useAppStore';
import Toast from '../components/Toast';

export default function AcademicoPage() {
  const { students, saveBatchAttendance, fetchStudents } = useAppStore();

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // --- Estados de Control ---
  const [activeSubTab, setActiveSubTab] = useState<'pase-lista' | 'reporte-general'>('pase-lista');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Inicializar con la fecha de hoy en formato YYYY-MM-DD local
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; // offset en ms
    const localISODate = (new Date(now.getTime() - tzOffset)).toISOString().split('T')[0];
    return localISODate;
  });
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [isSaving, setIsSaving] = useState(false);

  // Estado para Notificaciones Flotantes (Toasts)
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

  // --- Estado Local de Registros de Asistencia ---
  // Mapea { [studentId]: 'Presente' | 'Falta' | 'Retardo' }
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'Presente' | 'Falta' | 'Retardo'>>({});

  // --- Helper: Buscar asistencia histórica para una fecha dada ---
  const getAttendanceStatusForDate = (student: Student, dateStr: string) => {
    if (!student.attendance || !student.attendance.history) return null;
    
    // 1. Coincidencia exacta por YYYY-MM-DD
    const foundExact = student.attendance.history.find(h => h.date === dateStr);
    if (foundExact) return foundExact.status;

    // 2. Coincidencia por formato largo (ej. "01 Jun 2026" o similar)
    try {
      const parsedDate = new Date(dateStr + 'T00:00:00');
      const formattedSeed = parsedDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
      
      const foundFormatted = student.attendance.history.find(h => {
         const normalizedHistoryDate = h.date.toLowerCase().replace(/\./g, '');
         const normalizedSeed = formattedSeed.toLowerCase().replace(/\./g, '');
         return normalizedHistoryDate.includes(normalizedSeed) || normalizedHistoryDate.includes(dateStr);
      });
      if (foundFormatted) return foundFormatted.status;
    } catch (e) {}

    return null;
  };

  // --- Cargar/Sincronizar Asistencia al cambiar fecha o estudiantes ---
  useEffect(() => {
    const initialRecords: Record<string, 'Presente' | 'Falta' | 'Retardo'> = {};
    students.forEach(student => {
      const existingStatus = getAttendanceStatusForDate(student, selectedDate);
      initialRecords[student.id] = (existingStatus as 'Presente' | 'Falta' | 'Retardo') || 'Presente';
    });
    setAttendanceRecords(initialRecords);
  }, [selectedDate, students]);

  // --- Obtener grupos dinámicos basados en los alumnos ---
  const groups = useMemo(() => {
    const courses = students.map(s => s.curso).filter(Boolean);
    return Array.from(new Set(courses));
  }, [students]);

  // --- Filtrar Alumnos por Grupo Seleccionado ---
  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      selectedGroup === 'All' || student.curso === selectedGroup
    );
  }, [students, selectedGroup]);

  // --- Alumnos filtrados para reporte general con búsqueda ---
  const searchedStudents = useMemo(() => {
    return filteredStudents.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredStudents, searchQuery]);

  // --- Estadísticas en tiempo real del pase de lista actual ---
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const presentes = filteredStudents.filter(s => attendanceRecords[s.id] === 'Presente').length;
    const faltas = filteredStudents.filter(s => attendanceRecords[s.id] === 'Falta').length;
    const retardos = filteredStudents.filter(s => attendanceRecords[s.id] === 'Retardo').length;
    return { total, presentes, faltas, retardos };
  }, [filteredStudents, attendanceRecords]);

  // --- Lista de alumnos con faltas para notificaciones ---
  const absentStudents = useMemo(() => {
    return filteredStudents.filter(s => attendanceRecords[s.id] === 'Falta');
  }, [filteredStudents, attendanceRecords]);

  // --- Cambiar estatus de asistencia de un alumno individual ---
  const handleStatusChange = async (studentId: string | number, newStatus: 'Presente' | 'Falta' | 'Retardo') => {
    // 1. Actualizar el estado local inmediatamente para respuesta instantánea en UI
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: newStatus
    }));

    // 2. Guardar de forma inmediata en la base de datos de fondo
    try {
      await saveBatchAttendance(selectedDate, {
        [studentId]: newStatus
      });
      showToast('Asistencia guardada de forma segura en la base de datos. 💾', 'success');
    } catch (error) {
      console.error('Error al guardar asistencia de fondo:', error);
      showToast('Error al conectar con la base de datos para guardar la asistencia.', 'error');
    }
  };

  // --- Guardar Pase de Lista ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Filtrar y preparar registros que correspondan a la vista actual
      const recordsToSave: Record<string, 'Presente' | 'Falta' | 'Retardo'> = {};
      filteredStudents.forEach(s => {
        recordsToSave[s.id] = attendanceRecords[s.id] || 'Presente';
      });

      await saveBatchAttendance(selectedDate, recordsToSave);
      
      const numFaltas = absentStudents.length;
      if (numFaltas > 0) {
        showToast(
          `Asistencia guardada con éxito. Se enviaron ${numFaltas} notificaciones de falta a los tutores.`, 
          'success'
        );
      } else {
        showToast(`Asistencia guardada con éxito (${filteredStudents.length} alumnos procesados).`, 'success');
      }
    } catch (error) {
      console.error(error);
      showToast('Error al guardar el pase de lista. Inténtalo de nuevo.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="academico-view" style={{ padding: '0 40px 40px', minHeight: 'calc(100vh - 80px)' }}>
      {/* 1. Cabecera Premium del Módulo */}
      <div className="card-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>Asistencia y Operación Escolar</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>
            Control de asistencia diario, alertas automatizadas de faltas a tutores y reporte académico global.
          </p>
        </div>
        <button 
          className="btn-secondary" 
          style={{ width: 'auto', padding: '10px 24px', gap: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)', fontWeight: '600' }}
          onClick={() => showToast('Módulo de carga de guías activo.', 'info')}
        >
          <UploadCloud size={18} /> Subir Guía de Estudio
        </button>
      </div>

      {/* Selector de Pestañas (Subtabs) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveSubTab('pase-lista')}
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            background: activeSubTab === 'pase-lista' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            color: activeSubTab === 'pase-lista' ? 'var(--brand-blue)' : 'var(--text-secondary)',
            border: activeSubTab === 'pase-lista' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Pase de Lista Diario
        </button>
        <button
          onClick={() => setActiveSubTab('reporte-general')}
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            background: activeSubTab === 'reporte-general' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            color: activeSubTab === 'reporte-general' ? 'var(--brand-blue)' : 'var(--text-secondary)',
            border: activeSubTab === 'reporte-general' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Reporte General Académico
        </button>
      </div>

      {/* 2. Filtros Generales e Indicadores */}
      <div className="bento-card" style={{ padding: '18px 24px', marginBottom: '24px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'nowrap' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          
          {/* Selector de Fecha - Solo visible en Pase de Lista */}
          {activeSubTab === 'pase-lista' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Fecha de Operación</span>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 56, 105, 0.04)', border: '1px solid rgba(15, 56, 105, 0.08)', borderRadius: '10px', height: '40px', padding: '0 12px', gap: '8px' }}>
                <Calendar size={15} style={{ color: 'var(--text-secondary)' }} />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '13px', fontFamily: 'inherit', fontWeight: '600', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {/* Selector de Grupo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Grupo / Curso</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              style={{ 
                height: '40px',
                padding: '0 16px', 
                borderRadius: '10px', 
                border: '1px solid rgba(15, 56, 105, 0.1)', 
                background: 'var(--bg-card)', 
                color: 'var(--text-primary)', 
                fontSize: '13px',
                fontFamily: 'inherit',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">Todos los Grupos ({students.length} alumnos)</option>
              {groups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen Bento Rápido de Lista Actual - Solo visible en Pase de Lista */}
        {activeSubTab === 'pase-lista' ? (
          <div style={{ display: 'flex', gap: '12px', background: 'rgba(15, 56, 105, 0.03)', padding: '6px 16px', borderRadius: '12px', border: '1px solid rgba(15, 56, 105, 0.05)', flexShrink: 0 }}>
            <div style={{ textAlign: 'center', padding: '0 8px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>TOTAL</span>
              <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{stats.total}</h4>
            </div>
            <div style={{ width: '1px', background: 'rgba(15, 56, 105, 0.1)', alignSelf: 'stretch' }}></div>
            <div style={{ textAlign: 'center', padding: '0 8px' }}>
              <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '600' }}>PRESENTE</span>
              <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#16a34a', margin: 0 }}>{stats.presentes}</h4>
            </div>
            <div style={{ width: '1px', background: 'rgba(15, 56, 105, 0.1)', alignSelf: 'stretch' }}></div>
            <div style={{ textAlign: 'center', padding: '0 8px' }}>
              <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: '600' }}>FALTA</span>
              <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444', margin: 0 }}>{stats.faltas}</h4>
            </div>
            <div style={{ width: '1px', background: 'rgba(15, 56, 105, 0.1)', alignSelf: 'stretch' }}></div>
            <div style={{ textAlign: 'center', padding: '0 8px' }}>
              <span style={{ fontSize: '10px', color: '#eab308', fontWeight: '600' }}>RETARDO</span>
              <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#eab308', margin: 0 }}>{stats.retardos}</h4>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(59, 130, 246, 0.05)', color: 'var(--brand-blue)', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} /> Vista de acumulados históricos
          </div>
        )}
      </div>

      {/* 3. Panel de Operación Condicional según Pestaña */}
      {activeSubTab === 'pase-lista' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* COLUMNA IZQUIERDA: Planilla del Pase de Lista */}
          <div className="bento-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', margin: 0 }}>
                  <UserCheck size={18} color="var(--brand-blue)" /> Planilla de Asistencia
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                  Modo: {selectedGroup === 'All' ? 'Todos los Alumnos' : `Curso ${selectedGroup}`} • Total en planilla: {filteredStudents.length}
                </p>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={13} /> Alertas SMS / WhatsApp Activas
              </div>
            </div>

            {/* Tabla de Alumnos */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No hay alumnos inscritos en este grupo en la base de datos.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const activeStatus = attendanceRecords[student.id] || 'Presente';
                      
                      // Badge acumulado
                      const cumPercentage = student.attendance?.percentage ?? 0;
                      let percentageColor = '#16a34a';
                      if (cumPercentage < 80) percentageColor = '#eab308';
                      if (cumPercentage < 70) percentageColor = '#ef4444';

                      return (
                        <tr 
                          key={student.id} 
                          style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(15, 56, 105, 0.01)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Alumno Info */}
                          <td style={{ padding: '14px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(15, 56, 105, 0.05)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>
                                {student.avatar || student.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block', fontSize: '14px' }}>{student.name}</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                  <span>{student.curso}</span>
                                  <span>•</span>
                                  <span style={{ color: percentageColor, fontWeight: '700' }}>
                                    Cumplimiento: {cumPercentage}%
                                  </span>
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Botones de Control de Asistencia */}
                          <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              
                              {/* PRESENTE */}
                              <button 
                                onClick={() => handleStatusChange(student.id, 'Presente')}
                                style={{ 
                                  width: '36px', height: '36px', borderRadius: '50%', 
                                  background: activeStatus === 'Presente' ? '#16a34a' : 'transparent', 
                                  border: activeStatus === 'Presente' ? 'none' : '1px solid var(--border-color)', 
                                  color: activeStatus === 'Presente' ? 'white' : 'var(--text-secondary)', 
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                  cursor: 'pointer', transition: 'all 0.2s ease',
                                  boxShadow: activeStatus === 'Presente' ? '0 3px 8px rgba(22, 163, 74, 0.3)' : 'none'
                                }} 
                                title="Presente"
                              >
                                <Check size={16} />
                              </button>

                              {/* FALTA */}
                              <button 
                                onClick={() => handleStatusChange(student.id, 'Falta')}
                                style={{ 
                                  width: '36px', height: '36px', borderRadius: '50%', 
                                  background: activeStatus === 'Falta' ? '#ef4444' : 'transparent', 
                                  border: activeStatus === 'Falta' ? 'none' : '1px solid var(--border-color)', 
                                  color: activeStatus === 'Falta' ? 'white' : 'var(--text-secondary)', 
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                  cursor: 'pointer', transition: 'all 0.2s ease',
                                  boxShadow: activeStatus === 'Falta' ? '0 3px 8px rgba(239, 68, 68, 0.3)' : 'none'
                                }} 
                                title="Falta"
                              >
                                <X size={16} />
                              </button>

                              {/* RETARDO */}
                              <button 
                                onClick={() => handleStatusChange(student.id, 'Retardo')}
                                style={{ 
                                  width: '36px', height: '36px', borderRadius: '50%', 
                                  background: activeStatus === 'Retardo' ? '#eab308' : 'transparent', 
                                  border: activeStatus === 'Retardo' ? 'none' : '1px solid var(--border-color)', 
                                  color: activeStatus === 'Retardo' ? 'white' : 'var(--text-secondary)', 
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                  cursor: 'pointer', transition: 'all 0.2s ease',
                                  boxShadow: activeStatus === 'Retardo' ? '0 3px 8px rgba(234, 179, 8, 0.3)' : 'none'
                                }} 
                                title="Retardo"
                              >
                                <Clock size={16} />
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

            {/* Footer de Guardado de Asistencia */}
            {filteredStudents.length > 0 && (
              <div style={{ padding: '20px 24px', background: 'rgba(15, 56, 105, 0.02)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  Estás procesando el pase de lista del día <strong style={{ color: 'var(--text-primary)' }}>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>.
                </span>
                <button 
                  className="btn-primary" 
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{ 
                    width: 'auto', 
                    padding: '12px 36px', 
                    background: 'var(--gradient-accent)', 
                    color: '#081c33', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontWeight: '700', 
                    fontSize: '14px', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(229, 169, 59, 0.25)',
                    transition: 'var(--transition)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isSaving ? (
                    <>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #081c33', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Asistencia'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: Centro de Notificaciones Instantáneas y WhatsApp */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Panel 1: WhatsApp de Inasistencias Activo */}
            <div className="bento-card" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25d366', padding: '8px', borderRadius: '10px' }}>
                  <Bell size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Notificaciones de Inasistencias</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>WhatsApp automatizado activo</span>
                </div>
              </div>

              {absentStudents.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 12px', border: '1px dashed var(--border-color)', borderRadius: '12px', textAlign: 'center', background: 'rgba(15, 56, 105, 0.01)' }}>
                  <CheckCircle2 size={32} color="#16a34a" style={{ marginBottom: '8px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>¡Asistencia Perfecta!</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                    No hay faltas marcadas en esta planilla. Ningún aviso de inasistencia se enviará al guardar.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    Al guardar, se enviará una notificación escolar automática por WhatsApp a los tutores de los siguientes alumnos:
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                    {absentStudents.map(student => (
                      <div 
                        key={student.id} 
                        style={{ 
                          padding: '10px 12px', 
                          background: 'rgba(239, 68, 68, 0.02)', 
                          border: '1px solid rgba(239, 68, 68, 0.12)', 
                          borderRadius: '8px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '2px' 
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {student.name}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          Tutor: {student.tutor} • <strong style={{ color: '#25d366' }}>{student.phone}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* VISTA DE REPORTE GENERAL ACADÉMICO */
        <div className="bento-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', margin: 0 }}>
                <Users size={18} color="var(--brand-blue)" /> Reporte de Asistencias General
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                Historial completo y porcentaje de cumplimiento acumulado por estudiante.
              </p>
            </div>
            
            {/* Buscador de alumnos */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', height: '36px', padding: '0 12px', gap: '8px' }}>
              <Search size={14} style={{ color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '13px', fontFamily: 'inherit', width: '180px' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Alumno</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Clases Totales</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Asistencias</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Faltas</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Retardos</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>% Cumplimiento</th>
                </tr>
              </thead>
              <tbody>
                {searchedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No se encontraron alumnos que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  searchedStudents.map((student) => {
                    const history = student.attendance?.history || [];
                    const clasesTotales = history.length;
                    const presentes = history.filter(h => h.status === 'Presente').length;
                    const faltas = history.filter(h => h.status === 'Falta').length;
                    const retardos = history.filter(h => h.status === 'Retardo').length;
                    
                    const cumPercentage = student.attendance?.percentage ?? 0;
                    let percentageColor = '#16a34a';
                    if (cumPercentage < 80) percentageColor = '#eab308';
                    if (cumPercentage < 70) percentageColor = '#ef4444';

                    return (
                      <tr 
                        key={student.id} 
                        style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(15, 56, 105, 0.01)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(15, 56, 105, 0.05)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>
                              {student.avatar || student.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block', fontSize: '14px' }}>{student.name}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{student.curso}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>
                          {clasesTotales}
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'center', fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>
                          {presentes}
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'center', fontSize: '14px', color: '#ef4444', fontWeight: '600' }}>
                          {faltas}
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'center', fontSize: '14px', color: '#eab308', fontWeight: '600' }}>
                          {retardos}
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '700',
                            background: cumPercentage >= 80 ? 'rgba(34, 197, 94, 0.1)' : cumPercentage >= 70 ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: percentageColor
                          }}>
                            {cumPercentage}%
                          </span>
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

      {/* 4. Notificación Flotante Toast Reutilizable */}
      <Toast 
        isOpen={toastConfig.isOpen}
        onClose={() => setToastConfig({ ...toastConfig, isOpen: false })}
        message={toastConfig.message}
        type={toastConfig.type}
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
