import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Banknote, AlertTriangle, MessageSquare, CheckCircle2, Bell, Download, UserCheck, GraduationCap, UserPlus, FileText } from 'lucide-react';
import { enrollmentData, academicData, notifications } from '../data/mockData';

export default function DashboardPage() {
  return (
    <div className="dashboard-grid">
      {/* 1. Control Escolar - Inscripciones (Area Chart) */}
      <div className="bento-card col-span-2" style={{ position: 'relative' }}>
        <div className="crece-dots-grid" style={{ position: 'absolute', top: 0, right: 0, width: '130px', height: '130px', pointerEvents: 'none', borderBottomLeftRadius: '100%' }}></div>
        <div className="card-header" style={{ position: 'relative', zIndex: 2 }}>
          <div className="card-title">
            <TrendingUp size={20} /> Inscripciones Mensuales
          </div>
          <button className="card-action">Ver Reporte</button>
        </div>
        <div style={{ width: '100%', height: '220px', position: 'relative', zIndex: 1 }}>
          <ResponsiveContainer>
            <AreaChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAlumnos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-blue)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--brand-blue)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,56,105,0.06)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="alumnos" stroke="var(--brand-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorAlumnos)" />
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
      <div className="bento-card col-span-1" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
        <div className="crece-dots-grid" style={{ position: 'absolute', top: 0, left: 0, width: '100px', height: '100px', pointerEvents: 'none', borderBottomRightRadius: '100%', opacity: 0.08 }}></div>
        <div style={{ background: 'rgba(15, 56, 105, 0.08)', padding: '20px', borderRadius: '50%', marginBottom: '16px', color: 'var(--brand-blue)', alignSelf: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserCheck size={40} />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--brand-blue)' }}>Asistencia Rápida</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Pase de lista con 1 click para el grupo actual (3°A).
        </p>
        <button className="btn-primary" style={{ width: 'auto', padding: '12px 32px', alignSelf: 'center' }}>
          Pasar Lista Ahora
        </button>
      </div>

      {/* 5. Académico - Rendimiento */}
      <div className="bento-card col-span-1" style={{ position: 'relative' }}>
        <div className="crece-dots-grid" style={{ position: 'absolute', bottom: 0, right: 0, width: '100px', height: '100px', pointerEvents: 'none', borderTopLeftRadius: '100%', opacity: 0.1 }}></div>
        <div className="card-header">
          <div className="card-title">
            <GraduationCap size={20} /> Rendimiento Académico
          </div>
        </div>
        <div style={{ width: '100%', height: '160px', marginTop: '10px', position: 'relative', zIndex: 1 }}>
          <ResponsiveContainer>
            <BarChart data={academicData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,56,105,0.06)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
              <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="promedio" fill="var(--brand-blue)" radius={[4, 4, 0, 0]} barSize={10} name="Promedio Final" />
              <Bar dataKey="simulacro" fill="var(--brand-yellow)" radius={[4, 4, 0, 0]} barSize={10} name="Simulacro" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Control Escolar - Inscripción en 3 clicks (Prospectos) */}
      <div className="bento-card col-span-2" style={{ position: 'relative' }}>
        <div className="crece-dots-grid" style={{ position: 'absolute', top: 0, right: 0, width: '130px', height: '130px', pointerEvents: 'none', borderBottomLeftRadius: '100%', opacity: 0.08 }}></div>
        <div className="card-header" style={{ position: 'relative', zIndex: 2 }}>
          <div className="card-title">
            <UserPlus size={20} /> Gestión de Prospectos (Inscripción en 3 clicks)
          </div>
          <button className="card-action">Nuevo Formulario</button>
        </div>
        <div className="funnel-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="funnel-step active">
            <div className="funnel-icon-wrap" style={{ borderColor: 'var(--brand-yellow)', color: 'var(--brand-yellow)', background: 'rgba(229,169,59,0.05)' }}><UserPlus size={24} /></div>
            <div className="funnel-value" style={{ color: 'var(--brand-blue)' }}>124</div>
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
  );
}
