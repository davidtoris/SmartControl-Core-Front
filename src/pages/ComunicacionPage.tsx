import { Megaphone, MessageSquare, Filter, AlertTriangle, CheckCircle2, Eye, Download, GraduationCap, ShieldCheck, Search, TrendingUp } from 'lucide-react';

export default function ComunicacionPage() {
  return (
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
  );
}
