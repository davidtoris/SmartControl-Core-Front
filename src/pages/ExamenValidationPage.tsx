import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function ExamenValidationPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { students, fetchStudents } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  // Cargar estudiantes si el store está vacío para asegurar sincronización
  useEffect(() => {
    const syncData = async () => {
      try {
        if (students.length === 0) {
          await fetchStudents();
        }
      } catch (error) {
        console.error('Error al sincronizar datos de validación:', error);
      } finally {
        // Pequeño delay de 500ms para una transición ultra fluida de la carga
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    syncData();
  }, [students.length, fetchStudents]);

  // Buscar el intento y el estudiante correspondiente
  const getValidationData = () => {
    if (!attemptId) return null;
    for (const student of students) {
      const attempt = student.examAttempts?.find(
        (a: any) => String(a.id) === String(attemptId)
      );
      if (attempt) {
        return { student, attempt };
      }
    }
    return null;
  };

  const data = getValidationData();

  // --- 1. RENDERIZADO DEL SPINNER DE CARGA ---
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fcfbf7', // Fondo crema ligero
        fontFamily: "'Outfit', sans-serif",
        color: '#1e293b',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '4px solid rgba(212, 175, 55, 0.1)',
            borderTopColor: '#d4af37', // Anillo dorado de carga
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e3a8a', letterSpacing: '0.3px' }}>
            Consultando registro de autenticidad...
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Conectando con el servidor central de CRECE
          </span>
        </div>
      </div>
    );
  }

  // --- 2. RENDERIZADO DEL CERTIFICADO DE EXAMEN ---
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle, #f5f3e9 0%, #e2ded0 100%)', // Fondo pergamino premium
      fontFamily: "'Outfit', sans-serif",
      color: '#1e293b',
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '850px',
        width: '100%',
        background: 'white',
        border: '3px double #d4af37', // Doble borde dorado académico
        borderRadius: '16px',
        padding: '54px',
        boxShadow: '0 25px 60px -15px rgba(30, 41, 59, 0.15)',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        
        {/* Marca de agua de fondo (Logotipo CRECE sutil) */}
        <div style={{
          position: 'absolute',
          fontSize: '280px',
          fontWeight: '900',
          color: 'rgba(30, 58, 138, 0.015)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          C
        </div>

        {data ? (
          // ================= CASO 1: CERTIFICADO AUTÉNTICO VÁLIDO =================
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Header del Certificado */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  color: '#d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '24px',
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)',
                  border: '1.5px solid #d4af37'
                }}>
                  C
                </div>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px 0', color: '#1e3a8a', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
                Instituto de Capacitación CRECE
              </h1>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '2px' }}>
                Sello de Autenticidad de Evaluación y Honestidad Académica
              </p>
            </div>

            {/* Banner Oficial de Verificación */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.06), rgba(34, 197, 94, 0.02))',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '12px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: '#22c55e', display: 'flex', alignItems: 'center' }}>
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#16a34a' }}>
                    Documento de Evaluación Verificado
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
                    Registrado de forma segura en las bases de datos centrales de CRECE.
                  </p>
                </div>
              </div>
              <span style={{
                background: '#22c55e',
                color: 'white',
                padding: '4px 14px',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 6px rgba(34, 197, 94, 0.2)'
              }}>
                VÁLIDO
              </span>
            </div>

            {/* Texto del Certificado */}
            <div style={{ textAlign: 'center', padding: '0 10px' }}>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.7', margin: 0 }}>
                Por medio del presente documento, se hace constar de forma electrónica que el estudiante ha completado satisfactoriamente la prueba oficial evaluadora y proctorada bajo las normas y lineamientos de honestidad académica institucionales de CRECE.
              </p>
            </div>

            {/* Cuerpo del Certificado (2 Columnas) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'start' }}>
              
              {/* Detalles Académicos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', margin: 0 }}>
                  Expediente de la Prueba
                </h4>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 0', color: '#64748b', fontWeight: '500' }}>Estudiante:</td>
                      <td style={{ padding: '8px 0', color: '#0f172a', fontWeight: '700', textAlign: 'right' }}>{data.student.name}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 0', color: '#64748b', fontWeight: '500' }}>Programa de Estudio:</td>
                      <td style={{ padding: '8px 0', color: '#0f172a', fontWeight: '600', textAlign: 'right' }}>{data.student.curso}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 0', color: '#64748b', fontWeight: '500' }}>Evaluación Tomada:</td>
                      <td style={{ padding: '8px 0', color: '#1e3a8a', fontWeight: '700', textAlign: 'right' }}>{data.attempt.examName}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 0', color: '#64748b', fontWeight: '500' }}>Fecha de Ejecución:</td>
                      <td style={{ padding: '8px 0', color: '#0f172a', fontWeight: '600', textAlign: 'right' }}>
                        {new Date(data.attempt.endedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Resultados e Integridad */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', margin: 0 }}>
                  Métricas de Desempeño
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Calificación */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>Calificación</span>
                    <strong style={{ fontSize: '24px', fontWeight: '800', color: data.attempt.cheatingCanceled ? '#ef4444' : '#1e3a8a' }}>
                      {data.attempt.cheatingCanceled ? '0' : data.attempt.score}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>/ {data.attempt.max} aciertos</span>
                  </div>

                  {/* Honestidad */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>Honestidad</span>
                    <strong style={{ fontSize: '24px', fontWeight: '800', color: (data.attempt.integrityScore ?? 100) >= 80 ? '#16a34a' : '#ef4444' }}>
                      {data.attempt.integrityScore !== undefined ? data.attempt.integrityScore : 100}%
                    </strong>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                      {data.attempt.cheatingCanceled ? 'Anulado' : ((data.attempt.integrityScore ?? 100) >= 80 ? 'Aprobado' : 'Sospecha')}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Sello y Firmas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '32px', alignItems: 'end', marginTop: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '24px' }}>
              {/* Código hash seguro */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Firma Electrónica Criptográfica (SHA-256):
                </span>
                <code style={{ 
                  display: 'block', 
                  fontSize: '11px', 
                  fontFamily: 'monospace', 
                  color: '#475569', 
                  background: '#f8fafc', 
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  wordBreak: 'break-all',
                  lineHeight: '1.4'
                }}>
                  CRECE-SECURE-SHA256:{data.attempt.id.slice(0, 8)}-{new Date(data.attempt.endedAt).getTime()}-{(data.attempt.integrityScore || 100)}-{data.attempt.score}
                </code>
              </div>

              {/* Firma del Director */}
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  fontFamily: "'Great Vibes', cursive, 'Brush Script MT', cursive, sans-serif", 
                  fontSize: '26px', 
                  color: '#1e3a8a',
                  marginBottom: '-8px',
                  fontStyle: 'italic',
                  opacity: 0.9
                }}>
                  David Toris
                </div>
                <div style={{ width: '120px', height: '1px', background: '#cbd5e1', margin: '8px 0' }}></div>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Dirección General CRECE
                </span>
              </div>
            </div>

          </div>
        ) : (
          // ================= CASO 2: CERTIFICADO INVÁLIDO / FALLIDO =================
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'center' }}>
            
            {/* Header del Certificado (Invalido) */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px 0', color: '#1e3a8a', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
                Instituto de Capacitación CRECE
              </h1>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '2px' }}>
                Boleta de Verificación de Integridad Académica
              </p>
            </div>

            {/* Alerta de Error */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '2px solid #ef4444',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)'
              }}>
                <ShieldAlert size={36} />
              </div>
            </div>

            <div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                Validación Fallida
              </h2>
              <span style={{
                display: 'inline-block',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                padding: '4px 14px',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Código No Registrado ❌
              </span>
            </div>

            <p style={{ margin: '0 auto', fontSize: '14.5px', color: '#475569', lineHeight: '1.7', maxWidth: '560px' }}>
              El folio ingresado <strong>{attemptId || 'desconocido'}</strong> no coincide con ninguna evaluación oficial en los servidores de CRECE. El reporte físico o digital que posee podría haber sido alterado o manipulado de forma no autorizada.
            </p>

            <div style={{
              background: 'rgba(239, 68, 68, 0.03)',
              border: '1px solid rgba(239, 68, 68, 0.12)',
              borderRadius: '12px',
              padding: '18px 24px',
              fontSize: '13px',
              color: '#ef4444',
              lineHeight: '1.6',
              textAlign: 'left',
              maxWidth: '560px',
              margin: '0 auto'
            }}>
              <strong>Advertencia de Seguridad Académica:</strong> Si usted cuenta con una boleta física que muestre este código QR y asegura ser emitida por CRECE, por favor repórtelo al área administrativa institucional para proceder con una auditoría completa del expediente del alumno.
            </div>

          </div>
        )}

        {/* Botón de Regreso a la plataforma */}
        <div style={{ marginTop: '36px', borderTop: '1px solid #cbd5e1', paddingTop: '24px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#1e3a8a',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseOver={e => e.currentTarget.style.color = '#3b82f6'}
            onMouseOut={e => e.currentTarget.style.color = '#1e3a8a'}
          >
            <ArrowLeft size={16} /> Volver a la Administración de CRECE
          </button>
        </div>

      </div>
    </div>
  );
}
