import { useNavigate } from 'react-router-dom';
import { UserPlus, BookOpen, Phone, TrendingUp, MoreVertical } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function AlumnosPage() {
  const navigate = useNavigate();
  const { students } = useAppStore();

  return (
    <div className="alumnos-view" style={{ padding: '0 40px 40px' }}>
      <div className="card-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>Expediente Digital</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>Gestión de alumnos, grupos y reportes de éxito.</p>
        </div>
        <button 
          className="btn-secondary" 
          style={{ width: 'auto', padding: '10px 24px', gap: '8px', cursor: 'pointer' }}
          onClick={() => navigate('/inscripcion')}
        >
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
            {students.map(student => (
              <tr 
                key={student.id} 
                style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }} 
                onClick={() => navigate(`/alumnos/${student.id}`)} 
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-main)'} 
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
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
                    <button style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand-blue)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'} onClick={(e) => { e.stopPropagation(); /* TODO: Reporte Modal */ }}>
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
  );
}
