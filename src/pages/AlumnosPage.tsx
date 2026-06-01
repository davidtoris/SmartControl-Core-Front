import { useNavigate } from 'react-router-dom';
import { UserPlus, BookOpen, Phone, TrendingUp, MoreVertical } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function AlumnosPage() {
  const navigate = useNavigate();
  const { students } = useAppStore();

  return (
    <div className="alumnos-view" style={{ padding: '0 40px 40px' }}>
      
      {/* Cabecera Premium de Módulo */}
      <div className="card-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text-primary)', background: 'linear-gradient(90deg, #fff, #a3a3a3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Expediente Digital
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>
            Gestión integral de expedientes académicos, grupos y estatus de alumnos.
          </p>
        </div>
        
        <button 
          className="btn-secondary" 
          style={{ width: 'auto', padding: '10px 24px', gap: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)', fontWeight: '600' }}
          onClick={() => navigate('/inscripcion')}
        >
          <UserPlus size={18} /> Nueva Inscripción Rápida
        </button>
      </div>

      {/* VISTA DE ALUMNOS (EXPEDIENTE) */}
      <div className="bento-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--bg-card)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alumno</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Curso</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tutor / Contacto</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estatus</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr 
                key={student.id} 
                style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }} 
                onClick={() => navigate(`/alumnos/${student.id}`)} 
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} 
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      {student.avatar || student.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block', fontSize: '15px' }}>{student.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>ID: {student.id}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={16} style={{ color: 'var(--brand-blue)' }} /> {student.curso}
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500', display: 'block', fontSize: '14px' }}>{student.tutor}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginTop: '2px' }}>{student.phone}</span>
                    </div>
                    <button style={{ background: 'rgba(37, 211, 102, 0.1)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366', cursor: 'pointer', border: '1px solid rgba(37, 211, 102, 0.2)' }} onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${student.phone.replace(/[^0-9]/g, '')}`, '_blank'); }}>
                      <Phone size={14} />
                    </button>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '5px 12px', 
                    borderRadius: '100px', 
                    fontSize: '12px', 
                    fontWeight: '700',
                    letterSpacing: '0.2px',
                    background: student.status === 'Activo - Al Corriente' ? 'rgba(34, 197, 94, 0.15)' 
                               : student.status === 'Activo - Con Adeudos' ? 'rgba(239, 68, 68, 0.15)' 
                               : student.status === 'Inactivo' ? 'rgba(100, 116, 139, 0.15)' 
                               : 'rgba(234, 179, 8, 0.15)',
                    color: student.status === 'Activo - Al Corriente' ? '#22c55e' 
                           : student.status === 'Activo - Con Adeudos' ? '#ef4444' 
                           : student.status === 'Inactivo' ? '#94a3b8' 
                           : '#eab308',
                    border: `1px solid ${
                      student.status === 'Activo - Al Corriente' ? 'rgba(34, 197, 94, 0.3)' 
                      : student.status === 'Activo - Con Adeudos' ? 'rgba(239, 68, 68, 0.3)' 
                      : student.status === 'Inactivo' ? 'rgba(100, 116, 139, 0.3)' 
                      : 'rgba(234, 179, 8, 0.3)'
                    }`
                  }}>
                    {student.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand-blue)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'} onClick={(e) => { e.stopPropagation(); navigate(`/alumnos/${student.id}`); }}>
                      <TrendingUp size={14} /> Gestionar
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
  );
}
