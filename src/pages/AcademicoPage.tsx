import { UploadCloud, UserCheck, AlertTriangle, Check, X, Clock, BookOpen, FileText, Download, Bell } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function AcademicoPage() {
  const { students } = useAppStore();
  return (
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
              {students.map((student, idx) => (
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
  );
}
