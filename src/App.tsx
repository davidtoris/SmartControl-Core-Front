import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, CreditCard, GraduationCap, 
  MessageSquare, Settings, Search, Bell,
  TrendingUp, Download, AlertTriangle, CheckCircle2,
  UserPlus, FileText, Banknote, UserCheck, Phone,
  MoreVertical, BookOpen, X, Send,
  ArrowUpRight, Clock, Megaphone, Eye, Filter, ShieldCheck,
  Check, UploadCloud, Smartphone, Target, ArrowDownRight, Wallet, Plus,
  ChevronLeft, Award, Calendar, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from 'recharts';
import './App.css';

// Fake Data for Charts
const enrollmentData = [
  { name: 'Ene', alumnos: 12 },
  { name: 'Feb', alumnos: 19 },
  { name: 'Mar', alumnos: 15 },
  { name: 'Abr', alumnos: 45 },
  { name: 'May', alumnos: 32 },
  { name: 'Jun', alumnos: 25 },
];

const academicData = [
  { name: 'Matemáticas', promedio: 8.5, simulacro: 7.2 },
  { name: 'Español', promedio: 9.1, simulacro: 8.5 },
  { name: 'Ciencias', promedio: 7.8, simulacro: 6.9 },
];

// Fake Data for Notifications (Muro de Avisos)
const notifications = [
  { 
    id: 1, 
    type: 'alert', 
    title: 'Aviso a Padre de Familia', 
    desc: 'Inactividad de 48h (Juan Pérez). Mensaje automático de WhatsApp enviado.', 
    time: 'Hace 10 min' 
  },
  { 
    id: 2, 
    type: 'success', 
    title: 'Reporte de Evidencia Generado', 
    desc: 'El reporte de fin de mes de 3°A está listo para enviar.', 
    time: 'Hace 1 hora' 
  },
  { 
    id: 3, 
    type: 'info', 
    title: 'Nuevo Prospecto', 
    desc: 'María Gómez completó el formulario de pre-inscripción inteligente.', 
    time: 'Hace 2 horas' 
  },
];

// Fake Data for Students (Control Escolar)
const mockStudents = [
  { 
    id: 1, name: 'Ana Sofía Martínez', curso: 'COMIPEMS 2024', tutor: 'Carlos Martínez', status: 'Inscrito', phone: '+52 55 1234 5678', avatar: 'AM', 
    paymentPlan: { type: '3 pagos', totalCost: 12000, amountPaid: 4000 },
    documents: [
      { name: 'Acta de Nacimiento', status: 'Subido' },
      { name: 'CURP', status: 'Subido' },
      { name: 'Comprobante de Domicilio', status: 'Subido' },
      { name: 'Certificado Secundaria', status: 'Faltante' }
    ],
    exams: [
      { name: 'Diagnóstico', score: 45, max: 128, date: '10 Feb 2026', details: 'Fallas principales en Matemáticas y Física.' },
      { name: 'Simulacro 1', score: 72, max: 128, date: '15 Mar 2026', details: 'Mejora en Matemáticas. Requiere repaso en Historia.' },
      { name: 'Simulacro 2', score: 98, max: 128, date: '20 Abr 2026', details: 'Excelente progreso. Listo para competencia.' }
    ],
    attendance: {
      percentage: 92,
      history: [
        { date: '24 May 2026', status: 'Presente' },
        { date: '22 May 2026', status: 'Presente' },
        { date: '20 May 2026', status: 'Falta' },
        { date: '17 May 2026', status: 'Presente' },
      ]
    }
  },
  { 
    id: 2, name: 'Luis Fernando Gómez', curso: 'Ingreso UNAM', tutor: 'María Gómez', status: 'Pendiente Docs', phone: '+52 55 8765 4321', avatar: 'LG', 
    paymentPlan: { type: '1 pago', totalCost: 10000, amountPaid: 0 },
    documents: [
      { name: 'Acta de Nacimiento', status: 'Subido' },
      { name: 'CURP', status: 'Faltante' },
      { name: 'Comprobante de Domicilio', status: 'Faltante' },
      { name: 'Certificado Bachillerato', status: 'Faltante' }
    ],
    exams: [
      { name: 'Diagnóstico', score: 50, max: 120, date: '01 Mar 2026', details: 'Nivel básico. Requiere regularización en todas las áreas.' }
    ],
    attendance: {
      percentage: 75,
      history: [
        { date: '24 May 2026', status: 'Presente' },
        { date: '22 May 2026', status: 'Falta' },
      ]
    }
  },
  { 
    id: 3, name: 'Valeria Rojas', curso: 'COMIPEMS 2024', tutor: 'Roberto Rojas', status: 'Inscrito', phone: '+52 55 1122 3344', avatar: 'VR', 
    paymentPlan: { type: '8 pagos', totalCost: 16000, amountPaid: 6000 },
    documents: [
      { name: 'Acta de Nacimiento', status: 'Subido' },
      { name: 'CURP', status: 'Subido' },
      { name: 'Comprobante de Domicilio', status: 'Subido' },
      { name: 'Certificado Secundaria', status: 'Subido' }
    ],
    exams: [
      { name: 'Diagnóstico', score: 60, max: 128, date: '10 Feb 2026', details: 'Buen nivel general. Reforzar Matemáticas.' }
    ],
    attendance: { percentage: 100, history: [ { date: '24 May 2026', status: 'Presente' } ] }
  },
  { 
    id: 4, name: 'Diego Alejandro Cruz', curso: 'Ingreso IPN', tutor: 'Laura Cruz', status: 'Inscrito', phone: '+52 55 9988 7766', avatar: 'DC', 
    paymentPlan: { type: '3 pagos', totalCost: 12000, amountPaid: 12000 },
    documents: [
      { name: 'Acta de Nacimiento', status: 'Subido' },
      { name: 'CURP', status: 'Subido' },
      { name: 'Comprobante de Domicilio', status: 'Subido' },
      { name: 'Certificado Bachillerato', status: 'Subido' }
    ],
    exams: [
      { name: 'Simulacro 1', score: 85, max: 130, date: '15 Mar 2026', details: 'Excelente en Ciencias. Fallas en Español.' }
    ],
    attendance: { percentage: 88, history: [ { date: '24 May 2026', status: 'Presente' } ] }
  },
];

// Fake Data for Finanzas (Entradas y Salidas)
const mockTransactions = [
  { id: 'REC-001', type: 'Entrada', student: 'Ana Sofía Martínez', concept: 'Pago 1/3', amount: 4000, date: '05 May 2026', status: 'Pagado' },
  { id: 'REC-002', type: 'Entrada', student: 'Luis Fernando Gómez', concept: 'Pago Único', amount: 10000, date: '05 May 2026', status: 'Vencido' },
  { id: 'REC-003', type: 'Entrada', student: 'Valeria Rojas', concept: 'Pago 3/8', amount: 2000, date: '10 May 2026', status: 'Pendiente' },
  { id: 'GAS-001', type: 'Salida', student: '-', concept: 'Pago de Publicidad FB', amount: 3500, date: '12 May 2026', status: 'Pagado' },
  { id: 'GAS-002', type: 'Salida', student: '-', concept: 'Mantenimiento', amount: 1200, date: '14 May 2026', status: 'Pagado' },
];

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showReportModal, setShowReportModal] = useState<any>(null);
  const [showParentPortal, setShowParentPortal] = useState(false);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentTab, setStudentTab] = useState('Resumen');

  // Financial calculations
  const totalIngresos = mockTransactions.filter(t => t.type === 'Entrada').reduce((acc, curr) => acc + curr.amount, 0);
  const totalEgresos = mockTransactions.filter(t => t.type === 'Salida').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIngresos - totalEgresos;
  const totalAdeudos = mockStudents.reduce((acc, curr) => acc + (curr.paymentPlan.totalCost - curr.paymentPlan.amountPaid), 0);

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">C</div>
          <div className="logo-text">CRECE</div>
        </div>
        
        <nav className="nav-menu">
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Alumnos', icon: Users },
            { name: 'Finanzas', icon: CreditCard },
            { name: 'Académico', icon: GraduationCap },
            { name: 'Comunicación', icon: MessageSquare },
            { name: 'Configuración', icon: Settings },
          ].map((item) => (
            <div 
              key={item.name}
              className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {selectedStudent ? (
          <div className="student-detail-view" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', background: 'var(--bg-main)' }}>
            <div style={{ padding: '24px 40px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '24px', background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 10 }}>
              <button style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }} onClick={() => setSelectedStudent(null)}>
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
                      <Users size={18} color="var(--brand-blue)" /> Información del Tutor
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedStudent.exams?.length > 0 ? selectedStudent.exams.map((exam: any, i: number) => (
                    <div key={i} className="bento-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexDirection: 'row' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>{exam.score}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>/ {exam.max}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>{exam.name}</h4>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Realizado el {exam.date}</div>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>{exam.details}</p>
                      </div>
                      <button className="btn-secondary" style={{ width: 'auto', padding: '10px 16px', fontSize: '13px', background: 'transparent', color: 'var(--brand-blue)', border: '1px solid var(--brand-blue)' }}>Ver Desglose</button>
                    </div>
                  )) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay exámenes registrados.</div>
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
        ) : (
          <>
            <header className="header">
              <h1 className="header-title">{activeTab}</h1>
              <div className="header-actions">
            <div className="search-bar">
              <Search size={18} className="text-secondary" />
              <input type="text" placeholder="Buscar alumno, recibo o clase..." className="search-input" />
            </div>
            <button className="btn-secondary" style={{ padding: '8px 16px', gap: '8px', background: 'var(--brand-blue)', color: 'white', border: 'none', cursor: 'pointer' }} onClick={() => setShowParentPortal(true)}>
              <Smartphone size={16} /> Ver como Papá
            </button>
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>
            <div className="user-profile">
              DT
            </div>
          </div>
        </header>

        {activeTab === 'Dashboard' ? (
          <div className="dashboard-grid">
            
            {/* 1. Control Escolar - Inscripciones (Area Chart) */}
            <div className="bento-card col-span-2">
              <div className="card-header">
                <div className="card-title">
                  <TrendingUp size={20} /> Inscripciones Mensuales
                </div>
                <button className="card-action">Ver Reporte</button>
              </div>
              <div style={{ width: '100%', height: '220px' }}>
                <ResponsiveContainer>
                  <AreaChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAlumnos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="alumnos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAlumnos)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Finanzas - Cobranza "Manos Libres" */}
            <div className="bento-card card-finance col-span-1">
              <div className="card-header">
                <div className="card-title">
                  <Banknote size={20} /> Cobranza y Adeudos
                </div>
              </div>
              <div className="finance-stats">
                <div className="finance-stat-item">
                  <div>
                    <div className="stat-label">Total Cobrado (Mes)</div>
                    <div className="stat-value">$142,500.00</div>
                  </div>
                </div>
                <div className="finance-stat-item">
                  <div>
                    <div className="stat-label">
                      <AlertTriangle size={14} color="#eab308" /> Adeudos Pendientes
                    </div>
                    <div className="stat-value warning">$12,300.00</div>
                  </div>
                </div>
              </div>
              <button className="btn-primary">
                Enviar Recordatorios <MessageSquare size={16} />
              </button>
            </div>

            {/* 3. Escudo contra Reclamos - Muro de Avisos */}
            <div className="bento-card col-span-1 row-span-2" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <div className="card-title">
                  <MessageSquare size={20} /> Escudo contra Reclamos
                </div>
                <button className="card-action">Ver Todos</button>
              </div>
              <div className="notification-list">
                {notifications.map(notif => (
                  <div className="notification-item" key={notif.id}>
                    <div className={`notif-icon ${notif.type}`}>
                      {notif.type === 'alert' && <AlertTriangle size={20} />}
                      {notif.type === 'success' && <CheckCircle2 size={20} />}
                      {notif.type === 'info' && <Bell size={20} />}
                    </div>
                    <div className="notif-content">
                      <span className="notif-title">{notif.title}</span>
                      <span className="notif-desc">{notif.desc}</span>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-secondary mt-auto">
                Generar Evidencias PDF <Download size={16} />
              </button>
            </div>

            {/* 4. Control Escolar - Asistencia Rápida */}
            <div className="bento-card col-span-1" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '16px', color: '#3b82f6', alignSelf: 'center' }}>
                <UserCheck size={40} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Asistencia Rápida</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                Pase de lista con 1 click para el grupo actual (3°A).
              </p>
              <button className="btn-secondary" style={{ width: 'auto', padding: '12px 32px', alignSelf: 'center' }}>
                Pasar Lista Ahora
              </button>
            </div>

            {/* 5. Académico - Rendimiento */}
            <div className="bento-card col-span-1">
              <div className="card-header">
                <div className="card-title">
                  <GraduationCap size={20} /> Rendimiento Académico
                </div>
              </div>
              <div style={{ width: '100%', height: '160px', marginTop: '10px' }}>
                <ResponsiveContainer>
                  <BarChart data={academicData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="promedio" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} name="Promedio Final" />
                    <Bar dataKey="simulacro" fill="#eab308" radius={[4, 4, 0, 0]} barSize={12} name="Simulacro" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 6. Control Escolar - Inscripción en 3 clicks (Prospectos) */}
            <div className="bento-card col-span-2">
              <div className="card-header">
                <div className="card-title">
                  <UserPlus size={20} /> Gestión de Prospectos (Inscripción en 3 clicks)
                </div>
                <button className="card-action">Nuevo Formulario</button>
              </div>
              <div className="funnel-container">
                <div className="funnel-step active">
                  <div className="funnel-icon-wrap"><UserPlus size={24} /></div>
                  <div className="funnel-value">124</div>
                  <div className="funnel-label">Pre-inscritos<br/>(Formulario)</div>
                </div>
                <div className="funnel-step">
                  <div className="funnel-icon-wrap"><FileText size={24} /></div>
                  <div className="funnel-value">86</div>
                  <div className="funnel-label">Documentos<br/>Revisados</div>
                </div>
                <div className="funnel-step">
                  <div className="funnel-icon-wrap"><Banknote size={24} /></div>
                  <div className="funnel-value">62</div>
                  <div className="funnel-label">Pago Inscripción<br/>Recibido</div>
                </div>
                <div className="funnel-step">
                  <div className="funnel-icon-wrap"><CheckCircle2 size={24} /></div>
                  <div className="funnel-value">45</div>
                  <div className="funnel-label">Contratos PDF<br/>Generados</div>
                </div>
              </div>
            </div>

          </div>
        ) : activeTab === 'Alumnos' ? (
          <div className="alumnos-view" style={{ padding: '0 40px 40px' }}>
            <div className="card-header" style={{ marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>Expediente Digital</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>Gestión de alumnos, grupos y reportes de éxito.</p>
              </div>
              <button className="btn-secondary" style={{ width: 'auto', padding: '10px 24px', gap: '8px' }}>
                <UserPlus size={18} /> Nueva Inscripción Rápida
              </button>
            </div>
            
            <div className="bento-card" style={{ padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>ALUMNO</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>CURSO</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>TUTOR (WHATSAPP)</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>ESTATUS</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStudents.map(student => (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setSelectedStudent(student)} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-main)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px' }}>
                            {student.avatar}
                          </div>
                          <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{student.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <BookOpen size={16} /> {student.curso}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: 'var(--text-primary)' }}>{student.tutor}</span>
                          <button style={{ background: '#25D366', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                            <Phone size={14} />
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '100px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          background: student.status === 'Inscrito' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                          color: student.status === 'Inscrito' ? '#16a34a' : '#ca8a04'
                        }}>
                          {student.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand-blue)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'} onClick={(e) => { e.stopPropagation(); setShowReportModal(student); }}>
                            <TrendingUp size={14} /> Reporte de Éxito
                          </button>
                          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }} onClick={(e) => e.stopPropagation()}>
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'Finanzas' ? (
          <div className="finanzas-view" style={{ padding: '0 40px 40px' }}>
            <div className="card-header" style={{ marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>Control de Finanzas</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>Seguimiento de entradas, salidas y planes de pago por alumno.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" style={{ width: 'auto', padding: '10px 24px', gap: '8px' }} onClick={() => setShowNewEntryModal(true)}>
                  <ArrowUpRight size={18} /> Nueva Entrada
                </button>
                <button className="btn-secondary" style={{ width: 'auto', padding: '10px 24px', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'transparent' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>
                  <ArrowDownRight size={18} /> Nuevo Gasto
                </button>
              </div>
            </div>

            {/* Financial KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
              <div className="bento-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}><ArrowUpRight size={20} /></div>
                  <span style={{ fontWeight: '500' }}>Ingresos Totales</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>${totalIngresos.toLocaleString()}</div>
              </div>

              <div className="bento-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><ArrowDownRight size={20} /></div>
                  <span style={{ fontWeight: '500' }}>Egresos (Salidas)</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>${totalEgresos.toLocaleString()}</div>
              </div>

              <div className="bento-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><Wallet size={20} /></div>
                  <span style={{ fontWeight: '500' }}>Balance Actual</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>${balance.toLocaleString()}</div>
              </div>

              <div className="bento-card" style={{ padding: '20px', border: '1px solid rgba(234, 179, 8, 0.2)', background: 'linear-gradient(to right, var(--glass-bg), rgba(234, 179, 8, 0.05))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' }}><AlertTriangle size={20} /></div>
                  <span style={{ fontWeight: '500' }}>Adeudos por Cobrar</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#ca8a04' }}>${totalAdeudos.toLocaleString()}</div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* Tabla de Adeudos por Alumno */}
              <div className="bento-card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="var(--brand-blue)" /> Seguimiento de Adeudos
                  </h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                      <tr>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>ALUMNO</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>PLAN</th>
                        <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>DEUDA RESTANTE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockStudents.map((student) => {
                        const debt = student.paymentPlan.totalCost - student.paymentPlan.amountPaid;
                        const hasDebt = debt > 0;
                        return (
                          <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>{student.name}</td>
                            <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                              {student.paymentPlan.type} <br/>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Pagado: ${student.paymentPlan.amountPaid.toLocaleString()} de ${student.paymentPlan.totalCost.toLocaleString()}</span>
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '100px', 
                                fontSize: '13px', 
                                fontWeight: '600',
                                background: hasDebt ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                color: hasDebt ? '#ef4444' : '#16a34a'
                              }}>
                                ${debt.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Historial de Transacciones (Entradas y Salidas) */}
              <div className="bento-card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} color="var(--brand-yellow)" /> Entradas y Salidas
                  </h3>
                  <button style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <Filter size={14} /> Filtrar
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                      <tr>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>TIPO</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>CONCEPTO / ALUMNO</th>
                        <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>MONTO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTransactions.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '6px', 
                              fontSize: '12px', 
                              fontWeight: '600',
                              background: item.type === 'Entrada' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: item.type === 'Entrada' ? '#16a34a' : '#ef4444',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {item.type === 'Entrada' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                              {item.type}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '14px' }}>{item.concept}</div>
                            {item.student !== '-' && (
                              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>{item.student}</div>
                            )}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>
                            ${item.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        ) : activeTab === 'Comunicación' ? (
          <div className="comunicacion-view" style={{ padding: '0 40px 40px' }}>
            <div className="card-header" style={{ marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>Escudo contra Reclamos</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>Muro de avisos oficial, bitácora de evidencias y alertas automáticas.</p>
              </div>
              <button className="btn-secondary" style={{ width: 'auto', padding: '10px 24px', gap: '8px' }}>
                <Megaphone size={18} /> Nuevo Comunicado
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              
              {/* Left Column: Muro de Avisos / Timeline */}
              <div className="bento-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <MessageSquare size={20} color="var(--brand-blue)" /> Muro de Avisos Institucional
                  </h3>
                  <button style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <Filter size={14} /> Filtrar
                  </button>
                </div>

                <div className="notification-list" style={{ gap: '20px' }}>
                  <div style={{ padding: '16px', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.05)' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ca8a04', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <AlertTriangle size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '15px' }}>Alerta Automática: Inactividad (48h)</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hoy, 09:41 AM</span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px', margin: 0 }}>
                          El alumno <strong>Luis Fernando Gómez</strong> no ha ingresado a la plataforma en 48 horas. Se envió alerta al WhatsApp de su tutor (María Gómez).
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#16a34a', fontWeight: '500', marginTop: '12px' }}>
                          <CheckCircle2 size={14} /> Entregado y Leído por el Tutor
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-main)' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Megaphone size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '15px' }}>Comunicado General: Simulacro COMIPEMS</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ayer, 18:30 PM</span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px', margin: 0 }}>
                          Estimados padres de familia, les recordamos que el próximo sábado es el 2° simulacro oficial presencial.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> 115 Vistos</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6' }}><Download size={14} /> PDF Adjunto descargado 89 veces</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-main)' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#16a34a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <GraduationCap size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '15px' }}>Boletas de Calificaciones Generadas</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ayer, 12:00 PM</span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px', margin: 0 }}>
                          Se enviaron 45 boletas con el comparativo de rendimiento a los tutores del grupo COMIPEMS 2024.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#16a34a', fontWeight: '500', marginTop: '12px' }}>
                          <CheckCircle2 size={14} /> Proceso Automático Completado
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Bitácora de Evidencia */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="bento-card" style={{ background: 'var(--gradient-card)', color: 'white', border: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'rgba(255,255,255,0.9)' }}>
                    <ShieldCheck size={48} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', textAlign: 'center', marginBottom: '8px' }}>Bitácora de Evidencia</h3>
                  <p style={{ fontSize: '14px', textAlign: 'center', color: 'rgba(255,255,255,0.8)', marginBottom: '24px', lineHeight: '1.5', margin: '0 0 24px 0' }}>
                    Protege a la institución generando un PDF con el historial completo de mensajes entregados y leídos por el tutor.
                  </p>
                  
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>Seleccionar Alumno</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500' }}>Luis Fernando Gómez</span>
                      <Search size={16} />
                    </div>
                  </div>

                  <button className="btn-primary" style={{ background: 'white', color: 'var(--brand-blue)' }}>
                    <Download size={18} /> Descargar Historial PDF
                  </button>
                </div>
                
                <div className="bento-card" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="var(--brand-blue)" /> Impacto del Módulo
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Avisos Leídos</span>
                      <span style={{ fontWeight: '600', color: '#16a34a' }}>94%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ width: '94%', height: '100%', background: '#16a34a' }}></div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Reclamos / Quejas</span>
                      <span style={{ fontWeight: '600', color: '#3b82f6' }}>-85%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ width: '15%', height: '100%', background: '#3b82f6' }}></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : activeTab === 'Académico' ? (
          <div className="academico-view" style={{ padding: '0 40px 40px' }}>
            <div className="card-header" style={{ marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>Asistencia y Operación</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>Pase de lista con notificación automática y repositorio de materiales.</p>
              </div>
              <button className="btn-secondary" style={{ width: 'auto', padding: '10px 24px', gap: '8px' }}>
                <UploadCloud size={18} /> Subir Material de Estudio
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              
              {/* Left Column: Pase de Lista */}
              <div className="bento-card" style={{ padding: '0' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      <UserCheck size={20} color="var(--brand-blue)" /> Pase de Lista Rápido
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Grupo: COMIPEMS 2024 • Fecha: Hoy</p>
                  </div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} /> Marca de Falta envía WhatsApp
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {mockStudents.map((student, idx) => (
                      <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px' }}>
                              {student.avatar}
                            </div>
                            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{student.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: idx === 0 ? '#16a34a' : 'transparent', border: idx === 0 ? 'none' : '1px solid var(--border-color)', color: idx === 0 ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }} title="Presente">
                              <Check size={18} />
                            </button>
                            <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: idx === 1 ? '#ef4444' : 'transparent', border: idx === 1 ? 'none' : '1px solid var(--border-color)', color: idx === 1 ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }} title="Falta">
                              <X size={18} />
                            </button>
                            <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }} title="Retardo">
                              <Clock size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: '20px 24px', background: 'var(--bg-main)', textAlign: 'right' }}>
                  <button className="btn-secondary" style={{ width: 'auto', padding: '10px 32px' }}>Guardar Asistencia</button>
                </div>
              </div>

              {/* Right Column: Materiales */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="bento-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    <BookOpen size={20} color="var(--brand-yellow)" /> Repositorio de Guías
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '8px', background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', borderRadius: '8px' }}><FileText size={16} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>Guía de Matemáticas (Bloque 1)</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>PDF • 2.4 MB</div>
                      </div>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--brand-blue)', cursor: 'pointer' }}><Download size={16} /></button>
                    </div>

                    <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand-blue)', borderRadius: '8px' }}><FileText size={16} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>Examen Diagnóstico 2024</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>PDF • 1.1 MB</div>
                      </div>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--brand-blue)', cursor: 'pointer' }}><Download size={16} /></button>
                    </div>
                  </div>
                </div>

                <div className="bento-card" style={{ padding: '20px', background: 'var(--gradient-card)', color: 'white', border: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}><Bell size={20} /></div>
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>Notificación Inmediata</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', margin: 0 }}>
                    Al guardar la asistencia, el sistema procesará <strong>1 falta</strong> y enviará un mensaje instantáneo a la Sra. María Gómez.
                  </p>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%', flexDirection: 'column', color: 'var(--text-secondary)' }}>
            <div style={{ opacity: 0.5, marginBottom: '16px' }}>
              <LayoutDashboard size={64} />
            </div>
            <h2>Módulo en construcción</h2>
            <p>Este módulo será parte de la plataforma completa de CRECE.</p>
          </div>
        )}
        </>
        )}
      </main>

      {/* MODAL: Reporte de Éxito */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '16px' }}>
                  {showReportModal.avatar}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Reporte de Éxito</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{showReportModal.name} • {showReportModal.curso}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowReportModal(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Evolución de Puntaje</h4>
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer>
                  <BarChart data={[
                    { examen: 'Diagnóstico', aciertos: 45 },
                    { examen: 'Simulacro 1', aciertos: 72 },
                    { examen: 'Simulacro Final', aciertos: 98 }
                  ]} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="examen" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="aciertos" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} name="Aciertos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <Target size={18} color="#8b5cf6" /> Meta de Ingreso: Medicina UNAM
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Faltan 13 aciertos</span>
                  </div>
                  <div style={{ width: '100%', height: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)', borderRadius: '100px' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    <span>Diagnóstico: 45</span>
                    <span style={{ color: '#3b82f6', fontWeight: '600' }}>Simulacro Actual: 98</span>
                    <span style={{ fontWeight: '600' }}>Meta: 111</span>
                  </div>
                </div>

                <div className="success-badge" style={{ marginTop: '0' }}>
                  <TrendingUp size={16} /> Incremento del 117% en aciertos
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowReportModal(null)}>
                Cerrar
              </button>
              <button style={{ background: '#25D366', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 211, 102, 0.2)' }}>
                <Send size={16} /> Enviar PDF al Tutor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Portal de Padres (Celular) */}
      {showParentPortal && (
        <div className="modal-overlay" style={{ zIndex: 200, background: 'rgba(15, 23, 42, 0.8)' }} onClick={() => setShowParentPortal(false)}>
          <div className="phone-mockup-container" onClick={e => e.stopPropagation()}>
            <div className="phone-mockup">
              <div className="phone-notch"></div>
              
              <div className="phone-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>C</div>
                    <span style={{ fontWeight: '600', fontSize: '16px', color: 'var(--text-primary)' }}>CRECE Portal</span>
                  </div>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowParentPortal(false)}>
                    <X size={20} />
                  </button>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Hola, Carlos</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>Tutor de Ana Sofía Martínez</p>
              </div>

              <div className="phone-content" style={{ background: '#f8fafc' }}>
                
                {/* Alerta de Pago */}
                <div className="phone-card" style={{ borderLeft: '4px solid #ef4444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: '600', marginBottom: '8px' }}>
                    <AlertTriangle size={16} /> Mensualidad Vencida
                  </div>
                  <p style={{ fontSize: '14px', margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>La mensualidad de Mayo ($2,500.00) venció hace 2 días.</p>
                  <button style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <CreditCard size={16} /> Pagar Ahora
                  </button>
                </div>

                {/* Rendimiento */}
                <div className="phone-card">
                  <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <Target size={16} color="var(--brand-blue)" /> Meta de Admisión: UNAM
                  </h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Actual: <strong style={{ color: 'var(--text-primary)' }}>98</strong> aciertos</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Meta: 111</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: 'var(--border-color)', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)', borderRadius: '100px' }}></div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#10b981', marginTop: '8px', fontWeight: '500', margin: '8px 0 0 0' }}>
                      ¡A solo 13 aciertos de Medicina! Vamos por excelente camino.
                    </p>
                  </div>

                  <button style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                    Descargar Reporte Completo
                  </button>
                </div>

                {/* Avisos */}
                <div className="phone-card">
                  <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <Megaphone size={16} color="var(--brand-yellow)" /> Avisos Recientes
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>Simulacro Presencial</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sábado 15 de Mayo, 08:00 AM</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>Asistencia a Clase</div>
                      <div style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Ana Sofía asistió hoy a tiempo.
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nueva Entrada */}
      {showNewEntryModal && (
        <div className="modal-overlay" onClick={() => setShowNewEntryModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '16px' }}>
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Registrar Nueva Entrada</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Ingreso por pago de alumno u otro concepto</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowNewEntryModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Alumno (Opcional)</label>
                <select className="form-input">
                  <option value="">Selecciona un alumno...</option>
                  {mockStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.curso}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Concepto</label>
                <input type="text" className="form-input" placeholder="Ej. Pago de Mensualidad" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Monto</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: '500' }}>$</span>
                    <input type="number" className="form-input" placeholder="0.00" style={{ paddingLeft: '32px' }} />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Método de Pago</label>
                  <select className="form-input">
                    <option>Efectivo</option>
                    <option>Transferencia</option>
                    <option>Tarjeta de Crédito / Débito</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowNewEntryModal(false)}>
                Cancelar
              </button>
              <button style={{ background: '#16a34a', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)' }} onClick={() => setShowNewEntryModal(false)}>
                <Check size={16} /> Guardar Entrada
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
