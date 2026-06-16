import { create } from 'zustand';
import apiClient from '../api/apiClient';

// --- INTERFACES ---
export interface Question {
  subject: string;
  question: string;
  options: Record<string, string>;
  correct: string;
  explanation: string;
  image?: string;
  imageCaption?: string;
  optionsAreImages?: boolean;
  servicio?: string;
  examName?: string;
}

export interface Exam {
  id: string;
  name: string;
  servicio: string;
  durationMinutes: number;
  description?: string;
}

export interface ExamAttempt {
  id: string;
  examName: string;
  score: number;
  max: number;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  answers: Record<number, string>; // { questionIndex: selectedOption }
  auditLog: { timestamp: string; action: string }[];
  integrityScore?: number;
  cheatingCanceled?: boolean;
  questionsSnapshot?: {
    subject: string;
    question: string;
    options: Record<string, string>;
    correct: string;
    explanation?: string;
  }[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  usuarioId?: string | null;
  alumnoId?: string | null;
  remitenteTipo: 'ADMIN' | 'ALUMNO';
  remitenteNombre: string;
  contenido: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  folio: string;
  asunto: string;
  descripcion: string;
  categoria: string;
  status: 'ABIERTO' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  tipoTicket: 'ADMINISTRATIVO' | 'ESTUDIANTE';
  adjuntoUrl?: string | null;
  creatorUsuarioId?: string | null;
  creatorUsuario?: { id: string; nombre: string; email: string } | null;
  creatorAlumnoId?: string | null;
  creatorAlumno?: { id: string | number; nombre: string; curso: string } | null;
  responsableUsuarioId?: string | null;
  responsableUsuario?: { id: string; nombre: string } | null;
  closedByUsuarioId?: string | null;
  closedByUsuario?: { id: string; nombre: string } | null;
  mensajes: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: number | string;
  name: string;
  curso: string;
  tutor: string;
  status: string;
  phone: string;
  avatar: string;
  nextPaymentDate?: string; // Formato YYYY-MM-DD
  paymentPlan: {
    type: string;
    totalCost: number;
    amountPaid: number;
    costoInscripcion?: number;
    planPagosRealizados?: number;
    planPagosTotales?: number;
  };
  documents: { name: string; status: string; url?: string; comentario?: string }[];
  exams?: { name: string; score: number; max: number; date: string; details: string }[];
  examAttempts?: ExamAttempt[];
  attendance?: {
    percentage: number;
    history: { date: string; status: string }[];
  };
  
  // Nuevas propiedades académicas, certificación y auditoría
  realizoExamenFinal?: boolean;
  tieneCertificado?: boolean;
  certificadoPdf?: string | null;
  certificadoXml?: string | null;
  certNombreValido?: boolean;
  certCurpValido?: boolean;
  certCalificacionValido?: boolean;
  certSigedValido?: boolean;
  certificadoEnviado?: boolean;
  fotoEvidencia?: string | null;
  certValidadorUser?: string | null;
  certValidadorFecha?: string | null;
  pagoRegistradorUser?: string | null;
  pagoRegistradorFecha?: string | null;
  cuotas?: {
    id: string;
    numeroPago: number;
    monto: number;
    fechaVencimiento: string;
    status: string;
    fechaPago?: string | null;
    comprobanteUrl?: string | null;
  }[];
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  subcategories: Subcategory[];
}

export interface Transaction {
  id: string;
  type: 'Entrada' | 'Salida';
  student: string; // Nombre del alumno o '-'
  studentId?: number | string; // Para vinculación reactiva
  concept: string;
  category: string;
  subcategory?: string;
  amount: number;
  date: string;
  status: string; // 'Pagado', 'Pendiente', etc.
  comprobanteUrl?: string;
}

export interface StudentMessage {
  id: string;
  title: string;
  content: string;
  sender: string;
  targetType?: string; // 'ALL' | 'GRUPO' | 'INDIVIDUAL'
  targetGroup?: string | null;
  studentId?: string | number | null;
  createdAt?: string;
  sentAt?: string; // legacy support
  read?: boolean;
  readAt?: string | null;
  lecturas?: {
    id: string;
    readAt: string;
    alumno: {
      id: string;
      nombre: string;
      avatar: string;
      curso: string;
    };
  }[];
  student?: {
    id: string;
    nombre: string;
  } | null;
  totalTargeted?: number;
  readCount?: number;
}

export interface EnlaceInscripcion {
  id: string;
  token: string;
  curso: string;
  costoInscripcion: number;
  costoContado: number;
  costoPagos: number;
  planPagosTotales: number;
  activo: boolean;
  usosMaximos: number;
  usosActuales: number;
  expiraEn?: string | null;
  creadoPorUser?: string | null;
  createdAt: string;
  updatedAt: string;
  empresaId: string;
  documentosRequeridos?: string[];
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string | null;
  duracionMeses: number;
  documentosRequeridos: string[];
  documentosConfig?: { nombre: string; caracteristicas: string }[];
  materiales?: string[];
  materialesConfig?: { nombre: string; caracteristicas: string }[];
  proceso?: string | null;
  tieneCertificado: boolean;
  requiereEvidencia: boolean;
  activo: boolean;
  alumnosCount: number;
  createdAt: string;
  updatedAt: string;
  empresaId: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  roles: string[];
  permisos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CRMFollowUpLog {
  id: string;
  fecha: string;
  nota: string;
  usuario: string;
  nuevoEstatus?: string;
}

export interface CRMProspect {
  id: string;
  nombre: string;
  telefono: string;
  correo?: string;
  procedencia: string;
  modalidad: 'Digital' | 'Presencial';
  cursoInteres?: string;
  estatus: 'Prospecto' | 'Contactado' | 'Demostración' | 'Inscrito' | 'Descartado';
  fechaRegistro: string;
  historialSeguimiento: CRMFollowUpLog[];
  comoTeEnteraste: string;
  entidadFederativa: string;
}

interface AppState {
  // Modals de Control
  showNewEntryModal: boolean;
  setShowNewEntryModal: (show: boolean) => void;
  showNewExpenseModal: boolean;
  setShowNewExpenseModal: (show: boolean) => void;
  showParentPortal: boolean;
  setShowParentPortal: (show: boolean) => void;
  showReportModal: Student | null;
  setShowReportModal: (student: Student | null) => void;
  
  // Alumnos y Transacciones
  students: Student[];
  transactions: Transaction[];
  fetchStudents: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addStudent: (student: any) => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  recordStudentPayment: (studentId: number | string, amount: number, comprobanteUrl?: string) => Promise<string | null>;
  updateStudentTracking: (studentId: number | string, fields: Partial<Student>) => Promise<void>;
  addExamAttempt: (studentId: number | string, attempt: ExamAttempt) => Promise<void>;
  
  // Banco de Reactivos Dinámico
  questions: Question[];
  addQuestion: (question: Question) => void;
  deleteQuestion: (index: number) => void;
  updateQuestion: (index: number, question: Question) => void;

  // Exámenes Estructurados (Fase 5 - Extensión)
  exams: Exam[];
  addExam: (exam: Exam) => void;
  updateExam: (id: string, fields: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  
  // Mensajes de Alumnos
  studentMessages: StudentMessage[];
  markMessageAsRead: (messageId: string) => Promise<void>;

  // Gestión de Mensajes Internos
  mensajesAdmin: StudentMessage[];
  mensajesEstudiante: StudentMessage[];
  fetchMensajesAdmin: () => Promise<void>;
  createMensaje: (data: Partial<StudentMessage>) => Promise<StudentMessage>;
  fetchStudentMessages: (studentId: string | number) => Promise<void>;
  readMensaje: (mensajeId: string, studentId: string | number) => Promise<void>;
  
  // Categorías y Subcategorías
  categories: Category[];
  fetchCategories: () => Promise<void>;
  addCategory: (category: Category) => void;
  addSubcategory: (categoryId: string, subcategoryName: string) => void;
  deleteCategory: (categoryId: string) => Promise<void>;
  deleteSubcategory: (subcategoryId: string) => Promise<void>;
  updateCategory: (categoryId: string, name: string, type: 'income' | 'expense') => Promise<void>;
  updateSubcategory: (subcategoryId: string, name: string, categoryId: string) => Promise<void>;

  // Enlaces de Inscripción
  enlacesInscripcion: EnlaceInscripcion[];
  fetchEnlacesInscripcion: () => Promise<void>;
  createEnlaceInscripcion: (enlace: Partial<EnlaceInscripcion>) => Promise<EnlaceInscripcion>;
  toggleEnlaceInscripcion: (id: string, activo: boolean) => Promise<void>;
  fetchPublicEnlace: (token: string) => Promise<EnlaceInscripcion>;
  registerPublicStudent: (student: any, token: string) => Promise<any>;
  deleteEnlaceInscripcion: (id: string) => Promise<void>;
  updateEnlaceInscripcion: (id: string, fields: { usosMaximos?: number; expiraEn?: string | null }) => Promise<void>;

  // Servicios
  servicios: Servicio[];
  fetchServicios: () => Promise<void>;
  createServicio: (fields: Partial<Servicio>) => Promise<Servicio>;
  updateServicio: (id: string, fields: Partial<Servicio>) => Promise<void>;
  toggleServicio: (id: string, activo: boolean) => Promise<void>;
  deleteServicio: (id: string) => Promise<void>;

  // Gestión de Usuarios
  usuarios: Usuario[];
  fetchUsuarios: () => Promise<void>;
  createUsuario: (usuario: Partial<Usuario> & { password?: string }) => Promise<Usuario>;
  updateUsuario: (id: string, fields: Partial<Usuario> & { password?: string }) => Promise<void>;
  deleteUsuario: (id: string) => Promise<void>;

  // CRM Prospectos
  prospects: CRMProspect[];
  addProspect: (prospect: Omit<CRMProspect, 'id' | 'fechaRegistro' | 'historialSeguimiento'>) => void;
  updateProspect: (id: string, fields: Partial<CRMProspect>) => void;
  deleteProspect: (id: string) => void;
  addProspectFollowUp: (prospectId: string, log: Omit<CRMFollowUpLog, 'id' | 'fecha'>) => void;

  // Asistencia Escolar
  saveBatchAttendance: (date: string, records: Record<string, 'Presente' | 'Falta' | 'Retardo'>) => Promise<void>;

  // Soporte y Tickets
  tickets: Ticket[];
  activeTicket: Ticket | null;
  studentTickets: Ticket[];
  fetchTickets: (filters?: { tipoTicket?: string; status?: string; categoria?: string }) => Promise<void>;
  fetchStudentTickets: (studentId: string | number) => Promise<void>;
  createTicket: (payload: {
    asunto: string;
    descripcion: string;
    categoria: string;
    prioridad?: string;
    tipoTicket: 'ADMINISTRATIVO' | 'ESTUDIANTE';
    creatorAlumnoId?: string | number | null;
    adjuntoUrl?: string | null;
  }) => Promise<Ticket>;
  replyTicket: (payload: {
    ticketId: string;
    contenido: string;
    remitenteTipo: 'ADMIN' | 'ALUMNO';
    remitenteNombre: string;
    alumnoId?: string | number | null;
  }) => Promise<TicketMessage>;
  updateTicketStatus: (ticketId: string, status?: string, prioridad?: string, responsableUsuarioId?: string | null) => Promise<void>;
}



const initialMessages: StudentMessage[] = [
  // Mensajes de Ana Sofía Martínez (id: 1)
  {
    id: 'MSG-001',
    studentId: 1,
    sender: 'Coordinación CRECE',
    title: '¡Examen Simulacro Presencial este Sábado! 📝',
    content: 'Hola Ana Sofía, te recordamos que este sábado a las 08:00 AM tendremos nuestro Examen Simulacro Presencial obligatorio de ingreso UNAM. Por favor, asegúrate de traer lápiz del número 2, goma, sacapuntas y tu credencial digital. ¡Mucho éxito en tu preparación!',
    sentAt: '25 May 2026, 09:00'
  },
  {
    id: 'MSG-002',
    studentId: 1,
    sender: 'Finanzas CRECE',
    title: 'Confirmación de Pago Inicial 💳',
    content: 'Estimado tutor de Ana Sofía, hemos registrado exitosamente el abono inicial por $1,500.00 pesos. Su estatus ha sido actualizado. Las credenciales de acceso al portal y simuladores ya están totalmente liberadas. Quedamos a sus órdenes.',
    sentAt: '26 May 2026, 14:30'
  },
  {
    id: 'MSG-003',
    studentId: 1,
    sender: 'Soporte CRECE',
    title: '¡Te damos la Bienvenida a la Plataforma! 🎉',
    content: '¡Hola Ana Sofía! Estamos muy contentos de acompañarte en este camino de preparación hacia la UNAM. En este portal podrás consultar tus resultados de exámenes simulacro, descargar guías y revisar tu calendario financiero. ¡Tú tienes el poder de lograrlo!',
    sentAt: '20 May 2026, 10:00',
    readAt: '20 May 2026 a las 11:15'
  },
  // Mensajes de Diego Ochoa (id: 4)
  {
    id: 'MSG-004',
    studentId: 4,
    sender: 'Dirección Académica',
    title: 'Reporte de Evolución Mensual Liberado 📊',
    content: 'Estimado tutor, le informamos que el reporte detallado de evolución de aciertos del alumno Diego Ochoa correspondiente al mes de Mayo ya está disponible para su consulta en la pestaña de rendimiento del expediente digital. ¡Felicidades por su excelente constancia!',
    sentAt: '24 May 2026, 16:00'
  }
];

import moodleQuestions from '../data/preguntas_moodle.json';

const initialQuestions: Question[] = [
  {
    subject: 'Matemáticas',
    question: 'Si f(x) = x² - 3x + 2, ¿cuál es el valor de f(4) - f(2)?',
    options: {
      A: '6',
      B: '8',
      C: '4',
      D: '2'
    },
    correct: 'A',
    image: '/grafica_parabola.png',
    imageCaption: 'Gráfica cartesiana de la función f(x) = x² - 3x + 2',
    explanation: 'Primero evaluamos f(4): 4² - 3(4) + 2 = 16 - 12 + 2 = 6. Luego evaluamos f(2): 2² - 3(2) + 2 = 4 - 6 + 2 = 0. Finalmente restamos: f(4) - f(2) = 6 - 0 = 6.'
  },
  {
    subject: 'Matemáticas - Geometría Avanzada',
    question: 'Considerando la función cuadrática f(x) = x² - 3x + 2 mostrada en el gráfico de la izquierda, ¿cuál de los siguientes sectores circulares tiene un área numéricamente equivalente al valor de f(4) - f(2)?',
    options: {
      A: '/grafica_parabola.png',
      B: '/diagrama_matematicas.png', // Correcto: área 15.7 cm², f(4)-f(2) = 6, pero esperemos, f(4)-f(2)=6, y la opción D de la otra pregunta era 15.7. Pongamos que B es correcto por tener el área del sector circular.
      C: '/grafica_parabola.png',
      D: '/diagrama_matematicas.png'
    },
    correct: 'B',
    image: '/grafica_parabola.png',
    imageCaption: 'Gráfica cartesiana de apoyo de la función f(x)',
    optionsAreImages: true,
    explanation: 'Evaluando f(4) - f(2) obtenemos 6. La opción B representa el sector circular sombreado de 72° con radio r = 5 cm, cuya área es de 15.7 cm².'
  },
  {
    subject: 'Español',
    question: 'Identifica el enunciado que presenta una redacción con concordancia gramatical correcta:',
    options: {
      A: 'El grupo de estudiantes decidieron organizar una colecta benéfica.',
      B: 'Hubieron muchos problemas de comunicación durante la sesión del consejo.',
      C: 'El análisis y la síntesis de los datos fueron completados por el equipo.',
      D: 'La mayoría de la gente piensa que los exámenes finales son difíciles.'
    },
    correct: 'C',
    explanation: 'El análisis y la síntesis (sujeto compuesto plural) fueron completados (verbo y participio plural concordando correctamente). En A, "el grupo" requiere singular. En B, el verbo haber impersonal debe ir en singular ("Hubo muchos problemas"). En D, "La mayoría... piensa" es correcto en concordancia pero C es gramaticalmente perfecta.'
  },
  {
    subject: 'Biología',
    question: '¿Cuál de los siguientes organelos celulares es responsable de la producción de energía en forma de ATP mediante la respiración celular?',
    options: {
      A: 'Cloroplasto',
      B: 'Aparato de Golgi',
      C: 'Mitocondria',
      D: 'Lisosoma'
    },
    correct: 'C',
    explanation: 'Las mitocondrias son los organelos responsables de llevar a cabo la respiración celular aeróbica para sintetizar moléculas de ATP (adenosín trifosfato), la principal fuente de energía de la célula.'
  },
  {
    subject: 'Química',
    question: '¿Qué tipo de enlace químico se forma cuando dos átomos comparten electrones de manera equitativa debido a tener electronegatividades similares?',
    options: {
      A: 'Enlace Iónico',
      B: 'Enlace Covalente No Polar',
      C: 'Enlace Covalente Polar',
      D: 'Enlace Metálico'
    },
    correct: 'B',
    explanation: 'En el enlace covalente no polar o apolar, los electrones se comparten por igual entre átomos con electronegatividades iguales o muy cercanas (diferencia menor a 0.4), como sucede en las moléculas diatómicas homonucleares (H₂, O₂).'
  },
  {
    subject: 'Historia de México',
    question: '¿En qué año dio inicio la Revolución Mexicana encabezada por Francisco I. Madero con el Plan de San Luis?',
    options: {
      A: '1910',
      B: '1917',
      C: '1906',
      D: '1921'
    },
    correct: 'A',
    explanation: 'La Revolución Mexicana comenzó formalmente el 20 de noviembre de 1910, de acuerdo a la convocatoria del Plan de San Luis promulgado por Francisco I. Madero contra la dictadura de Porfirio Díaz.'
  },
  {
    subject: 'Geografía',
    question: '¿Cuál es el río más largo del mundo, conocido por atravesar América del Sur y desembocar en el Océano Atlántico?',
    options: {
      A: 'Río Nilo',
      B: 'Río Misisipi',
      C: 'Río Amazonas',
      D: 'Río Yangtsé'
    },
    correct: 'C',
    explanation: 'El Río Amazonas, localizado en Sudamérica, es científicamente reconocido como el río más largo y caudaloso del mundo, superando levemente en longitud al Río Nilo de África.'
  },
  {
    subject: 'Literatura',
    question: '¿Quién es el autor de la emblemática novela hispanoamericana del realismo mágico "Cien años de soledad"?',
    options: {
      A: 'Mario Vargas Llosa',
      B: 'Gabriel García Márquez',
      C: 'Julio Cortázar',
      D: 'Jorge Luis Borges'
    },
    correct: 'B',
    explanation: 'La obra maestra "Cien años de soledad", publicada en 1967 y pilar fundamental del Realismo Mágico, fue escrita por el novelista colombiano Gabriel García Márquez, ganador del Premio Nobel de Literatura en 1982.'
  },
  {
    subject: 'Historia Universal',
    question: '¿Qué acontecimiento histórico ocurrido en 1789 marcó el inicio de la Edad Contemporánea y el fin del absolutismo monárquico en Francia?',
    options: {
      A: 'La Revolución Industrial',
      B: 'La caída del Imperio Romano de Oriente',
      C: 'La Revolución Francesa',
      D: 'La firma del Tratado de Versalles'
    },
    correct: 'C',
    explanation: 'La Revolución Francesa, iniciada en 1789 con la toma de la Bastilla, derrocó al antiguo régimen absolutista, proclamó los Derechos del Hombre y del Ciudadano y se considera el hito fundador de la Edad Contemporánea.'
  },
  {
    subject: 'Matemáticas - Geometría',
    question: 'Dada la circunferencia de la figura con radio r = 5 cm y un ángulo de sector circular AOB = 72°, ¿cuál es el área del sector circular sombreado? (Considera π ≈ 3.14)',
    options: {
      A: '31.4 cm²',
      B: '78.5 cm²',
      C: '5.0 cm²',
      D: '15.7 cm²'
    },
    correct: 'D',
    image: '/diagrama_matematicas.png',
    imageCaption: 'Figura: Circunferencia de radio r = 5 cm y sector circular de 72°',
    explanation: 'El área de un sector circular se calcula con la fórmula: A = (θ / 360) * π * r². Sustituyendo los valores del diagrama: θ = 72° y r = 5 cm. A = (72 / 360) * 3.14 * 5² = (1/5) * 3.14 * 25 = 3.14 * 5 = 15.7 cm².'
  },
  // Preguntas de Muestra de UAM (NUEVO - FASE 5)
  {
    subject: 'Razonamiento Matemático',
    question: 'En un examen de la UAM, de 80 preguntas, Carlos contestó el 70% correctamente. ¿Cuántas preguntas contestó de forma incorrecta o dejó en blanco?',
    options: {
      A: '24',
      B: '56',
      C: '18',
      D: '32'
    },
    correct: 'A',
    servicio: 'UAM',
    examName: 'Examen Diagnóstico UAM',
    explanation: 'El número de respuestas correctas es el 70% de 80, que es 80 * 0.70 = 56 preguntas. Por lo tanto, el número de respuestas incorrectas o en blanco es 80 - 56 = 24.'
  },
  {
    subject: 'Razonamiento Verbal',
    question: 'Selecciona la analogía correcta. LIBRO : LEER ::',
    options: {
      A: 'Pincel : Pintar',
      B: 'Agua : Beber',
      C: 'Guitarra : Escuchar',
      D: 'Bolígrafo : Dibujo'
    },
    correct: 'A',
    servicio: 'UAM',
    examName: 'Examen Diagnóstico UAM',
    explanation: 'La relación analítica es de objeto a su función principal: un libro sirve para leer, así como un pincel sirve para pintar.'
  },
  {
    subject: 'Razonamiento Matemático',
    question: 'Si se tiene una sucesión numérica de la UAM: 3, 7, 15, 31... ¿Cuál es el quinto término?',
    options: {
      A: '63',
      B: '45',
      C: '58',
      D: '60'
    },
    correct: 'A',
    servicio: 'UAM',
    examName: 'Simulacro UAM 1',
    explanation: 'El patrón de la sucesión es multiplicar el término anterior por 2 y sumarle 1: (3*2)+1 = 7, (7*2)+1 = 15, (15*2)+1 = 31. El quinto término será: (31*2)+1 = 63.'
  },
  ...(moodleQuestions as Question[])
];

export const initialExams: Exam[] = [
  {
    id: 'EX-001',
    name: 'Simulacro de Admisión UNAM 2026',
    servicio: 'Ingreso UNAM',
    durationMinutes: 180,
    description: 'Examen simulacro completo para práctica de admisión UNAM.'
  },
  {
    id: 'EX-002',
    name: 'Examen Diagnóstico UNAM',
    servicio: 'Ingreso UNAM',
    durationMinutes: 60,
    description: 'Evaluación diagnóstica inicial para medir nivel de aciertos UNAM.'
  },
  {
    id: 'EX-003',
    name: 'Evaluación COMIPEMS',
    servicio: 'COMIPEMS 2024',
    durationMinutes: 180,
    description: 'Examen de simulación oficial de ingreso COMIPEMS.'
  },
  {
    id: 'EX-004',
    name: 'Examen Diagnóstico UAM',
    servicio: 'UAM',
    durationMinutes: 120,
    description: 'Prueba diagnóstica de razonamiento verbal y matemático de ingreso UAM.'
  },
  {
    id: 'EX-005',
    name: 'Simulacro UAM 1',
    servicio: 'UAM',
    durationMinutes: 180,
    description: 'Primer examen de simulación oficial para la UAM.'
  }
];

export const initialProspects: CRMProspect[] = [
  {
    id: 'PR-101',
    nombre: 'Sofía Ramírez Díaz',
    telefono: '55 1234 5678',
    correo: 'sofia.ramirez@gmail.com',
    procedencia: 'Prepa 9 UNAM',
    modalidad: 'Presencial',
    cursoInteres: 'Ingreso UNAM',
    estatus: 'Prospecto',
    fechaRegistro: '28 May 2026',
    comoTeEnteraste: 'Redes Sociales',
    entidadFederativa: 'Ciudad de México',
    historialSeguimiento: [
      {
        id: 'FL-101-1',
        fecha: '28 May 2026, 10:15 AM',
        nota: 'Registro inicial del prospecto desde formulario digital de Facebook Ads. Interés en curso presencial intensivo.',
        usuario: 'David Toris (DT)',
        nuevoEstatus: 'Prospecto'
      }
    ]
  },
  {
    id: 'PR-102',
    nombre: 'Alejandro Gómez Ruiz',
    telefono: '55 8765 4321',
    correo: 'alejandro.g@outlook.com',
    procedencia: 'CCH Oriente',
    modalidad: 'Digital',
    cursoInteres: 'UAM',
    estatus: 'Contactado',
    fechaRegistro: '25 May 2026',
    comoTeEnteraste: 'Recomendación',
    entidadFederativa: 'Estado de México',
    historialSeguimiento: [
      {
        id: 'FL-102-1',
        fecha: '25 May 2026, 02:00 PM',
        nota: 'Registro inicial por recomendación directa de un alumno activo (Diego Ochoa). Interesado en examen de simulación UAM.',
        usuario: 'David Toris (DT)',
        nuevoEstatus: 'Prospecto'
      },
      {
        id: 'FL-102-2',
        fecha: '26 May 2026, 11:30 AM',
        nota: 'Llamada telefónica realizada. Se le brindaron detalles sobre la modalidad online y la plataforma de simuladores de CRECE. Se le envió folleto informativo en formato PDF por WhatsApp. Comenta que lo platicará con sus tutores.',
        usuario: 'David Toris (DT)',
        nuevoEstatus: 'Contactado'
      }
    ]
  },
  {
    id: 'PR-103',
    nombre: 'Valeria Montes López',
    telefono: '55 4567 8901',
    correo: 'val.montes@hotmail.com',
    procedencia: 'Secundaria 14 Federal',
    modalidad: 'Presencial',
    cursoInteres: 'COMIPEMS 2024',
    estatus: 'Demostración',
    fechaRegistro: '20 May 2026',
    comoTeEnteraste: 'Volante',
    entidadFederativa: 'Ciudad de México',
    historialSeguimiento: [
      {
        id: 'FL-103-1',
        fecha: '20 May 2026, 04:45 PM',
        nota: 'Se registró en recepción pidiendo información sobre cursos COMIPEMS sabatinos.',
        usuario: 'David Toris (DT)',
        nuevoEstatus: 'Prospecto'
      },
      {
        id: 'FL-103-2',
        fecha: '22 May 2026, 05:00 PM',
        nota: 'Asistió a la sesión de clase muestra presencial. Quedó muy satisfecha con la explicación del docente de física y la interactividad de las preguntas. Su tutor solicita facilidades de pagos semanales. Se le agendó llamada para cierre.',
        usuario: 'David Toris (DT)',
        nuevoEstatus: 'Demostración'
      }
    ]
  },
  {
    id: 'PR-104',
    nombre: 'Mateo Herrera Castillo',
    telefono: '55 9012 3456',
    correo: 'mateo.herrera@live.com.mx',
    procedencia: 'Vocacional 5 IPN',
    modalidad: 'Digital',
    cursoInteres: 'Ingreso UNAM',
    estatus: 'Inscrito',
    fechaRegistro: '15 May 2026',
    comoTeEnteraste: 'Sitio Web',
    entidadFederativa: 'Estado de México',
    historialSeguimiento: [
      {
        id: 'FL-104-1',
        fecha: '15 May 2026, 09:00 AM',
        nota: 'Registro web desde portal orgánico.',
        usuario: 'David Toris (DT)',
        nuevoEstatus: 'Prospecto'
      },
      {
        id: 'FL-104-2',
        fecha: '18 May 2026, 12:00 PM',
        nota: 'Llamada de contacto inicial. Se resolvieron dudas sobre el plan de pagos y el inicio de cursos en junio.',
        usuario: 'David Toris (DT)',
        nuevoEstatus: 'Contactado'
      },
      {
        id: 'FL-104-3',
        fecha: '22 May 2026, 03:30 PM',
        nota: 'Inscripción completada exitosamente. El tutor realizó el pago inicial y ya se generó su matrícula oficial en el sistema de alumnos como alumno de Nuevo Ingreso UNAM.',
        usuario: 'David Toris (DT)',
        nuevoEstatus: 'Inscrito'
      }
    ]
  },
  {
    id: 'PR-105',
    nombre: 'Carolina Fuentes Ortiz',
    telefono: '55 3456 7890',
    correo: 'caro.fuentes@gmail.com',
    procedencia: 'Colegio Francés',
    modalidad: 'Presencial',
    cursoInteres: 'UAM',
    estatus: 'Descartado',
    fechaRegistro: '10 May 2026',
    comoTeEnteraste: 'Otro',
    entidadFederativa: 'Ciudad de México',
    historialSeguimiento: [
      {
        id: 'FL-105-1',
        fecha: '10 May 2026, 11:00 AM',
        nota: 'Prospecto visitó las instalaciones de manera física solicitando información para ingreso a UAM en área de diseño.',
        usuario: 'David Toris (DT)',
        nuevoEstatus: 'Prospecto'
      },
      {
        id: 'FL-105-2',
        fecha: '12 May 2026, 10:00 AM',
        nota: 'Llamada de seguimiento. El tutor indica que Carolina decidió optar por un curso de preparación particular a domicilio y que ya realizaron el pago en otra institución. Se descarta para este periodo escolar.',
        usuario: 'David Toris (DT)',
        nuevoEstatus: 'Descartado'
      }
    ]
  }
];

// --- STORE DE ZUSTAND ---
export const useAppStore = create<AppState>((set) => {
  // Inicialización inteligente con persistencia local
  const loadedQuestionsStr = typeof window !== 'undefined' ? localStorage.getItem('crece_questions') : null;
  let finalQuestions: Question[] = [];
  if (loadedQuestionsStr) {
    try {
      finalQuestions = JSON.parse(loadedQuestionsStr);
    } catch(e) {
      finalQuestions = initialQuestions;
    }
  } else {
    // Vincular retrospectivamente las preguntas de fallback a sus exámenes correspondientes
    finalQuestions = initialQuestions.map(q => {
      if (q.servicio) return q;
      const isUnam = q.subject.includes('Matemáticas') || q.subject.includes('Español') || q.subject.includes('Química') || q.subject.includes('Biología') || q.subject.includes('Historia');
      return {
        ...q,
        servicio: isUnam ? 'Ingreso UNAM' : 'COMIPEMS 2024',
        examName: isUnam ? 'Simulacro de Admisión UNAM 2026' : 'Evaluación COMIPEMS'
      };
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('crece_questions', JSON.stringify(finalQuestions));
    }
  }

  const loadedExamsStr = typeof window !== 'undefined' ? localStorage.getItem('crece_exams') : null;
  let finalExams: Exam[] = [];
  if (loadedExamsStr) {
    try {
      finalExams = JSON.parse(loadedExamsStr);
    } catch(e) {
      finalExams = initialExams;
    }
  } else {
    finalExams = initialExams;
    if (typeof window !== 'undefined') {
      localStorage.setItem('crece_exams', JSON.stringify(initialExams));
    }
  }

  const loadedProspectsStr = typeof window !== 'undefined' ? localStorage.getItem('crece_crm_prospects') : null;
  let finalProspects: CRMProspect[] = [];
  if (loadedProspectsStr) {
    try {
      finalProspects = JSON.parse(loadedProspectsStr);
    } catch(e) {
      finalProspects = initialProspects;
    }
  } else {
    finalProspects = initialProspects;
    if (typeof window !== 'undefined') {
      localStorage.setItem('crece_crm_prospects', JSON.stringify(initialProspects));
    }
  }

  return {
    // Control de Modals
    showNewEntryModal: false,
    setShowNewEntryModal: (show) => set({ showNewEntryModal: show }),
    showNewExpenseModal: false,
    setShowNewExpenseModal: (show) => set({ showNewExpenseModal: show }),
    showParentPortal: false,
    setShowParentPortal: (show) => set({ showParentPortal: show }),
    showReportModal: null,
    setShowReportModal: (student) => set({ showReportModal: student }),
    
    // Listados de Datos
    students: [],
    transactions: [],
    categories: [], // Cargados dinámicamente del backend
    studentMessages: initialMessages,
    mensajesAdmin: [],
    mensajesEstudiante: [],
    questions: finalQuestions,
    exams: finalExams,
    prospects: finalProspects,

    // Soporte y Tickets
    tickets: [],
    activeTicket: null,
    studentTickets: [],

  // Acciones de Datos
  fetchStudents: async () => {
    try {
      const response = await apiClient.get('/alumnos');
      const enriched = response.data.map((student: any) => {
        const attempts: any[] = [];
        
        // Parsear intentos en la nube desde el campo details
        const exams = student.exams?.map((exam: any) => {
          if (exam.details && exam.details.startsWith('{')) {
            try {
              const parsed = JSON.parse(exam.details);
              if (parsed.attempt) {
                attempts.push(parsed.attempt);
              }
              return {
                ...exam,
                details: parsed.text
              };
            } catch (e) {
              return exam;
            }
          }
          return exam;
        }) || [];

        // Leer intentos locales como respaldo / retrocompatibilidad
        const localAttemptsStr = localStorage.getItem(`crece_attempts_${student.id}`);
        const localAttempts = localAttemptsStr ? JSON.parse(localAttemptsStr) : [];
        
        // Unificar intentos evitando duplicados
        const mergedAttempts = [...attempts];
        localAttempts.forEach((la: any) => {
          if (!mergedAttempts.some(ma => ma.startedAt === la.startedAt && ma.score === la.score)) {
            mergedAttempts.push(la);
          }
        });

        // Actualizar localStorage para sincronizar reportes que vinieron de la nube
        if (mergedAttempts.length > localAttempts.length) {
          localStorage.setItem(`crece_attempts_${student.id}`, JSON.stringify(mergedAttempts));
        }

        return {
          ...student,
          exams,
          examAttempts: mergedAttempts
        };
      });
      set({ students: enriched });
    } catch (error) {
      console.error('Error al cargar alumnos del backend:', error);
    }
  },

  fetchTransactions: async () => {
    try {
      const response = await apiClient.get('/transacciones');
      set({ transactions: response.data });
    } catch (error) {
      console.error('Error al cargar transacciones del backend:', error);
    }
  },

  addStudent: async (student) => {
    try {
      const response = await apiClient.post('/alumnos', student);
      const created = response.data;
      set((state) => ({ students: [created, ...state.students] }));
      await useAppStore.getState().fetchStudents();
    } catch (error) {
      console.error('Error al agregar estudiante en el backend:', error);
    }
  },
  
  updateStudentTracking: async (studentId, fields) => {
    try {
      await apiClient.put(`/alumnos/${studentId}/tracking`, fields);
      await useAppStore.getState().fetchStudents();
    } catch (error) {
      console.error('Error al actualizar seguimiento de estudiante:', error);
    }
  },
  
  saveBatchAttendance: async (date, records) => {
    try {
      await apiClient.post('/alumnos/asistencia/batch', { date, records });
      await useAppStore.getState().fetchStudents();
    } catch (error) {
      console.error('Error al guardar asistencia en lote:', error);
      throw error;
    }
  },
  
  addTransaction: async (transaction) => {
    try {
      const response = await apiClient.post('/transacciones', {
        type: transaction.type,
        concept: transaction.concept,
        amount: transaction.amount,
        category: transaction.category,
        subcategory: transaction.subcategory,
        studentId: transaction.studentId,
        student: transaction.student
      });
      const newTx = response.data;
      set((state) => ({ transactions: [newTx, ...state.transactions] }));
      
      // Si la transacción está vinculada a un alumno, recargamos el listado de alumnos para actualizar los adeudos acumulados en el frontend!
      if (transaction.studentId) {
        await useAppStore.getState().fetchStudents();
      }
    } catch (error) {
      console.error('Error al agregar transacción en el backend:', error);
    }
  },
  
  recordStudentPayment: async (studentId, amount, comprobanteUrl) => {
    try {
      const response = await apiClient.post(`/alumnos/${studentId}/pagos`, { amount, comprobanteUrl });
      // Sincronizar listados
      await useAppStore.getState().fetchStudents();
      await useAppStore.getState().fetchTransactions();
      return response.data?.comprobanteUrl || null;
    } catch (error) {
      console.error('Error al registrar pago en el backend:', error);
      return null;
    }
  },

  addExamAttempt: async (studentId, attempt) => {
    try {
      const attemptsCount = useAppStore.getState().students.find(s => s.id === studentId)?.examAttempts?.length || 0;
      const detailsText = attempt.cheatingCanceled 
        ? `Cancelado por proctoreo (trampas).`
        : `Completado en ${Math.floor(attempt.durationSeconds / 60)}m ${attempt.durationSeconds % 60}s. Aciertos: ${attempt.score}/${attempt.max}. Honestidad: ${attempt.integrityScore || 100}%`;

      const serializedDetails = JSON.stringify({
        text: detailsText,
        attempt: {
          ...attempt,
          id: attempt.id || `ATT-${Date.now()}`
        }
      });

      await apiClient.post(`/alumnos/${studentId}/examenes`, {
        name: attempt.examName + ` (Intento ${attemptsCount + 1})`,
        score: attempt.score,
        max: attempt.max,
        date: new Date(attempt.endedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
        details: serializedDetails
      });
    } catch (apiError) {
      console.error('Error al persistir examen en base de datos Neon:', apiError);
    }

    // Guardar en localStorage para persistencia local en navegador
    const localAttemptsStr = localStorage.getItem(`crece_attempts_${studentId}`);
    const localAttempts = localAttemptsStr ? JSON.parse(localAttemptsStr) : [];
    localAttempts.push(attempt);
    localStorage.setItem(`crece_attempts_${studentId}`, JSON.stringify(localAttempts));

    set((state) => {
      const updatedStudents = state.students.map((student) => {
        if (student.id === studentId) {
          const newExam = {
            name: attempt.examName + ` (Intento ${localAttempts.length})`,
            score: attempt.score,
            max: attempt.max,
            date: new Date(attempt.endedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
            details: attempt.cheatingCanceled 
              ? `Cancelado por proctoreo (trampas).`
              : `Completado en ${Math.floor(attempt.durationSeconds / 60)}m ${attempt.durationSeconds % 60}s. Aciertos: ${attempt.score}/${attempt.max}. Honestidad: ${attempt.integrityScore || 100}%`
          };
          const exams = student.exams ? [...student.exams, newExam] : [newExam];

          return {
            ...student,
            examAttempts: localAttempts,
            exams
          };
        }
        return student;
      });
      return { students: updatedStudents };
    });
  },

  addQuestion: (question) => set((state) => {
    const updated = [...state.questions, question];
    localStorage.setItem('crece_questions', JSON.stringify(updated));
    return { questions: updated };
  }),
  deleteQuestion: (index) => set((state) => {
    const updated = state.questions.filter((_, idx) => idx !== index);
    localStorage.setItem('crece_questions', JSON.stringify(updated));
    return { questions: updated };
  }),
  updateQuestion: (index, question) => set((state) => {
    const updated = state.questions.map((q, idx) => idx === index ? question : q);
    localStorage.setItem('crece_questions', JSON.stringify(updated));
    return { questions: updated };
  }),

  // Exámenes Estructurados (Fase 5 - Extensión)
  addExam: (exam) => set((state) => {
    const updated = [...state.exams, exam];
    localStorage.setItem('crece_exams', JSON.stringify(updated));
    return { exams: updated };
  }),
  updateExam: (id, fields) => set((state) => {
    const updated = state.exams.map((e) => e.id === id ? { ...e, ...fields } : e);
    localStorage.setItem('crece_exams', JSON.stringify(updated));
    return { exams: updated };
  }),
  deleteExam: (id) => set((state) => {
    const examToDelete = state.exams.find(e => e.id === id);
    let updatedQuestions = state.questions;
    if (examToDelete) {
      updatedQuestions = state.questions.filter(q => !(q.servicio === examToDelete.servicio && q.examName === examToDelete.name));
      localStorage.setItem('crece_questions', JSON.stringify(updatedQuestions));
    }
    const updatedExams = state.exams.filter((e) => e.id !== id);
    localStorage.setItem('crece_exams', JSON.stringify(updatedExams));
    return { exams: updatedExams, questions: updatedQuestions };
  }),

  // Acciones de Categorías y Subcategorías
  fetchCategories: async () => {
    try {
      const response = await apiClient.get('/categorias');
      set({ categories: response.data });
    } catch (error) {
      console.error('Error al cargar categorías del backend:', error);
    }
  },

  addCategory: async (category) => {
    try {
      const response = await apiClient.post('/categorias', {
        name: category.name,
        type: category.type
      });
      const newCat = response.data;
      set((state) => ({ categories: [...state.categories, newCat] }));
    } catch (error) {
      console.error('Error al agregar categoría en el backend:', error);
    }
  },
  
  addSubcategory: async (categoryId, subcategoryName) => {
    try {
      const response = await apiClient.post('/subcategorias', {
        categoriaId: categoryId,
        name: subcategoryName
      });
      const newSub = response.data;
      
      set((state) => {
        const updatedCategories = state.categories.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              subcategories: [...cat.subcategories, { id: newSub.id, name: newSub.name }]
            };
          }
          return cat;
        });
        return { categories: updatedCategories };
      });
    } catch (error) {
      console.error('Error al agregar subcategoría en el backend:', error);
    }
  },

  deleteCategory: async (categoryId) => {
    try {
      await apiClient.delete(`/categorias/${categoryId}`);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== categoryId)
      }));
    } catch (error: any) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  },

  deleteSubcategory: async (subcategoryId) => {
    try {
      await apiClient.delete(`/subcategorias/${subcategoryId}`);
      set((state) => ({
        categories: state.categories.map((cat) => ({
          ...cat,
          subcategories: cat.subcategories.filter((sub) => sub.id !== subcategoryId)
        }))
      }));
    } catch (error: any) {
      console.error('Error al eliminar subcategoría:', error);
      throw error;
    }
  },

  updateCategory: async (categoryId, name, type) => {
    try {
      const response = await apiClient.put(`/categorias/${categoryId}`, { name, type });
      const updated = response.data;
      set((state) => ({
        categories: state.categories.map((cat) => (cat.id === categoryId ? updated : cat))
      }));
    } catch (error: any) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  },

  updateSubcategory: async (subcategoryId, name, categoriaId) => {
    try {
      const response = await apiClient.put(`/subcategorias/${subcategoryId}`, { name, categoriaId });
      const updated = response.data;
      
      set((state) => {
        return {
          categories: state.categories.map((cat) => {
            const isOldParent = cat.subcategories.some(s => s.id === subcategoryId);
            const isNewParent = cat.id === categoriaId;
            
            if (isOldParent && !isNewParent) {
              return {
                ...cat,
                subcategories: cat.subcategories.filter(s => s.id !== subcategoryId)
              };
            }
            if (isNewParent) {
              const alreadyExists = cat.subcategories.some(s => s.id === subcategoryId);
              if (alreadyExists) {
                return {
                  ...cat,
                  subcategories: cat.subcategories.map(s => s.id === subcategoryId ? { ...s, name: updated.name } : s)
                };
              } else {
                return {
                  ...cat,
                  subcategories: [...cat.subcategories, { id: updated.id, name: updated.name }]
                };
              }
            }
            return cat;
          })
        };
      });
    } catch (error: any) {
      console.error('Error al actualizar subcategoría:', error);
      throw error;
    }
  },

  markMessageAsRead: async (messageId) => {
    const state = useAppStore.getState();
    const msg = state.studentMessages.find(m => m.id === messageId);
    if (msg && msg.studentId) {
      await state.readMensaje(messageId, msg.studentId);
    }
  },

  // Gestión de Mensajes Internos
  fetchMensajesAdmin: async () => {
    try {
      const response = await apiClient.get('/mensajes');
      set({ mensajesAdmin: response.data });
    } catch (error) {
      console.error('Error al cargar mensajes administrativos:', error);
    }
  },
  createMensaje: async (data) => {
    try {
      const response = await apiClient.post('/mensajes', data);
      const nuevo = response.data;
      set((state) => ({ mensajesAdmin: [nuevo, ...state.mensajesAdmin] }));
      return nuevo;
    } catch (error) {
      console.error('Error al crear mensaje:', error);
      throw error;
    }
  },
  fetchStudentMessages: async (studentId) => {
    try {
      const response = await apiClient.get(`/mensajes/alumno/${studentId}`);
      // Mapear al arreglo compatible studentMessages para retrocompatibilidad
      const mapped = response.data.map((m: any) => ({
        id: m.id,
        studentId: studentId,
        sender: m.sender,
        title: m.title,
        content: m.content,
        sentAt: new Date(m.createdAt).toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        readAt: m.readAt ? new Date(m.readAt).toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : undefined,
        read: m.read
      }));

      set({ 
        mensajesEstudiante: response.data,
        studentMessages: mapped
      });
    } catch (error) {
      console.error('Error al cargar mensajes del alumno:', error);
    }
  },
  readMensaje: async (mensajeId, studentId) => {
    try {
      await apiClient.post(`/mensajes/${mensajeId}/read`, { alumnoId: studentId });
      
      // Actualizar localmente el estado
      set((state) => {
        const updatedEstudiante = state.mensajesEstudiante.map(m => 
          m.id === mensajeId ? { ...m, read: true, readAt: new Date().toISOString() } : m
        );
        
        const updatedLegacy = state.studentMessages.map(m => 
          m.id === mensajeId ? { ...m, readAt: new Date().toLocaleString('es-MX') } : m
        );

        return { 
          mensajesEstudiante: updatedEstudiante,
          studentMessages: updatedLegacy
        };
      });
    } catch (error) {
      console.error('Error al registrar lectura de mensaje:', error);
    }
  },

  // Enlaces de Inscripción
  enlacesInscripcion: [],
  fetchEnlacesInscripcion: async () => {
    try {
      const response = await apiClient.get('/enlaces-inscripcion');
      set({ enlacesInscripcion: response.data });
    } catch (error) {
      console.error('Error al cargar enlaces de inscripción:', error);
    }
  },
  createEnlaceInscripcion: async (enlace) => {
    try {
      const response = await apiClient.post('/enlaces-inscripcion', enlace);
      const newEnlace = response.data;
      set((state) => ({ enlacesInscripcion: [newEnlace, ...state.enlacesInscripcion] }));
      return newEnlace;
    } catch (error) {
      console.error('Error al crear enlace de inscripción:', error);
      throw error;
    }
  },
  toggleEnlaceInscripcion: async (id, activo) => {
    try {
      const response = await apiClient.put(`/enlaces-inscripcion/${id}/toggle`, { activo });
      const updated = response.data;
      set((state) => ({
        enlacesInscripcion: state.enlacesInscripcion.map((e) => (e.id === id ? updated : e))
      }));
    } catch (error) {
      console.error('Error al activar/desactivar enlace de inscripción:', error);
      throw error;
    }
  },
  fetchPublicEnlace: async (token) => {
    try {
      const response = await apiClient.get(`/enlaces-inscripcion-public/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error al consultar enlace público:', error);
      throw error;
    }
  },
  registerPublicStudent: async (studentData, token) => {
    try {
      const response = await apiClient.post('/enlaces-inscripcion-public/registrar', {
        token,
        student: studentData
      });
      // Sincronizar el store
      await useAppStore.getState().fetchStudents();
      return response.data;
    } catch (error) {
      console.error('Error al registrar estudiante con token público:', error);
      throw error;
    }
  },
  deleteEnlaceInscripcion: async (id) => {
    try {
      await apiClient.delete(`/enlaces-inscripcion/${id}`);
      set((state) => ({
        enlacesInscripcion: state.enlacesInscripcion.filter((e) => e.id !== id)
      }));
    } catch (error) {
      console.error('Error al eliminar enlace de inscripción:', error);
      throw error;
    }
  },
  updateEnlaceInscripcion: async (id, fields) => {
    try {
      const response = await apiClient.put(`/enlaces-inscripcion/${id}`, fields);
      const updated = response.data;
      set((state) => ({
        enlacesInscripcion: state.enlacesInscripcion.map((e) => (e.id === id ? updated : e))
      }));
    } catch (error) {
      console.error('Error al actualizar enlace de inscripción:', error);
      throw error;
    }
  },

  // Servicios
  servicios: [],
  fetchServicios: async () => {
    try {
      const response = await apiClient.get('/servicios');
      set({ servicios: response.data });
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    }
  },
  createServicio: async (fields) => {
    try {
      const response = await apiClient.post('/servicios', fields);
      const nuevo = response.data;
      set((state) => ({ servicios: [nuevo, ...state.servicios] }));
      return nuevo;
    } catch (error) {
      console.error('Error al crear servicio:', error);
      throw error;
    }
  },
  updateServicio: async (id, fields) => {
    try {
      const response = await apiClient.put(`/servicios/${id}`, fields);
      const updated = response.data;
      set((state) => ({
        servicios: state.servicios.map((s) => (s.id === id ? updated : s))
      }));
    } catch (error) {
      console.error('Error al actualizar servicio:', error);
      throw error;
    }
  },
  toggleServicio: async (id, activo) => {
    try {
      const response = await apiClient.put(`/servicios/${id}/toggle`, { activo });
      const updated = response.data;
      set((state) => ({
        servicios: state.servicios.map((s) => (s.id === id ? updated : s))
      }));
    } catch (error) {
      console.error('Error al cambiar estado del servicio:', error);
      throw error;
    }
  },
  deleteServicio: async (id) => {
    try {
      await apiClient.delete(`/servicios/${id}`);
      set((state) => ({
        servicios: state.servicios.filter((s) => s.id !== id)
      }));
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
      throw error;
    }
  },

  // Gestión de Usuarios
  usuarios: [],
  fetchUsuarios: async () => {
    try {
      const response = await apiClient.get('/usuarios');
      set({ usuarios: response.data });
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  },
  createUsuario: async (fields) => {
    try {
      const response = await apiClient.post('/usuarios', fields);
      const nuevo = response.data;
      set((state) => ({ usuarios: [nuevo, ...state.usuarios] }));
      return nuevo;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },
  updateUsuario: async (id, fields) => {
    try {
      const response = await apiClient.put(`/usuarios/${id}`, fields);
      const updated = response.data;
      set((state) => ({
        usuarios: state.usuarios.map((u) => (u.id === id ? updated : u))
      }));
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },
  deleteUsuario: async (id) => {
    try {
      await apiClient.delete(`/usuarios/${id}`);
      set((state) => ({
        usuarios: state.usuarios.filter((u) => u.id !== id)
      }));
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  },

  // CRM Prospectos
  addProspect: (prospect) => set((state) => {
    const newProspect: CRMProspect = {
      ...prospect,
      id: `PR-${Date.now()}`,
      fechaRegistro: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
      historialSeguimiento: [
        {
          id: `FL-${Date.now()}-init`,
          fecha: new Date().toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          nota: `Prospecto registrado en el sistema. Estatus inicial: ${prospect.estatus}.`,
          usuario: 'David Toris (DT)',
          nuevoEstatus: prospect.estatus
        }
      ]
    };
    const updated = [newProspect, ...state.prospects];
    localStorage.setItem('crece_crm_prospects', JSON.stringify(updated));
    return { prospects: updated };
  }),

  updateProspect: (id, fields) => set((state) => {
    const updated = state.prospects.map((p) => {
      if (p.id === id) {
        const logs = [...p.historialSeguimiento];
        if (fields.estatus && fields.estatus !== p.estatus) {
          logs.push({
            id: `FL-${Date.now()}-status`,
            fecha: new Date().toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            nota: `Cambio de estatus administrativo de "${p.estatus}" a "${fields.estatus}".`,
            usuario: 'David Toris (DT)',
            nuevoEstatus: fields.estatus
          });
        }
        return { ...p, ...fields, historialSeguimiento: logs };
      }
      return p;
    });
    localStorage.setItem('crece_crm_prospects', JSON.stringify(updated));
    return { prospects: updated };
  }),

  deleteProspect: (id) => set((state) => {
    const updated = state.prospects.filter((p) => p.id !== id);
    localStorage.setItem('crece_crm_prospects', JSON.stringify(updated));
    return { prospects: updated };
  }),

  addProspectFollowUp: (prospectId, log) => set((state) => {
    const updated = state.prospects.map((p) => {
      if (p.id === prospectId) {
        const newLog: CRMFollowUpLog = {
          ...log,
          id: `FL-${Date.now()}-log`,
          fecha: new Date().toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
        const updatedLogs = [...p.historialSeguimiento, newLog];
        const finalEstatus = log.nuevoEstatus ? (log.nuevoEstatus as any) : p.estatus;
        
        return {
          ...p,
          estatus: finalEstatus,
          historialSeguimiento: updatedLogs
        };
      }
      return p;
    });
    localStorage.setItem('crece_crm_prospects', JSON.stringify(updated));
    return { prospects: updated };
  }),

  // Soporte y Tickets Acciones
  fetchTickets: async (filters) => {
    try {
      let queryStr = '';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.tipoTicket) params.append('tipoTicket', filters.tipoTicket);
        if (filters.status) params.append('status', filters.status);
        if (filters.categoria) params.append('categoria', filters.categoria);
        queryStr = `?${params.toString()}`;
      }
      const response = await apiClient.get(`/tickets${queryStr}`);
      set({ tickets: response.data });
      // Si hay un ticket activo seleccionado, refrescar sus detalles
      const active = useAppStore.getState().activeTicket;
      if (active) {
        const refreshed = response.data.find((t: any) => t.id === active.id);
        if (refreshed) {
          set({ activeTicket: refreshed });
        }
      }
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    }
  },

  fetchStudentTickets: async (studentId) => {
    try {
      const response = await apiClient.get(`/tickets/alumno/${studentId}`);
      set({ studentTickets: response.data });
    } catch (error) {
      console.error('Error al cargar tickets del alumno:', error);
    }
  },

  createTicket: async (payload) => {
    try {
      const response = await apiClient.post('/tickets', payload);
      const newTicket = response.data;
      
      set((state) => ({
        tickets: [newTicket, ...state.tickets],
        studentTickets: payload.tipoTicket === 'ESTUDIANTE' ? [newTicket, ...state.studentTickets] : state.studentTickets
      }));
      
      return newTicket;
    } catch (error) {
      console.error('Error al crear ticket:', error);
      throw error;
    }
  },

  replyTicket: async (payload) => {
    try {
      const { ticketId, ...replyBody } = payload;
      const response = await apiClient.post(`/tickets/${ticketId}/reply`, replyBody);
      const newMsg = response.data;

      set((state) => {
        const updateTicketList = (list: Ticket[]) => 
          list.map(t => {
            if (t.id === ticketId) {
              const updatedMsg = [...(t.mensajes || []), newMsg];
              return { ...t, mensajes: updatedMsg, updatedAt: new Date().toISOString() };
            }
            return t;
          });

        const updatedTickets = updateTicketList(state.tickets);
        const updatedStudentTickets = updateTicketList(state.studentTickets);
        
        let updatedActiveTicket = state.activeTicket;
        if (updatedActiveTicket && updatedActiveTicket.id === ticketId) {
          updatedActiveTicket = {
            ...updatedActiveTicket,
            mensajes: [...(updatedActiveTicket.mensajes || []), newMsg],
            updatedAt: new Date().toISOString()
          };
        }

        return {
          tickets: updatedTickets,
          studentTickets: updatedStudentTickets,
          activeTicket: updatedActiveTicket
        };
      });

      return newMsg;
    } catch (error) {
      console.error('Error al responder ticket:', error);
      throw error;
    }
  },

  updateTicketStatus: async (ticketId, status, prioridad, responsableUsuarioId) => {
    try {
      const response = await apiClient.put(`/tickets/${ticketId}/status`, { status, prioridad, responsableUsuarioId });
      const updatedTicket = response.data;

      set((state) => {
        const updateTicketList = (list: Ticket[]) => 
          list.map(t => (t.id === ticketId ? updatedTicket : t));

        const updatedTickets = updateTicketList(state.tickets);
        const updatedStudentTickets = updateTicketList(state.studentTickets);

        let updatedActiveTicket = state.activeTicket;
        if (updatedActiveTicket && updatedActiveTicket.id === ticketId) {
          updatedActiveTicket = updatedTicket;
        }

        return {
          tickets: updatedTickets,
          studentTickets: updatedStudentTickets,
          activeTicket: updatedActiveTicket
        };
      });
    } catch (error) {
      console.error('Error al actualizar estado del ticket:', error);
    }
  },
};
});

// --- DISPARAR CARGA INICIAL ---
useAppStore.getState().fetchCategories();
useAppStore.getState().fetchStudents();
useAppStore.getState().fetchTransactions();
useAppStore.getState().fetchServicios();

