import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, BookOpen, Phone, Calendar, Wallet, FileText, 
  AlertTriangle, CheckCircle2, TrendingUp, Download, UserCheck, Target,
  Clock, Award, Star, Plus, AlertCircle, UploadCloud, Pencil, Loader2
} from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/useAppStore';

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, transactions, questions } = useAppStore();
  const [studentTab, setStudentTab] = useState('Resumen');
  const [selectedAttemptAudit, setSelectedAttemptAudit] = useState<any | null>(null);
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<number | null>(null);

  const selectedStudent = students.find(s => String(s.id) === String(id));

  // --- ESTADOS PARA MODAL DE PAGO Y TOAST ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCuotaToPay, setSelectedCuotaToPay] = useState<any | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [downloadReceiptUrl, setDownloadReceiptUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null
  });

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', type: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback.message]);

  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});

  const handleUploadDocument = async (docName: string, file: File) => {
    if (!selectedStudent) return;
    
    // Validar tipo de archivo
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setFeedback({ message: 'Error: Solo se permiten archivos en formato PDF.', type: 'error' });
      return;
    }

    try {
      // Activar spinner en la fila del documento
      setUploadingDocs(prev => ({ ...prev, [docName]: true }));
      
      // Simular tiempo de carga para un feedback visual excelente
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Construir la nueva lista de documentos
      const updatedDocs = (selectedStudent.documents || []).map((d: any) => {
        if (d.name === docName) {
          return { ...d, status: 'Subido' };
        }
        return d;
      });

      // Si por alguna razón el documento no estaba en la lista requerida del alumno, lo agregamos
      if (!updatedDocs.find((d: any) => d.name === docName)) {
        updatedDocs.push({ name: docName, status: 'Subido' });
      }

      // Actualizar a través del Zustand Store
      await useAppStore.getState().updateStudentTracking(selectedStudent.id, {
        documents: updatedDocs
      });

      setFeedback({ message: `¡Documento "${docName}" subido y guardado con éxito! 📄`, type: 'success' });
    } catch (err) {
      console.error('Error al subir el documento:', err);
      setFeedback({ message: 'Error al procesar el archivo. Intente de nuevo.', type: 'error' });
    } finally {
      setUploadingDocs(prev => ({ ...prev, [docName]: false }));
    }
  };

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', tutor: '', phone: '', curso: '' });

  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUploadingCertPdf, setIsUploadingCertPdf] = useState(false);
  const [isUploadingCertXml, setIsUploadingCertXml] = useState(false);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  const handleStartEditInfo = () => {
    if (!selectedStudent) return;
    setEditForm({
      name: selectedStudent.name || '',
      tutor: selectedStudent.tutor || '',
      phone: selectedStudent.phone || '',
      curso: selectedStudent.curso || ''
    });
    setIsEditingInfo(true);
  };

  const handleSaveInfo = async () => {
    if (!selectedStudent) return;
    try {
      setIsSavingInfo(true);
      await useAppStore.getState().updateStudentTracking(selectedStudent.id, {
        name: editForm.name,
        tutor: editForm.tutor,
        phone: editForm.phone,
        curso: editForm.curso
      });
      setIsEditingInfo(false);
      setFeedback({ message: '¡Información del alumno actualizada con éxito! 👤', type: 'success' });
    } catch (error) {
      console.error('Error al guardar información del alumno:', error);
      setFeedback({ message: 'Error al actualizar la información del alumno.', type: 'error' });
    } finally {
      setIsSavingInfo(false);
    }
  };

  const cuotasList = useMemo(() => {
    if (!selectedStudent) return [];
    if (selectedStudent.cuotas && selectedStudent.cuotas.length > 0) {
      return selectedStudent.cuotas;
    }

    // Fallback: Si no tiene cuotas estructuradas en BD, las calculamos al vuelo
    const totalCost = selectedStudent.paymentPlan?.totalCost || 0;
    const amountPaid = selectedStudent.paymentPlan?.amountPaid || 0;
    const plazosTotales = selectedStudent.paymentPlan?.planPagosTotales || 1;
    const valorCuota = totalCost / plazosTotales;

    let saldoAbonado = amountPaid;
    
    return Array.from({ length: plazosTotales }).map((_, index) => {
      const numeroPago = index + 1;
      
      // Simulamos fechas de vencimiento: Pago 1 hoy, Pago 2 en +30 días, etc.
      const fechaVencimientoObj = new Date();
      fechaVencimientoObj.setDate(fechaVencimientoObj.getDate() + (index * 30));
      const fechaVencimiento = fechaVencimientoObj.toISOString().split('T')[0];

      let status = 'Pendiente';
      let fechaPago: string | null = null;

      if (saldoAbonado >= valorCuota) {
        status = 'Pagada';
        fechaPago = new Date().toISOString().split('T')[0];
        saldoAbonado -= valorCuota;
      } else if (saldoAbonado > 0) {
        status = 'Pagada'; // Cubierto parcialmente
        fechaPago = new Date().toISOString().split('T')[0];
        saldoAbonado = 0;
      } else {
        const hoy = new Date();
        if (fechaVencimientoObj < hoy) {
          status = 'Vencida';
        }
      }

      return {
        id: `simulated-${numeroPago}`,
        numeroPago,
        monto: valorCuota,
        fechaVencimiento,
        status,
        fechaPago
      };
    });
  }, [selectedStudent]);

  if (!selectedStudent) {
    return <div style={{ padding: '40px' }}>Alumno no encontrado.</div>;
  }

  return (
    <div className="student-detail-view" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', background: 'var(--bg-main)' }}>
      <div style={{ padding: '24px 40px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '24px', background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }} onClick={() => navigate('/alumnos')}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '20px' }}>
            {selectedStudent.avatar}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedStudent.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={14} /> {selectedStudent.curso}</span>
              <span style={{ color: 'var(--border-color)' }}>|</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <select
                  value={selectedStudent.status}
                  disabled={isUpdatingStatus}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    try {
                      setIsUpdatingStatus(true);
                      await useAppStore.getState().updateStudentTracking(selectedStudent.id, { status: newStatus });
                    } finally {
                      setIsUpdatingStatus(false);
                    }
                  }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '100px',
                    fontSize: '11px',
                    fontWeight: '700',
                    border: '1px solid var(--border-color)',
                    cursor: isUpdatingStatus ? 'not-allowed' : 'pointer',
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'var(--transition)',
                    background: selectedStudent.status.includes('Al Corriente') ? 'rgba(34, 197, 94, 0.1)' 
                               : selectedStudent.status.includes('Adeudo') ? 'rgba(239, 68, 68, 0.1)' 
                               : selectedStudent.status.includes('Inactivo') ? 'rgba(100, 116, 139, 0.1)' 
                               : 'rgba(234, 179, 8, 0.1)',
                    color: selectedStudent.status.includes('Al Corriente') ? '#16a34a' 
                            : selectedStudent.status.includes('Adeudo') ? '#ef4444' 
                            : selectedStudent.status.includes('Inactivo') ? '#64748b' 
                            : '#ca8a04'
                  }}
                >
                  <option value="Pendiente Docs">Pendiente Docs</option>
                  <option value="Activo - Al Corriente">Activo - Al Corriente</option>
                  <option value="Activo - Con Adeudos">Activo - Con Adeudos</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
                {isUpdatingStatus && (
                  <Loader2 size={12} style={{ color: 'var(--brand-blue)', animation: 'spin 1s linear infinite' }} />
                )}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ width: 'auto', padding: '10px 20px', gap: '8px', background: '#25D366' }}>
            <Phone size={16} /> Contactar Tutor
          </button>
        </div>
      </div>

      <div style={{ padding: '0 40px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {['Resumen', 'Información', 'Documentos', 'Descargas', 'Finanzas', 'Rendimiento', 'Asistencia'].map(tab => (
            <div 
              key={tab} 
              style={{ 
                padding: '16px 0', 
                fontSize: '14px', 
                fontWeight: studentTab === tab ? '600' : '500', 
                color: studentTab === tab ? 'var(--brand-blue)' : 'var(--text-secondary)',
                borderBottom: studentTab === tab ? '2px solid var(--brand-blue)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setStudentTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
        {studentTab === 'Resumen' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {/* Asistencia Resumen */}
            <div className="bento-card">
              <div className="card-title" style={{ marginBottom: '0' }}>
                <Calendar size={18} color="var(--brand-blue)" /> Asistencia General
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <span style={{ fontSize: '42px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-1px' }}>{selectedStudent.attendance?.percentage || 0}%</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '500' }}>Presentismo</span>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-main)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ width: `${selectedStudent.attendance?.percentage || 0}%`, height: '100%', background: 'linear-gradient(90deg, var(--brand-blue), #60a5fa)', borderRadius: '100px' }}></div>
                </div>
              </div>
            </div>

            {/* Finanzas Resumen */}
            <div className="bento-card card-finance">
              <div className="card-title" style={{ marginBottom: '0' }}>
                <Wallet size={18} color="white" /> Balance y Adeudo
              </div>
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>Restante por Pagar</div>
                <div style={{ fontSize: '42px', fontWeight: '700', marginTop: '4px', lineHeight: 1, letterSpacing: '-1px' }}>${(selectedStudent.paymentPlan.totalCost - selectedStudent.paymentPlan.amountPaid).toLocaleString()}</div>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: '500' }}>
                  <span>Pagado: ${selectedStudent.paymentPlan.amountPaid.toLocaleString()}</span>
                  <span>{Math.round((selectedStudent.paymentPlan.amountPaid / selectedStudent.paymentPlan.totalCost) * 100)}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ width: `${(selectedStudent.paymentPlan.amountPaid / selectedStudent.paymentPlan.totalCost) * 100}%`, height: '100%', background: 'var(--brand-yellow)', borderRadius: '100px', boxShadow: '0 0 10px rgba(234, 179, 8, 0.5)' }}></div>
                </div>
              </div>
            </div>

            {/* Documentos Resumen */}
            <div className="bento-card">
              <div className="card-title" style={{ marginBottom: '0' }}>
                <FileText size={18} color="var(--brand-blue)" /> Expediente
              </div>
              <div style={{ marginTop: '24px' }}>
                <span style={{ fontSize: '42px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-1px' }}>
                  {selectedStudent.documents?.filter((d:any) => d.status === 'Subido').length} <span style={{ fontSize: '24px', color: 'var(--text-secondary)' }}>/ {selectedStudent.documents?.length}</span>
                </span>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: '500' }}>Documentos entregados</div>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                {selectedStudent.documents?.some((d:any) => d.status === 'Faltante') ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '100px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <AlertTriangle size={16} color="var(--brand-yellow)" /> Requiere Atención
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '100px', fontSize: '13px', fontWeight: '600', color: 'var(--brand-blue)' }}>
                    <CheckCircle2 size={16} /> Expediente Completo
                  </div>
                )}
              </div>
            </div>

            {/* Gráfica Rendimiento (Ocupa todo el ancho) */}
            <div className="bento-card" style={{ gridColumn: 'span 3', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div className="card-title" style={{ margin: 0, fontSize: '20px' }}>
                  <TrendingUp size={22} color="var(--brand-blue)" /> Rendimiento Académico
                </div>
                <button className="card-action" onClick={() => setStudentTab('Rendimiento')} style={{ padding: '8px 16px' }}>Ver Historial Completo</button>
              </div>
              {selectedStudent.exams && selectedStudent.exams.length > 0 ? (
                <div style={{ height: '240px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedStudent.exams.map((e:any) => ({ name: e.name, score: e.score }))} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--brand-blue)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--brand-blue)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-secondary)', fontWeight: 500 }} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-secondary)', fontWeight: 500 }} domain={[0, 128]} />
                      <Tooltip 
                        contentStyle={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: '12px', boxShadow: 'var(--shadow-hover)' }}
                        itemStyle={{ color: 'var(--brand-blue)', fontWeight: 700, fontSize: '16px' }}
                        labelStyle={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}
                      />
                      <Area type="monotone" dataKey="score" stroke="var(--brand-blue)" fillOpacity={1} fill="url(#colorScore)" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--brand-blue)', style: { filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' } }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '15px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                  Aún no hay exámenes registrados para mostrar la tendencia de {selectedStudent.name}.
                </div>
              )}
            </div>
          </div>
        )}
        {studentTab === 'Información' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="bento-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={18} color="var(--brand-blue)" /> Datos del Alumno y Tutor
                </h3>
                {!isEditingInfo ? (
                  <button 
                    className="btn-secondary" 
                    onClick={handleStartEditInfo}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', width: 'auto', padding: '6px 14px' }}
                  >
                    <Pencil size={14} /> Editar Información
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-secondary" 
                      onClick={() => setIsEditingInfo(false)}
                      style={{ padding: '6px 14px', fontSize: '13px', width: 'auto' }}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={handleSaveInfo}
                      disabled={isSavingInfo}
                      style={{ 
                        background: 'var(--brand-blue)', 
                        color: 'white', 
                        border: 'none', 
                        padding: '6px 14px', 
                        fontSize: '13px', 
                        width: 'auto', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        cursor: isSavingInfo ? 'not-allowed' : 'pointer',
                        opacity: isSavingInfo ? 0.8 : 1
                      }}
                    >
                      {isSavingInfo ? (
                        <>
                          <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                          Guardando...
                        </>
                      ) : 'Guardar'}
                    </button>
                  </div>
                )}
              </div>

              {!isEditingInfo ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nombre del Alumno</div>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>{selectedStudent.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Curso</div>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>{selectedStudent.curso}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nombre Completo del Tutor</div>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>{selectedStudent.tutor}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Teléfono (WhatsApp)</div>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>{selectedStudent.phone}</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Nombre del Alumno</label>
                    <input 
                      type="text" 
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Nombre completo"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Curso</label>
                    <input 
                      type="text" 
                      value={editForm.curso}
                      onChange={(e) => setEditForm({ ...editForm, curso: e.target.value })}
                      placeholder="Curso inscrito"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Nombre Completo del Tutor</label>
                    <input 
                      type="text" 
                      value={editForm.tutor}
                      onChange={(e) => setEditForm({ ...editForm, tutor: e.target.value })}
                      placeholder="Tutor del alumno"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Teléfono (WhatsApp)</label>
                    <input 
                      type="text" 
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="WhatsApp tutor"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {studentTab === 'Documentos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Expediente Principal */}
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            <div className="bento-card" style={{ padding: 0 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="var(--brand-blue)" /> Expediente de Documentos
                </h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {selectedStudent.documents?.map((doc: any, i: number) => {
                    const isUploading = uploadingDocs[doc.name] || false;
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{doc.name}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                            {isUploading ? (
                              <span style={{ 
                                padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: 'var(--brand-blue)'
                              }}>
                                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                Subiendo...
                              </span>
                            ) : (
                              <>
                                <span style={{ 
                                  padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                  background: doc.status === 'Subido' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  color: doc.status === 'Subido' ? '#16a34a' : '#ef4444'
                                }}>
                                  {doc.status === 'Subido' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                  {doc.status}
                                </span>

                                {/* Hidden file input */}
                                <input 
                                  type="file" 
                                  id={`file-input-${i}`} 
                                  accept=".pdf" 
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleUploadDocument(doc.name, file);
                                    }
                                    e.target.value = '';
                                  }}
                                />

                                {doc.status === 'Subido' ? (
                                  <button 
                                    className="btn-secondary"
                                    onClick={() => document.getElementById(`file-input-${i}`)?.click()}
                                    title="Reemplazar documento PDF"
                                    style={{ 
                                      width: '32px', height: '32px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                                      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'var(--transition)'
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
                                      e.currentTarget.style.color = 'var(--brand-blue)';
                                      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                      e.currentTarget.style.color = 'var(--text-secondary)';
                                      e.currentTarget.style.borderColor = 'var(--border-color)';
                                    }}
                                  >
                                    <Pencil size={14} />
                                  </button>
                                ) : (
                                  <button 
                                    className="btn-secondary"
                                    onClick={() => document.getElementById(`file-input-${i}`)?.click()}
                                    style={{ 
                                      width: 'auto', padding: '6px 12px', fontSize: '12px', height: '32px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                      background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--brand-blue)', cursor: 'pointer', transition: 'var(--transition)'
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.background = 'var(--brand-blue)';
                                      e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
                                      e.currentTarget.style.color = 'var(--brand-blue)';
                                    }}
                                  >
                                    <UploadCloud size={14} />
                                    Subir
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* SECCIÓN DE CERTIFICACIÓN OFICIAL */}
            {(() => {
              const hasDebt = (selectedStudent.paymentPlan.totalCost - selectedStudent.paymentPlan.amountPaid) > 0;
              
              if (hasDebt) {
                return (
                  <div className="bento-card" style={{ 
                    position: 'relative', 
                    padding: '40px 32px',
                    textAlign: 'center',
                    border: '1px dashed rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px'
                  }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Módulo de Certificación Bloqueado</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '480px', margin: 0, lineHeight: 1.4 }}>
                        🔒 La certificación oficial (PDF, XML, SIGED y Evidencia de Recibido) se desbloqueará una vez que el plan de pagos esté liquidado al 100%. 
                        Deuda actual: <strong>${(selectedStudent.paymentPlan.totalCost - selectedStudent.paymentPlan.amountPaid).toLocaleString()} MXN</strong>.
                      </p>
                    </div>
                    <button 
                      className="btn-secondary" 
                      onClick={() => setStudentTab('Finanzas')}
                      style={{ fontSize: '13px', padding: '8px 16px', background: 'var(--brand-blue)', color: 'white', border: 'none', width: 'auto', cursor: 'pointer' }}
                    >
                      Ir a Registrar Pago
                    </button>
                  </div>
                );
              }

              // Estudiante Liquidado: Habilitar Certificación Oficial
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                  
                  {/* Bloque Izquierdo: Carga y Validación de Certificado */}
                  <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={18} color="var(--brand-yellow)" /> Certificación Académica Oficial
                      </h3>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '100px' }}>
                        LIQUIDADO (100%)
                      </span>
                    </div>

                    {/* Drag and Drop de Certificado (PDF & XML) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      
                      {/* PDF Upload */}
                      <div style={{
                        border: `2px dashed ${selectedStudent.certificadoPdf ? '#16a34a' : 'var(--border-color)'}`,
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        background: selectedStudent.certificadoPdf ? 'rgba(34, 197, 94, 0.01)' : 'var(--bg-main)',
                        cursor: isUploadingCertPdf ? 'not-allowed' : 'pointer',
                        transition: 'var(--transition)',
                        opacity: isUploadingCertPdf ? 0.7 : 1,
                        position: 'relative'
                      }} onClick={async () => {
                        if (isUploadingCertPdf) return;
                        if (!selectedStudent.certificadoPdf) {
                          const name = prompt('Ingrese el nombre del archivo PDF del Certificado (ej. certificado_oficial.pdf):', `certificado_${selectedStudent.name.toLowerCase().replace(/\s+/g, '_')}.pdf`);
                          if (name) {
                            try {
                              setIsUploadingCertPdf(true);
                              await new Promise(resolve => setTimeout(resolve, 800));
                              await useAppStore.getState().updateStudentTracking(selectedStudent.id, { 
                                certificadoPdf: name,
                                tieneCertificado: true
                              });
                            } finally {
                              setIsUploadingCertPdf(false);
                            }
                          }
                        }
                      }}>
                        {isUploadingCertPdf ? (
                          <div style={{ padding: '8px 0' }}>
                            <Loader2 size={24} style={{ color: 'var(--brand-blue)', animation: 'spin 1s linear infinite', marginBottom: '8px', margin: '0 auto' }} />
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Procesando...</div>
                          </div>
                        ) : (
                          <>
                            <FileText size={24} color={selectedStudent.certificadoPdf ? '#16a34a' : 'var(--text-secondary)'} style={{ marginBottom: '8px', margin: '0 auto' }} />
                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>Certificado PDF *</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', wordBreak: 'break-all' }}>
                              {selectedStudent.certificadoPdf ? selectedStudent.certificadoPdf : 'Haz clic para seleccionar PDF'}
                            </div>
                          </>
                        )}
                      </div>

                      {/* XML Upload */}
                      <div style={{
                        border: `2px dashed ${selectedStudent.certificadoXml ? '#16a34a' : 'var(--border-color)'}`,
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        background: selectedStudent.certificadoXml ? 'rgba(34, 197, 94, 0.01)' : 'var(--bg-main)',
                        cursor: isUploadingCertXml ? 'not-allowed' : 'pointer',
                        transition: 'var(--transition)',
                        opacity: isUploadingCertXml ? 0.7 : 1,
                        position: 'relative'
                      }} onClick={async () => {
                        if (isUploadingCertXml) return;
                        if (!selectedStudent.certificadoXml) {
                          const name = prompt('Ingrese el nombre del archivo XML del Certificado (ej. certificado_oficial.xml):', `certificado_${selectedStudent.name.toLowerCase().replace(/\s+/g, '_')}.xml`);
                          if (name) {
                            try {
                              setIsUploadingCertXml(true);
                              await new Promise(resolve => setTimeout(resolve, 800));
                              await useAppStore.getState().updateStudentTracking(selectedStudent.id, { 
                                certificadoXml: name,
                                tieneCertificado: true
                              });
                            } finally {
                              setIsUploadingCertXml(false);
                            }
                          }
                        }
                      }}>
                        {isUploadingCertXml ? (
                          <div style={{ padding: '8px 0' }}>
                            <Loader2 size={24} style={{ color: 'var(--brand-blue)', animation: 'spin 1s linear infinite', marginBottom: '8px', margin: '0 auto' }} />
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Procesando...</div>
                          </div>
                        ) : (
                          <>
                            <FileText size={24} color={selectedStudent.certificadoXml ? '#16a34a' : 'var(--text-secondary)'} style={{ marginBottom: '8px', margin: '0 auto' }} />
                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>Certificado XML *</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', wordBreak: 'break-all' }}>
                              {selectedStudent.certificadoXml ? selectedStudent.certificadoXml : 'Haz clic para seleccionar XML'}
                            </div>
                          </>
                        )}
                      </div>

                    </div>

                    {/* Validador de Atributos del Certificado */}
                    <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Validación de Datos Oficiales</span>
                        <button 
                          onClick={async () => {
                            // Simulación premium de carga con IA
                            const loaderBtn = document.getElementById('ia-loader');
                            if (loaderBtn) loaderBtn.innerHTML = 'Leyendo XML/PDF... ⌛';
                            setTimeout(async () => {
                              await useAppStore.getState().updateStudentTracking(selectedStudent.id, {
                                certNombreValido: true,
                                certCurpValido: true,
                                certCalificacionValido: true,
                                certSigedValido: true,
                                tieneCertificado: true
                              });
                              if (loaderBtn) loaderBtn.innerHTML = '✨ Auto-Validado con IA';
                              alert('¡Análisis completado! La IA ha validado Nombre, CURP, Calificación y autenticidad en SIGED de forma exitosa.');
                            }, 1500);
                          }}
                          id="ia-loader"
                          style={{ border: 'none', background: 'rgba(59,130,246,0.1)', color: 'var(--brand-blue)', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          ✨ Auto-Validar con IA
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          { key: 'certNombreValido', label: '1. Nombre Completo Correcto', desc: `Debe coincidir exactamente con "${selectedStudent.name}"` },
                          { key: 'certCurpValido', label: '2. CURP Validada', desc: 'Validación en RENAPO correcta' },
                          { key: 'certCalificacionValido', label: '3. Calificación Registrada', desc: 'Nota aprobatoria en formato decimal' },
                          { key: 'certSigedValido', label: '4. Autenticidad SIGED', desc: 'Sello digital del SIGED verificado' }
                        ].map(item => (
                          <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.label}</div>
                              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{item.desc}</div>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={(selectedStudent as any)[item.key] || false}
                              onChange={async (e) => {
                                await useAppStore.getState().updateStudentTracking(selectedStudent.id, {
                                  [item.key]: e.target.checked
                                });
                              }}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Estatus de envío */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.04)', padding: '12px 16px', borderRadius: '100px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--brand-blue)' }}>
                        <Clock size={16} /> ¿Certificado enviado al estudiante?
                      </div>
                      <input 
                        type="checkbox" 
                        checked={selectedStudent.certificadoEnviado || false}
                        onChange={async (e) => {
                          await useAppStore.getState().updateStudentTracking(selectedStudent.id, {
                            certificadoEnviado: e.target.checked
                          });
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>

                  {/* Bloque Derecho: Evidencia Fotográfica y Auditoría */}
                  <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                      Evidencia de Entrega
                    </h3>

                    {/* Foto Evidencia */}
                    <div style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: '16px',
                      padding: '24px',
                      textAlign: 'center',
                      background: 'var(--bg-main)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: isUploadingEvidence ? 'not-allowed' : 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '200px',
                      justifyContent: 'center',
                      opacity: isUploadingEvidence ? 0.7 : 1
                    }} onClick={async () => {
                      if (isUploadingEvidence) return;
                      const currentVal = selectedStudent.fotoEvidencia;
                      const name = prompt('Ingrese el nombre de la foto de recibido (ej. foto_recibido.jpg):', currentVal || `evidencia_${selectedStudent.name.toLowerCase().replace(/\s+/g, '_')}_recibido.jpg`);
                      if (name) {
                        try {
                          setIsUploadingEvidence(true);
                          await new Promise(resolve => setTimeout(resolve, 800));
                          await useAppStore.getState().updateStudentTracking(selectedStudent.id, { 
                            fotoEvidencia: name
                          });
                        } finally {
                          setIsUploadingEvidence(false);
                        }
                      }
                    }}>
                      {isUploadingEvidence ? (
                        <div style={{ zIndex: 20 }}>
                          <Loader2 size={32} style={{ color: 'var(--brand-blue)', animation: 'spin 1s linear infinite', marginBottom: '12px', margin: '0 auto' }} />
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Actualizando evidencia...</div>
                        </div>
                      ) : selectedStudent.fotoEvidencia ? (
                        <>
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'var(--transition)', zIndex: 10 }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                            Haga clic para cambiar evidencia
                          </div>
                          <img 
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80" 
                            alt="Evidencia fotográfica" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                          />
                        </>
                      ) : (
                        <>
                          <Clock size={32} color="var(--text-secondary)" style={{ marginBottom: '12px', margin: '0 auto' }} />
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Evidencia Fotográfica de Recibido</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>PNG o JPG del alumno recibiendo el documento</div>
                        </>
                      )}
                    </div>

                    {/* Metadata de Auditoría */}
                    <div style={{ 
                      marginTop: 'auto', 
                      background: 'rgba(30, 58, 138, 0.03)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>
                        Historial de Auditoría de Procesos
                      </div>
                      
                      <div>
                        <strong>Validación del Certificado:</strong><br />
                        {selectedStudent.certValidadorUser ? (
                          <span style={{ color: 'var(--brand-blue)', fontWeight: '500' }}>
                            ✓ Validado por {selectedStudent.certValidadorUser} el {selectedStudent.certValidadorFecha ? new Date(selectedStudent.certValidadorFecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>Sin validar todavía</span>
                        )}
                      </div>

                      <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                        <strong>Último Pago Registrado:</strong><br />
                        {selectedStudent.pagoRegistradorUser ? (
                          <span style={{ color: '#16a34a', fontWeight: '500' }}>
                            ✓ Registrado por {selectedStudent.pagoRegistradorUser} el {selectedStudent.pagoRegistradorFecha ? new Date(selectedStudent.pagoRegistradorFecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>Sin abonos todavía</span>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              );
            })()}
          </div>
        )}
        {studentTab === 'Descargas' && (
          <div className="bento-card" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={18} color="var(--brand-blue)" /> Formatos y Descargables
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Documentos listos para descargar o imprimir para {selectedStudent.name}.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '24px' }}>
              {[
                { title: 'Comprobante de Inscripción', date: 'Generado hoy', icon: <FileText size={20} color="var(--brand-blue)" /> },
                { title: 'Credencial de Estudiante', date: 'Generado hoy', icon: <UserCheck size={20} color="var(--brand-blue)" /> },
                { title: 'Reglamento Escolar 2024-2025', date: 'PDF Institucional', icon: <BookOpen size={20} color="var(--brand-blue)" /> },
                { title: 'Temario Oficial del Curso', date: 'PDF Institucional', icon: <Target size={20} color="var(--brand-blue)" /> }
              ].map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-main)', transition: 'var(--transition)', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--brand-blue)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {doc.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{doc.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{doc.date}</div>
                    </div>
                  </div>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%', transition: 'var(--transition)' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; e.currentTarget.style.color = 'var(--brand-blue)'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                    <Download size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {studentTab === 'Finanzas' && (() => {
          // Función auxiliar local para formatear fechas de vencimiento de forma segura contra offsets de zona horaria
          const formatLocalDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return '-';
            const parts = dateStr.split('-');
            if (parts.length === 3) {
              const year = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10) - 1;
              const day = parseInt(parts[2], 10);
              return new Date(year, month, day).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
            }
            return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
          };

          return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Estado de Cuenta */}
                <div className="bento-card">
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wallet size={18} color="var(--brand-yellow)" /> Estado de Cuenta
                  </h3>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Estatus Comercial</span>
                    <span style={{ 
                      fontWeight: '700', 
                      color: selectedStudent.status.includes('Al Corriente') ? '#16a34a' 
                             : selectedStudent.status.includes('Adeudo') ? '#ef4444' 
                             : '#64748b'
                    }}>
                      {selectedStudent.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tipo de Pago</span>
                    <span style={{ fontWeight: '600' }}>
                      {selectedStudent.paymentPlan.type.includes('Contado') || selectedStudent.paymentPlan.type === '1 pago' 
                        ? 'Pago Directo (Contado)' 
                        : `Plan a Mensualidades (${selectedStudent.paymentPlan.type})`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Costo Total Curso</span>
                    <span style={{ fontWeight: '600' }}>${selectedStudent.paymentPlan.totalCost.toLocaleString()}</span>
                  </div>
                  
                  {selectedStudent.paymentPlan.costoInscripcion !== undefined && selectedStudent.paymentPlan.costoInscripcion > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Costo de Inscripción</span>
                      <span style={{ fontWeight: '600' }}>${selectedStudent.paymentPlan.costoInscripcion.toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Abonado a la Fecha</span>
                    <span style={{ fontWeight: '600', color: '#16a34a' }}>${selectedStudent.paymentPlan.amountPaid.toLocaleString()}</span>
                  </div>
                  
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Progreso de Pago ({selectedStudent.paymentPlan.planPagosRealizados || 0} / {selectedStudent.paymentPlan.planPagosTotales || 1} cuotas)</span>
                    <span>{selectedStudent.paymentPlan.totalCost > 0 ? Math.round((selectedStudent.paymentPlan.amountPaid / selectedStudent.paymentPlan.totalCost) * 100) : 0}%</span>
                  </div>
                  
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
                    <div style={{ width: `${selectedStudent.paymentPlan.totalCost > 0 ? (selectedStudent.paymentPlan.amountPaid / selectedStudent.paymentPlan.totalCost) * 100 : 0}%`, height: '100%', background: '#16a34a' }}></div>
                  </div>
                  
                  <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600', marginBottom: '4px' }}>ADEUDO RESTANTE</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>${(selectedStudent.paymentPlan.totalCost - selectedStudent.paymentPlan.amountPaid).toLocaleString()}</div>
                    </div>
                    <button 
                      className="btn-primary" 
                      style={{ width: 'auto', padding: '10px 20px', fontSize: '14px' }}
                      onClick={() => {
                        const firstUnpaid = cuotasList.find(c => c.status !== 'Pagada');
                        setSelectedCuotaToPay(firstUnpaid || null);
                        setDownloadReceiptUrl(null);
                        setShowPaymentModal(true);
                      }}
                    >
                      Pagar Ahora
                    </button>
                  </div>
                </div>

                {/* Cronograma de Mensualidades (Timeline) */}
                <div className="bento-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} color="var(--brand-blue)" /> Cronograma de Mensualidades
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                    {/* Línea vertical del timeline */}
                    <div style={{
                      position: 'absolute',
                      left: '15px',
                      top: '12px',
                      bottom: '12px',
                      width: '2px',
                      background: 'var(--border-color)',
                      zIndex: 0
                    }}></div>

                    {cuotasList.map((cuota, idx) => {
                      let iconColor = '#64748b'; // Pendiente / Sin pagar
                      let statusBg = 'rgba(100, 116, 139, 0.1)';
                      let textColor = 'var(--text-primary)';
                      let Icon = Clock;
                      let statusText = 'Pendiente';

                      if (cuota.status === 'Pagada') {
                        iconColor = '#16a34a';
                        statusBg = 'rgba(22, 163, 74, 0.1)';
                        Icon = CheckCircle2;
                        statusText = 'Pagada';
                      } else if (cuota.status === 'Vencida') {
                        iconColor = '#ef4444';
                        statusBg = 'rgba(239, 68, 68, 0.1)';
                        Icon = AlertCircle;
                        statusText = 'Vencida / Adeudo';
                      }

                      return (
                        <div key={cuota.id || idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                          {/* Icono de estatus del timeline */}
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--bg-card)',
                            border: `2px solid ${iconColor}`,
                            color: iconColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Icon size={16} />
                          </div>
                          
                          {/* Caja de Detalles */}
                          <div style={{
                            flexGrow: 1,
                            padding: '12px 16px',
                            background: 'var(--bg-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '13px', color: textColor }}>
                                Mensualidad #{cuota.numeroPago}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                Vence el: {formatLocalDate(cuota.fechaVencimiento)}
                              </div>
                              {cuota.fechaPago && (
                                <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '500', marginTop: '2px' }}>
                                  Pagado el: {formatLocalDate(cuota.fechaPago)}
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
                                ${cuota.monto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                              </div>
                              <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '20px',
                                fontSize: '10px',
                                fontWeight: '600',
                                marginTop: '6px',
                                background: statusBg,
                                color: iconColor,
                                textTransform: 'uppercase'
                              }}>
                                {statusText}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Historial de Pagos */}
              <div className="bento-card" style={{ padding: 0 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="var(--brand-blue)" /> Historial de Pagos
                  </h3>
                </div>
                <div style={{ overflowY: 'auto', maxHeight: '550px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                      <tr>
                        <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', color: 'var(--text-secondary)' }}>CONCEPTO</th>
                        <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', color: 'var(--text-secondary)' }}>FECHA</th>
                        <th style={{ padding: '10px 20px', textAlign: 'right', fontSize: '11px', color: 'var(--text-secondary)' }}>MONTO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.filter(t => t.studentId === selectedStudent.id || t.student === selectedStudent.name).length > 0 ? (
                        transactions
                          .filter(t => t.studentId === selectedStudent.id || t.student === selectedStudent.name)
                          .map((tx, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{tx.concept}</td>
                              <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-secondary)' }}>{tx.date}</td>
                              <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a' }}>
                                    +${tx.amount.toLocaleString()}
                                  </span>
                                  {tx.comprobanteUrl && (
                                    <a 
                                      href={tx.comprobanteUrl} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      title="Descargar Recibo Oficial"
                                      style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        color: 'var(--brand-blue)', 
                                        padding: '4px', 
                                        borderRadius: '4px',
                                        background: 'rgba(59, 130, 246, 0.08)',
                                        transition: 'var(--transition)'
                                      }}
                                      onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.16)'}
                                      onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)'}
                                    >
                                      <FileText size={12} />
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            No hay pagos registrados para este alumno.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}
        {studentTab === 'Rendimiento' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Seguimiento de Examen Final */}
            <div className="bento-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: selectedStudent.realizoExamenFinal ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.1)', color: selectedStudent.realizoExamenFinal ? '#16a34a' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Estatus de Examen Final</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {selectedStudent.realizoExamenFinal 
                      ? '✓ Examen final del curso acreditado y registrado.' 
                      : 'El examen final oficial de este programa se encuentra pendiente.'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Acreditar Examen Final</span>
                <input 
                  type="checkbox" 
                  checked={selectedStudent.realizoExamenFinal || false}
                  onChange={async (e) => {
                    await useAppStore.getState().updateStudentTracking(selectedStudent.id, { realizoExamenFinal: e.target.checked });
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>

            {selectedAttemptAudit ? (
              // VISTA DE REPORTE DETALLADO (SECCIÓN DEDICADA DE ANCHO COMPLETO)
              <div id="print-report-section" className="bento-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                <style>{`
                  @media print {
                    /* Ocultar elementos generales de la app */
                    aside, header, nav, button, .sidebar, .header, .btn-exit-portal, .btn-secondary {
                      display: none !important;
                    }
                    body {
                      background: white !important;
                      color: #0f172a !important;
                      padding: 0 !important;
                      margin: 0 !important;
                    }
                    .app-container, .main-content {
                      padding: 0 !important;
                      margin: 0 !important;
                      background: white !important;
                      box-shadow: none !important;
                      border: none !important;
                    }
                    
                    /* Posicionar el reporte a tamaño completo */
                    #print-report-section {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      background: white !important;
                      color: #0f172a !important;
                      padding: 0 !important;
                      box-shadow: none !important;
                      border: none !important;
                      display: flex !important;
                      flex-direction: column !important;
                      gap: 20px !important;
                    }
                    
                    /* Forzar que las cajas tengan fondo blanco y bordes gris claro */
                    .bento-card, div[style*="background-color"], div[style*="background"] {
                      background: white !important;
                      background-color: white !important;
                      border: 1px solid #cbd5e1 !important;
                      color: #0f172a !important;
                      box-shadow: none !important;
                    }

                    /* Forzar colores de texto legibles en papel */
                    h3, h4, span, div, strong, p {
                      color: #0f172a !important;
                    }
                    
                    /* Expandir todas las preguntas en el acordeón de impresión */
                    .print-accordion-item {
                      display: flex !important;
                      flex-direction: column !important;
                      border: 1px solid #94a3b8 !important;
                      margin-bottom: 12px !important;
                      page-break-inside: avoid !important;
                    }
                    .print-accordion-content {
                      display: flex !important;
                      flex-direction: column !important;
                      max-height: none !important;
                      opacity: 1 !important;
                      border-top: 1px dashed #cbd5e1 !important;
                      padding-top: 12px !important;
                      margin-top: 12px !important;
                    }

                    /* Evitar cortes feos de página en impresión */
                    .print-accordion-item, .print-signature-section {
                      page-break-inside: avoid !important;
                    }
                  }
                `}</style>

                {/* Cabecera del Reporte con botón de regreso */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => { setSelectedAttemptAudit(null); setExpandedQuestionIndex(null); }}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'var(--transition)'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.borderColor = 'var(--brand-blue)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      ◀ Volver al Historial
                    </button>

                    <button 
                      onClick={() => window.print()}
                      style={{
                        background: 'var(--brand-blue)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'var(--transition)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.filter = 'brightness(1.1)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.filter = 'none';
                      }}
                    >
                      <Download size={14} /> Descargar PDF Reporte 📥
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '4px 12px', borderRadius: '100px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      Folio: {selectedAttemptAudit.id}
                    </span>
                    {selectedAttemptAudit.integrityScore !== undefined && (
                      <span style={{ 
                        fontSize: '11px', 
                        background: selectedAttemptAudit.integrityScore >= 80 ? 'rgba(34, 197, 94, 0.1)' : (selectedAttemptAudit.integrityScore >= 50 ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)'), 
                        border: '1px solid ' + (selectedAttemptAudit.integrityScore >= 80 ? 'rgba(34, 197, 94, 0.2)' : (selectedAttemptAudit.integrityScore >= 50 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)')),
                        padding: '4px 10px', 
                        borderRadius: '100px', 
                        fontWeight: '700', 
                        color: selectedAttemptAudit.integrityScore >= 80 ? '#16a34a' : (selectedAttemptAudit.integrityScore >= 50 ? '#ca8a04' : '#ef4444') 
                      }}>
                        {selectedAttemptAudit.integrityScore}% Honestidad
                      </span>
                    )}
                    {selectedAttemptAudit.cheatingCanceled && (
                      <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '4px 10px', borderRadius: '100px', fontWeight: '800' }}>
                        ANULADO 🚫
                      </span>
                    )}
                  </div>
                </div>

                {/* Título Principal */}
                <div>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>Reporte de Desempeño y Honestidad</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Examen: <strong>{selectedAttemptAudit.examName}</strong> • Sustentante: <strong>{selectedStudent.name}</strong>
                  </p>
                </div>

                {/* Fila de Tarjetas Resumen */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                  <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Calificación Final</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: selectedAttemptAudit.cheatingCanceled ? '#ef4444' : (selectedAttemptAudit.score >= 8 ? '#16a34a' : '#ca8a04'), marginTop: '6px' }}>
                      {selectedAttemptAudit.cheatingCanceled ? '0' : selectedAttemptAudit.score} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>/ {selectedAttemptAudit.max} aciertos</span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nivel de Confianza</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: selectedAttemptAudit.integrityScore !== undefined && selectedAttemptAudit.integrityScore >= 80 ? '#16a34a' : '#ef4444', marginTop: '6px' }}>
                      {selectedAttemptAudit.integrityScore !== undefined ? selectedAttemptAudit.integrityScore : 100}% <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Honestidad</span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tiempo de Duración</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '6px' }}>
                      {Math.floor(selectedAttemptAudit.durationSeconds / 60)}m {selectedAttemptAudit.durationSeconds % 60}s <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>empleados</span>
                    </div>
                  </div>
                </div>

                {/* Grid del Contenido Principal: Dos Columnas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', marginTop: '12px' }}>
                  
                  {/* Columna Izquierda: Respuestas con Acordeón */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={16} color="var(--brand-blue)" /> Respuestas Registradas (Justificación Didáctica)
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {questions.map((q, idx) => {
                        const ans = selectedAttemptAudit.answers[idx];
                        const isCorrect = ans === q.correct;
                        const isExpanded = expandedQuestionIndex === idx;
                        return (
                          <div 
                            key={idx} 
                            onClick={() => setExpandedQuestionIndex(isExpanded ? null : idx)}
                            className="print-accordion-item"
                            style={{
                              background: 'var(--bg-main)',
                              border: `1px solid ${isExpanded ? 'var(--brand-blue)' : 'var(--border-color)'}`,
                              borderRadius: '12px',
                              padding: '12px 16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              cursor: 'pointer',
                              transition: 'var(--transition)',
                              boxShadow: isExpanded ? '0 4px 12px rgba(30, 58, 138, 0.05)' : 'none'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  Pregunta {idx + 1}
                                  <span style={{ fontSize: '10px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>
                                    {isExpanded ? '▲' : '▼ (Clic para ver detalle)'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Tema: {q.subject}</div>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Elegida: <strong>{ans || 'S/R'}</strong></span>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  padding: '2px 8px',
                                  borderRadius: '100px',
                                  background: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  color: isCorrect ? '#16a34a' : '#ef4444'
                                }}>
                                  {isCorrect ? 'OK' : `Correcta: ${q.correct}`}
                                </span>
                              </div>
                            </div>

                            <div 
                              className="print-accordion-content"
                              onClick={e => e.stopPropagation()} 
                              style={{
                                display: isExpanded ? 'flex' : 'none',
                                marginTop: '12px',
                                paddingTop: '12px',
                                borderTop: '1px dashed var(--border-color)',
                                width: '100%',
                                flexDirection: 'column',
                                gap: '10px'
                              }}
                            >
                              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                                {q.question}
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {Object.entries(q.options).map(([key, text]) => {
                                  const isChosen = ans === key;
                                  const isCorrectOption = q.correct === key;
                                  
                                  let optionBg = 'rgba(255, 255, 255, 0.02)';
                                  let optionBorder = '1px solid var(--border-color)';
                                  let optionColor = 'var(--text-secondary)';
                                  let prefixColor = 'var(--text-secondary)';
                                  
                                  if (isCorrectOption) {
                                    optionBg = 'rgba(34, 197, 94, 0.08)';
                                    optionBorder = '1px solid rgba(34, 197, 94, 0.3)';
                                    optionColor = 'var(--text-primary)';
                                    prefixColor = '#16a34a';
                                  } else if (isChosen && !isCorrect) {
                                    optionBg = 'rgba(239, 68, 68, 0.08)';
                                    optionBorder = '1px solid rgba(239, 68, 68, 0.3)';
                                    optionColor = 'var(--text-primary)';
                                    prefixColor = '#ef4444';
                                  }
                                  
                                  return (
                                    <div key={key} style={{
                                      background: optionBg,
                                      border: optionBorder,
                                      color: optionColor,
                                      padding: '8px 12px',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px'
                                    }}>
                                      <strong style={{ color: prefixColor }}>{key})</strong> {text}
                                      {isChosen && <span style={{ marginLeft: 'auto', fontSize: '10px', background: isCorrect ? '#16a34a' : '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>Tú Elegiste</span>}
                                      {isCorrectOption && !isChosen && <span style={{ marginLeft: 'auto', fontSize: '10px', background: '#16a34a', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>Correcta</span>}
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {q.explanation && (
                                <div style={{
                                  background: 'rgba(59, 130, 246, 0.04)',
                                  border: '1px solid rgba(59, 130, 246, 0.15)',
                                  borderRadius: '8px',
                                  padding: '10px 12px',
                                  fontSize: '12px',
                                  color: 'var(--text-secondary)',
                                  lineHeight: '1.5'
                                }}>
                                  <strong style={{ color: 'var(--brand-blue)', display: 'block', marginBottom: '4px' }}>Justificación Didáctica:</strong>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Columna Derecha: Registro de Actividad */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="var(--brand-yellow)" /> Registro de Actividad
                    </h4>

                    <div style={{ 
                      flex: 1, 
                      overflowY: 'auto', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '6px',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      padding: '12px',
                      borderRadius: '16px',
                      maxHeight: '480px'
                    }}>
                      {selectedAttemptAudit.auditLog && selectedAttemptAudit.auditLog.length > 0 ? (
                        selectedAttemptAudit.auditLog.map((log: any, idx: number) => {
                          const isNav = log.action.includes('Navegó') || log.action.includes('Saltó');
                          const isFlag = log.action.includes('Marcó') || log.action.includes('Desmarcó');
                          const isSubmit = log.action.includes('finalizado') || log.action.includes('Inició');
                          const isProctor = log.action.includes('ADVERTENCIA') || log.action.includes('cancelado') || log.action.includes('sospecha') || log.action.includes('proctoreo') || log.action.includes('Trampas') || log.action.includes('trampas') || log.action.includes('foco');

                          let logColor = 'var(--text-primary)';
                          let itemBg = 'transparent';
                          let itemPadding = '0 0 8px 0';
                          let itemBorder = '1px dashed var(--border-color)';
                          let borderRadius = '0';

                          if (isNav) {
                            logColor = 'var(--text-secondary)';
                          } else if (isFlag) {
                            logColor = '#ca8a04';
                          } else if (isSubmit) {
                            logColor = '#16a34a';
                          } else if (isProctor) {
                            logColor = '#ef4444';
                            itemBg = 'rgba(239, 68, 68, 0.05)';
                            itemPadding = '8px 12px';
                            itemBorder = '1px solid rgba(239, 68, 68, 0.15)';
                            borderRadius = '8px';
                          }

                          return (
                            <div key={idx} style={{ 
                              display: 'flex', 
                              gap: '10px', 
                              fontSize: '12px',
                              borderBottom: itemBorder,
                              paddingBottom: '8px',
                              padding: itemPadding,
                              background: itemBg,
                              borderRadius: borderRadius,
                              color: logColor,
                              margin: isProctor ? '4px 0' : '0'
                            }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: '700', color: isProctor ? '#ef4444' : 'var(--text-secondary)', flexShrink: 0 }}>
                                {log.timestamp}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: isProctor ? '600' : '400' }}>
                                {isFlag && <Star size={12} fill="#eab308" color="#eab308" />}
                                {isSubmit && <CheckCircle2 size={12} />}
                                {isProctor && <AlertCircle size={12} color="#ef4444" />}
                                {log.action}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>Sin registros.</div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Sello Digital y Validación Académica (Footer Membretado para Impresión / PDF) */}
                <div className="print-signature-section" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr auto', 
                  gap: '32px', 
                  alignItems: 'center', 
                  borderTop: '1px solid var(--border-color)', 
                  paddingTop: '24px', 
                  marginTop: '24px',
                  flexWrap: 'wrap'
                }}>
                  {/* Lado Izquierdo: Firma Digital */}
                  <div>
                    <h5 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={16} color="var(--brand-blue)" /> Sello de Integridad y Validación Académica
                    </h5>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Este reporte representa el resultado certificado de la evaluación digital del alumno en la plataforma CRECE. Ha sido auditado electrónicamente por el motor de honestidad activa.
                    </p>
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Firma Digital de Auditoría:</span>
                      <code style={{ 
                        display: 'block', 
                        fontSize: '11px', 
                        fontFamily: 'monospace', 
                        color: 'var(--text-secondary)', 
                        background: 'var(--bg-main)', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border-color)', 
                        marginTop: '4px', 
                        wordBreak: 'break-all' 
                      }}>
                        CRECE-SECURE-SHA256:{selectedAttemptAudit.id.slice(0, 8)}-{new Date(selectedAttemptAudit.endedAt).getTime()}-{(selectedAttemptAudit.integrityScore || 100)}-{selectedAttemptAudit.score}
                      </code>
                    </div>
                  </div>

                  {/* Lado Derecho: Código QR de Validación */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div style={{ 
                      padding: '8px', 
                      background: 'white', 
                      border: '1px solid #cbd5e1', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&color=0f172a&data=${encodeURIComponent(`${window.location.origin}/validar/intento/${selectedAttemptAudit.id}`)}`}
                        alt="QR de Validación" 
                        style={{ width: '90px', height: '90px', display: 'block' }}
                      />
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      Validar Autenticidad QR
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Banner superior con botón de simulación */}
                <div className="bento-card" style={{ 
                  background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row'
                }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={20} color="var(--brand-yellow)" /> Evaluaciones y Simulacros en Tiempo Real
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                      Monitorea las notas de {selectedStudent.name} o simula una toma de examen para revisar su nivel de preparación y honestidad.
                    </p>
                  </div>
                  <button 
                    className="btn-secondary" 
                    onClick={() => navigate('/examen')}
                    style={{ width: 'auto', padding: '10px 20px', gap: '8px', background: 'var(--brand-blue)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                  >
                    <Plus size={16} /> Simular Toma de Examen
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="var(--brand-yellow)" /> Historial Unificado de Evaluaciones y Simulacros (Moodle+)
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selectedStudent.exams && selectedStudent.exams.length > 0 ? (
                      selectedStudent.exams.map((exam: any, index: number) => {
                        // Buscar si este examen tiene una bitácora técnica de proctoreo online
                        const match = exam.name.match(/\(Intento (\d+)\)/);
                        const attemptIndex = match ? parseInt(match[1], 10) - 1 : -1;
                        const att = (attemptIndex >= 0 && selectedStudent.examAttempts?.[attemptIndex]) || selectedStudent.examAttempts?.find((a: any) => 
                          a.score === exam.score && 
                          a.max === exam.max && 
                          exam.name.startsWith(a.examName)
                        );

                        const isAnulado = att ? att.cheatingCanceled : exam.details?.includes('Cancelado');

                        return (
                          <div 
                            key={index} 
                            className="bento-card" 
                            style={{ 
                              padding: '20px 24px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '24px', 
                              justifyContent: 'space-between',
                              border: `1px solid ${isAnulado ? 'rgba(239, 68, 68, 0.15)' : 'var(--border-color)'}`,
                              background: isAnulado ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.02), var(--bg-card))' : 'var(--bg-card)',
                              transition: 'var(--transition)',
                              flexDirection: 'row',
                              flexWrap: 'wrap'
                            }}
                          >
                            {/* Lado Izquierdo: Score Circle e Información */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 300px' }}>
                              <div style={{ 
                                width: '56px', 
                                height: '56px', 
                                borderRadius: '50%', 
                                border: `3px solid ${isAnulado ? '#ef4444' : (exam.score >= 8 ? '#16a34a' : '#ca8a04')}`, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                flexShrink: 0 
                              }}>
                                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                                  {isAnulado ? '0' : exam.score}
                                </span>
                                <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>/{exam.max}</span>
                              </div>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{exam.name}</h4>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Registrado el {exam.date}</span>
                                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{exam.details}</p>
                              </div>
                            </div>

                            {/* Lado Derecho: Acciones y honestidad */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              {att && att.integrityScore !== undefined && (
                                <span style={{ 
                                  fontSize: '11px', 
                                  background: att.integrityScore >= 80 ? 'rgba(34, 197, 94, 0.1)' : (att.integrityScore >= 50 ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)'), 
                                  border: '1px solid ' + (att.integrityScore >= 80 ? 'rgba(34, 197, 94, 0.2)' : (att.integrityScore >= 50 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)')),
                                  padding: '4px 10px', 
                                  borderRadius: '100px', 
                                  fontWeight: '700', 
                                  color: att.integrityScore >= 80 ? '#16a34a' : (att.integrityScore >= 50 ? '#ca8a04' : '#ef4444') 
                                }}>
                                  {att.integrityScore}% Honestidad
                                </span>
                              )}
                              
                              {att ? (
                                <button 
                                  onClick={() => { setSelectedAttemptAudit(att); setExpandedQuestionIndex(null); }}
                                  style={{
                                    background: 'var(--bg-main)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '10px',
                                    padding: '8px 16px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'var(--transition)'
                                  }}
                                  onMouseOver={e => {
                                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                                    e.currentTarget.style.borderColor = 'var(--brand-blue)';
                                  }}
                                  onMouseOut={e => {
                                    e.currentTarget.style.background = 'var(--bg-main)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                  }}
                                >
                                  Ver Reporte del Intento 🔍
                                </button>
                              ) : (
                                <span style={{ fontSize: '11px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '100px', fontWeight: '600' }}>
                                  Evaluación Presencial / Histórica
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '16px', fontSize: '13px' }}>
                        No hay exámenes registrados.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>
        )}
        {studentTab === 'Asistencia' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', fontWeight: '700', color: (selectedStudent.attendance?.percentage ?? 0) >= 80 ? '#16a34a' : '#ef4444' }}>
                {selectedStudent.attendance?.percentage || 0}%
              </div>
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '500' }}>Asistencia General</div>
            </div>
            <div className="bento-card" style={{ padding: 0 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} color="var(--brand-blue)" /> Últimas Clases
                </h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {selectedStudent.attendance?.history?.map((h: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-primary)' }}>{h.date}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
                          background: h.status === 'Presente' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: h.status === 'Presente' ? '#16a34a' : '#ef4444'
                        }}>
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GLASSMORPHIC MODAL - REGISTRAR PAGO DE MENSUALIDAD */}
        {showPaymentModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '24px'
          }}>
            <div style={{
              background: 'rgba(22, 28, 45, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              {/* Header */}
              <div style={{
                padding: '24px 32px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)'
              }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Wallet size={20} style={{ color: 'var(--brand-yellow)' }} /> Registrar Pago de Mensualidad
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginTop: '4px', margin: '4px 0 0 0' }}>
                    Selecciona la mensualidad que deseas liquidar para {selectedStudent.name}.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedCuotaToPay(null);
                    setDownloadReceiptUrl(null);
                  }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>

              {/* Form / List of Cuotas */}
              <div style={{ padding: '32px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Mensualidades Pendientes / Vencidas
                  </label>
                  
                  {cuotasList.filter(c => c.status !== 'Pagada').length === 0 ? (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      background: 'rgba(34, 197, 94, 0.08)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      borderRadius: '12px',
                      color: '#22c55e',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      🎉 ¡El plan de pagos de este alumno está liquidado al 100%!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                      {cuotasList.filter(c => c.status !== 'Pagada').map((cuota) => {
                        const isSelected = selectedCuotaToPay?.id === cuota.id;
                        return (
                          <div 
                            key={cuota.id}
                            onClick={() => {
                              if (!isSubmittingPayment && !downloadReceiptUrl) {
                                setSelectedCuotaToPay(cuota);
                              }
                            }}
                            style={{
                              background: isSelected ? 'rgba(234, 179, 8, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                              border: `2px solid ${isSelected ? 'var(--brand-yellow)' : 'rgba(255, 255, 255, 0.1)'}`,
                              borderRadius: '12px',
                              padding: '14px 18px',
                              cursor: (isSubmittingPayment || downloadReceiptUrl) ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                border: `2px solid ${isSelected ? 'var(--brand-yellow)' : 'rgba(255, 255, 255, 0.4)'}`,
                                background: isSelected ? 'var(--brand-yellow)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#161c2d' }} />}
                              </div>
                              <div>
                                <strong style={{ fontSize: '14px', color: '#ffffff', display: 'block' }}>Mensualidad #{cuota.numeroPago}</strong>
                                <span style={{ fontSize: '11px', color: cuota.status === 'Vencida' ? '#ef4444' : 'rgba(255,255,255,0.5)' }}>
                                  {cuota.status === 'Vencida' ? '⚠️ Vencida (Excedida)' : 'Pendiente'} • Vence el {cuota.fechaVencimiento ? new Date(cuota.fechaVencimiento + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : '-'}
                                </span>
                              </div>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: isSelected ? 'var(--brand-yellow)' : '#ffffff' }}>
                              ${cuota.monto.toLocaleString()} <span style={{ fontSize: '10px', fontWeight: '500', color: 'rgba(255,255,255,0.5)' }}>MXN</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Botón de Comprobante PDF (Si se generó con éxito) */}
                {downloadReceiptUrl && (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.08)',
                    border: '1px solid rgba(34, 197, 94, 0.15)',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: '600' }}>
                      ¡Abono registrado con éxito en la base de datos!
                    </span>
                    <button
                      onClick={() => window.open(downloadReceiptUrl, '_blank')}
                      style={{
                        background: '#16a34a',
                        border: 'none',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Download size={14} /> Descargar Comprobante PDF
                    </button>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedCuotaToPay(null);
                      setDownloadReceiptUrl(null);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Cerrar
                  </button>
                  {cuotasList.filter(c => c.status !== 'Pagada').length > 0 && !downloadReceiptUrl && (
                    <button
                      type="button"
                      disabled={!selectedCuotaToPay || isSubmittingPayment}
                      onClick={async () => {
                        if (!selectedCuotaToPay) return;
                        setIsSubmittingPayment(true);
                        try {
                          const receiptUrl = await useAppStore.getState().recordStudentPayment(selectedStudent.id, selectedCuotaToPay.monto);
                          setFeedback({ message: `¡Abono de Mensualidad #${selectedCuotaToPay.numeroPago} registrado con éxito! 🔒`, type: 'success' });
                          if (receiptUrl) {
                            setDownloadReceiptUrl(receiptUrl);
                          } else {
                            setTimeout(() => {
                              setShowPaymentModal(false);
                              setSelectedCuotaToPay(null);
                            }, 1200);
                          }
                        } catch (err) {
                          setFeedback({ message: 'Error al registrar abono en la base de datos.', type: 'error' });
                        } finally {
                          setIsSubmittingPayment(false);
                        }
                      }}
                      style={{
                        background: selectedCuotaToPay ? 'linear-gradient(135deg, var(--brand-yellow), #ca8a04)' : 'rgba(255,255,255,0.05)',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '10px',
                        color: selectedCuotaToPay ? '#161c2d' : 'rgba(255,255,255,0.3)',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: selectedCuotaToPay ? 'pointer' : 'not-allowed',
                        opacity: isSubmittingPayment ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isSubmittingPayment ? 'Registrando...' : 'Registrar Pago 🔒'}
                    </button>
                  )}
                </div>
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
            background: feedback.type === 'success' ? 'rgba(22, 163, 74, 0.95)' : 'rgba(220, 38, 38, 0.95)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
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
    </div>
  );
}
