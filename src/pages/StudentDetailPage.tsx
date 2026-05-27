import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, BookOpen, Phone, Calendar, Wallet, FileText, 
  AlertTriangle, CheckCircle2, TrendingUp, Download, UserCheck, Target,
  Clock, ArrowUpRight, Award, Info, X, Star
} from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { examQuestions } from './ExamenPage';

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students } = useAppStore();
  const [studentTab, setStudentTab] = useState('Resumen');
  const [selectedAttemptAudit, setSelectedAttemptAudit] = useState<any | null>(null);

  const selectedStudent = students.find(s => s.id === Number(id));

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
              <span style={{ 
                padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: '600',
                background: selectedStudent.status === 'Inscrito' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                color: selectedStudent.status === 'Inscrito' ? '#16a34a' : '#ca8a04'
              }}>
                {selectedStudent.status}
              </span>
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
            <div className="bento-card">
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} color="var(--brand-blue)" /> Información del Tutor
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nombre Completo</div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>{selectedStudent.tutor}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Teléfono (WhatsApp)</div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>{selectedStudent.phone}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {studentTab === 'Documentos' && (
          <div className="bento-card" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--brand-blue)" /> Expediente de Documentos
              </h3>
              <button className="btn-secondary" style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}>Subir Documento</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {selectedStudent.documents?.map((doc: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{doc.name}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <span style={{ 
                        padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: doc.status === 'Subido' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: doc.status === 'Subido' ? '#16a34a' : '#ef4444'
                      }}>
                        {doc.status === 'Subido' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        {studentTab === 'Finanzas' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="bento-card">
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={18} color="var(--brand-yellow)" /> Estado de Cuenta
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Plan Elegido</span>
                <span style={{ fontWeight: '600' }}>{selectedStudent.paymentPlan.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Costo Total</span>
                <span style={{ fontWeight: '600' }}>${selectedStudent.paymentPlan.totalCost.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pagado</span>
                <span style={{ fontWeight: '600', color: '#16a34a' }}>${selectedStudent.paymentPlan.amountPaid.toLocaleString()}</span>
              </div>
              
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Progreso de Pago</span>
                <span>{Math.round((selectedStudent.paymentPlan.amountPaid / selectedStudent.paymentPlan.totalCost) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{ width: `${(selectedStudent.paymentPlan.amountPaid / selectedStudent.paymentPlan.totalCost) * 100}%`, height: '100%', background: '#16a34a' }}></div>
              </div>
              
              <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600', marginBottom: '4px' }}>ADEUDO RESTANTE</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>${(selectedStudent.paymentPlan.totalCost - selectedStudent.paymentPlan.amountPaid).toLocaleString()}</div>
                </div>
                <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', fontSize: '14px' }}>Pagar Ahora</button>
              </div>
            </div>
          </div>
        )}
        {studentTab === 'Rendimiento' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
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
                  Monitorea las notas de {selectedStudent.name} o simula una toma de examen con bitácora técnica de navegación para auditar sus habilidades.
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Bloque Izquierdo: Exámenes Tradicionales */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={16} color="var(--accent-primary)" /> Historial General e Histórico
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedStudent.exams && selectedStudent.exams.length > 0 ? (
                    selectedStudent.exams.map((exam: any, i: number) => (
                      <div key={i} className="bento-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexDirection: 'row' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid var(--accent-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>{exam.score}</span>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>/{exam.max}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{exam.name}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Registrado el {exam.date}</span>
                          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{exam.details}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '16px', fontSize: '13px' }}>
                      No hay exámenes tradicionales cargados.
                    </div>
                  )}
                </div>
              </div>

              {/* Bloque Derecho: Intentos de Exámenes en Línea (Auditoría) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="var(--brand-yellow)" /> Auditoría de Intentos en Línea (Moodle+)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedStudent.examAttempts && selectedStudent.examAttempts.length > 0 ? (
                    selectedStudent.examAttempts.map((att: any, i: number) => (
                      <div key={att.id} className="bento-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '100px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                            Folio: {att.id}
                          </span>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '800',
                            color: att.score >= 8 ? '#16a34a' : '#ca8a04'
                          }}>
                            {att.score} / {att.max} aciertos
                          </span>
                        </div>

                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{att.examName}</h4>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '10px' }}>
                            <span>Inicio: {new Date(att.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span>Fin: {new Date(att.endedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span>Duración: {Math.floor(att.durationSeconds / 60)}m {att.durationSeconds % 60}s</span>
                          </div>
                        </div>

                        <button 
                          className="btn-secondary" 
                          onClick={() => setSelectedAttemptAudit(att)}
                          style={{ width: '100%', padding: '10px', fontSize: '13px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand-blue)', border: 'none', cursor: 'pointer', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                        >
                          Auditar Navegación (bitácora de clics) 🔍
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '50px 20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Clock size={32} style={{ opacity: 0.3 }} />
                      <span>Este estudiante no registra intentos en línea todavía.</span>
                      <button 
                        onClick={() => navigate('/examen')}
                        style={{ border: 'none', background: 'transparent', color: 'var(--brand-blue)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Simular primer examen ahora
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal de Auditoría Completo */}
            {selectedAttemptAudit && (
              <div className="modal-overlay" onClick={() => setSelectedAttemptAudit(null)} style={{ zIndex: 300 }}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '90vh' }}>
                  <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={20} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Auditoría Técnica del Intento ({selectedAttemptAudit.id})</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {selectedAttemptAudit.examName} • {selectedStudent.name}
                        </p>
                      </div>
                    </div>
                    <button className="close-btn" onClick={() => setSelectedAttemptAudit(null)}>
                      <X size={20} />
                    </button>
                  </div>

                  <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', overflowY: 'auto', maxHeight: '55vh', padding: '24px' }}>
                    
                    {/* Columna Izquierda: Respuestas del Estudiante */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={16} color="var(--brand-blue)" /> Respuestas Registradas
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {examQuestions.map((q, idx) => {
                          const ans = selectedAttemptAudit.answers[idx];
                          const isCorrect = ans === q.correct;
                          return (
                            <div key={idx} style={{
                              background: 'var(--bg-main)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '12px',
                              padding: '10px 14px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>Pregunta {idx + 1}</div>
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
                          );
                        })}
                      </div>
                    </div>

                    {/* Columna Derecha: Bitácora Audit Log */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="var(--brand-yellow)" /> Bitácora Técnica de Navegación
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
                        maxHeight: '380px'
                      }}>
                        {selectedAttemptAudit.auditLog && selectedAttemptAudit.auditLog.length > 0 ? (
                          selectedAttemptAudit.auditLog.map((log: any, idx: number) => {
                            const isNav = log.action.includes('Navegó') || log.action.includes('Saltó');
                            const isFlag = log.action.includes('Marcó') || log.action.includes('Desmarcó');
                            const isSubmit = log.action.includes('finalizado') || log.action.includes('Inició');

                            let logColor = 'var(--text-primary)';
                            let iconColor = 'var(--text-secondary)';

                            if (isNav) {
                              logColor = 'var(--text-primary)';
                              iconColor = 'var(--accent-primary)';
                            } else if (isFlag) {
                              logColor = '#ca8a04';
                              iconColor = '#eab308';
                            } else if (isSubmit) {
                              logColor = '#16a34a';
                              iconColor = '#10b981';
                            }

                            return (
                              <div key={idx} style={{ 
                                display: 'flex', 
                                gap: '10px', 
                                fontSize: '12px',
                                borderBottom: '1px dashed var(--border-color)',
                                paddingBottom: '8px',
                                color: logColor
                              }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-secondary)', flexShrink: 0 }}>
                                  {log.timestamp}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {isFlag && <Star size={12} fill="#eab308" color="#eab308" />}
                                  {isSubmit && <CheckCircle2 size={12} />}
                                  {log.action}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>Sin logs registrados.</div>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="modal-footer" style={{ padding: '16px 24px' }}>
                    <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <Info size={14} /> Esta bitácora audita el comportamiento técnico y lógico del sustentante.
                    </div>
                    <button 
                      style={{ background: 'var(--brand-blue)', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                      onClick={() => setSelectedAttemptAudit(null)}
                    >
                      Cerrar Auditoría
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
        {studentTab === 'Asistencia' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', fontWeight: '700', color: selectedStudent.attendance?.percentage >= 80 ? '#16a34a' : '#ef4444' }}>
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
      </div>
    </div>
  );
}
