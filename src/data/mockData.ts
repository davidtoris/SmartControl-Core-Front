export const enrollmentData = [
  { name: 'Ene', alumnos: 12 },
  { name: 'Feb', alumnos: 19 },
  { name: 'Mar', alumnos: 15 },
  { name: 'Abr', alumnos: 45 },
  { name: 'May', alumnos: 32 },
  { name: 'Jun', alumnos: 25 },
];

export const academicData = [
  { name: 'Matemáticas', promedio: 8.5, simulacro: 7.2 },
  { name: 'Español', promedio: 9.1, simulacro: 8.5 },
  { name: 'Ciencias', promedio: 7.8, simulacro: 6.9 },
];

export const notifications = [
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

export const mockStudents = [
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

export const mockTransactions = [
  { id: 'REC-001', type: 'Entrada', student: 'Ana Sofía Martínez', concept: 'Pago 1/3', amount: 4000, date: '05 May 2026', status: 'Pagado' },
  { id: 'REC-002', type: 'Entrada', student: 'Luis Fernando Gómez', concept: 'Pago Único', amount: 10000, date: '05 May 2026', status: 'Vencido' },
  { id: 'REC-003', type: 'Entrada', student: 'Valeria Rojas', concept: 'Pago 3/8', amount: 2000, date: '10 May 2026', status: 'Pendiente' },
  { id: 'GAS-001', type: 'Salida', student: '-', concept: 'Pago de Publicidad FB', amount: 3500, date: '12 May 2026', status: 'Pagado' },
  { id: 'GAS-002', type: 'Salida', student: '-', concept: 'Mantenimiento', amount: 1200, date: '14 May 2026', status: 'Pagado' },
];
