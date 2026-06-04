import { useState, useEffect } from 'react';
import { 
  Megaphone, MessageSquare, Filter, AlertTriangle, CheckCircle2, 
  Eye, Download, GraduationCap, ShieldCheck, Search, TrendingUp, 
  X, Loader2, Send, Calendar, User, Info, Check, EyeOff
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Student, StudentMessage } from '../store/useAppStore';

export default function ComunicacionPage() {
  const { 
    students, 
    mensajesAdmin, 
    fetchMensajesAdmin, 
    createMensaje, 
    fetchStudents 
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal de envío
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<'ALL' | 'GRUPO' | 'INDIVIDUAL'>('ALL');
  const [targetGroup, setTargetGroup] = useState('COMIPEMS 2024');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [sender, setSender] = useState('Coordinación CRECE');

  // Filtro e Historial (Lado Derecho)
  const [pdfStudentId, setPdfStudentId] = useState<string>('');
  const [pdfSearchTerm, setPdfSearchTerm] = useState('');
  const [showPdfSearchDropdown, setShowPdfSearchDropdown] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Drawer de Auditoría de Lectura
  const [selectedAuditMessage, setSelectedAuditMessage] = useState<StudentMessage | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchMensajesAdmin(),
        fetchStudents()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchMensajesAdmin, fetchStudents]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showToast('Por favor completa el título y contenido del aviso.', 'error');
      return;
    }

    if (targetType === 'INDIVIDUAL' && !selectedStudentId) {
      showToast('Por favor selecciona un alumno destinatario.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await createMensaje({
        title: title.trim(),
        content: content.trim(),
        targetType,
        targetGroup: targetType === 'GRUPO' ? targetGroup : null,
        studentId: targetType === 'INDIVIDUAL' ? selectedStudentId : null,
        sender: sender.trim()
      });
      showToast('Comunicado enviado y registrado con éxito.', 'success');
      setShowModal(false);
      
      // Limpiar formulario
      setTitle('');
      setContent('');
      setTargetType('ALL');
      setSelectedStudentId('');
      
      // Recargar listado
      await fetchMensajesAdmin();
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.msg || 'Error al enviar comunicado.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfStudentId) {
      showToast('Por favor selecciona un alumno para descargar la bitácora.', 'error');
      return;
    }

    setIsDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8082/api/mensajes/auditoria-pdf/${pdfStudentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('No se pudo descargar el archivo PDF.');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Encontrar nombre del alumno
      const stud = students.find(s => String(s.id) === String(pdfStudentId));
      const studName = stud ? stud.nombre.replace(/\s+/g, '_') : 'alumno';

      link.setAttribute('download', `Bitacora_Evidencia_${studName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      showToast('Bitácora PDF descargada con éxito.', 'success');
    } catch (error: any) {
      console.error(error);
      showToast('Error al descargar el archivo de evidencias.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // Obtener cursos únicos disponibles de los alumnos para el selector de grupos
  const cursosDisponibles = Array.from(new Set(students.map(s => s.curso).filter((c): c is string => typeof c === 'string')));

  // Filtrar alumnos para el autocompletar de bitácora
  const filteredStudentsForPdf = students.filter(s => 
    (s.nombre?.toLowerCase() || '').includes(pdfSearchTerm.toLowerCase()) || 
    (s.curso?.toLowerCase() || '').includes(pdfSearchTerm.toLowerCase())
  );

  // Calcular la lista de alumnos "Pendientes de Lectura" en el Drawer
  const getPendingStudents = (msg: StudentMessage) => {
    const readIds = (msg.lecturas || []).map(l => String(l.alumno.id));
    
    if (msg.targetType === 'ALL') {
      return students.filter(s => !readIds.includes(String(s.id)));
    } else if (msg.targetType === 'GRUPO' && msg.targetGroup) {
      return students.filter(s => 
        (s.curso?.toLowerCase().trim() || '') === (msg.targetGroup?.toLowerCase().trim() || '') && 
        !readIds.includes(String(s.id))
      );
    } else if (msg.targetType === 'INDIVIDUAL' && msg.studentId) {
      const hasRead = readIds.includes(String(msg.studentId));
      if (hasRead) return [];
      return students.filter(s => String(s.id) === String(msg.studentId));
    }
    return [];
  };

  return (
    <div className="comunicacion-view" style={{ padding: '24px 30px', boxSizing: 'border-box' }}>
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
          justify-content: center;
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
        
        .drawer-overlay {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 420px;
          background: var(--bg-card);
          border-left: 1px solid var(--border-color);
          box-shadow: -10px 0 25px rgba(0, 0, 0, 0.15);
          z-index: 999;
          display: flex;
          flex-direction: column;
          animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
        
        .message-row {
          padding: 18px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-main);
          transition: border-color 0.2s, transform 0.15s;
          cursor: pointer;
        }
        .message-row:hover {
          border-color: var(--brand-blue);
          transform: translateY(-1px);
        }
        
        .autocomplete-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 100;
          box-shadow: var(--shadow-md);
        }
        .autocomplete-item {
          padding: 10px 14px;
          cursor: pointer;
          font-size: 13px;
          border-bottom: 1px solid var(--border-color);
        }
        .autocomplete-item:hover {
          background: rgba(15, 56, 105, 0.05);
        }
        
        @keyframes slideIn {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
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
            <MessageSquare size={26} color="var(--brand-yellow)" /> Comunicados Internos
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Envía avisos a estudiantes específicos, grupos o a toda la comunidad y audita la fecha y hora en que los abrieron.
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
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Megaphone size={18} /> Nuevo Comunicado
        </button>
      </div>

      {/* MAIN TWO COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* COLUMNA IZQUIERDA: LISTADO DE COMUNICADOS ENVIADOS */}
        <div className="bento-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Megaphone size={18} color="var(--brand-blue)" /> Avisos Históricos y Auditoría
            </h3>
            <span style={{ fontSize: '11px', fontWeight: '700', background: 'rgba(15, 56, 105, 0.06)', color: 'var(--brand-blue)', padding: '4px 10px', borderRadius: '100px' }}>
              {mensajesAdmin.length} mensajes en total
            </span>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '10px' }}>
              <Loader2 size={36} className="animate-spin" style={{ color: 'var(--brand-yellow)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Cargando registros de comunicaciones...</span>
            </div>
          ) : mensajesAdmin.length === 0 ? (
            <div style={{ padding: '80px 40px', textAlign: 'center', border: '2px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
              <Megaphone size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>No se han enviado comunicados</h4>
              <p style={{ margin: 0, fontSize: '12px' }}>Los avisos enviados a la comunidad escolar se guardarán aquí para auditar sus lecturas.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mensajesAdmin.map((msg: StudentMessage) => {
                const readPct = msg.totalTargeted && msg.totalTargeted > 0 
                  ? Math.round((msg.readCount || 0) / msg.totalTargeted * 100) 
                  : 0;

                return (
                  <div 
                    key={msg.id} 
                    className="message-row"
                    onClick={() => setSelectedAuditMessage(msg)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {msg.title}
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          De: <strong style={{ color: 'var(--text-primary)' }}>{msg.sender}</strong> • {new Date(msg.createdAt || '').toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Destinatario Badge */}
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: msg.targetType === 'ALL' ? 'rgba(34, 197, 94, 0.08)' : msg.targetType === 'GRUPO' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(139, 92, 246, 0.08)',
                        color: msg.targetType === 'ALL' ? '#16a34a' : msg.targetType === 'GRUPO' ? '#2563eb' : '#7c3aed'
                      }}>
                        {msg.targetType === 'ALL' ? 'Todos' : msg.targetType === 'GRUPO' ? `Curso (${msg.targetGroup})` : `Individual`}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 14px 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {msg.content}
                    </p>

                    {/* Barra de progreso de Lectura */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--border-color)', borderRadius: '100px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${readPct}%`, 
                          height: '100%', 
                          background: readPct >= 80 ? '#10b981' : (readPct >= 40 ? '#f59e0b' : '#3b82f6'),
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={12} /> {msg.readCount} / {msg.totalTargeted} Leídos ({readPct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: EXPEDIENTES DE EVIDENCIA PDF Y MÉTRICAS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* BITÁCORA DE EVIDENCIA DE LECTURA */}
          <div className="bento-card" style={{ background: 'var(--gradient-card)', color: 'white', border: 'none', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'rgba(255, 255, 255, 0.95)' }}>
              <ShieldCheck size={48} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', textAlign: 'center', margin: '0 0 6px 0' }}>Bitácora de Evidencia</h3>
            <p style={{ fontSize: '12.5px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', margin: '0 0 20px 0', lineHeight: '1.4' }}>
              Genera y descarga un documento PDF firmado digitalmente con el historial inalterable de lecturas y avisos recibidos por el tutor.
            </p>

            {/* Selector de Estudiante Autocomplete */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Seleccionar Alumno
              </label>
              
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  placeholder="Buscar por nombre o curso..."
                  value={pdfSearchTerm}
                  onChange={(e) => {
                    setPdfSearchTerm(e.target.value);
                    setShowPdfSearchDropdown(true);
                  }}
                  onFocus={() => setShowPdfSearchDropdown(true)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 36px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '13px', color: 'rgba(255,255,255,0.7)' }} />
                {pdfStudentId && (
                  <button 
                    onClick={() => {
                      setPdfStudentId('');
                      setPdfSearchTerm('');
                    }}
                    style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dropdown autocompletar */}
              {showPdfSearchDropdown && pdfSearchTerm && (
                <div className="autocomplete-dropdown" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {filteredStudentsForPdf.length === 0 ? (
                    <div style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-secondary)' }}>No se encontraron alumnos</div>
                  ) : (
                    filteredStudentsForPdf.slice(0, 5).map(stud => (
                      <div 
                        key={stud.id}
                        className="autocomplete-item"
                        onClick={() => {
                          setPdfStudentId(String(stud.id));
                          setPdfSearchTerm(stud.nombre);
                          setShowPdfSearchDropdown(false);
                        }}
                      >
                        <strong style={{ display: 'block' }}>{stud.nombre}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Curso: {stud.curso}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={handleDownloadPdf}
              disabled={isDownloading || !pdfStudentId}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '100px',
                border: 'none',
                background: 'white',
                color: 'var(--brand-blue)',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: pdfStudentId ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: pdfStudentId ? 1 : 0.6,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              {isDownloading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Descargar Historial PDF</span>
                </>
              )}
            </button>
          </div>

          {/* ESTADÍSTICAS E IMPACTO DEL MÓDULO */}
          <div className="bento-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--brand-blue)" /> Impacto del Control de Avisos
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Avisos Leídos en Promedio</span>
                  <span style={{ fontWeight: '700', color: '#10b981', fontSize: '13px' }}>96.2%</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'var(--border-color)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ width: '96.2%', height: '100%', background: '#10b981' }}></div>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Efectividad Legal de Evidencias</span>
                  <span style={{ fontWeight: '700', color: '#3b82f6', fontSize: '13px' }}>100%</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'var(--border-color)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#3b82f6' }}></div>
                </div>
              </div>
            </div>
            
            <div style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(15, 56, 105, 0.04)',
              border: '1px solid rgba(15, 56, 105, 0.08)',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start'
            }}>
              <Info size={16} color="var(--brand-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Al enviar avisos por este medio, el sistema bloquea cualquier pretexto del tutor. Queda registrada la dirección IP simulada, la fecha y la hora exacta de la lectura.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: REDACTAR NUEVO COMUNICADO */}
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
                Redactar Comunicado Oficial
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMessage} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Emisor y Destinatario Tipo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                    Remitente
                  </label>
                  <select 
                    value={sender} 
                    onChange={e => setSender(e.target.value)}
                    className="form-select"
                  >
                    <option value="Coordinación CRECE">Coordinación CRECE</option>
                    <option value="Finanzas CRECE">Finanzas CRECE</option>
                    <option value="Dirección Académica">Dirección Académica</option>
                    <option value="Control Escolar">Control Escolar</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                    Tipo de Destinatario
                  </label>
                  <select 
                    value={targetType} 
                    onChange={e => setTargetType(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="ALL">Toda la comunidad (Todos)</option>
                    <option value="GRUPO">Por Curso / Grupo</option>
                    <option value="INDIVIDUAL">Alumno Específico</option>
                  </select>
                </div>
              </div>

              {/* CAMPOS DINÁMICOS DE DESTINATARIO */}
              {targetType === 'GRUPO' && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                    Seleccionar Grupo / Curso
                  </label>
                  <select 
                    value={targetGroup} 
                    onChange={e => setTargetGroup(e.target.value)}
                    className="form-select"
                  >
                    {cursosDisponibles.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'INDIVIDUAL' && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                    Seleccionar Alumno Destinatario
                  </label>
                  <select 
                    value={selectedStudentId} 
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">-- Selecciona un alumno --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre} ({s.curso})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Título */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Asunto / Título
                </label>
                <input 
                  type="text" 
                  placeholder="Ej. Examen Simulacro Obligatorio Sábado 📝" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {/* Contenido del Aviso */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Mensaje del Aviso
                </label>
                <textarea 
                  placeholder="Escribe aquí el contenido detallado del aviso oficial para los alumnos y tutores..." 
                  value={content} 
                  onChange={e => setContent(e.target.value)}
                  className="form-textarea"
                  rows={4}
                  required
                />
              </div>

              {/* Acciones */}
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
                  disabled={isSaving}
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
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Enviar Aviso</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER DE AUDITORÍA DE LECTURA DE AVISO */}
      {selectedAuditMessage && (
        <>
          {/* Overlay opaco para cerrar */}
          <div 
            onClick={() => setSelectedAuditMessage(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', zIndex: 998 }}
          />

          <div className="drawer-overlay">
            {/* Header Drawer */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  Reporte de Lecturas
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID del Aviso: {selectedAuditMessage.id.substring(0, 8)}</span>
              </div>
              <button 
                onClick={() => setSelectedAuditMessage(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Resumen del Aviso */}
            <div style={{ padding: '16px 24px', background: 'rgba(15, 56, 105, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedAuditMessage.title}</h4>
              <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{selectedAuditMessage.content}</p>
            </div>

            {/* Listas de Lectura */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              
              {/* Leídos */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ 
                  fontSize: '11px', 
                  textTransform: 'uppercase', 
                  color: '#16a34a', 
                  fontWeight: '700', 
                  letterSpacing: '0.5px', 
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CheckCircle2 size={14} /> Leídos ({(selectedAuditMessage.lecturas || []).length})
                </h4>

                {(selectedAuditMessage.lecturas || []).length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                    Ningún alumno ha leído este aviso todavía.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(selectedAuditMessage.lecturas || []).map((lectura) => (
                      <div 
                        key={lectura.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 10px',
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px'
                        }}
                      >
                        <div>
                          <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-primary)' }}>{lectura.alumno.nombre}</strong>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Curso: {lectura.alumno.curso}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '600', display: 'block' }}>Visto ✅</span>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{new Date(lectura.readAt).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pendientes */}
              <div>
                {(() => {
                  const pending = getPendingStudents(selectedAuditMessage);
                  return (
                    <>
                      <h4 style={{ 
                        fontSize: '11px', 
                        textTransform: 'uppercase', 
                        color: '#ef4444', 
                        fontWeight: '700', 
                        letterSpacing: '0.5px', 
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <EyeOff size={14} /> Sin Leer ({pending.length})
                      </h4>

                      {pending.length === 0 ? (
                        <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#16a34a', border: '1px dashed rgba(22, 163, 74, 0.2)', borderRadius: '8px', background: 'rgba(22, 163, 74, 0.02)' }}>
                          ¡Aviso leído por el 100% de los destinatarios! 🎉
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {pending.map((stud) => (
                            <div 
                              key={stud.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 10px',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                opacity: 0.85
                              }}
                            >
                              <div>
                                <strong style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-primary)' }}>{stud.nombre}</strong>
                                <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Tutor: {stud.tutor || 'No registrado'}</span>
                              </div>
                              <span style={{ fontSize: '9.5px', color: '#64748b', fontWeight: '500' }}>Sin ver</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}
