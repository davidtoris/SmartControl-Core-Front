import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, AlertCircle, Sparkles, FolderPlus,
  Timer, BookOpen, Clock, AlertTriangle, 
  Award, BarChart2, Star, Play, 
  ChevronLeft, ChevronRight, CheckCircle2, User, 
  ListOrdered, Info, ChevronDown, ChevronUp,
  Sun, Moon, ClipboardList
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { ExamAttempt, Question } from '../store/useAppStore';

export const examQuestions = [
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
      B: '/diagrama_matematicas.png',
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
      D: 'La mayoría de la gente piensa que los exámenes finales son difíciles.',
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
  }
];

const matchService = (examServicio: string, studentCurso: string) => {
  if (!examServicio || !studentCurso) return false;
  const es = examServicio.toLowerCase().trim();
  const sc = studentCurso.toLowerCase().trim();
  return es === sc || sc.includes(es) || es.includes(sc);
};

export default function ExamenPage() {
  const { 
    students, 
    addExamAttempt, 
    questions, 
    addQuestion, 
    deleteQuestion, 
    updateQuestion,
    servicios,
    exams,
    addExam,
    updateExam,
    deleteExam
  } = useAppStore();

  // --- PARÁMETROS DE MODO PORTAL / ESTUDIANTE ---
  const searchParams = new URLSearchParams(window.location.search);
  const portalStudentId = searchParams.get('studentId');
  const isPortalMode = searchParams.get('portal') === 'true';

  useEffect(() => {
    if (portalStudentId) {
      // Forzar que el alumno activo sea el que viene en la URL
      setSelectedStudentId(isNaN(Number(portalStudentId)) ? portalStudentId : Number(portalStudentId));
    }
  }, [portalStudentId]);

  // --- CONTROL DE MODO OSCURO MANUAL (FASE 2) ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('crece-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('crece-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Banco de Reactivos Activo en el Intento (Completo o Filtrado por mini-simulacro)
  const [activeExamQuestions, setActiveExamQuestions] = useState<Question[]>([]);
  const examQuestions = activeExamQuestions.length > 0 ? activeExamQuestions : questions;

  // Estados de control de Flujo
  const [screen, setScreen] = useState<'selection' | 'test' | 'results'>('selection');
  const [activeTab, setActiveTab] = useState<'simulador' | 'reactivos' | 'metricas' | 'examenes'>('simulador');

  // Selección Inicial
  const [selectedStudentId, setSelectedStudentId] = useState<string | number | ''>('');
  const [selectedExamName, setSelectedExamName] = useState<string>('Examen de Admisión UNAM 2026');

  // Estado del Examen Activo
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [startedAt, setStartedAt] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutos (600 segundos)
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  
  // Bitácora de navegación (Audit Log)
  const [auditLog, setAuditLog] = useState<{ timestamp: string; action: string }[]>([]);

  // Intento Finalizado para Pantalla de Resultados
  const [completedAttempt, setCompletedAttempt] = useState<ExamAttempt | null>(null);

  // Estados para la revisión final de resultados (Acordeón y Filtros)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'flagged'>('all');
  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});

  // Referencias para el Timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalDuration = 600; // 10 minutos

  // Alumno seleccionado actual
  const student = students.find(s => s.id === selectedStudentId);

  // --- ESTADOS DE PROCTOREO Y ABM DE BANCO DE REACTIVOS ---
  const [focusLossCount, setFocusLossCount] = useState<number>(0);
  const [showProctorModal, setShowProctorModal] = useState<boolean>(false);
  const [proctorWarningMsg, setProctorWarningMsg] = useState<string>('');

  // Estados Formulario Banco de Reactivos
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [questionSubject, setQuestionSubject] = useState<string>('');
  const [questionText, setQuestionText] = useState<string>('');
  const [questionOptA, setQuestionOptA] = useState<string>('');
  const [questionOptB, setQuestionOptB] = useState<string>('');
  const [questionOptC, setQuestionOptC] = useState<string>('');
  const [questionOptD, setQuestionOptD] = useState<string>('');
  const [questionCorrect, setQuestionCorrect] = useState<string>('A');
  const [questionExplanation, setQuestionExplanation] = useState<string>('');
  const [questionImage, setQuestionImage] = useState<string>('');
  const [questionImageCaption, setQuestionImageCaption] = useState<string>('');
  const [questionOptionsAreImages, setQuestionOptionsAreImages] = useState<boolean>(false);
  const [questionServicio, setQuestionServicio] = useState<string>('');
  const [questionExamName, setQuestionExamName] = useState<string>('');

  // --- ESTADOS DE CONTROL DE EXÁMENES ESTRUCTURADOS (FASE 5 EXTENSIÓN) ---
  const [selectedDetailService, setSelectedDetailService] = useState<string | null>(null);
  
  // Modal de Crear/Editar Examen
  const [showExamModal, setShowExamModal] = useState<boolean>(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examFormName, setExamFormName] = useState<string>('');
  const [examFormDesc, setExamFormDesc] = useState<string>('');
  const [examFormDuration, setExamFormDuration] = useState<number>(180);
  
  // Modal de Importación XML Moodle
  const [showXmlModal, setShowXmlModal] = useState<boolean>(false);
  const [xmlTargetExamName, setXmlTargetExamName] = useState<string>('');
  const [xmlTargetService, setXmlTargetService] = useState<string>('');
  const [xmlError, setXmlError] = useState<string | null>(null);
  const [xmlSuccessCount, setXmlSuccessCount] = useState<number | null>(null);
  const [xmlImportExamName, setXmlImportExamName] = useState<string>('');

  // --- ESTADO PARA DIÁLOGOS DE CONFIRMACIÓN Y ALERTA PREMIUM ---
  const [customDialog, setCustomDialog] = useState<{
    show: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  } | null>(null);

  // Lógica de Parsing en Navegador para Moodle XML
  const handleParseMoodleXml = (xmlText: string, serviceName: string, examName: string) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        throw new Error("El archivo XML no tiene un formato válido.");
      }
      
      const questionNodes = xmlDoc.getElementsByTagName("question");
      const parsedQuestions: any[] = [];
      
      for (let i = 0; i < questionNodes.length; i++) {
        const node = questionNodes[i];
        const type = node.getAttribute("type");
        
        if (type === "multichoice") {
          const qTextNode = node.getElementsByTagName("questiontext")[0];
          let qText = qTextNode ? qTextNode.getElementsByTagName("text")[0]?.textContent || "" : "";
          qText = qText.replace(/<[^>]*>/g, '').trim();
          
          const feedbackNode = node.getElementsByTagName("generalfeedback")[0];
          let explanation = feedbackNode ? feedbackNode.getElementsByTagName("text")[0]?.textContent || "" : "";
          explanation = explanation.replace(/<[^>]*>/g, '').trim() || "Justificación didáctica no disponible.";
          
          const answerNodes = node.getElementsByTagName("answer");
          const options: Record<string, string> = {};
          let correctLetter = "A";
          
          const letters = ["A", "B", "C", "D"];
          for (let j = 0; j < Math.min(answerNodes.length, 4); j++) {
            const ansNode = answerNodes[j];
            const fraction = parseFloat(ansNode.getAttribute("fraction") || "0");
            let ansText = ansNode.getElementsByTagName("text")[0]?.textContent || "";
            ansText = ansText.replace(/<[^>]*>/g, '').trim();
            
            const letter = letters[j];
            options[letter] = ansText;
            
            if (fraction > 0) {
              correctLetter = letter;
            }
          }
          
          if (qText && Object.keys(options).length >= 2) {
            parsedQuestions.push({
              subject: "Importado",
              question: qText,
              options,
              correct: correctLetter,
              explanation,
              servicio: serviceName,
              examName: examName
            });
          }
        }
      }
      return parsedQuestions;
    } catch (error) {
      console.error("Error al parsear XML de Moodle:", error);
      throw error;
    }
  };
  
  // Filtros de Reactivos
  const [qSearchQuery, setQSearchQuery] = useState<string>('');
  const [qFilterSubject, setQFilterSubject] = useState<string>('');

  // Expandir detalles de intentos de métricas
  const [expandedMetricsAttempts, setExpandedMetricsAttempts] = useState<Record<string, boolean>>({});

  // --- AUDIO LOG Y AUTO-GUARDADO ---
  const addLog = (action: string) => {
    const timeStr = new Date().toLocaleTimeString('es-MX', { hour12: false });
    setAuditLog(prev => [...prev, { timestamp: timeStr, action }]);
    
    // Simular efecto de Auto-guardado
    setIsAutoSaving(true);
    setTimeout(() => {
      setIsAutoSaving(false);
      setLastSavedTime(timeStr);
    }, 600);
  };

  // --- DETECTORES DE PROCTOREO EN TIEMPO REAL ---
  const screenRef = useRef(screen);
  const focusLossRef = useRef(focusLossCount);
  
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    focusLossRef.current = focusLossCount;
  }, [focusLossCount]);

  useEffect(() => {
    if (screen !== 'test') return;

    // Bloqueo de copia de texto
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addLog('🚨 BLOQUEO DE COPIA: Se intentó copiar texto del reactivo.');
    };

    // Bloqueo de click derecho
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addLog('🚨 BLOQUEO: Se intentó abrir menú contextual / inspeccionar.');
    };

    // Detección de pérdida de foco / cambio de pestaña
    const handleVisibilityOrBlur = () => {
      if (screenRef.current !== 'test') return;
      
      const newCount = focusLossRef.current + 1;
      setFocusLossCount(newCount);

      if (newCount >= 3) {
        // Strike 3: Expulsión y anulación del examen
        setShowProctorModal(false);
        addLog(`🚫 ANULACIÓN POR TRAMPAS: Examen anulado automáticamente al cometer 3 infracciones.`);
        handleForceSubmitCheating();
      } else {
        // Strike 1 o 2: Mostrar advertencia flotante y congelar
        setProctorWarningMsg(`¡ADVERTENCIA DE HONESTIDAD ACADÉMICA! Has salido de la pantalla de evaluación. (Infracción ${newCount} de 3). Al llegar a 3 infracciones tu examen se cancelará automáticamente con calificación de 0 aciertos.`);
        setShowProctorModal(true);
        addLog(`🚨 ADVERTENCIA DE PROCTOREO: Pérdida de foco detectada (${newCount}/3).`);
      }
    };

    window.addEventListener('copy', handleCopy);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleVisibilityOrBlur);
    document.addEventListener('visibilitychange', handleVisibilityOrBlur);

    return () => {
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleVisibilityOrBlur);
      document.removeEventListener('visibilitychange', handleVisibilityOrBlur);
    };
  }, [screen]);



  // --- INICIAR EXAMEN ---
  const handleStartExam = (filterSubject?: string) => {
    if (!selectedStudentId) return;
    
    let list = questions;
    let duration = totalDuration;
    
    if (filterSubject) {
      list = questions.filter(q => q.subject === filterSubject);
      duration = list.length * 60; // 60 segundos por pregunta
    }
    
    setActiveExamQuestions(list);
    setAnswers({});
    setFlaggedQuestions({});
    setAuditLog([]);
    setCurrentQuestionIndex(0);
    setTimeLeft(duration);
    setFocusLossCount(0);
    setShowProctorModal(false);
    setStartedAt(new Date().toISOString());
    setScreen('test');
    
    // Log inicial
    const timeStr = new Date().toLocaleTimeString('es-MX', { hour12: false });
    setAuditLog([{ 
      timestamp: timeStr, 
      action: filterSubject 
        ? `Inició mini-simulacro de repaso focalizado en: ${filterSubject} (${list.length} reactivos).`
        : 'Inició el examen simulado completo.' 
    }]);
    setLastSavedTime(timeStr);
  };

  // --- TIMER EFFECT ---
  useEffect(() => {
    if (screen === 'test') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            // Enviar automático por expiración de tiempo
            handleSubmitExam(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen]);

  // --- RESPONDER PREGUNTA ---
  const handleAnswerSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }));
    const q = examQuestions[currentQuestionIndex];
    const answerText = q?.options?.[option as keyof typeof q.options] || option;
    const answerTextShort = typeof answerText === 'string' && answerText.length > 60
      ? answerText.slice(0, 60) + '…'
      : answerText;
    addLog(`📝 Reactivo ${currentQuestionIndex + 1} [${q?.subject || ''}] — Seleccionó opción ${option}: "${answerTextShort}"`);
  };

  // --- MARCAR PREGUNTA ---
  const handleToggleFlag = () => {
    const isCurrentlyFlagged = flaggedQuestions[currentQuestionIndex];
    setFlaggedQuestions(prev => ({ ...prev, [currentQuestionIndex]: !isCurrentlyFlagged }));
    addLog(isCurrentlyFlagged 
      ? `Desmarcó Reactivo ${currentQuestionIndex + 1} de revisión.` 
      : `⭐ Marcó Reactivo ${currentQuestionIndex + 1} para revisión posterior.`
    );
  };

  // --- NAVEGACIÓN ---
  const handleNextQuestion = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      const nextQ = examQuestions[nextIdx];
      const qSnippet = nextQ?.question?.length > 55 ? nextQ.question.slice(0, 55) + '…' : nextQ?.question || '';
      setCurrentQuestionIndex(nextIdx);
      addLog(`→ Avanzó al Reactivo ${nextIdx + 1} [${nextQ?.subject || ''}]: "${qSnippet}"`);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      const prevQ = examQuestions[prevIdx];
      const qSnippet = prevQ?.question?.length > 55 ? prevQ.question.slice(0, 55) + '…' : prevQ?.question || '';
      setCurrentQuestionIndex(prevIdx);
      addLog(`← Retrocedió al Reactivo ${prevIdx + 1} [${prevQ?.subject || ''}]: "${qSnippet}"`);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    const jumpQ = examQuestions[index];
    const qSnippet = jumpQ?.question?.length > 55 ? jumpQ.question.slice(0, 55) + '…' : jumpQ?.question || '';
    setCurrentQuestionIndex(index);
    addLog(`🔀 Saltó al Reactivo ${index + 1} [${jumpQ?.subject || ''}]: "${qSnippet}"`);
  };

  // Atajos de Teclado y Controles Inteligentes para el Examen Activo
  useEffect(() => {
    if (screen !== 'test') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'A' || key === 'B' || key === 'C' || key === 'D') {
        const questionOptions = examQuestions[currentQuestionIndex]?.options;
        if (questionOptions && key in questionOptions) {
          handleAnswerSelect(key);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentQuestionIndex < examQuestions.length - 1) {
          handleNextQuestion();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentQuestionIndex > 0) {
          handlePrevQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [screen, currentQuestionIndex, examQuestions, handleAnswerSelect, handleNextQuestion, handlePrevQuestion]);

  // --- ACCIONES ABM BANCO DE REACTIVOS ---
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionSubject || !questionText || !questionOptA || !questionOptB || !questionExplanation) {
      setCustomDialog({
        show: true,
        type: 'alert',
        title: '⚠️ Campos Incompletos',
        message: 'Por favor, completa todos los campos obligatorios.'
      });
      return;
    }

    const questionObj = {
      subject: questionSubject,
      question: questionText,
      options: {
        A: questionOptA,
        B: questionOptB,
        C: questionOptC,
        D: questionOptD || '-'
      },
      correct: questionCorrect,
      explanation: questionExplanation,
      image: questionImage || undefined,
      imageCaption: questionImageCaption || undefined,
      optionsAreImages: questionOptionsAreImages,
      servicio: questionServicio || undefined,
      examName: questionExamName || undefined
    };

    if (editingQuestionIndex !== null) {
      updateQuestion(editingQuestionIndex, questionObj);
    } else {
      addQuestion(questionObj);
    }

    // Cerrar y limpiar
    setShowAddModal(false);
    setEditingQuestionIndex(null);
    setQuestionSubject('');
    setQuestionText('');
    setQuestionOptA('');
    setQuestionOptB('');
    setQuestionOptC('');
    setQuestionOptD('');
    setQuestionCorrect('A');
    setQuestionExplanation('');
    setQuestionImage('');
    setQuestionImageCaption('');
    setQuestionOptionsAreImages(false);
    setQuestionServicio('');
    setQuestionExamName('');
  };

  const handleDeleteQuestion = (index: number) => {
    setCustomDialog({
      show: true,
      type: 'confirm',
      title: '🗑️ Eliminar Reactivo',
      message: '¿Estás seguro de que deseas eliminar este reactivo del banco oficial?',
      onConfirm: () => {
        deleteQuestion(index);
      }
    });
  };

  const handleStartEditQuestion = (index: number) => {
    const q = examQuestions[index];
    setEditingQuestionIndex(index);
    setQuestionSubject(q.subject);
    setQuestionText(q.question);
    setQuestionOptA(q.options.A || '');
    setQuestionOptB(q.options.B || '');
    setQuestionOptC(q.options.C || '');
    setQuestionOptD(q.options.D || '');
    setQuestionCorrect(q.correct);
    setQuestionExplanation(q.explanation);
    setQuestionImage(q.image || '');
    setQuestionImageCaption(q.imageCaption || '');
    setQuestionOptionsAreImages(!!q.optionsAreImages);
    setQuestionServicio(q.servicio || '');
    setQuestionExamName(q.examName || '');
    setShowAddModal(true);
  };

  // --- ENVIAR Y CALCULAR RESULTADOS ---
  const handleSubmitExam = (byTimeout = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!student) return;

    const endedAtStr = new Date().toISOString();
    const duration = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);

    // Calcular puntaje
    let score = 0;
    examQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correct) {
        score += 1;
      }
    });

    const finalLog = [...auditLog, { 
      timestamp: new Date().toLocaleTimeString('es-MX', { hour12: false }), 
      action: byTimeout ? 'Examen finalizado automáticamente por límite de tiempo.' : 'Examen finalizado de forma manual por el alumno.' 
    }];

    const integrity = Math.max(0, 100 - (focusLossCount * 15));

    const attempt: ExamAttempt = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      examName: selectedExamName,
      score,
      max: examQuestions.length,
      startedAt,
      endedAt: endedAtStr,
      durationSeconds: duration,
      answers,
      auditLog: finalLog,
      integrityScore: integrity,
      cheatingCanceled: false,
      questionsSnapshot: examQuestions.map(q => ({
        subject: q.subject,
        question: q.question,
        options: q.options as Record<string, string>,
        correct: q.correct,
        explanation: q.explanation
      }))
    };

    // Registrar en Zustand
    addExamAttempt(student.id, attempt);
    setCompletedAttempt(attempt);
    setScreen('results');
    
    // Disparar confeti nativo si no fue cancelado por trampas y aprobó satisfactoriamente
    if (score >= 6) {
      setTimeout(() => {
        startConfetti();
      }, 100);
    }
  };

  const handleForceSubmitCheating = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!student) return;

    const endedAtStr = new Date().toISOString();
    const duration = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);

    // Al ser expulsado por trampas, el puntaje oficial se anula a 0
    const finalLog = [...auditLog, { 
      timestamp: new Date().toLocaleTimeString('es-MX', { hour12: false }), 
      action: '🚫 EXAMEN ANULADO AUTOMÁTICAMENTE: El simulador se canceló tras cometer 3 infracciones de proctoreo (sospecha de copia).' 
    }];

    const attempt: ExamAttempt = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      examName: selectedExamName,
      score: 0,
      max: examQuestions.length,
      startedAt,
      endedAt: endedAtStr,
      durationSeconds: duration,
      answers,
      auditLog: finalLog,
      integrityScore: 0,
      cheatingCanceled: true,
      questionsSnapshot: examQuestions.map(q => ({
        subject: q.subject,
        question: q.question,
        options: q.options as Record<string, string>,
        correct: q.correct,
        explanation: q.explanation
      }))
    };

    // Registrar en Zustand
    addExamAttempt(student.id, attempt);
    setCompletedAttempt(attempt);
    setScreen('results');
  };

  // --- ENGINE DE CONFETI NATIVO PREMIUM ---
  const startConfetti = () => {
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Redimensionar automáticamente si cambia la pantalla
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    
    const pieces: { 
      x: number; 
      y: number; 
      size: number; 
      color: string; 
      speedX: number; 
      speedY: number; 
      rotation: number; 
      rotationSpeed: number;
      shape: 'rect' | 'circle'
    }[] = [];
    
    const colors = [
      '#0f3869', // Brand Navy
      '#e5a93b', // Brand Gold
      '#10b981', // Emerald Success
      '#3b82f6', // Bright Blue
      '#f43f5e', // Coral Rose
      '#8b5cf6'  // Violet Royal
    ];
    
    for (let i = 0; i < 200; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height - 40,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 6 - 3,
        speedY: Math.random() * 5 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 6 - 3,
        shape: Math.random() > 0.45 ? 'rect' : 'circle'
      });
    }
    
    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      
      pieces.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y / 30) * 0.5;
        p.rotation += p.rotationSpeed;
        
        if (p.y < canvas.height + 20) {
          alive = true;
        }
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        
        ctx.beginPath();
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
        } else {
          ctx.arc(0, 0, p.size / 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      
      if (alive) {
        requestAnimationFrame(update);
      } else {
        window.removeEventListener('resize', handleResize);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    
    update();
  };

  // Helper para formatear tiempo MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft < 60) return '#ef4444'; // Rojo parpadeante último minuto
    if (timeLeft < 180) return '#eab308'; // Amarillo menor a 3 minutos
    return 'var(--accent-primary)'; // Azul normal
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-main)', position: 'relative', overflowX: 'hidden', paddingBottom: '60px' }}>
      <canvas id="confetti-canvas" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 999 }}></canvas>

      <style>{`
        .question-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 32px;
          box-shadow: var(--shadow-sm);
        }
        .option-button {
          width: 100%;
          text-align: left;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-main);
          color: var(--text-primary);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .option-button:hover:not(:disabled) {
          border-color: var(--accent-primary);
          background: rgba(59, 130, 246, 0.05);
          transform: translateX(4px);
        }
        .option-button.selected {
          border-color: var(--accent-primary);
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-primary);
          font-weight: 600;
          box-shadow: 0 0 0 2px var(--accent-primary);
        }
        .nav-cell {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
        }
        .nav-cell:hover {
          transform: translateY(-2px);
        }
        .audit-item {
          display: flex;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          border-bottom: 1px dashed var(--border-color);
          animation: slideUp 0.2s ease-out;
        }
        @keyframes blink-led {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .auto-save-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          animation: blink-led 1s infinite;
        }

        /* Rediseño de Línea de Tiempo de Progreso */
        .progress-timeline-container {
          width: 100%;
          background: var(--border-color);
          height: 8px;
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 12px;
          position: relative;
        }
        .progress-timeline-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--brand-blue) 0%, #3b82f6 100%);
          border-radius: 100px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Tarjeta Premium de Opción Múltiple */
        .premium-option-card {
          width: 100%;
          text-align: left;
          padding: 16px 20px;
          border-radius: 16px;
          border: 1.5px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-primary);
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .premium-option-card:hover:not(:disabled) {
          border-color: var(--brand-blue);
          background: rgba(15, 56, 105, 0.02);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .premium-option-card.selected {
          border-color: var(--brand-blue);
          background: rgba(15, 56, 105, 0.05);
          color: var(--brand-blue);
          font-weight: 600;
          box-shadow: 0 0 0 3px rgba(15, 56, 105, 0.12), var(--shadow-sm);
        }
        .premium-option-card-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        /* Círculo de la letra A, B, C, D */
        .premium-option-badge {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .premium-option-card:hover:not(.selected):not(:disabled) .premium-option-badge {
          border-color: var(--brand-blue) !important;
          color: var(--brand-blue) !important;
        }
        .premium-option-card.selected .premium-option-badge {
          background: var(--brand-blue) !important;
          border-color: var(--brand-blue) !important;
          color: #ffffff !important;
          box-shadow: 0 2px 6px rgba(15, 56, 105, 0.25);
        }

        /* Indicador de tecla rápida (hotkey) */
        .hotkey-indicator {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary);
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 2px 8px;
          border-radius: 6px;
          opacity: 0.65;
          transition: all 0.2s ease;
          text-transform: uppercase;
        }
        .premium-option-card:hover .hotkey-indicator {
          opacity: 1;
          color: var(--brand-blue);
          border-color: rgba(15, 56, 105, 0.2);
        }
        .premium-option-card.selected .hotkey-indicator {
          background: rgba(15, 56, 105, 0.1);
          border-color: rgba(15, 56, 105, 0.15);
          color: var(--brand-blue);
          opacity: 1;
        }

        /* Contenedor principal con barra lateral colapsable */
        .exam-workspace-layout {
          display: flex;
          gap: 32px;
          width: 100%;
          align-items: flex-start;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .exam-main-panel {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .exam-sidebar-panel {
          width: 340px;
          flex-shrink: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: sticky;
          top: 96px;
          max-height: calc(100vh - 130px);
          overflow-y: auto;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .exam-sidebar-panel.collapsed {
          width: 0;
          padding: 0;
          border: none;
          opacity: 0;
          pointer-events: none;
          margin-left: -32px;
          transform: translateX(40px);
        }

        /* Botón de marcar para revisión animado */
        .flag-button-gold {
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .flag-button-gold:hover {
          border-color: var(--brand-yellow);
          background: rgba(229, 169, 59, 0.05);
          color: #ca8a04;
          transform: scale(1.02);
        }
        .flag-button-gold.active {
          background: rgba(229, 169, 59, 0.1);
          border-color: var(--brand-yellow);
          color: #ca8a04;
          box-shadow: 0 4px 12px rgba(229, 169, 59, 0.15);
        }
        .flag-button-gold.active svg {
          animation: starPulse 0.4s ease-out;
        }
        @keyframes starPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.4) rotate(15deg); }
          100% { transform: scale(1); }
        }

        /* Cuadrícula de mapa de preguntas moderna */
        .modern-nav-cell {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          border: 1.5px solid var(--border-color);
          background: var(--bg-main);
          color: var(--text-secondary);
        }
        .modern-nav-cell:hover {
          transform: translateY(-2px);
          border-color: var(--brand-blue);
          box-shadow: var(--shadow-sm);
        }
        .modern-nav-cell.current {
          border-color: var(--brand-blue) !important;
          border-width: 2px !important;
          color: var(--brand-blue) !important;
          box-shadow: 0 0 0 3px rgba(15, 56, 105, 0.15);
          background: var(--bg-card);
        }
        .modern-nav-cell.answered {
          background: rgba(34, 197, 94, 0.08);
          border-color: rgba(34, 197, 94, 0.25);
          color: #16a34a;
        }
        .modern-nav-cell.answered.current {
          background: rgba(34, 197, 94, 0.12);
        }
        .modern-nav-cell.flagged-dot::after {
          content: '';
          position: absolute;
          top: 3px;
          right: 3px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--brand-yellow);
          box-shadow: 0 0 4px rgba(229, 169, 59, 0.8);
        }

        /* Distribución del cuerpo de la pregunta (imagen a la izquierda, opciones a la derecha) */
        .question-body-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }
        @media (min-width: 768px) {
          .question-body-layout.has-image {
            display: grid;
            grid-template-columns: 1fr 1.15fr;
            gap: 28px;
            align-items: center;
          }
        }

        /* Contenedor de opciones responsivo para imágenes */
        .premium-options-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
        }
        @media (min-width: 576px) {
          .premium-options-container.is-image-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 14px;
          }
        }

        /* Consola de acción inferior */
        .bottom-action-hub {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: var(--shadow-md);
          gap: 16px;
        }
      `}</style>

      {/* --- CABECERA SUPERIOR --- */}
      <header style={{ 
        background: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-color)', 
        padding: '20px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--gradient-accent)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 2px 8px rgba(229, 169, 59, 0.2)' }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M12 2L2 7.5L12 13L22 7.5L12 2Z" fill="var(--brand-blue)" />
              <path d="M17 10.25V14.5C17 16.5 14.75 18 12 18C9.25 18 7 16.5 7 14.5V10.25L12 13L17 10.25Z" fill="#ffffff" />
              <path d="M18 7.5V12.5" stroke="var(--brand-blue)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M17 12.5H19V14.5H17V12.5Z" fill="var(--brand-blue)" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>CRECE Evaluaciones</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Portal Inteligente de Exámenes</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* BOTÓN TOGGLE DE MODO OSCURO (FASE 2) */}
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema de color"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: theme === 'dark' ? '#e5a93b' : '#0f3869',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'var(--shadow-sm)',
              padding: 0
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.08) rotate(15deg)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {screen === 'test' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {/* Indicador de Auto-Save */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '100px' }}>
                <div className="auto-save-dot" style={{ background: isAutoSaving ? 'var(--brand-blue)' : '#22c55e' }}></div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {isAutoSaving ? 'Auto-guardando...' : `Guardado: ${lastSavedTime}`}
                </span>
              </div>

              {/* Timer Circular o Rectangular */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                color: getTimerColor(),
                fontWeight: '700',
                fontSize: '20px',
                fontFamily: 'monospace',
                background: timeLeft < 60 ? 'rgba(239,68,68,0.1)' : 'var(--bg-main)',
                border: '1px solid ' + (timeLeft < 60 ? 'rgba(239,68,68,0.2)' : 'var(--border-color)'),
                padding: '6px 16px',
                borderRadius: '100px',
                transition: 'all 0.3s'
              }}>
                <Timer size={20} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
          )}

          {screen === 'results' && (
            isPortalMode ? (
              <button 
                onClick={() => window.location.href = `/estudiante?studentId=${portalStudentId}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--gradient-accent)', border: 'none', color: '#081c33', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
              >
                <ChevronLeft size={16} /> Volver a mi Portal
              </button>
            ) : (
              <button 
                onClick={() => setScreen('selection')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                <ChevronLeft size={16} /> Salir a Inicio
              </button>
            )
          )}
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '40px auto 0', padding: '0 24px' }}>
        
        {/* ========================================================
            1. PANTALLA DE SELECCIÓN E INSTRUCCIONES
            ======================================================== */}
        {screen === 'selection' && (
          isPortalMode ? (
            /* ========================================================
               MODO ALUMNO: VESTÍBULO ACADÉMICO DE EXÁMENES ASIGNADOS
               ======================================================== */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div className="question-card" style={{ padding: '28px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ClipboardList size={26} color="var(--brand-yellow)" /> Simuladores de Evaluación Asignados
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
                      Hola, <strong>{student ? student.name : 'Estudiante'}</strong>. Estos son los exámenes simulacro disponibles para tu curso <strong>{student ? student.curso : ''}</strong>.
                    </p>
                  </div>

                  <button
                    onClick={() => window.location.href = `/estudiante?studentId=${portalStudentId}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  >
                    <ChevronLeft size={16} /> Volver al Portal
                  </button>
                </div>
              </div>

              {/* Listado de Exámenes */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '24px'
              }}>
                {(() => {
                  const studentCurso = student ? student.curso : '';
                  const studentExams = exams.filter(exam => 
                    matchService(exam.servicio, studentCurso)
                  );

                  if (studentExams.length === 0) {
                    return (
                      <div style={{
                        gridColumn: '1 / -1',
                        padding: '48px',
                        textAlign: 'center',
                        background: 'var(--bg-card)',
                        border: '1.5px dashed var(--border-color)',
                        borderRadius: '20px'
                      }}>
                        <AlertCircle size={36} color="var(--brand-yellow)" style={{ marginBottom: '12px' }} />
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>No hay simuladores cargados aún</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                          Tu coordinador académico asignará exámenes simulacro para tu curso a la brevedad.
                        </p>
                      </div>
                    );
                  }

                  return studentExams.map(exam => {
                    // Filtrar preguntas para este examen en particular
                    const examQuestionsCount = questions.filter(q => 
                      q.servicio === exam.servicio && q.examName === exam.name
                    ).length;

                    // Si no tiene preguntas específicas en exams, usar el banco completo
                    const totalReactivos = examQuestionsCount > 0 ? examQuestionsCount : questions.length;

                    return (
                      <div
                        key={exam.id}
                        className="question-card bento-card"
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '20px',
                          padding: '24px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '16px',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{
                              fontSize: '11px',
                              background: 'var(--gradient-accent)',
                              color: '#081c33',
                              padding: '4px 10px',
                              borderRadius: '100px',
                              fontWeight: '700',
                              border: '1px solid rgba(229,169,59,0.2)'
                            }}>
                              {exam.servicio}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Clock size={13} /> {exam.durationMinutes} min
                            </span>
                          </div>

                          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                            {exam.name}
                          </h3>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                            {exam.description || 'Evaluación simulacro para medir tu preparación académica.'}
                          </p>

                          <div style={{
                            display: 'flex',
                            gap: '12px',
                            background: 'var(--inner-card-bg)',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid var(--inner-card-border)',
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            alignItems: 'center',
                            marginBottom: '20px'
                          }}>
                            <BookOpen size={14} color="var(--brand-yellow)" />
                            <span>Contiene <strong>{totalReactivos} reactivos</strong> oficiales</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            // Cargar preguntas específicas para este examen
                            const specificQuestions = questions.filter(q => 
                              q.servicio === exam.servicio && q.examName === exam.name
                            );
                            
                            // Si no hay preguntas específicas en Zustand, usar las del mock fallback
                            const finalQuestionsToLoad = specificQuestions.length > 0 ? specificQuestions : questions;

                            setSelectedExamName(exam.name);
                            setActiveExamQuestions(finalQuestionsToLoad);
                            
                            // Duración en segundos
                            const durationSeconds = exam.durationMinutes * 60;
                            
                            // Iniciar examen
                            setAnswers({});
                            setFlaggedQuestions({});
                            setAuditLog([]);
                            setCurrentQuestionIndex(0);
                            setTimeLeft(durationSeconds);
                            setFocusLossCount(0);
                            setShowProctorModal(false);
                            setStartedAt(new Date().toISOString());
                            setScreen('test');
                            
                            const timeStr = new Date().toLocaleTimeString('es-MX', { hour12: false });
                            setAuditLog([{ 
                              timestamp: timeStr, 
                              action: `El alumno inició el simulacro oficial: ${exam.name} (${finalQuestionsToLoad.length} reactivos).` 
                            }]);
                            setLastSavedTime(timeStr);
                          }}
                          style={{
                            width: '100%',
                            background: 'var(--gradient-accent)',
                            border: 'none',
                            color: '#081c33',
                            padding: '12px 18px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 10px rgba(229, 169, 59, 0.15)'
                          }}
                        >
                          <Play size={14} fill="#081c33" stroke="none" /> Iniciar Examen Simulacro
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* --- SELECTOR DE PESTAÑAS GLASSMORPHIC --- */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              padding: '6px',
              borderRadius: '16px',
              gap: '8px',
              alignSelf: 'flex-start',
              boxShadow: 'var(--shadow-sm)',
              backdropFilter: 'blur(12px)'
            }}>
              {[
                { id: 'simulador' as const, label: '📝 Simuladores Activos', icon: Play },
                { id: 'examenes' as const, label: '📋 Exámenes por Servicio', icon: ClipboardList },
                { id: 'reactivos' as const, label: '🗃️ Banco de Reactivos', icon: FolderPlus },
                { id: 'metricas' as const, label: '📊 Métricas Académicas', icon: BarChart2 }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: isActive ? 'var(--brand-blue)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isActive ? '0 4px 12px rgba(30, 58, 138, 0.2)' : 'none'
                    }}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ========================================================
                TAB 1.5: EXÁMENES POR SERVICIO (NUEVO - FASE 5)
                ======================================================== */}
            {activeTab === 'examenes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
                {/* Cabecera del Dashboard de Exámenes */}
                <div className="question-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '24px 32px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ClipboardList size={20} color="var(--brand-yellow)" /> Dashboard de Exámenes por Servicio
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      Administra y supervisa los simuladores de evaluación activos para cada oferta académica oficial.
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setEditingExamId(null);
                      setExamFormName('');
                      setExamFormDesc('');
                      setExamFormDuration(180);
                      setSelectedDetailService(servicios[0]?.nombre || 'UAM');
                      setShowExamModal(true);
                    }}
                    style={{
                      background: 'var(--brand-blue)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
                    }}
                  >
                    <Plus size={16} /> Crear Nuevo Examen
                  </button>
                </div>

                {/* Grid de Cursos/Servicios */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px', width: '100%' }}>
                  {(() => {
                    const activeServicios = servicios.length > 0 ? servicios : [
                      { id: '1', nombre: 'Ingreso UNAM', descripcion: 'Curso de Preparación para el Examen de Admisión UNAM 2026', activo: true },
                      { id: '2', nombre: 'COMIPEMS 2024', descripcion: 'Preparación para el Ingreso al Nivel Medio Superior COMIPEMS', activo: true },
                      { id: '3', nombre: 'UAM', descripcion: 'Curso de Preparación para el Examen de Admisión UAM 2026', activo: true }
                    ];

                    return activeServicios.filter(s => s.activo).map(srv => {
                      const srvExams = exams.filter(e => e.servicio === srv.nombre);
                      const srvQuestionsCount = questions.filter(q => q.servicio === srv.nombre).length;

                      return (
                        <div 
                          key={srv.id} 
                          className="question-card" 
                          style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '20px', 
                            padding: '24px', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '20px',
                            background: 'var(--bg-card)',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          {/* Cabecera del Servicio */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
                                {srv.nombre}
                              </h3>
                              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                                {srv.descripcion || 'Servicio Educativo de Alta Competencia.'}
                              </p>
                            </div>
                            <span style={{ fontSize: '10px', background: 'rgba(229, 169, 59, 0.12)', color: '#ca8a04', padding: '4px 10px', borderRadius: '100px', fontWeight: '700', flexShrink: 0, marginLeft: '10px' }}>
                              {srvQuestionsCount} reactivos
                            </span>
                          </div>

                          {/* Listado resumido de Exámenes */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Simulacros Oficiales del Curso ({srvExams.length}):
                            </span>

                            {srvExams.length > 0 ? (
                              srvExams.slice(0, 3).map(exam => {
                                const examQCount = questions.filter(q => q.servicio === srv.nombre && q.examName === exam.name).length;
                                return (
                                  <div 
                                    key={exam.id}
                                    style={{
                                      background: 'var(--bg-main)',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: '12px',
                                      padding: '10px 12px',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <ClipboardList size={13} color="var(--brand-blue)" />
                                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                        {exam.name}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                      {examQCount} reactivos
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <div style={{ padding: '16px', textAlign: 'center', border: '1.5px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                No hay exámenes registrados.
                              </div>
                            )}

                            {srvExams.length > 3 && (
                              <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--brand-blue)', fontWeight: '700' }}>
                                + ver {srvExams.length - 3} exámenes más
                              </div>
                            )}
                          </div>

                          {/* Botón de Administración de Exámenes */}
                          <button
                            onClick={() => setSelectedDetailService(srv.nombre)}
                            style={{
                              width: '100%',
                              background: 'rgba(15, 56, 105, 0.05)',
                              border: '1px solid rgba(15, 56, 105, 0.15)',
                              color: 'var(--brand-blue)',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <ClipboardList size={14} /> Administrar {srvExams.length} Exámenes 📋
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* ========================================================
                TAB 1: SIMULADORES ACTIVOS
                ======================================================== */}
            {activeTab === 'simulador' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                {/* Formulario de Configuración */}
                <div className="question-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                    <Sparkles size={24} color="var(--brand-yellow)" />
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>Iniciar Evaluación Simulada</h2>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">1. Selecciona el Expediente del Alumno</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <select 
                        className="form-input" 
                        style={{ paddingLeft: '44px', borderRadius: '12px', height: '48px' }}
                        value={selectedStudentId}
                        onChange={e => {
                          const val = e.target.value;
                          const num = Number(val);
                          setSelectedStudentId(isNaN(num) || val === '' ? val : num);
                        }}
                      >
                        <option value="">-- Elige un alumno del expediente --</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.curso})</option>
                        ))}
                      </select>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      El intento de examen quedará guardado reactivamente en la ficha histórica de este estudiante.
                    </p>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">2. Elige el Banco de Reactivos</label>
                    <div style={{ position: 'relative' }}>
                      <BookOpen size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <select 
                        className="form-input" 
                        style={{ paddingLeft: '44px', borderRadius: '12px', height: '48px' }}
                        value={selectedExamName}
                        onChange={e => setSelectedExamName(e.target.value)}
                      >
                        <option value="Examen de Admisión UNAM 2026">Simulacro de Admisión UNAM (Multidisciplinar)</option>
                        <option value="Evaluación COMIPEMS">Evaluación COMIPEMS (Básico Secundaria)</option>
                        <option value="Simulacro de Competencia IPN">Simulacro de Competencia IPN (Matemáticas Avanzadas)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
                      <Info size={16} color="var(--brand-blue)" /> Instrucciones y Reglas de Honestidad:
                    </div>
                    <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li>La prueba tiene una duración estricta de <strong>10 minutos (600 segundos)</strong>.</li>
                      <li>El simulador posee **Proctoreo Activo**: detectará si cambias de pestaña, copias texto o sales de la pantalla.</li>
                      <li><strong style={{ color: '#ef4444' }}>Expulsión por Trampas:</strong> Si cometes 3 pérdidas de foco de la pantalla, el simulador **se cancelará inmediatamente** anulando tu puntuación.</li>
                      <li>Al finalizar obtendrás la justificación didáctica completa de cada opción.</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleStartExam()}
                    disabled={!selectedStudentId}
                    className="btn-primary"
                    style={{ 
                      borderRadius: '12px', 
                      height: '48px', 
                      background: selectedStudentId ? 'var(--brand-blue)' : 'var(--border-color)', 
                      color: 'white',
                      cursor: selectedStudentId ? 'pointer' : 'not-allowed',
                      opacity: selectedStudentId ? 1 : 0.6,
                      boxShadow: selectedStudentId ? '0 4px 12px rgba(30, 58, 138, 0.2)' : 'none'
                    }}
                  >
                    <Play size={18} /> Iniciar Examen Simulador
                  </button>
                </div>

                {/* Ficha de Intentos del Alumno */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {student ? (
                    <div className="question-card" style={{ height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                          {student.avatar}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{student.name}</h3>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Curso: {student.curso}</span>
                        </div>
                      </div>

                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px' }}>Historial de Intentos Previos:</h4>
                      
                      {student.examAttempts && student.examAttempts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '340px' }}>
                          {student.examAttempts.map((att, index) => (
                            <div key={att.id} style={{
                              background: 'var(--bg-main)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>
                                  Intento {index + 1}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                  Fecha: {new Date(att.endedAt).toLocaleDateString()} | Duración: {Math.floor(att.durationSeconds / 60)}m {att.durationSeconds % 60}s
                                </div>
                                {att.integrityScore !== undefined && (
                                  <div style={{ fontSize: '10px', color: att.integrityScore >= 80 ? '#16a34a' : '#ef4444', fontWeight: '700', marginTop: '2px' }}>
                                    Integridad: {att.integrityScore}% {att.cheatingCanceled && '• CANCELADO 🚫'}
                                  </div>
                                )}
                              </div>
                              <div style={{
                                background: att.cheatingCanceled ? 'rgba(239, 68, 68, 0.1)' : (att.score >= 8 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)'),
                                color: att.cheatingCanceled ? '#ef4444' : (att.score >= 8 ? '#16a34a' : '#ca8a04'),
                                fontWeight: '700',
                                fontSize: '14px',
                                padding: '4px 12px',
                                borderRadius: '100px'
                              }}>
                                {att.cheatingCanceled ? 'Anulado' : `${att.score} / ${att.max} aciertos`}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <Award size={32} style={{ opacity: 0.4 }} />
                          <span>Este estudiante no tiene ningún intento registrado para este examen.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="question-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                      <Award size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                      <h3>Ficha del Alumno</h3>
                      <p style={{ fontSize: '13px', marginTop: '8px' }}>
                        Selecciona un estudiante para cargar sus expedientes, historial de exámenes previos y cargar su auditoría.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================
                TAB 2: GESTOR DE BANCO DE REACTIVOS
                ======================================================== */}
            {activeTab === 'reactivos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
                {/* Cabecera del Banco */}
                <div className="question-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '24px 32px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <BookOpen size={20} color="var(--brand-blue)" /> Banco de Reactivos Oficiales
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      Modifica, añade o elimina reactivos didácticos del portal simulador en tiempo real.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setEditingQuestionIndex(null);
                      setQuestionSubject('');
                      setQuestionText('');
                      setQuestionOptA('');
                      setQuestionOptB('');
                      setQuestionOptC('');
                      setQuestionOptD('');
                      setQuestionCorrect('A');
                      setQuestionExplanation('');
                      setShowAddModal(true);
                    }}
                    style={{
                      background: 'var(--brand-blue)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
                    }}
                  >
                    <Plus size={16} /> Agregar Reactivo
                  </button>
                </div>

                {/* Barra de Filtros */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%' }}>
                  <input
                    type="text"
                    placeholder="🔍 Buscar reactivos por enunciado o materia..."
                    value={qSearchQuery}
                    onChange={e => setQSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '240px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <select
                    value={qFilterSubject}
                    onChange={e => setQFilterSubject(e.target.value)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      minWidth: '180px'
                    }}
                  >
                    <option value="">-- Todas las Materias --</option>
                    {Array.from(new Set(examQuestions.map(q => q.subject))).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* Listado de Reactivos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px', width: '100%' }}>
                  {examQuestions.map((q, idx) => {
                    const matchesSearch = q.question.toLowerCase().includes(qSearchQuery.toLowerCase()) || q.subject.toLowerCase().includes(qSearchQuery.toLowerCase());
                    const matchesSubject = !qFilterSubject || q.subject === qFilterSubject;
                    if (!matchesSearch || !matchesSubject) return null;

                    return (
                      <div key={idx} className="question-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', background: 'rgba(30, 58, 138, 0.08)', color: 'var(--brand-blue)', padding: '3px 8px', borderRadius: '100px', fontWeight: '700' }}>
                            {q.subject}
                          </span>
                          <span style={{ fontSize: '11px', background: 'rgba(34, 197, 94, 0.08)', color: '#16a34a', padding: '3px 8px', borderRadius: '100px', fontWeight: '700' }}>
                            Correcta: {q.correct}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5, flexGrow: 1 }}>
                          {idx + 1}. {q.question}
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-main)', padding: '12px', borderRadius: '12px', fontSize: '12px' }}>
                          {Object.entries(q.options).map(([key, val]) => (
                            <div key={key} style={{ display: 'flex', gap: '8px', color: key === q.correct ? '#16a34a' : 'var(--text-secondary)', fontWeight: key === q.correct ? '600' : '400' }}>
                              <span><strong>{key}:</strong></span>
                              <span>{val as string}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: 'auto' }}>
                          <button
                            onClick={() => handleStartEditQuestion(idx)}
                            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(idx)}
                            style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================
                TAB 3: MÉTRICAS ACADÉMICAS
                ======================================================== */}
            {activeTab === 'metricas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
                
                {/* Indicadores Clave */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  {[
                    { 
                      label: 'Total de Intentos', 
                      val: students.reduce((acc, s) => acc + (s.examAttempts?.length || 0), 0), 
                      color: 'var(--brand-blue)', 
                      icon: Clock 
                    },
                    { 
                      label: 'Promedio Aciertos', 
                      val: (() => {
                        let tot = 0, sum = 0;
                        students.forEach(s => s.examAttempts?.forEach(a => { if (!a.cheatingCanceled) { tot++; sum += a.score; } }));
                        return tot > 0 ? (sum / tot).toFixed(1) + ` / ${examQuestions.length}` : 'N/A';
                      })(), 
                      color: '#16a34a', 
                      icon: Award 
                    },
                    { 
                      label: 'Honestidad Promedio', 
                      val: (() => {
                        let tot = 0, sum = 0;
                        students.forEach(s => s.examAttempts?.forEach(a => { tot++; sum += a.integrityScore !== undefined ? a.integrityScore : 100; }));
                        return tot > 0 ? Math.round(sum / tot) + '%' : '100%';
                      })(), 
                      color: '#ca8a04', 
                      icon: AlertTriangle 
                    },
                    { 
                      label: 'Anulados por Trampas', 
                      val: students.reduce((acc, s) => acc + (s.examAttempts?.filter(a => a.cheatingCanceled).length || 0), 0), 
                      color: '#ef4444', 
                      icon: AlertCircle 
                    }
                  ].map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <div key={idx} className="question-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-main)', color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>{card.label}</div>
                          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>{card.val}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Panel de Gráficas y Feed de Intentos */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', width: '100%' }}>
                  {/* Materias más difíciles */}
                  <div className="question-card">
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} color="var(--brand-yellow)" /> Materias con Mayor Dificultad
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      Rendimiento promedio de los estudiantes agrupado por áreas temáticas a nivel institucional.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {(() => {
                        const stats: Record<string, { correct: number; total: number }> = {};
                        students.forEach(s => {
                          s.examAttempts?.forEach(att => {
                            if (att.cheatingCanceled) return;
                            examQuestions.forEach((q, idx) => {
                              const isCorrect = att.answers[idx] === q.correct;
                              if (!stats[q.subject]) {
                                stats[q.subject] = { correct: 0, total: 0 };
                              }
                              stats[q.subject].total += 1;
                              if (isCorrect) stats[q.subject].correct += 1;
                            });
                          });
                        });
                        const sortedStats = Object.entries(stats).map(([materia, val]) => ({
                          materia,
                          porcentaje: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 100
                        })).sort((a, b) => a.porcentaje - b.porcentaje);

                        if (sortedStats.length === 0) {
                          return (
                            <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                              Sin datos suficientes. Registra simuladores en línea.
                            </div>
                          );
                        }

                        return sortedStats.slice(0, 5).map((stat, index) => (
                          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{stat.materia}</span>
                              <span style={{ color: stat.porcentaje < 50 ? '#ef4444' : '#ca8a04', fontWeight: '700' }}>{stat.porcentaje}% Aciertos</span>
                            </div>
                            <div style={{ height: '8px', background: 'var(--bg-main)', borderRadius: '100px', overflow: 'hidden' }}>
                              <div style={{ width: `${stat.porcentaje}%`, height: '100%', background: stat.porcentaje < 50 ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, #eab308, #ca8a04)', borderRadius: '100px' }}></div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Feed de Intentos en Tiempo Real */}
                  <div className="question-card">
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="var(--brand-blue)" /> Registro de Intentos y Simulacros
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      Historial detallado de todas las simulaciones completadas y proctoreos auditados.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '310px', overflowY: 'auto' }}>
                      {(() => {
                        const allAttempts: { sName: string; avatar: string; att: ExamAttempt }[] = [];
                        students.forEach(s => s.examAttempts?.forEach(a => {
                          allAttempts.push({ sName: s.name, avatar: s.avatar || 'AL', att: a });
                        }));
                        allAttempts.sort((a, b) => new Date(b.att.endedAt).getTime() - new Date(a.att.endedAt).getTime());

                        if (allAttempts.length === 0) {
                          return (
                            <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                              Ningún estudiante registra intentos en la plataforma.
                            </div>
                          );
                        }

                        return allAttempts.map((item, index) => {
                          const isExpanded = expandedMetricsAttempts[item.att.id] === true;
                          return (
                            <div key={index} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700' }}>
                                    {item.avatar}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>{item.sName}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{new Date(item.att.endedAt).toLocaleDateString()} | {new Date(item.att.endedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                  <div style={{ fontSize: '12px', fontWeight: '800', color: item.att.cheatingCanceled ? '#ef4444' : '#16a34a' }}>
                                    {item.att.cheatingCanceled ? 'Trampas / Anulado' : `${item.att.score}/${item.att.max} aciertos`}
                                  </div>
                                  <div style={{ fontSize: '10px', background: item.att.integrityScore !== undefined && item.att.integrityScore >= 80 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: item.att.integrityScore !== undefined && item.att.integrityScore >= 80 ? '#16a34a' : '#ef4444', padding: '2px 6px', borderRadius: '100px', fontWeight: '700' }}>
                                    {item.att.integrityScore !== undefined ? item.att.integrityScore : 100}% Honestidad
                                  </div>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => setExpandedMetricsAttempts(prev => ({ ...prev, [item.att.id]: !isExpanded }))}
                                style={{ background: 'transparent', border: 'none', color: 'var(--brand-blue)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', padding: 0, textDecoration: 'underline' }}
                              >
                                {isExpanded ? 'Ocultar registro de actividad' : 'Ver registro de actividad (alertas y respuestas) 🔍'}
                              </button>

                              {isExpanded && (
                                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '8px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto', marginTop: '4px' }}>
                                  {item.att.auditLog.map((log, lIdx) => (
                                    <div key={lIdx} style={{ fontSize: '10px', display: 'flex', gap: '6px', color: log.action.includes('🚨') || log.action.includes('🚫') ? '#ef4444' : 'var(--text-secondary)' }}>
                                      <span style={{ fontWeight: '600' }}>{log.timestamp}</span>
                                      <span>{log.action}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )
      )}

        {/* ========================================================
            2. PANTALLA EXAMEN ACTIVO (MOTOR DE EXAMEN)
            ======================================================== */}
        {screen === 'test' && student && (
          <div className="exam-workspace-layout">
            
            {/* Panel Principal */}
            <div className="exam-main-panel">
              
              {/* Barra de Progreso Superior */}
              {(() => {
                const answeredCount = Object.keys(answers).length;
                const progressPct = Math.round((answeredCount / examQuestions.length) * 100);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      <span>Línea de Tiempo del Examen</span>
                      <span style={{ color: 'var(--brand-blue)' }}>{answeredCount} de {examQuestions.length} respondidos ({progressPct}%)</span>
                    </div>
                    <div className="progress-timeline-container">
                      <div className="progress-timeline-bar" style={{ width: `${progressPct}%` }}></div>
                    </div>
                  </div>
                );
              })()}

              {/* Caja de Pregunta Central */}
              <div className="question-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header de Pregunta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', background: 'rgba(15, 56, 105, 0.08)', color: 'var(--brand-blue)', padding: '4px 12px', borderRadius: '100px', fontWeight: '700', border: '1px solid rgba(15, 56, 105, 0.15)' }}>
                      {examQuestions[currentQuestionIndex].subject}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Reactivo {currentQuestionIndex + 1} de {examQuestions.length}
                    </span>
                  </div>

                  <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '6px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--brand-blue)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <ListOrdered size={14} />
                    {isSidebarOpen ? 'Ocultar Mapa' : 'Ver Mapa de Reactivos'}
                  </button>
                </div>

                {/* Enunciado */}
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.5, margin: '16px 0 8px' }}>
                  {examQuestions[currentQuestionIndex].question}
                </h3>

                {/* Cuerpo de la pregunta: Imagen + Opciones (Grid de dos columnas si hay imagen) */}
                <div className={`question-body-layout ${examQuestions[currentQuestionIndex].image ? 'has-image' : ''}`} style={{ marginTop: '16px' }}>
                  {/* Imagen a la izquierda (si existe) */}
                  {examQuestions[currentQuestionIndex].image && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '16px',
                      boxShadow: 'inset 0 2px 4px rgba(15, 56, 105, 0.02)',
                      width: '100%'
                    }}>
                      <img 
                        src={examQuestions[currentQuestionIndex].image} 
                        alt="Diagrama del reactivo"
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '260px', 
                          objectFit: 'contain', 
                          borderRadius: '8px'
                        }} 
                      />
                      {examQuestions[currentQuestionIndex].imageCaption && (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', fontWeight: '600' }}>
                          {examQuestions[currentQuestionIndex].imageCaption}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Opciones Premium (a la derecha) */}
                  <div className={`premium-options-container ${examQuestions[currentQuestionIndex].optionsAreImages ? 'is-image-grid' : ''}`}>
                    {Object.entries(examQuestions[currentQuestionIndex].options).map(([key, value]) => {
                      const isSelected = answers[currentQuestionIndex] === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleAnswerSelect(key)}
                          className={`premium-option-card ${isSelected ? 'selected' : ''}`}
                          style={examQuestions[currentQuestionIndex].optionsAreImages ? {
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px',
                            height: '142px',
                            gap: '8px'
                          } : undefined}
                        >
                          <div className="premium-option-card-left" style={examQuestions[currentQuestionIndex].optionsAreImages ? {
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            width: '100%'
                          } : undefined}>
                            <div className="premium-option-badge">
                              {key}
                            </div>
                            
                            {examQuestions[currentQuestionIndex].optionsAreImages ? (
                              <img 
                                src={value} 
                                alt={`Opción ${key}`}
                                style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px', background: '#ffffff', padding: '4px', border: '1px solid var(--border-color)' }}
                              />
                            ) : (
                              <span>{value}</span>
                            )}
                          </div>
                          <span className="hotkey-indicator" style={examQuestions[currentQuestionIndex].optionsAreImages ? {
                            marginTop: 'auto',
                            fontSize: '9px'
                          } : undefined}>
                            Tecla {key}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Consola Flotante e Inteligente Inferior */}
              <div className="bottom-action-hub">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentQuestionIndex === 0 ? 0.4 : 1,
                    transition: 'var(--transition)'
                  }}
                >
                  <ChevronLeft size={18} /> Anterior
                </button>

                {/* Botón Marcar para revisión */}
                <button
                  onClick={handleToggleFlag}
                  className={`flag-button-gold ${flaggedQuestions[currentQuestionIndex] ? 'active' : ''}`}
                >
                  <Star size={16} fill={flaggedQuestions[currentQuestionIndex] ? '#eab308' : 'none'} color={flaggedQuestions[currentQuestionIndex] ? '#eab308' : 'currentColor'} />
                  <span>{flaggedQuestions[currentQuestionIndex] ? 'Marcada para revisión' : 'Marcar para revisión'}</span>
                </button>

                {currentQuestionIndex === examQuestions.length - 1 ? (
                  <button
                    onClick={() => handleSubmitExam(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#16a34a',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <CheckCircle2 size={18} /> Finalizar y Entregar Examen
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--brand-blue)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(15, 56, 105, 0.25)',
                      transition: 'var(--transition)'
                    }}
                  >
                    Siguiente <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Barra Lateral Mapa de Reactivos */}
            <div className={`exam-sidebar-panel ${!isSidebarOpen ? 'collapsed' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <ListOrdered size={18} color="var(--brand-blue)" /> Mapa de Reactivos
                </h3>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '20px',
                    fontWeight: '300',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0 4px'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Estadísticas rápidas en el Mapa */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Respondidos</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', marginTop: '2px' }}>
                    {Object.keys(answers).length} <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-secondary)' }}>/ {examQuestions.length}</span>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Marcados ⭐</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#ca8a04', marginTop: '2px' }}>
                    {Object.values(flaggedQuestions).filter(Boolean).length}
                  </div>
                </div>
              </div>

              {/* Selector Moderno */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                {examQuestions.map((_, index) => {
                  const isCurrent = currentQuestionIndex === index;
                  const isAnswered = answers[index] !== undefined;
                  const isFlagged = flaggedQuestions[index] === true;

                  let cellClass = 'modern-nav-cell';
                  if (isCurrent) cellClass += ' current';
                  if (isAnswered) cellClass += ' answered';
                  if (isFlagged) cellClass += ' flagged-dot';

                  return (
                    <button
                      key={index}
                      onClick={() => handleJumpToQuestion(index)}
                      className={cellClass}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Simbología minimalista */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-main)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px' }}></div>
                  <span>Pendiente / Sin responder</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '4px' }}></div>
                  <span>Respondido y Guardado</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', border: '2px solid var(--brand-blue)', borderRadius: '4px', background: 'var(--bg-main)' }}></div>
                  <span>Reactivo actual</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-yellow)' }}></div>
                  <span>Marcado para revisión</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            3. PANTALLA DE RESULTADOS Y RETROALIMENTACIÓN
            ======================================================== */}
        {screen === 'results' && completedAttempt && student && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Tarjeta de Resumen y Aciertos */}
            <div className="question-card" style={{ 
              background: completedAttempt.cheatingCanceled 
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(249, 115, 22, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
              border: completedAttempt.cheatingCanceled
                ? '2px solid rgba(239, 68, 68, 0.2)'
                : '2px solid rgba(59, 130, 246, 0.1)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: completedAttempt.cheatingCanceled ? '#ef4444' : 'var(--accent-primary)', 
                  fontWeight: '700', 
                  fontSize: '13px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  marginBottom: '8px' 
                }}>
                  <Award size={16} /> {completedAttempt.cheatingCanceled ? '¡Examen Anulado!' : '¡Examen Simulado Finalizado!'}
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
                  {completedAttempt.cheatingCanceled 
                    ? 'Evaluación Cancelada' 
                    : `Resultados Obtenidos por ${student.name}`
                  }
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                  {completedAttempt.cheatingCanceled
                    ? `El simulador de exámenes ha determinado que se cometieron 3 infracciones de honestidad (pérdidas de foco o intentos de copia). El intento se ha registrado con calificación anulada por motivos de supervisión escolar.`
                    : `Se ha generado el reporte del intento y guardado el registro de respuestas de forma exitosa en el sistema administrativo. Consulta el desglose didáctico a continuación.`
                  }
                </p>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px', flex: '1 1 140px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Calificación</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: completedAttempt.cheatingCanceled ? '#ef4444' : (completedAttempt.score >= 8 ? '#16a34a' : '#ca8a04'), marginTop: '6px' }}>
                      {completedAttempt.cheatingCanceled ? '0' : completedAttempt.score} <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>/ {completedAttempt.max} aciertos</span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px', flex: '1 1 140px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Índice de Honestidad</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: completedAttempt.integrityScore !== undefined && completedAttempt.integrityScore >= 80 ? '#16a34a' : '#ef4444', marginTop: '6px' }}>
                      {completedAttempt.integrityScore !== undefined ? completedAttempt.integrityScore : 100}%
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px', flex: '1 1 140px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Tiempo Transcurrido</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '12px' }}>
                      {Math.floor(completedAttempt.durationSeconds / 60)}m {completedAttempt.durationSeconds % 60}s
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Comparativa UNAM / Alerta de Proctoreo */}
              {completedAttempt.cheatingCanceled ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: '700', fontSize: '14px' }}>
                    <AlertTriangle size={20} /> NOTIFICACIÓN DE ANULACIÓN POR INCUMPLIMIENTO
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Se ha cancelado la prueba debido a múltiples salidas de pantalla (3 infracciones cometidas). Los tutores académicos y directores han recibido una notificación automática en su panel de supervisión.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', background: 'var(--bg-card)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: '700', color: '#ef4444' }}>Detalles de la Cancelación:</div>
                    <div>• Infracción 1: Cambio de pestaña del navegador detectado.</div>
                    <div>• Infracción 2: Pérdida de foco del simulador.</div>
                    <div>• Infracción 3: Salida del portal de honestidad. Examen cerrado.</div>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart2 size={18} color="var(--brand-yellow)" /> Comparativo Meta UNAM
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '100px', fontWeight: '600' }}>
                      Objetivo: Medicina UNAM
                    </span>
                  </div>

                  <div style={{ position: 'relative', height: '16px', background: 'var(--bg-main)', borderRadius: '100px', overflow: 'hidden', marginTop: '8px' }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      height: '100%', 
                      width: `${(completedAttempt.score / completedAttempt.max) * 100}%`, 
                      background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                      borderRadius: '100px'
                    }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Puntaje Actual: <strong>{completedAttempt.score} aciertos</strong></span>
                    <span>Meta Ideal: <strong>9 aciertos</strong></span>
                  </div>

                  {completedAttempt.score >= 9 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#16a34a', background: 'rgba(34,197,94,0.1)', padding: '12px', borderRadius: '12px', fontWeight: '600', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <CheckCircle2 size={16} /> ¡Excelente! Cumple con los aciertos necesarios para admisión.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ca8a04', background: 'rgba(234,179,8,0.08)', padding: '12px', borderRadius: '12px', fontWeight: '600', border: '1px solid rgba(234,179,8,0.15)' }}>
                      <AlertTriangle size={16} /> Falta poco. Requiere regularizar materias de Geografía e Historia.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Diagnóstico Académico Inteligente y Botón de Repaso Focalizado (Mini-Simulacro) */}
            {!completedAttempt.cheatingCanceled && (() => {
              // Calcular estadísticas por materia
              const stats: Record<string, { correct: number; total: number }> = {};
              examQuestions.forEach((q, idx) => {
                const studentAns = completedAttempt.answers[idx];
                const isCorrect = studentAns === q.correct;
                if (!stats[q.subject]) {
                  stats[q.subject] = { correct: 0, total: 0 };
                }
                stats[q.subject].total += 1;
                if (isCorrect) stats[q.subject].correct += 1;
              });

              // Encontrar la materia más débil por debajo de 80% de aciertos
              let weakestSubject = '';
              let lowestPercentage = 100;
              let weakestStats = { correct: 0, total: 0 };

              Object.entries(stats).forEach(([subj, val]) => {
                const percentage = (val.correct / val.total) * 100;
                if (percentage < 80 && percentage < lowestPercentage) {
                  lowestPercentage = Math.round(percentage);
                  weakestSubject = subj;
                  weakestStats = val;
                }
              });

              if (!weakestSubject) return null;

              return (
                <div className="question-card" style={{ 
                  background: 'linear-gradient(135deg, rgba(229, 169, 59, 0.06) 0%, rgba(244, 192, 90, 0.04) 100%)',
                  border: '1.5px solid rgba(229, 169, 59, 0.25)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '24px',
                  flexWrap: 'wrap',
                  animation: 'slideUp 0.3s ease-out'
                }}>
                  <div style={{ display: 'flex', gap: '16px', flex: '1 1 450px', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: 'rgba(229, 169, 59, 0.12)', 
                      color: 'var(--brand-yellow)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
                        Diagnóstico de Rendimiento Académico: Oportunidad en {weakestSubject}
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        Detectamos que tu mayor área de oportunidad está en la materia de <strong>{weakestSubject}</strong>, donde obtuviste solo un <strong>{lowestPercentage}%</strong> de aciertos ({weakestStats.correct} de {weakestStats.total}). Te recomendamos realizar una sesión de regularización inmediata con un mini-simulacro enfocado de repaso.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartExam(weakestSubject)}
                    style={{
                      background: 'var(--brand-blue)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px 24px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(15, 56, 105, 0.2)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexShrink: 0
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(15, 56, 105, 0.3)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(15, 56, 105, 0.2)';
                    }}
                  >
                    <Sparkles size={16} color="var(--brand-yellow)" />
                    <span>Iniciar Repaso de {weakestSubject} ⚡</span>
                  </button>
                </div>
              );
            })()}

            {/* Rendimiento Específico por Materia - Solo si no fue cancelado */}
            {!completedAttempt.cheatingCanceled && (
              <div className="question-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Análisis Fino de Rendimiento por Áreas Temáticas
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {(() => {
                    const stats: Record<string, { correct: number; total: number }> = {};
                    examQuestions.forEach((q, idx) => {
                      const studentAns = completedAttempt.answers[idx];
                      const isCorrect = studentAns === q.correct;
                      if (!stats[q.subject]) {
                        stats[q.subject] = { correct: 0, total: 0 };
                      }
                      stats[q.subject].total += 1;
                      if (isCorrect) stats[q.subject].correct += 1;
                    });
                    return Object.entries(stats).map(([subj, val], index) => {
                      const percentage = Math.round((val.correct / val.total) * 100);
                      return (
                        <div key={index} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>{subj}</span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: percentage >= 80 ? '#16a34a' : (percentage >= 50 ? '#ca8a04' : '#ef4444') }}>
                              {percentage}%
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                              {val.correct} de {val.total}
                            </span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--bg-card)', borderRadius: '100px', overflow: 'hidden' }}>
                            <div style={{ width: `${percentage}%`, height: '100%', background: percentage >= 80 ? '#16a34a' : (percentage >= 50 ? '#eab308' : '#ef4444'), borderRadius: '100px' }}></div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Acordeón de Retroalimentación Detallada */}
            <div className="question-card" style={{ padding: '0' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Revisión Didáctica del Examen (Respuestas y Justificaciones)
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Filtra y expande reactivos para revisar detalles. Por defecto se muestran colapsados para una navegación ágil en exámenes extensos.
                  </p>
                </div>
                
                {/* Botones de Control de Apertura */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => {
                      const bulk: Record<number, boolean> = {};
                      examQuestions.forEach((_, idx) => { bulk[idx] = true; });
                      setExpandedReviews(bulk);
                    }}
                    style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer' }}
                  >
                    Expandir Todas
                  </button>
                  <button 
                    onClick={() => setExpandedReviews({})}
                    style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer' }}
                  >
                    Colapsar Todas
                  </button>
                </div>
              </div>

              {/* Pestañas de Filtrado de Revisión */}
              <div style={{ display: 'flex', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', padding: '10px 24px', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all' as const, label: 'Todos los Reactivos', color: 'var(--brand-blue)', bg: 'rgba(30, 58, 138, 0.08)' },
                  { id: 'incorrect' as const, label: `Incorrectas ❌ (${examQuestions.length - completedAttempt.score})`, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
                  { id: 'correct' as const, label: `Correctas ✅ (${completedAttempt.score})`, color: '#16a34a', bg: 'rgba(34, 197, 94, 0.08)' },
                  { id: 'flagged' as const, label: 'Marcadas ⭐', color: '#ca8a04', bg: 'rgba(234, 179, 8, 0.08)' }
                ].map(tab => {
                  const isActive = reviewFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setReviewFilter(tab.id)}
                      style={{
                        background: isActive ? tab.bg : 'transparent',
                        border: isActive ? '1px solid ' + tab.color : '1px solid transparent',
                        color: isActive ? tab.color : 'var(--text-secondary)',
                        borderRadius: '20px',
                        padding: '6px 16px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Lista Acordeón Filtrada */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {examQuestions.map((q, idx) => {
                  const studentAnswer = completedAttempt.answers[idx];
                  const isCorrect = studentAnswer === q.correct;
                  const isFlagged = flaggedQuestions[idx] === true;

                  // Aplicar Filtro
                  if (reviewFilter === 'correct' && !isCorrect) return null;
                  if (reviewFilter === 'incorrect' && isCorrect) return null;
                  if (reviewFilter === 'flagged' && !isFlagged) return null;

                  const isExpanded = expandedReviews[idx] === true;

                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        borderBottom: idx < examQuestions.length - 1 ? '1px solid var(--border-color)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {/* Acordeón HEADER */}
                      <div 
                        onClick={() => setExpandedReviews(prev => ({ ...prev, [idx]: !isExpanded }))}
                        style={{
                          padding: '18px 32px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          background: isExpanded ? 'var(--bg-main)' : 'transparent',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--bg-main)'}
                        onMouseOut={e => {
                          if (!isExpanded) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            Reactivo {idx + 1}
                          </span>
                          <span style={{ fontSize: '11px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '100px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                            {q.subject}
                          </span>
                          {isFlagged && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', padding: '2px 8px', borderRadius: '100px', fontWeight: '700' }}>
                              <Star size={10} fill="#eab308" color="#eab308" /> Marcada
                            </span>
                          )}
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '100px',
                            background: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: isCorrect ? '#16a34a' : '#ef4444'
                          }}>
                            {isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {studentAnswer ? (
                              <span>Tu respuesta: <strong style={{ color: isCorrect ? '#16a34a' : '#ef4444' }}>{studentAnswer}</strong> {!isCorrect && <span>| Correcta: <strong style={{ color: '#16a34a' }}>{q.correct}</strong></span>}</span>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Sin responder | Correcta: <strong>{q.correct}</strong></span>
                            )}
                          </span>
                          {isExpanded ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
                        </div>
                      </div>

                      {/* Acordeón BODY */}
                      {isExpanded && (
                        <div style={{ 
                          padding: '24px 32px 32px',
                          background: 'rgba(0,0,0,0.01)',
                          animation: 'slideUp 0.2s ease-out',
                          borderTop: '1px solid var(--border-color)'
                        }}>
                          <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.5 }}>
                            {q.question}
                          </h4>

                          {/* Desglose de Opciones con visual de colores de éxito */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                            {Object.entries(q.options).map(([key, val]) => {
                              const isKeyCorrect = key === q.correct;
                              const isKeyStudent = key === studentAnswer;
                              
                              let optBorder = 'var(--border-color)';
                              let optBg = 'var(--bg-main)';
                              let optColor = 'var(--text-primary)';

                              if (isKeyCorrect) {
                                optBorder = '#22c55e';
                                optBg = 'rgba(34, 197, 94, 0.08)';
                                optColor = '#16a34a';
                              } else if (isKeyStudent && !isCorrect) {
                                optBorder = '#ef4444';
                                optBg = 'rgba(239, 68, 68, 0.08)';
                                optColor = '#ef4444';
                              }

                              return (
                                <div key={key} style={{
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  border: '1px solid ' + optBorder,
                                  background: optBg,
                                  color: optColor,
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  fontWeight: isKeyStudent || isKeyCorrect ? '600' : '400'
                                }}>
                                  <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: isKeyCorrect ? '#22c55e' : (isKeyStudent ? '#ef4444' : 'var(--border-color)'),
                                    color: isKeyCorrect || isKeyStudent ? 'white' : 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '11px',
                                    fontWeight: '700'
                                  }}>
                                    {key}
                                  </div>
                                  <span>{val}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Caja de Explicación Didáctica */}
                          <div style={{ 
                            background: 'var(--bg-main)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '12px', 
                            padding: '14px 16px',
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5
                          }}>
                            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Justificación Pedagógica:</strong>
                            {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bitácora de honestidad del Intento */}
            <div className="question-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--brand-yellow)" /> Bitácora Oficial de Supervisión Académica
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Este registro detalla cronológicamente la navegación del estudiante y las alertas de seguridad de proctoreo generadas en tiempo real durante la prueba.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--bg-main)', padding: '12px', borderRadius: '16px', border: '1px solid var(--border-color)', maxHeight: '200px', overflowY: 'auto' }}>
                {completedAttempt.auditLog && completedAttempt.auditLog.length > 0 ? (
                  completedAttempt.auditLog.slice().reverse().map((log, index) => (
                    <div key={index} className="audit-item">
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--brand-blue)' }}>{log.timestamp}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{log.action}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-secondary)' }}>Sin incidencias registradas.</div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================
          MODALES ADICIONALES DE CONTROL DE AUDITORÍA Y EDICIÓN
          ======================================================== */}

      {/* Modal de Advertencia de Proctoreo (Pérdida de Foco) */}
      {showProctorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '2px solid #ef4444',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '500px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={32} />
            </div>
            
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              ALERTA DE SEGURIDAD ACADÉMICA
            </h3>
            
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {proctorWarningMsg}
            </p>
            
            <button
              onClick={() => setShowProctorModal(false)}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              Entendido, reanudar examen
            </button>
          </div>
        </div>
      )}

      {/* Modal Agregar/Editar Reactivo */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <form 
            onSubmit={handleSaveQuestion}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '32px',
              width: '90%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {editingQuestionIndex !== null ? '📝 Editar Reactivo Oficial' : '➕ Agregar Reactivo al Banco'}
            </h3>

            {/* VINCULACIÓN A EXAMEN Y SERVICIO (NUEVO - FASE 5) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-main)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Servicio Académico</label>
                <select
                  value={questionServicio}
                  onChange={e => setQuestionServicio(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">-- Sin Servicio (General) --</option>
                  {(servicios.length > 0 ? servicios : [
                    { id: '1', nombre: 'Ingreso UNAM', activo: true },
                    { id: '2', nombre: 'COMIPEMS 2024', activo: true }
                  ]).filter(s => s.activo).map(s => (
                    <option key={s.id} value={s.nombre}>{s.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Nombre del Examen / Simulacro</label>
                <input
                  type="text"
                  placeholder="Ej: Simulacro 1, Examen Diagnóstico"
                  value={questionExamName}
                  onChange={e => setQuestionExamName(e.target.value)}
                  list="exam-names-suggestions"
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
                />
                <datalist id="exam-names-suggestions">
                  {Array.from(new Set(
                    questions
                      .filter(q => q.servicio === questionServicio && q.examName)
                      .map(q => q.examName)
                  )).map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Materia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Física, Historia, Química"
                  value={questionSubject}
                  onChange={e => setQuestionSubject(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Opción Correcta *</label>
                <select
                  value={questionCorrect}
                  onChange={e => setQuestionCorrect(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="A">Opción A</option>
                  <option value="B">Opción B</option>
                  <option value="C">Opción C</option>
                  <option value="D">Opción D</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Enunciado de la Pregunta *</label>
              <textarea
                required
                rows={3}
                placeholder="Ingresa la pregunta de forma clara y precisa..."
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {/* CAMPOS MULTIMEDIA DE APOYO (NUEVO - FASE 4) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>URL de Imagen de Apoyo (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: /grafica_parabola.png o URL externa"
                  value={questionImage}
                  onChange={e => setQuestionImage(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Pie de Foto / Título del Gráfico</label>
                <input
                  type="text"
                  placeholder="Ej: Gráfica de la parábola"
                  value={questionImageCaption}
                  onChange={e => setQuestionImageCaption(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>

            {/* CHECKBOX DE OPCIONES GRÁFICAS (NUEVO - FASE 4) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-main)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <input 
                type="checkbox" 
                id="optionsAreImages"
                checked={questionOptionsAreImages}
                onChange={e => setQuestionOptionsAreImages(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--brand-blue)' }}
              />
              <label htmlFor="optionsAreImages" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', cursor: 'pointer' }}>
                🖼️ Las opciones de respuestas son imágenes (Cuadrícula 2x2)
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Opción A *</label>
                <input 
                  type="text" 
                  required 
                  placeholder={questionOptionsAreImages ? "Ej: /diagrama_matematicas.png" : "Respuesta de la opción A"}
                  value={questionOptA} 
                  onChange={e => setQuestionOptA(e.target.value)} 
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Opción B *</label>
                <input 
                  type="text" 
                  required 
                  placeholder={questionOptionsAreImages ? "Ej: /grafica_parabola.png" : "Respuesta de la opción B"}
                  value={questionOptB} 
                  onChange={e => setQuestionOptB(e.target.value)} 
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Opción C</label>
                <input 
                  type="text" 
                  placeholder={questionOptionsAreImages ? "Ej: /diagrama_matematicas.png" : "Respuesta de la opción C"}
                  value={questionOptC} 
                  onChange={e => setQuestionOptC(e.target.value)} 
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Opción D</label>
                <input 
                  type="text" 
                  placeholder={questionOptionsAreImages ? "Ej: /grafica_parabola.png" : "Respuesta de la opción D"}
                  value={questionOptD} 
                  onChange={e => setQuestionOptD(e.target.value)} 
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', outline: 'none' }} 
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Justificación Pedagógica *</label>
              <textarea
                required
                rows={2}
                placeholder="Explica detalladamente por qué la opción seleccionada es la correcta..."
                value={questionExplanation}
                onChange={e => setQuestionExplanation(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingQuestionIndex(null);
                  setQuestionSubject('');
                  setQuestionText('');
                  setQuestionOptA('');
                  setQuestionOptB('');
                  setQuestionOptC('');
                  setQuestionOptD('');
                  setQuestionCorrect('A');
                  setQuestionExplanation('');
                  setQuestionImage('');
                  setQuestionImageCaption('');
                  setQuestionOptionsAreImages(false);
                  setQuestionServicio('');
                  setQuestionExamName('');
                }}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ background: 'var(--brand-blue)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(30,58,138,0.2)' }}
              >
                Guardar Reactivo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          MODALES DE ADMINISTRACIÓN DE EXÁMENES ESTRUCTURADOS (FASE 5 EXTENSIÓN)
          ======================================================== */}

      {/* Drawer / Modal de Detalle de Exámenes del Servicio */}
      {selectedDetailService && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '32px',
            width: '90%',
            maxWidth: '850px',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* Cabecera */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--brand-yellow)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Servicio Académico</span>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                  📂 Exámenes de {selectedDetailService}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedDetailService(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer', outline: 'none' }}
              >
                ✕
              </button>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setEditingExamId(null);
                  setExamFormName('');
                  setExamFormDesc('');
                  setExamFormDuration(180);
                  setShowExamModal(true);
                }}
                style={{
                  background: 'var(--brand-blue)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(30,58,138,0.15)'
                }}
              >
                <Plus size={16} /> Crear Nuevo Examen
              </button>

              <button
                onClick={() => {
                  setXmlTargetExamName(''); // vacío para CREAR examen nuevo
                  setXmlTargetService(selectedDetailService || 'UAM');
                  setXmlImportExamName('');
                  setXmlError(null);
                  setXmlSuccessCount(null);
                  setShowXmlModal(true);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FolderPlus size={16} /> Agregar desde archivo
              </button>
            </div>

            {/* Listado de Exámenes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(() => {
                const srvExams = exams.filter(e => e.servicio === selectedDetailService);
                if (srvExams.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px 0', border: '1.5px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
                      No hay exámenes registrados para este servicio. ¡Crea uno nuevo arriba!
                    </div>
                  );
                }

                return srvExams.map(exam => {
                  const examQuestions = questions.filter(q => q.servicio === selectedDetailService && q.examName === exam.name);
                  return (
                    <div key={exam.id} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ClipboardList size={16} color="var(--brand-blue)" />
                            <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                              {exam.name}
                            </h4>
                            <span style={{ fontSize: '11px', background: 'rgba(15, 56, 105, 0.08)', color: 'var(--brand-blue)', padding: '2px 8px', borderRadius: '100px', fontWeight: '700' }}>
                              ⏱️ {exam.durationMinutes} min
                            </span>
                          </div>
                          {exam.description && (
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
                              {exam.description}
                            </p>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {examQuestions.length} reactivos
                        </span>
                      </div>

                      {/* Botones de acción */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => {
                              setActiveExamQuestions(examQuestions);
                              setSelectedExamName(exam.name);
                              if (!selectedStudentId && students.length > 0) {
                                setSelectedStudentId(students[0].id);
                              }
                              setTimeLeft(exam.durationMinutes * 60);
                              setScreen('test');
                              setStartedAt(new Date().toLocaleTimeString('es-MX', { hour12: false }));
                              setAnswers({});
                              setFlaggedQuestions({});
                              setFocusLossCount(0);
                              setAuditLog([{
                                timestamp: new Date().toLocaleTimeString('es-MX', { hour12: false }),
                                action: `Inició el examen "${exam.name}" asignado al servicio "${exam.servicio}".`
                              }]);
                              setSelectedDetailService(null);
                            }}
                            disabled={examQuestions.length === 0}
                            style={{ 
                              background: examQuestions.length > 0 ? 'rgba(34, 197, 94, 0.1)' : 'var(--border-color)', 
                              border: 'none', 
                              color: examQuestions.length > 0 ? '#16a34a' : 'var(--text-secondary)', 
                              padding: '6px 12px', 
                              borderRadius: '8px', 
                              fontSize: '12px', 
                              fontWeight: '700', 
                              cursor: examQuestions.length > 0 ? 'pointer' : 'not-allowed', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px' 
                            }}
                          >
                            Iniciar ⚡
                          </button>

                          <button
                            onClick={() => {
                              setReviewFilter('all');
                              setQSearchQuery(exam.name);
                              setActiveTab('reactivos');
                              setSelectedDetailService(null);
                            }}
                            style={{ background: 'rgba(59, 130, 246, 0.08)', border: 'none', color: 'var(--brand-blue)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            Ver Reactivos 🔍
                          </button>

                          <button
                            onClick={() => {
                              setEditingQuestionIndex(null);
                              setQuestionSubject('Razonamiento');
                              setQuestionText('');
                              setQuestionOptA('');
                              setQuestionOptB('');
                              setQuestionOptC('');
                              setQuestionOptD('');
                              setQuestionCorrect('A');
                              setQuestionExplanation('');
                              setQuestionImage('');
                              setQuestionImageCaption('');
                              setQuestionOptionsAreImages(false);
                              setQuestionServicio(exam.servicio);
                              setQuestionExamName(exam.name);
                              setShowAddModal(true);
                            }}
                            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            + Pregunta ➕
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => {
                              setEditingExamId(exam.id);
                              setExamFormName(exam.name);
                              setExamFormDesc(exam.description || '');
                              setExamFormDuration(exam.durationMinutes);
                              setShowExamModal(true);
                            }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', padding: '4px' }}
                            title="Editar Examen"
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() => {
                              setCustomDialog({
                                show: true,
                                type: 'confirm',
                                title: '🗑️ Eliminar Examen',
                                message: `¿Estás seguro de que deseas eliminar el examen "${exam.name}"? Se eliminarán también todas sus preguntas asociadas del banco.`,
                                onConfirm: () => {
                                  deleteExam(exam.id);
                                }
                              });
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', padding: '4px' }}
                            title="Eliminar Examen"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Botón inferior de cerrar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button 
                onClick={() => setSelectedDetailService(null)}
                style={{ background: 'var(--brand-blue)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear/Editar Examen */}
      {showExamModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!examFormName.trim()) {
                setCustomDialog({
                  show: true,
                  type: 'alert',
                  title: '⚠️ Nombre Obligatorio',
                  message: 'El nombre del examen es obligatorio.'
                });
                return;
              }
              
              if (editingExamId) {
                updateExam(editingExamId, {
                  name: examFormName,
                  description: examFormDesc,
                  durationMinutes: examFormDuration
                });
              } else {
                addExam({
                  id: `EX-${Date.now()}`,
                  name: examFormName,
                  servicio: selectedDetailService || 'UAM',
                  description: examFormDesc,
                  durationMinutes: examFormDuration
                });
              }
              setShowExamModal(false);
              setEditingExamId(null);
            }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '32px',
              width: '90%',
              maxWidth: '500px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {editingExamId ? '📝 Editar Examen' : '➕ Crear Nuevo Examen'}
            </h3>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Nombre del Examen *</label>
              <input
                type="text"
                required
                placeholder="Ej: Simulacro de Admisión 1"
                value={examFormName}
                onChange={e => setExamFormName(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Descripción (Opcional)</label>
              <textarea
                rows={3}
                placeholder="Ingresa una descripción del contenido del simulacro..."
                value={examFormDesc}
                onChange={e => setExamFormDesc(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Duración Oficial (Minutos) *</label>
              <input
                type="number"
                required
                min={10}
                max={600}
                value={examFormDuration}
                onChange={e => setExamFormDuration(parseInt(e.target.value) || 180)}
                style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowExamModal(false);
                  setEditingExamId(null);
                }}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ background: 'var(--brand-blue)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(30,58,138,0.2)' }}
              >
                Guardar Examen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Importación XML Moodle */}
      {showXmlModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              📂 Agregar desde archivo
            </h3>
            
            {xmlTargetExamName === '' ? (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Selecciona un archivo XML exportado desde Moodle. El sistema creará un <strong>nuevo examen</strong> asignado al servicio <strong>{xmlTargetService}</strong> y cargará todas sus preguntas asociadas de forma automática.
              </p>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Selecciona un archivo XML exportado desde Moodle. Las preguntas se cargarán directamente en el examen <strong>{xmlTargetExamName}</strong> del servicio <strong>{xmlTargetService}</strong>.
              </p>
            )}

            {xmlTargetExamName === '' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block' }}>Nombre del Nuevo Examen *</label>
                <input
                  type="text"
                  placeholder="Ej: Simulacro Diagnóstico de Razonamiento"
                  value={xmlImportExamName}
                  onChange={e => setXmlImportExamName(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
                />
              </div>
            )}

            <div style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '16px',
              padding: '30px 20px',
              textAlign: 'center',
              background: 'var(--bg-main)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <input
                type="file"
                accept=".xml"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  let suggestedName = xmlImportExamName.trim();
                  if (!suggestedName) {
                    const fileNameClean = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ").replace(/-/g, " ");
                    suggestedName = fileNameClean.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    setXmlImportExamName(suggestedName);
                  }
                  
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const xmlText = event.target?.result as string;
                    try {
                      const finalExamName = xmlTargetExamName || suggestedName || "Examen Importado";
                      
                      const questionsParsed = handleParseMoodleXml(xmlText, xmlTargetService, finalExamName);
                      if (questionsParsed.length === 0) {
                        setXmlError("No se encontraron preguntas de tipo 'multichoice' válidas en el XML.");
                        setXmlSuccessCount(null);
                        return;
                      }
                      
                      // Si es examen nuevo, validar duplicados y crear
                      if (xmlTargetExamName === '') {
                        const nameExists = exams.some(ex => ex.servicio === xmlTargetService && ex.name.toLowerCase() === finalExamName.toLowerCase());
                        if (nameExists) {
                          setXmlError(`Ya existe un examen llamado "${finalExamName}" en este servicio. Por favor, elige otro nombre antes de subir.`);
                          setXmlSuccessCount(null);
                          return;
                        }
                        
                        addExam({
                          id: `EX-${Date.now()}`,
                          name: finalExamName,
                          servicio: xmlTargetService,
                          durationMinutes: 180,
                          description: `Examen creado dinámicamente desde archivo Moodle XML.`
                        });
                      }

                      // Guardar cada pregunta parsed en el store
                      questionsParsed.forEach(q => addQuestion(q));
                      
                      setXmlSuccessCount(questionsParsed.length);
                      setXmlError(null);
                    } catch (err: any) {
                      setXmlError(err.message || "Error al parsear el XML.");
                      setXmlSuccessCount(null);
                    }
                  };
                  reader.readAsText(file);
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '32px' }}>📂</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Arrastra aquí tu archivo XML o haz clic para buscar
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Solo se admiten archivos .xml válidos.
              </span>
            </div>

            {xmlError && (
              <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }}>
                ⚠️ {xmlError}
              </div>
            )}

            {xmlSuccessCount !== null && (
              <div style={{ color: '#16a34a', background: 'rgba(34,197,94,0.08)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }}>
                ✅ ¡Importación Exitosa! Se creó el examen y se agregaron <strong>{xmlSuccessCount}</strong> reactivos oficiales.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowXmlModal(false);
                  setXmlError(null);
                  setXmlSuccessCount(null);
                  setXmlImportExamName('');
                }}
                style={{ background: 'var(--brand-blue)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DIÁLOGO DE CONFIRMACIÓN Y ALERTA PREMIUM --- */}
      {customDialog && customDialog.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '32px',
            width: '90%',
            maxWidth: '420px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '20px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: customDialog.title.includes('Eliminar') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(229, 169, 59, 0.1)',
              color: customDialog.title.includes('Eliminar') ? '#ef4444' : '#ca8a04',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px'
            }}>
              {customDialog.title.includes('Eliminar') ? '🗑️' : '⚠️'}
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {customDialog.title}
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {customDialog.message}
            </p>

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
              {customDialog.type === 'confirm' ? (
                <>
                  <button
                    onClick={() => setCustomDialog(null)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '12px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (customDialog.onConfirm) customDialog.onConfirm();
                      setCustomDialog(null);
                    }}
                    style={{
                      flex: 1,
                      background: customDialog.title.includes('Eliminar') ? '#ef4444' : 'var(--brand-blue)',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: customDialog.title.includes('Eliminar') ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(30, 58, 138, 0.2)',
                      transition: 'all 0.2s'
                    }}
                  >
                    Confirmar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setCustomDialog(null)}
                  style={{
                    width: '100%',
                    background: 'var(--brand-blue)',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
                  }}
                >
                  Entendido
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
