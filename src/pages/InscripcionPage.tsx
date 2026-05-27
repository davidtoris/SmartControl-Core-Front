import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ChevronRight, ChevronLeft, User, Phone, Mail, Award, BookOpen, 
  MapPin, Clock, UploadCloud, CheckCircle2, AlertCircle, FileText, 
  Wallet, QrCode, Sparkles, Printer, UserCheck, ShieldCheck, CreditCard,
  Percent, Sparkle, HelpingHand
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Student } from '../store/useAppStore';

// --- Esquema de Validación con Zod ---
const contactSchema = z.object({
  nombre: z.string()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre solo debe contener letras y espacios.' }),
  correo: z.string()
    .min(1, { message: 'El correo electrónico es obligatorio.' })
    .email({ message: 'Formato de correo electrónico no válido.' }),
  celular: z.string()
    .min(10, { message: 'El celular debe tener exactamente 10 dígitos.' })
    .max(10, { message: 'El celular debe tener exactamente 10 dígitos.' })
    .regex(/^\d+$/, { message: 'Solo se permiten números.' }),
  tutorNombre: z.string()
    .min(3, { message: 'El nombre del tutor debe tener al menos 3 caracteres.' })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre solo debe contener letras y espacios.' }),
  tutorPhone: z.string()
    .min(10, { message: 'El WhatsApp del tutor debe tener exactamente 10 dígitos.' })
    .max(10, { message: 'El WhatsApp del tutor debe tener exactamente 10 dígitos.' })
    .regex(/^\d+$/, { message: 'Solo se permiten números.' }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function InscripcionPage() {
  const navigate = useNavigate();
  const { addStudent, students } = useAppStore();

  // Paso actual (1 a 5)
  const [step, setStep] = useState(1);

  // --- Datos del Formulario ---
  // Paso 1: Datos Personales (Gestionados reactivamente con React Hook Form)
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid },
    trigger,
    getValues
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange', // Valida en tiempo real al escribir
    defaultValues: {
      nombre: '',
      correo: '',
      celular: '',
      tutorNombre: '',
      tutorPhone: ''
    }
  });

  // Paso 2: Académico y Modalidad
  const [curso, setCurso] = useState('UNAM'); // UNAM, COMIPEMS, IPN
  const [modalidad, setModalidad] = useState('Presencial'); // Presencial, En linea
  const [turno, setTurno] = useState('Matutino'); // Matutino, Vespertino

  // Paso 3: Documentos (PDF)
  const [docs, setDocs] = useState<{
    acta: { file: File | null; progress: number; status: 'Faltante' | 'Subiendo' | 'Subido'; error?: string };
    curp: { file: File | null; progress: number; status: 'Faltante' | 'Subiendo' | 'Subido'; error?: string };
    domicilio: { file: File | null; progress: number; status: 'Faltante' | 'Subiendo' | 'Subido'; error?: string };
    certificado: { file: File | null; progress: number; status: 'Faltante' | 'Subiendo' | 'Subido'; error?: string };
  }>({
    acta: { file: null, progress: 0, status: 'Faltante' },
    curp: { file: null, progress: 0, status: 'Faltante' },
    domicilio: { file: null, progress: 0, status: 'Faltante' },
    certificado: { file: null, progress: 0, status: 'Faltante' },
  });

  // Paso 4: Finanzas
  const [tipoPago, setTipoPago] = useState<'Contado' | 'Pagos'>('Contado');
  
  // Confetti Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Reglas de Negocio de Cursos ---
  const cursosConfig: Record<string, { name: string; duracion: number; costoBase: number; mensualidadSugerida: number }> = {
    UNAM: { name: 'Curso Ingreso UNAM (Superior)', duracion: 8, costoBase: 10000, mensualidadSugerida: 1500 },
    COMIPEMS: { name: 'Curso Ingreso COMIPEMS (Medio)', duracion: 8, costoBase: 8000, mensualidadSugerida: 1200 },
    IPN: { name: 'Curso Ingreso IPN (Superior)', duracion: 3, costoBase: 5000, mensualidadSugerida: 2000 },
  };

  const selectedConfig = cursosConfig[curso];
  // El costo total a pagos incluye un 20% de financiamiento
  const costoTotal = tipoPago === 'Contado' ? selectedConfig.costoBase : selectedConfig.costoBase * 1.2;
  const mensualidadesDiferidas = selectedConfig.duracion;
  const costoMensualidad = costoTotal / mensualidadesDiferidas;
  const pagoInicial = tipoPago === 'Contado' ? costoTotal : costoMensualidad;

  // Validación de paso actual
  const isStepValid = () => {
    if (step === 1) {
      return isValid; // Depende de React Hook Form + Zod
    }
    if (step === 2) {
      return curso && modalidad && turno;
    }
    if (step === 3) {
      // Los documentos no impiden avanzar (quedarían como "Pendiente Docs")
      return true;
    }
    if (step === 4) {
      return true;
    }
    return true;
  };

  // Moverse entre pasos
  const handleNext = async () => {
    if (step === 1) {
      // Forzar validación de react-hook-form antes de avanzar
      const isValidForm = await trigger();
      if (isValidForm) {
        setStep(2);
      }
    } else if (step === 4) {
      handleFinalize();
    } else {
      setStep(prev => prev + 1);
    }
  };

  // --- Simulación de Carga de Documentos (Solo PDF) ---
  const handleFileUpload = (docKey: 'acta' | 'curp' | 'domicilio' | 'certificado', file: File) => {
    // Validar extensión PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setDocs(prev => ({
        ...prev,
        [docKey]: { ...prev[docKey], error: 'Solo se permiten archivos en formato PDF (.pdf)', status: 'Faltante' }
      }));
      return;
    }

    // Iniciar carga simulada
    setDocs(prev => ({
      ...prev,
      [docKey]: { file, progress: 0, status: 'Subiendo', error: undefined }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setDocs(prev => ({
        ...prev,
        [docKey]: { ...prev[docKey], progress }
      }));

      if (progress >= 100) {
        clearInterval(interval);
        setDocs(prev => ({
          ...prev,
          [docKey]: { ...prev[docKey], status: 'Subido', progress: 100 }
        }));
      }
    }, 150);
  };

  // Folio de inscripción generado una sola vez
  const [folio, setFolio] = useState('');
  const [newStudentId, setNewStudentId] = useState<number>(0);

  useEffect(() => {
    if (step === 5) {
      setFolio(`CR-26-${Math.floor(1000 + Math.random() * 9000)}`);
      
      // Efecto Confeti en Canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 600;

      const particles: any[] = [];
      const colors = ['#3b82f6', '#eab308', '#10b981', '#f43f5e', '#0ea5e9'];

      for (let i = 0; i < 120; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          r: Math.random() * 6 + 4,
          d: Math.random() * canvas.height,
          color: colors[Math.floor(Math.random() * colors.length)],
          tilt: Math.random() * 10 - 5,
          tiltAngleIncremental: Math.random() * 0.07 + 0.02,
          tiltAngle: 0
        });
      }

      let animationId: number;
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, idx) => {
          p.tiltAngle += p.tiltAngleIncremental;
          p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
          p.x += Math.sin(p.tiltAngle);
          p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

          ctx.beginPath();
          ctx.lineWidth = p.r;
          ctx.strokeStyle = p.color;
          ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
          ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
          ctx.stroke();

          if (p.y > canvas.height) {
            particles[idx] = {
              x: Math.random() * canvas.width,
              y: -20,
              r: p.r,
              d: p.d,
              color: p.color,
              tilt: p.tilt,
              tiltAngleIncremental: p.tiltAngleIncremental,
              tiltAngle: p.tiltAngle
            };
          }
        });

        animationId = requestAnimationFrame(draw);
      };

      draw();
      return () => cancelAnimationFrame(animationId);
    }
  }, [step]);

  // --- Guardar Alumno en Zustand ---
  const handleFinalize = () => {
    const nextId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    setNewStudentId(nextId);

    const values = getValues(); // Obtener valores validados de react-hook-form

    // Calcular estatus
    const hasAllDocs = docs.acta.status === 'Subido' && 
                       docs.curp.status === 'Subido' && 
                       docs.domicilio.status === 'Subido' && 
                       docs.certificado.status === 'Subido';
    
    const initialPay = pagoInicial;
    
    let finalStatus = 'Pendiente Docs';
    if (hasAllDocs) {
      finalStatus = 'Inscrito';
    }

    // Iniciales nombre
    const initials = values.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const newStudent: Student = {
      id: nextId,
      name: values.nombre,
      curso: `Ingreso ${curso}`,
      tutor: values.tutorNombre,
      status: finalStatus,
      phone: values.tutorPhone,
      avatar: initials || 'AL',
      paymentPlan: {
        type: tipoPago === 'Contado' ? '1 pago' : `${selectedConfig.duracion} pagos`,
        totalCost: costoTotal,
        amountPaid: initialPay
      },
      documents: [
        { name: 'Acta de Nacimiento', status: docs.acta.status === 'Subido' ? 'Subido' : 'Faltante' },
        { name: 'CURP', status: docs.curp.status === 'Subido' ? 'Subido' : 'Faltante' },
        { name: 'Comprobante de Domicilio', status: docs.domicilio.status === 'Subido' ? 'Subido' : 'Faltante' },
        { name: 'Certificado Secundaria', status: docs.certificado.status === 'Subido' ? 'Subido' : 'Faltante' }
      ],
      attendance: {
        percentage: 100,
        history: [
          { date: 'Fecha de Registro', status: 'Presente' }
        ]
      },
      exams: []
    };

    addStudent(newStudent);
    setStep(5);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, rgba(30, 58, 138, 0.15), var(--bg-main) 60%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Botón de Regreso a Admin */}
      <button 
        onClick={() => navigate('/')} 
        style={{
          position: 'absolute',
          top: '24px',
          left: '40px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '100px',
          padding: '8px 20px',
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'var(--transition)',
          zIndex: 10
        }}
        onMouseOver={e => {
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        <ChevronLeft size={16} /> Volver a la Administración
      </button>

      {/* --- Contenedor Principal --- */}
      <div style={{
        width: '100%',
        maxWidth: step === 5 ? '850px' : '960px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 5,
        transition: 'var(--transition)'
      }}>

        {/* Indicador de Pasos (1 al 4) */}
        {step < 5 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            position: 'relative'
          }}>
            {/* PROGRESS CONNECTING LINE - Centered horizontally EXACTLY at the middle of 36px tall circles (18px) */}
            <div style={{
              position: 'absolute',
              top: '18px',
              left: 0,
              right: 0,
              height: '2px',
              background: 'var(--border-color)',
              zIndex: 1
            }}>
              <div style={{
                height: '100%',
                background: 'var(--brand-blue)',
                width: `${((step - 1) / 3) * 100}%`,
                transition: 'var(--transition)'
              }}></div>
            </div>

            {[
              { num: 1, label: 'Contacto', icon: <User size={14} /> },
              { num: 2, label: 'Curso', icon: <BookOpen size={14} /> },
              { num: 3, label: 'Documentos', icon: <UploadCloud size={14} /> },
              { num: 4, label: 'Finanzas', icon: <Wallet size={14} /> },
            ].map(item => (
              <div key={item.num} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                zIndex: 2
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: step >= item.num ? 'var(--brand-blue)' : 'var(--bg-main)',
                  border: `2px solid ${step >= item.num ? 'var(--brand-blue)' : 'var(--border-color)'}`,
                  color: step >= item.num ? 'white' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '13px',
                  transition: 'var(--transition)'
                }}>
                  {step > item.num ? <CheckCircle2 size={16} /> : item.icon}
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: step === item.num ? '600' : '500',
                  color: step >= item.num ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'var(--transition)'
                }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* --- PASO 1: DATOS PERSONALES --- */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <span style={{
                background: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--accent-primary)',
                padding: '6px 12px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: '600'
              }}>Inscripción Autónoma</span>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '12px' }}>Datos de Registro</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Ingresa los datos generales del aspirante y su tutor responsable. Todos los campos son obligatorios.</p>
            </div>

            <form onSubmit={handleSubmit(handleFinalize)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} /> Nombre Completo del Aspirante *
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ borderColor: errors.nombre ? '#ef4444' : 'var(--border-color)', transition: 'all 0.2s' }}
                  placeholder="Ej. Juan Pérez Gómez" 
                  {...register('nombre')}
                />
                {errors.nombre && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                    <AlertCircle size={12} /> {errors.nombre.message}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} /> Correo Electrónico del Aspirante *
                  </label>
                  <input 
                    type="email" 
                    className="form-input" 
                    style={{ borderColor: errors.correo ? '#ef4444' : 'var(--border-color)', transition: 'all 0.2s' }}
                    placeholder="juan.perez@example.com" 
                    {...register('correo')}
                  />
                  {errors.correo && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                      <AlertCircle size={12} /> {errors.correo.message}
                    </span>
                  )}
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} /> Teléfono Celular (10 dígitos) *
                  </label>
                  <input 
                    type="tel" 
                    maxLength={10}
                    className="form-input" 
                    style={{ borderColor: errors.celular ? '#ef4444' : 'var(--border-color)', transition: 'all 0.2s' }}
                    placeholder="5512345678" 
                    {...register('celular')}
                  />
                  {errors.celular && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                      <AlertCircle size={12} /> {errors.celular.message}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-blue)', fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>
                <ShieldCheck size={18} /> Datos de Seguridad (Tutor Responsable)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nombre Completo del Tutor *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ borderColor: errors.tutorNombre ? '#ef4444' : 'var(--border-color)', transition: 'all 0.2s' }}
                    placeholder="Ej. Carlos Pérez" 
                    {...register('tutorNombre')}
                  />
                  {errors.tutorNombre && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                      <AlertCircle size={12} /> {errors.tutorNombre.message}
                    </span>
                  )}
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Teléfono de WhatsApp del Tutor *</label>
                  <input 
                    type="tel" 
                    maxLength={10}
                    className="form-input" 
                    style={{ borderColor: errors.tutorPhone ? '#ef4444' : 'var(--border-color)', transition: 'all 0.2s' }}
                    placeholder="5587654321" 
                    {...register('tutorPhone')}
                  />
                  {errors.tutorPhone && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                      <AlertCircle size={12} /> {errors.tutorPhone.message}
                    </span>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}

        {/* --- PASO 2: CURSO Y MODALIDAD --- */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>Configuración del Curso</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Selecciona el programa académico, modalidad y turno en el que deseas estudiar.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Tarjetas de Selección de Curso */}
              <div>
                <label className="form-label" style={{ marginBottom: '12px' }}>Selecciona tu Curso *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[
                    { id: 'UNAM', tag: 'Recomendado', title: 'Ingreso UNAM', duracion: '8 meses', cost: '$10,000 MXN', desc: 'Preparación integral para examen superior.' },
                    { id: 'COMIPEMS', tag: 'Nivel Medio', title: 'COMIPEMS 2026', duracion: '8 meses', cost: '$8,000 MXN', desc: 'Ingreso a preparatoria y bachilleratos.' },
                    { id: 'IPN', tag: 'Nivel Superior', title: 'Ingreso IPN', duracion: '3 meses', cost: '$5,000 MXN', desc: 'Repaso intensivo de ciencias duras.' },
                  ].map(c => {
                    const isSelected = curso === c.id;
                    return (
                      <div 
                        key={c.id} 
                        onClick={() => setCurso(c.id)}
                        style={{
                          background: isSelected ? 'rgba(30, 58, 138, 0.04)' : 'var(--bg-main)',
                          border: `2px solid ${isSelected ? 'var(--brand-blue)' : 'var(--border-color)'}`,
                          borderRadius: 'var(--radius-md)',
                          padding: '20px',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'var(--transition)',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                        }}
                        onMouseOver={e => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.3)';
                        }}
                        onMouseOut={e => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                      >
                        {c.id === 'UNAM' && (
                          <span style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '12px',
                            background: 'var(--brand-yellow)',
                            color: '#000',
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '100px'
                          }}>{c.tag}</span>
                        )}
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{c.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          <Clock size={12} /> {c.duracion}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px 0', flexGrow: 1, lineHeight: '1.4' }}>{c.desc}</p>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: isSelected ? 'var(--brand-blue)' : 'var(--text-primary)' }}>
                          {c.cost} <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>contado</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selector de Modalidad y Turno */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label className="form-label" style={{ marginBottom: '8px' }}>Modalidad de Estudio *</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                      { id: 'Presencial', label: 'Presencial', icon: <MapPin size={16} /> },
                      { id: 'En linea', label: 'En Línea', icon: <Clock size={16} /> },
                    ].map(m => {
                      const isSelected = modalidad === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setModalidad(m.id)}
                          style={{
                            flex: 1,
                            background: isSelected ? 'var(--brand-blue)' : 'var(--bg-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px',
                            color: isSelected ? 'white' : 'var(--text-primary)',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'var(--transition)'
                          }}
                        >
                          {m.icon} {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ marginBottom: '8px' }}>Turno Asignado *</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                      { id: 'Matutino', label: 'Matutino', desc: '08:00 AM - 01:00 PM' },
                      { id: 'Vespertino', label: 'Vespertino', desc: '02:00 PM - 07:00 PM' },
                    ].map(t => {
                      const isSelected = turno === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTurno(t.id)}
                          style={{
                            flex: 1,
                            background: isSelected ? 'var(--brand-blue)' : 'var(--bg-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px',
                            color: isSelected ? 'white' : 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            transition: 'var(--transition)'
                          }}
                        >
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>{t.label}</span>
                          <span style={{ fontSize: '10px', color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>{t.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- PASO 3: DOCUMENTACIÓN --- */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <span style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                padding: '6px 12px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: '600'
              }}>Formatos Admitidos: PDF</span>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '12px' }}>Cargar Expediente Digital</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Arrastra o selecciona tus archivos oficiales. Recuerda que todos los archivos deben ser estrictamente en formato **PDF**.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                { key: 'acta' as const, name: 'Acta de Nacimiento', desc: 'Copia certificada legible.' },
                { key: 'curp' as const, name: 'CURP', desc: 'Descarga reciente del portal Segob.' },
                { key: 'domicilio' as const, name: 'Comprobante de Domicilio', desc: 'Recibo de luz, agua o teléfono.' },
                { key: 'certificado' as const, name: 'Certificado de Estudios', desc: 'Secundaria o Bachillerato.' },
              ].map(docItem => {
                const itemData = docs[docItem.key];
                return (
                  <div 
                    key={docItem.key}
                    style={{
                      border: `2px dashed ${itemData.status === 'Subido' ? '#16a34a' : itemData.error ? '#ef4444' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '24px',
                      background: itemData.status === 'Subido' ? 'rgba(34, 197, 94, 0.02)' : 'var(--bg-main)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'var(--transition)'
                    }}
                  >
                    {itemData.status === 'Subido' ? (
                      <CheckCircle2 size={32} color="#16a34a" style={{ marginBottom: '12px' }} />
                    ) : (
                      <UploadCloud size={32} color="var(--brand-blue)" style={{ marginBottom: '12px' }} />
                    )}

                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{docItem.name}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>{docItem.desc}</p>

                    {itemData.status === 'Faltante' && (
                      <label style={{
                        background: 'white',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '6px 16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'var(--transition)'
                      }}>
                        Seleccionar PDF
                        <input 
                          type="file" 
                          accept=".pdf"
                          style={{ display: 'none' }}
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(docItem.key, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    )}

                    {itemData.status === 'Subiendo' && (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>Cargando...</div>
                        <div style={{ width: '80%', height: '4px', background: 'var(--border-color)', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ width: `${itemData.progress}%`, height: '100%', background: 'var(--brand-blue)', borderRadius: '100px', transition: 'width 0.2s' }}></div>
                        </div>
                      </div>
                    )}

                    {itemData.status === 'Subido' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                        <FileText size={14} /> {itemData.file?.name.substring(0, 16)}...
                      </div>
                    )}

                    {itemData.error && (
                      <div style={{
                        marginTop: '12px',
                        padding: '6px 12px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#ef4444',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <AlertCircle size={12} /> {itemData.error}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- PASO 4: FINANZAS Y PAGO --- */}
        {step === 4 && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>Configuración de Pago</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Elige la forma de pago preferida. Pagar de contado te asegura la tarifa base neta y más económica del ciclo escolar.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
              
              {/* Formulario Izquierda */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="form-label" style={{ marginBottom: '10px' }}>Selecciona tu Plan Comercial *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Tarjeta Opción 1: Pago de Contado (Foco Positivo Premium) */}
                    <button
                      type="button"
                      onClick={() => setTipoPago('Contado')}
                      style={{
                        width: '100%',
                        background: tipoPago === 'Contado' ? 'rgba(34, 197, 94, 0.04)' : 'var(--bg-main)',
                        border: `2px solid ${tipoPago === 'Contado' ? '#16a34a' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '18px 20px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: tipoPago === 'Contado' ? '#16a34a' : 'rgba(100, 116, 139, 0.1)',
                          color: tipoPago === 'Contado' ? 'white' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--transition)'
                        }}>
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>Pago Único de Contado</strong>
                            <span style={{
                              background: 'rgba(34, 197, 94, 0.15)',
                              color: '#16a34a',
                              fontSize: '10px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '100px'
                            }}>¡Mejor opción! Ahorra 20%</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: tipoPago === 'Contado' ? '#16a34a' : 'var(--text-primary)' }}>
                        ${selectedConfig.costoBase.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>MXN</span>
                      </div>
                    </button>

                    {/* Tarjeta Opción 2: Pago a Plazos */}
                    <button
                      type="button"
                      onClick={() => setTipoPago('Pagos')}
                      style={{
                        width: '100%',
                        background: tipoPago === 'Pagos' ? 'rgba(30, 58, 138, 0.04)' : 'var(--bg-main)',
                        border: `2px solid ${tipoPago === 'Pagos' ? 'var(--brand-blue)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '18px 20px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: tipoPago === 'Pagos' ? 'var(--brand-blue)' : 'rgba(100, 116, 139, 0.1)',
                          color: tipoPago === 'Pagos' ? 'white' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--transition)'
                        }}>
                          <Wallet size={20} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '15px', color: 'var(--text-primary)', display: 'block' }}>Financiado en Mensualidades</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                            Págalo en {mensualidadesDiferidas} cómodos pagos de ${Math.round(costoMensualidad).toLocaleString()} MXN.
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        ${(selectedConfig.costoBase * 1.2).toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>MXN</span>
                      </div>
                    </button>

                  </div>
                </div>


              </div>

              {/* Resumen Comercial Derecha */}
              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  Resumen Comercial
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '14px 16px', fontSize: '13px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Curso Seleccionado</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)', textAlign: 'right' }}>{selectedConfig.name}</span>

                  <span style={{ color: 'var(--text-secondary)' }}>Duración Escolar</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)', textAlign: 'right' }}>{selectedConfig.duracion} meses</span>

                  <span style={{ color: 'var(--text-secondary)' }}>Modalidad y Turno</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)', textAlign: 'right' }}>{modalidad} / {turno}</span>
                  
                  <div style={{ gridColumn: 'span 2', height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

                  <span style={{ color: 'var(--text-secondary)' }}>Costo Base Contado</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'right' }}>${selectedConfig.costoBase.toLocaleString()} MXN</span>

                  {tipoPago === 'Pagos' ? (
                    <>
                      <span style={{ color: 'var(--text-secondary)' }}>Financiamiento Plazos (20%)</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', textAlign: 'right' }}>+${(selectedConfig.costoBase * 0.2).toLocaleString()} MXN</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: '#16a34a', fontWeight: '600' }}>Descuento Contado</span>
                      <span style={{
                        fontSize: '12px', 
                        color: '#16a34a',
                        background: 'rgba(34, 197, 94, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        textAlign: 'right',
                        justifySelf: 'end'
                      }}>-${(selectedConfig.costoBase * 0.2).toLocaleString()} MXN</span>
                    </>
                  )}

                  <span style={{ color: 'var(--text-secondary)' }}>Total Neto del Plan</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'right' }}>${costoTotal.toLocaleString()} MXN</span>

                  <span style={{ color: 'var(--text-secondary)' }}>Pago Inicial</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a', textAlign: 'right' }}>-${pagoInicial.toLocaleString()} MXN</span>

                  <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '130px 1fr', background: 'rgba(0,0,0,0.03)', padding: '10px 12px', borderRadius: '6px', margin: '4px 0', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px' }}>Adeudo Pendiente</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'right' }}>${Math.max(0, costoTotal - pagoInicial).toLocaleString()} MXN</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  marginTop: 'auto',
                  paddingTop: '12px'
                }}>
                  <Award size={14} color="var(--brand-yellow)" /> Estatus de Expediente: 
                  <strong style={{
                    color: docs.acta.status === 'Subido' && docs.curp.status === 'Subido' && docs.domicilio.status === 'Subido' && docs.certificado.status === 'Subido' ? '#16a34a' : '#ca8a04'
                  }}>
                    {docs.acta.status === 'Subido' && docs.curp.status === 'Subido' && docs.domicilio.status === 'Subido' && docs.certificado.status === 'Subido' ? 'Inscrito' : 'Pendiente Docs'}
                  </strong>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* --- PASO 5: CREDENCIAL / FICHA DE ÉXITO --- */}
        {step === 5 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Canvas Flotante Confeti */}
            <canvas ref={canvasRef} style={{
              position: 'absolute',
              top: '-48px',
              left: '-48px',
              right: '-48px',
              bottom: '-48px',
              width: 'calc(100% + 96px)',
              height: 'calc(100% + 96px)',
              pointerEvents: 'none',
              zIndex: 1
            }} />

            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
              animation: 'slideUp 0.3s ease-out',
              zIndex: 2
            }}>
              <Sparkles size={32} />
            </div>

            <div style={{ zIndex: 2, marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>¡Inscripción Registrada con Éxito!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>
                Tu alta autónoma ha finalizado escolarmente. Hemos enviado las notificaciones del alta al tutor en tiempo real.
              </p>
            </div>

            {/* --- Ficha / Credencial Digital --- */}
            <div style={{
              width: '100%',
              maxWidth: '520px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: '32px',
              color: 'white',
              textAlign: 'left',
              boxShadow: 'var(--shadow-hover)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              zIndex: 2
            }}>
              {/* Marcas de Agua de Estilo */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              {/* Cabecera Ficha */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--brand-yellow)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>C</div>
                  <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>CRECE CONTROL</span>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '4px 12px',
                  borderRadius: '100px',
                  textTransform: 'uppercase'
                }}>
                  {docs.acta.status === 'Subido' && docs.curp.status === 'Subido' && docs.domicilio.status === 'Subido' && docs.certificado.status === 'Subido' ? 'Inscrito' : 'Pendiente Docs'}
                </span>
              </div>

              {/* Cuerpo Ficha */}
              <div style={{ display: 'flex', gap: '20px' }}>
                
                {/* QR Code Simulado */}
                <div style={{
                  width: '90px',
                  height: '90px',
                  background: 'white',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  padding: '8px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}>
                  <QrCode size={74} color="#0f172a" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alumno Matriculado</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>{getValues('nombre')}</h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                    <span>Folio: <strong style={{ color: 'white' }}>{folio}</strong></span>
                    <span>ID: <strong style={{ color: 'white' }}>#{newStudentId}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />

              {/* Detalles Curso y Turno */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '2px' }}>Curso</div>
                  <strong style={{ color: 'white' }}>Ingreso {curso}</strong>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '2px' }}>Modalidad</div>
                  <strong style={{ color: 'white' }}>{modalidad}</strong>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '2px' }}>Turno / Horario</div>
                  <strong style={{ color: 'white' }}>{turno}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '11px', marginBottom: '2px' }}>Costo Curso</div>
                  <strong style={{ color: 'white' }}>${costoTotal.toLocaleString()} MXN</strong>
                </div>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '11px', marginBottom: '2px' }}>Pago Inicial</div>
                  <strong style={{ color: 'var(--brand-yellow)' }}>${pagoInicial.toLocaleString()} MXN</strong>
                </div>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '11px', marginBottom: '2px' }}>Adeudo Diferido</div>
                  <strong style={{ color: 'white' }}>${Math.max(0, costoTotal - pagoInicial).toLocaleString()} MXN</strong>
                </div>
              </div>
            </div>

            {/* Footer Acciones */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '40px',
              width: '100%',
              maxWidth: '520px',
              zIndex: 2
            }}>
              <button 
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-main)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <Printer size={16} /> Imprimir Comprobante
              </button>

              <button 
                onClick={() => navigate(`/alumnos/${newStudentId}`)}
                style={{
                  flex: 1.2,
                  background: 'var(--brand-blue)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
                  transition: 'var(--transition)'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--brand-blue)'}
              >
                <UserCheck size={16} /> Ver Expediente Administrativo
              </button>
            </div>

          </div>
        )}

        {/* --- BOTONES DE CONTROL DE FLUJO (Paso 1 a 4) --- */}
        {step < 5 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '40px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '28px'
          }}>
            {step > 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(prev => prev - 1)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'var(--transition)'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-main)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <ChevronLeft size={16} /> Atrás
              </button>
            ) : (
              <div /> // Dummy div to keep alignment
            )}

            <button 
              type="button" 
              disabled={!isStepValid()}
              onClick={handleNext}
              style={{
                background: isStepValid() ? 'var(--brand-blue)' : 'var(--border-color)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 28px',
                fontSize: '14px',
                fontWeight: '600',
                color: isStepValid() ? 'white' : 'var(--text-secondary)',
                cursor: isStepValid() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isStepValid() ? '0 4px 12px rgba(30, 58, 138, 0.15)' : 'none',
                transition: 'var(--transition)'
              }}
              onMouseOver={e => {
                if (isStepValid()) e.currentTarget.style.background = '#1d4ed8';
              }}
              onMouseOut={e => {
                if (isStepValid()) e.currentTarget.style.background = 'var(--brand-blue)';
              }}
            >
              {step === 4 ? 'Confirmar Inscripción' : 'Continuar'} <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
