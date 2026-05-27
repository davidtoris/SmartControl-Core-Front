import { create } from 'zustand';
import { mockStudents, mockTransactions } from '../data/mockData';

// --- INTERFACES ---
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
}

export interface Student {
  id: number;
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
  };
  documents: { name: string; status: string }[];
  exams?: { name: string; score: number; max: number; date: string; details: string }[];
  examAttempts?: ExamAttempt[];
  attendance?: {
    percentage: number;
    history: { date: string; status: string }[];
  };
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
  studentId?: number; // Para vinculación reactiva
  concept: string;
  category: string;
  subcategory?: string;
  amount: number;
  date: string;
  status: string; // 'Pagado', 'Pendiente', etc.
}

export interface StudentMessage {
  id: string;
  studentId: number;
  sender: string;
  title: string;
  content: string;
  sentAt: string;
  readAt?: string;
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
  addStudent: (student: Student) => void;
  addTransaction: (transaction: Transaction) => void;
  recordStudentPayment: (studentId: number, amount: number) => void;
  addExamAttempt: (studentId: number, attempt: ExamAttempt) => void;
  
  // Mensajes de Alumnos
  studentMessages: StudentMessage[];
  markMessageAsRead: (messageId: string) => void;
  
  // Categorías y Subcategorías
  categories: Category[];
  addCategory: (category: Category) => void;
  addSubcategory: (categoryId: string, subcategoryName: string) => void;
}

// --- DATOS INICIALES ENRIQUECIDOS ---
const enrichedStudents: Student[] = mockStudents.map(s => {
  if (s.id === 1) return { ...s, nextPaymentDate: '2026-06-05' }; // Futura: Al Corriente
  if (s.id === 2) return { ...s, nextPaymentDate: '2026-05-20' }; // Hace 6 días: Atrasado (3+ días)
  if (s.id === 3) return { ...s, nextPaymentDate: '2026-05-23' }; // Hace 3 días: Atrasado (3+ días)
  return s; // Diego (id: 4) ya pagó todo, no tiene fecha de adeudo futuro
});

const enrichedTransactions: Transaction[] = mockTransactions.map(t => {
  let category = 'Otro Ingreso';
  let subcategory = 'Donaciones';
  if (t.id === 'REC-001') { category = 'Colegiatura / Mensualidad'; subcategory = 'UNAM'; }
  if (t.id === 'REC-002') { category = 'Inscripción'; subcategory = 'COMIPEMS'; }
  if (t.id === 'REC-003') { category = 'Colegiatura / Mensualidad'; subcategory = 'COMIPEMS'; }
  if (t.id === 'GAS-001') { category = 'Publicidad (FB / IG)'; subcategory = 'Campañas de Facebook'; }
  if (t.id === 'GAS-002') { category = 'Mantenimiento'; subcategory = 'Limpieza'; }
  
  return {
    id: t.id,
    type: t.type as 'Entrada' | 'Salida',
    student: t.student,
    concept: t.concept,
    amount: t.amount,
    date: t.date,
    status: t.status,
    category,
    subcategory
  };
});

// --- CATALOGO INICIAL DE CATEGORIAS Y SUBCATEGORIAS ---
const initialCategories: Category[] = [
  // --- INGRESOS ---
  {
    id: 'CAT-INC-001',
    name: 'Inscripción',
    type: 'income',
    subcategories: [
      { id: 'SUB-INC-101', name: 'COMIPEMS' },
      { id: 'SUB-INC-102', name: 'UNAM' },
      { id: 'SUB-INC-103', name: 'IPN' }
    ]
  },
  {
    id: 'CAT-INC-002',
    name: 'Colegiatura / Mensualidad',
    type: 'income',
    subcategories: [
      { id: 'SUB-INC-201', name: 'COMIPEMS' },
      { id: 'SUB-INC-202', name: 'UNAM' },
      { id: 'SUB-INC-203', name: 'IPN' }
    ]
  },
  {
    id: 'CAT-INC-003',
    name: 'Venta de Material',
    type: 'income',
    subcategories: [
      { id: 'SUB-INC-301', name: 'Guías de Estudio' },
      { id: 'SUB-INC-302', name: 'Uniformes' },
      { id: 'SUB-INC-303', name: 'Exámenes Simulacro' }
    ]
  },
  {
    id: 'CAT-INC-004',
    name: 'Otro Ingreso',
    type: 'income',
    subcategories: [
      { id: 'SUB-INC-401', name: 'Donaciones' },
      { id: 'SUB-INC-402', name: 'Renta de Aulas' }
    ]
  },
  // --- EGRESOS ---
  {
    id: 'CAT-EXP-001',
    name: 'Publicidad (FB / IG)',
    type: 'expense',
    subcategories: [
      { id: 'SUB-EXP-101', name: 'Campañas de Facebook' },
      { id: 'SUB-EXP-102', name: 'Campañas de Instagram' },
      { id: 'SUB-EXP-103', name: 'Flyers y Folletos' }
    ]
  },
  {
    id: 'CAT-EXP-002',
    name: 'Renta de Inmueble',
    type: 'expense',
    subcategories: [
      { id: 'SUB-EXP-201', name: 'Sucursal Principal' },
      { id: 'SUB-EXP-202', name: 'Sucursal Norte' }
    ]
  },
  {
    id: 'CAT-EXP-003',
    name: 'Sueldo Docente',
    type: 'expense',
    subcategories: [
      { id: 'SUB-EXP-301', name: 'Profesores de Matemáticas' },
      { id: 'SUB-EXP-302', name: 'Profesores de Ciencias' },
      { id: 'SUB-EXP-303', name: 'Profesores de Historia' }
    ]
  },
  {
    id: 'CAT-EXP-004',
    name: 'Servicios Básicos (Internet/Luz)',
    type: 'expense',
    subcategories: [
      { id: 'SUB-EXP-401', name: 'Luz (CFE)' },
      { id: 'SUB-EXP-402', name: 'Internet (Telmex/Izzi)' },
      { id: 'SUB-EXP-403', name: 'Agua' }
    ]
  },
  {
    id: 'CAT-EXP-005',
    name: 'Mantenimiento',
    type: 'expense',
    subcategories: [
      { id: 'SUB-EXP-501', name: 'Limpieza' },
      { id: 'SUB-EXP-502', name: 'Reparaciones Eléctricas' }
    ]
  },
  {
    id: 'CAT-EXP-006',
    name: 'Papelería',
    type: 'expense',
    subcategories: [
      { id: 'SUB-EXP-601', name: 'Hojas y Plumas' },
      { id: 'SUB-EXP-602', name: 'Copias e Impresiones' }
    ]
  },
  {
    id: 'CAT-EXP-007',
    name: 'Otro Gasto',
    type: 'expense',
    subcategories: [
      { id: 'SUB-EXP-701', name: 'Caja Chica' },
      { id: 'SUB-EXP-702', name: 'Gastos de Emergencia' }
    ]
  }
];

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

// --- STORE DE ZUSTAND ---
export const useAppStore = create<AppState>((set) => ({
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
  students: enrichedStudents,
  transactions: enrichedTransactions,
  categories: initialCategories,
  studentMessages: initialMessages,

  // Acciones de Datos
  addStudent: (student) => set((state) => ({ students: [student, ...state.students] })),
  
  addTransaction: (transaction) => set((state) => ({ transactions: [transaction, ...state.transactions] })),
  
  recordStudentPayment: (studentId, amount) => set((state) => {
    const updatedStudents = state.students.map((student) => {
      if (student.id === studentId) {
        const newPaid = student.paymentPlan.amountPaid + amount;
        const total = student.paymentPlan.totalCost;
        
        // Recalcular Estatus
        let newStatus = student.status;
        if (newPaid >= total) {
          newStatus = 'Inscrito'; // Liquidado, está totalmente inscrito
        }

        // Si se realiza un pago y estaba Atrasado, actualizar o empujar fecha al mes siguiente
        let nextDate = student.nextPaymentDate;
        if (nextDate && newPaid < total) {
          const dateObj = new Date(nextDate);
          dateObj.setMonth(dateObj.getMonth() + 1); // Empujar fecha de pago al siguiente mes
          nextDate = dateObj.toISOString().split('T')[0];
        } else if (newPaid >= total) {
          nextDate = undefined; // Liquidado, ya no tiene fecha de adeudo futuro
        }

        return {
          ...student,
          status: newStatus,
          nextPaymentDate: nextDate,
          paymentPlan: {
            ...student.paymentPlan,
            amountPaid: newPaid
          }
        };
      }
      return student;
    });
    return { students: updatedStudents };
  }),

  addExamAttempt: (studentId, attempt) => set((state) => {
    const updatedStudents = state.students.map((student) => {
      if (student.id === studentId) {
        const attempts = student.examAttempts ? [...student.examAttempts, attempt] : [attempt];
        
        // Agregar un registro simplificado a exams para mantener compatibilidad con las gráficas existentes
        const newExam = {
          name: attempt.examName + ` (Intento ${attempts.length})`,
          score: attempt.score,
          max: attempt.max,
          date: new Date(attempt.endedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
          details: `Completado en ${Math.floor(attempt.durationSeconds / 60)}m ${attempt.durationSeconds % 60}s. Aciertos: ${attempt.score}/${attempt.max}`
        };
        const exams = student.exams ? [...student.exams, newExam] : [newExam];

        return {
          ...student,
          examAttempts: attempts,
          exams
        };
      }
      return student;
    });
    return { students: updatedStudents };
  }),

  // Acciones de Categorías y Subcategorías
  addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
  
  addSubcategory: (categoryId, subcategoryName) => set((state) => {
    const updatedCategories = state.categories.map((cat) => {
      if (cat.id === categoryId) {
        const newSub = {
          id: `SUB-${cat.type === 'income' ? 'INC' : 'EXP'}-${cat.subcategories.length + 101}`,
          name: subcategoryName
        };
        return {
          ...cat,
          subcategories: [...cat.subcategories, newSub]
        };
      }
      return cat;
    });
    return { categories: updatedCategories };
  }),

  markMessageAsRead: (messageId) => set((state) => {
    const updatedMessages = state.studentMessages.map(msg => {
      if (msg.id === messageId && !msg.readAt) {
        const currentDate = '27 May 2026';
        const currentTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
        return {
          ...msg,
          readAt: `${currentDate} a las ${currentTime}`
        };
      }
      return msg;
    });
    return { studentMessages: updatedMessages };
  }),
}));
