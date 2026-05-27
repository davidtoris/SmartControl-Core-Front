import React, { useState, useEffect, useRef } from 'react';
import { 
  Tag, Plus, TrendingUp, TrendingDown, 
  Check, AlertCircle, Sparkles, FolderPlus,
  Coins, Timer, BookOpen, Clock, AlertTriangle, 
  Award, RefreshCw, BarChart2, Star, Play, 
  ChevronLeft, ChevronRight, CheckCircle2, User, 
  ListOrdered, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { ExamAttempt } from '../store/useAppStore';

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
    explanation: 'Primero evaluamos f(4): 4² - 3(4) + 2 = 16 - 12 + 2 = 6. Luego evaluamos f(2): 2² - 3(2) + 2 = 4 - 6 + 2 = 0. Finalmente restamos: f(4) - f(2) = 6 - 0 = 6.'
  },
  {
    subject: 'Física',
    question: 'Un automóvil viaja a una velocidad constante de 72 km/h. ¿Cuál es su velocidad equivalente en metros por segundo (m/s)?',
    options: {
      A: '15 m/s',
      B: '20 m/s',
      C: '25 m/s',
      D: '10 m/s'
    },
    correct: 'B',
    explanation: 'Para convertir de km/h a m/s, dividimos entre el factor de conversión 3.6: 72 / 3.6 = 20 m/s. Alternativamente: (72 * 1000m) / 3600s = 72000 / 3600 = 20 m/s.'
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
    question: '¿Cuál es el área de un círculo cuyo diámetro mide 10 cm? (Considera π ≈ 3.14)',
    options: {
      A: '314.0 cm²',
      B: '78.5 cm²',
      C: '31.4 cm²',
      D: '15.7 cm²'
    },
    correct: 'B',
    explanation: 'Si el diámetro mide 10 cm, el radio es de 5 cm (d/2). El área se calcula con la fórmula A = π * r²: A = 3.14 * 5² = 3.14 * 25 = 78.5 cm².'
  }
];

export default function ExamenPage() {
  const { students, addExamAttempt } = useAppStore();

  // Estados de control de Flujo
  const [screen, setScreen] = useState<'selection' | 'test' | 'results'>('selection');
  
  // Selección Inicial
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [selectedExamName, setSelectedExamName] = useState<string>('Examen de Admisión UNAM 2026');

  // Estado del Examen Activo
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
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

  // --- INICIAR EXAMEN ---
  const handleStartExam = () => {
    if (!selectedStudentId) return;
    setAnswers({});
    setFlaggedQuestions({});
    setAuditLog([]);
    setCurrentQuestionIndex(0);
    setTimeLeft(totalDuration);
    setStartedAt(new Date().toISOString());
    setScreen('test');
    
    // Log inicial
    const timeStr = new Date().toLocaleTimeString('es-MX', { hour12: false });
    setAuditLog([{ timestamp: timeStr, action: 'Inició el examen.' }]);
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
    addLog(`Respondió Pregunta ${currentQuestionIndex + 1} con Opción ${option}.`);
  };

  // --- MARCAR PREGUNTA ---
  const handleToggleFlag = () => {
    const isCurrentlyFlagged = flaggedQuestions[currentQuestionIndex];
    setFlaggedQuestions(prev => ({ ...prev, [currentQuestionIndex]: !isCurrentlyFlagged }));
    addLog(isCurrentlyFlagged 
      ? `Desmarcó Pregunta ${currentQuestionIndex + 1} de revisión.` 
      : `Marcó Pregunta ${currentQuestionIndex + 1} para revisión posterior. ⚠️`
    );
  };

  // --- NAVEGACIÓN ---
  const handleNextQuestion = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      addLog(`Navegó a Pregunta ${currentQuestionIndex + 2}.`);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      addLog(`Navegó a Pregunta ${currentQuestionIndex}.`);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    addLog(`Saltó directo a Pregunta ${index + 1}.`);
  };

  // --- ENVIAR Y CALCULAR RESULTADOS ---
  const handleSubmitExam = (byTimeout = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!student) return;

    const endedAtStr = new Date().toISOString();
    const duration = totalDuration - timeLeft;

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

    const attempt: ExamAttempt = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      examName: selectedExamName,
      score,
      max: examQuestions.length,
      startedAt,
      endedAt: endedAtStr,
      durationSeconds: duration,
      answers,
      auditLog: finalLog
    };

    // Registrar en Zustand
    addExamAttempt(student.id, attempt);
    setCompletedAttempt(attempt);
    setScreen('results');
    
    // Disparar confeti nativo
    setTimeout(() => {
      startConfetti();
    }, 100);
  };

  // --- ENGINE DE CONFETI NATIVO ---
  const startConfetti = () => {
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const pieces: { x: number; y: number; size: number; color: string; speedX: number; speedY: number; rotation: number; rotationSpeed: number }[] = [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#eab308', '#0ea5e9'];
    
    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height - 20,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 5 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2
      });
    }
    
    let animationId: number;
    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;
        if (p.y < canvas.height) alive = true;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      if (alive) animationId = requestAnimationFrame(update);
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
          padding: 10px 12px;
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
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>C</div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>CRECE Evaluaciones</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Portal Inteligente de Exámenes</p>
          </div>
        </div>

        {screen === 'test' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Indicador de Auto-Save */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '100px' }}>
              <div className="auto-save-dot" style={{ background: isAutoSaving ? '#3b82f6' : '#22c55e' }}></div>
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
          <button 
            onClick={() => setScreen('selection')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            <ChevronLeft size={16} /> Salir a Inicio
          </button>
        )}
      </header>

      <div style={{ maxWidth: '1200px', margin: '40px auto 0', padding: '0 24px' }}>
        
        {/* ========================================================
            1. PANTALLA DE SELECCIÓN E INSTRUCCIONES
            ======================================================== */}
        {screen === 'selection' && (
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
                    onChange={e => setSelectedStudentId(Number(e.target.value) || '')}
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
                    <option value="Examen de Admisión UNAM 2026">Simulacro de Admisión UNAM (10 reactivos multidisciplinares)</option>
                    <option value="Evaluación COMIPEMS">Evaluación COMIPEMS (Básico Secundaria)</option>
                    <option value="Simulacro de Competencia IPN">Simulacro de Competencia IPN (Matemáticas Avanzadas)</option>
                  </select>
                </div>
              </div>

              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
                  <Info size={16} color="var(--brand-blue)" /> Instrucciones y Reglas:
                </div>
                <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>La prueba tiene una duración estricta de <strong>10 minutos (600 segundos)</strong>.</li>
                  <li>El progreso se guarda de forma <strong>instantánea</strong> con cada clic. No hay riesgo de pérdida de datos.</li>
                  <li>Puedes marcar reactivos de difícil resolución para revisarlos en la cuadrícula antes de enviar.</li>
                  <li>Al finalizar obtendrás la justificación didáctica completa de cada opción.</li>
                </ul>
              </div>

              <button
                onClick={handleStartExam}
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
                          </div>
                          <div style={{
                            background: att.score >= 8 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                            color: att.score >= 8 ? '#16a34a' : '#ca8a04',
                            fontWeight: '700',
                            fontSize: '14px',
                            padding: '4px 12px',
                            borderRadius: '100px'
                          }}>
                            {att.score} / {att.max} aciertos
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
            2. PANTALLA EXAMEN ACTIVO (MOTOR DE EXAMEN)
            ======================================================== */}
        {screen === 'test' && student && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
            
            {/* Caja de Pregunta Central */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="question-card" style={{ minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
                {/* Header de Pregunta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '100px', fontWeight: '700' }}>
                      {examQuestions[currentQuestionIndex].subject}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                      Reactivo {currentQuestionIndex + 1} de {examQuestions.length}
                    </span>
                  </div>

                  <button 
                    onClick={handleToggleFlag}
                    style={{
                      background: flaggedQuestions[currentQuestionIndex] ? 'rgba(234, 179, 8, 0.1)' : 'transparent',
                      border: '1px solid ' + (flaggedQuestions[currentQuestionIndex] ? 'rgba(234, 179, 8, 0.3)' : 'var(--border-color)'),
                      borderRadius: '8px',
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: flaggedQuestions[currentQuestionIndex] ? '#ca8a04' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Star size={14} fill={flaggedQuestions[currentQuestionIndex] ? '#eab308' : 'none'} color={flaggedQuestions[currentQuestionIndex] ? '#eab308' : 'currentColor'} />
                    {flaggedQuestions[currentQuestionIndex] ? 'Marcada para revisión' : 'Marcar para revisión'}
                  </button>
                </div>

                {/* Enunciado */}
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '24px' }}>
                  {examQuestions[currentQuestionIndex].question}
                </h3>

                {/* Opciones */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
                  {Object.entries(examQuestions[currentQuestionIndex].options).map(([key, value]) => {
                    const isSelected = answers[currentQuestionIndex] === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleAnswerSelect(key)}
                        className={`option-button ${isSelected ? 'selected' : ''}`}
                      >
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                          color: isSelected ? 'white' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '13px'
                        }}>
                          {key}
                        </div>
                        <span style={{ fontSize: '15px' }}>{value}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botones de Navegación de Preguntas */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentQuestionIndex === 0 ? 0.4 : 1,
                    transition: 'var(--transition)'
                  }}
                >
                  <ChevronLeft size={16} /> Anterior
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
                      borderRadius: '10px',
                      padding: '10px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <CheckCircle2 size={16} /> Finalizar y Entregar Examen
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
                      borderRadius: '10px',
                      padding: '10px 18px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
                      transition: 'var(--transition)'
                    }}
                  >
                    Siguiente <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Panel de Moodle Navigator & Audit Log */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Cuadrícula estilo Moodle */}
              <div className="question-card">
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ListOrdered size={16} color="var(--brand-blue)" /> Navegación del Examen
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '24px' }}>
                  {examQuestions.map((_, index) => {
                    const isCurrent = currentQuestionIndex === index;
                    const isAnswered = answers[index] !== undefined;
                    const isFlagged = flaggedQuestions[index] === true;

                    // Determinar colores de fondo
                    let cellBg = 'var(--bg-main)';
                    let cellBorder = '1px solid var(--border-color)';
                    let cellColor = 'var(--text-secondary)';

                    if (isAnswered) {
                      cellBg = 'rgba(34, 197, 94, 0.1)';
                      cellBorder = '1px solid rgba(34, 197, 94, 0.3)';
                      cellColor = '#16a34a';
                    }

                    if (isCurrent) {
                      cellBorder = '2px solid var(--accent-primary)';
                      cellColor = 'var(--accent-primary)';
                      if (isAnswered) {
                        cellBg = 'rgba(34, 197, 94, 0.15)';
                      }
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleJumpToQuestion(index)}
                        className="nav-cell"
                        style={{
                          background: cellBg,
                          border: cellBorder,
                          color: cellColor,
                        }}
                      >
                        {index + 1}
                        {isFlagged && (
                          <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#eab308', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Star size={7} fill="white" color="white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-main)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '3px' }}></div>
                    <span>No visitada / Sin responder</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '3px' }}></div>
                    <span>Respondida y Guardada reactivamente</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', border: '2px solid var(--accent-primary)', borderRadius: '3px' }}></div>
                    <span>Reactivo actual</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#eab308', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Star size={6} fill="white" color="white" />
                    </div>
                    <span>Marcada para revisión (flagged)</span>
                  </div>
                </div>
              </div>

              {/* Bitácora de Clicks del Intento */}
              <div className="question-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '280px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="var(--brand-yellow)" /> Bitácora de Navegación del Intento (Audit Log)
                </h3>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--bg-main)', padding: '8px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  {auditLog.length > 0 ? (
                    auditLog.slice().reverse().map((log, index) => (
                      <div key={index} className="audit-item">
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--accent-primary)' }}>{log.timestamp}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{log.action}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>Sin interacciones registradas.</div>
                  )}
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
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
              border: '2px solid rgba(59, 130, 246, 0.1)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  <Award size={16} /> ¡Examen Simulado Finalizado!
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
                  Resultados Obtenidos por {student.name}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                  Se ha generado el expediente de intento y guardado la bitácora técnica de navegación de forma exitosa en la base del sistema administrativo.
                </p>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px', flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Calificación</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: completedAttempt.score >= 8 ? '#16a34a' : '#ca8a04', marginTop: '6px' }}>
                      {completedAttempt.score} <span style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>/ {completedAttempt.max} aciertos</span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px', flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Duración de la Prueba</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '12px' }}>
                      {Math.floor(completedAttempt.durationSeconds / 60)}m {completedAttempt.durationSeconds % 60}s
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Comparativa UNAM */}
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
            </div>

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

          </div>
        )}

      </div>
    </div>
  );
}
