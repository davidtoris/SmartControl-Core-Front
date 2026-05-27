import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, ArrowDownRight, Wallet, AlertTriangle, Users, 
  CreditCard, Filter, CheckCircle2, AlertCircle, BookmarkCheck,
  TrendingUp, BarChart3, PieChart as PieIcon, Percent, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function FinanzasPage() {
  const navigate = useNavigate();
  const { 
    setShowNewEntryModal, 
    setShowNewExpenseModal,
    students, 
    transactions 
  } = useAppStore();

  // Tab activa de adeudos: 'Todos' (con adeudo), 'Atrasados' (3+ días de retraso), 'Liquidados' (sin adeudo)
  const [debtTab, setDebtTab] = useState<'Todos' | 'Atrasados' | 'Liquidados'>('Todos');

  // --- CÁLCULO DE KPIs FINANCIEROS (REACTIVOS) ---
  const totalIngresos = transactions.filter(t => t.type === 'Entrada').reduce((acc, curr) => acc + curr.amount, 0);
  const totalEgresos = transactions.filter(t => t.type === 'Salida').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIngresos - totalEgresos;
  const totalAdeudos = students.reduce((acc, curr) => acc + (curr.paymentPlan.totalCost - curr.paymentPlan.amountPaid), 0);

  // --- ANALÍTICAS FINANCIERAS INTERACTIVAS ---
  const [showAnalytics, setShowAnalytics] = useState<boolean>(true);

  // 1. Ingresos agrupados por Categoría
  const incomeTxs = transactions.filter(t => t.type === 'Entrada');
  const incomeCategoryMap = incomeTxs.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const incomeChartData = Object.entries(incomeCategoryMap).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS_INCOME = ['#10b981', '#0ea5e9', '#1e3a8a', '#f59e0b', '#06b6d4', '#2563eb'];

  // 2. Egresos agrupados por Categoría
  const expenseTxs = transactions.filter(t => t.type === 'Salida');
  const expenseCategoryMap = expenseTxs.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const expenseChartData = Object.entries(expenseCategoryMap).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS_EXPENSE = ['#f43f5e', '#f97316', '#475569', '#cbd5e1', '#ef4444', '#3b82f6'];

  // 3. Progreso Histórico de Caja (Timeline)
  const parseMockDate = (dateStr: string) => {
    const parts = dateStr.split(' ');
    if (parts.length < 3) return new Date();
    const day = parseInt(parts[0], 10);
    const months: Record<string, number> = {
      'Jan': 0, 'Ene': 0,
      'Feb': 1,
      'Mar': 2,
      'Apr': 3, 'Abr': 3,
      'May': 4,
      'Jun': 5,
      'Jul': 6,
      'Aug': 7, 'Ago': 7,
      'Sep': 8,
      'Oct': 9,
      'Nov': 10,
      'Dec': 11, 'Dic': 11
    };
    const monthName = parts[1].substring(0, 3);
    const month = months[monthName] !== undefined ? months[monthName] : 4;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    return parseMockDate(a.date).getTime() - parseMockDate(b.date).getTime();
  });

  let runningBalance = 0;
  const historyMap: Record<string, { date: string; balance: number; ingresos: number; egresos: number }> = {};
  
  sortedTransactions.forEach(tx => {
    const dStr = tx.date;
    if (tx.type === 'Entrada') runningBalance += tx.amount;
    else runningBalance -= tx.amount;

    if (!historyMap[dStr]) {
      const parts = dStr.split(' ');
      const xLabel = parts.length >= 2 ? `${parts[0]} ${parts[1]}` : dStr;
      historyMap[dStr] = { date: xLabel, balance: runningBalance, ingresos: 0, egresos: 0 };
    }
    historyMap[dStr].balance = runningBalance;
    if (tx.type === 'Entrada') historyMap[dStr].ingresos += tx.amount;
    else historyMap[dStr].egresos += tx.amount;
  });

  const timelineChartData = Object.values(historyMap);

  // 4. Métrica de Cobranza (Recuperación)
  const totalFacturado = totalIngresos + totalAdeudos;
  const recoveryRate = totalFacturado > 0 ? Math.round((totalIngresos / totalFacturado) * 100) : 0;

  // --- LÓGICA DE ALERTA DE MENSUALIDADES (HOY: 26 MAYO 2026) ---
  const today = new Date('2026-05-26');

  const getOverdueDays = (nextPaymentDate?: string) => {
    if (!nextPaymentDate) return 0;
    const due = new Date(nextPaymentDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isPastDue3Days = (nextPaymentDate?: string) => {
    const days = getOverdueDays(nextPaymentDate);
    return days >= 3;
  };

  // --- FILTRADO DE ALUMNOS EN LA TABLA ---
  const filteredStudents = students.filter(student => {
    const debt = student.paymentPlan.totalCost - student.paymentPlan.amountPaid;
    
    if (debtTab === 'Liquidados') {
      return debt === 0;
    }
    if (debtTab === 'Atrasados') {
      return debt > 0 && isPastDue3Days(student.nextPaymentDate);
    }
    // 'Todos': Alumnos con adeudo activo (> 0)
    return debt > 0;
  });

  // Conteo rápido para insignias de pestañas
  const countAtrasados = students.filter(s => {
    const debt = s.paymentPlan.totalCost - s.paymentPlan.amountPaid;
    return debt > 0 && isPastDue3Days(s.nextPaymentDate);
  }).length;

  const countLiquidados = students.filter(s => {
    const debt = s.paymentPlan.totalCost - s.paymentPlan.amountPaid;
    return debt === 0;
  }).length;

  // --- ENLACE DE COLORES POR CATEGORÍA ---
  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('colegiatura') || cat.includes('mensualidad')) return { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' };
    if (cat.includes('inscripción')) return { bg: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' };
    if (cat.includes('publicidad')) return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
    if (cat.includes('renta')) return { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569' };
    if (cat.includes('material') || cat.includes('papelería')) return { bg: 'rgba(20, 184, 166, 0.1)', color: '#0d9488' };
    if (cat.includes('sueldo') || cat.includes('docente')) return { bg: 'rgba(236, 72, 153, 0.1)', color: '#db2777' };
    return { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569' };
  };

  return (
    <div className="finanzas-view" style={{ padding: '0 40px 40px' }}>
      <div className="card-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)' }}>Control de Finanzas</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>Seguimiento de entradas, salidas y planes de pago por alumno.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-secondary" 
            style={{ 
              width: 'auto', 
              padding: '10px 20px', 
              gap: '8px', 
              cursor: 'pointer',
              background: showAnalytics ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              color: showAnalytics ? 'var(--brand-blue)' : 'var(--text-secondary)',
              borderColor: showAnalytics ? 'rgba(59, 130, 246, 0.2)' : 'var(--border-color)',
              display: 'flex',
              alignItems: 'center'
            }} 
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 size={18} />
            {showAnalytics ? 'Ocultar Analíticas' : 'Ver Analíticas'}
          </button>
          <button 
            className="btn-secondary" 
            style={{ width: 'auto', padding: '10px 24px', gap: '8px', cursor: 'pointer' }} 
            onClick={() => setShowNewEntryModal(true)}
          >
            <ArrowUpRight size={18} /> Nueva Entrada
          </button>
          <button 
            className="btn-secondary" 
            style={{ width: 'auto', padding: '10px 24px', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'transparent', cursor: 'pointer' }}
            onClick={() => setShowNewExpenseModal(true)}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} 
            onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            <ArrowDownRight size={18} /> Nuevo Gasto
          </button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="bento-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}><ArrowUpRight size={20} /></div>
            <span style={{ fontWeight: '500' }}>Ingresos Totales</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>${totalIngresos.toLocaleString()}</div>
        </div>

        <div className="bento-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><ArrowDownRight size={20} /></div>
            <span style={{ fontWeight: '500' }}>Egresos (Salidas)</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>${totalEgresos.toLocaleString()}</div>
        </div>

        <div className="bento-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><Wallet size={20} /></div>
            <span style={{ fontWeight: '500' }}>Balance Actual</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>${balance.toLocaleString()}</div>
        </div>

        <div className="bento-card" style={{ padding: '20px', border: '1px solid rgba(234, 179, 8, 0.2)', background: 'linear-gradient(to right, var(--glass-bg), rgba(234, 179, 8, 0.05))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' }}><AlertTriangle size={20} /></div>
            <span style={{ fontWeight: '500' }}>Adeudos por Cobrar</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ca8a04' }}>${totalAdeudos.toLocaleString()}</div>
        </div>
      </div>

      {/* SECCIÓN DE ANALÍTICAS AVANZADAS */}
      {showAnalytics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          
          {/* Fila 1: Tendencia de Balance y Eficiencia de Cobro */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            
            {/* Gráfica de Tendencia (Timeline) */}
            <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="var(--brand-blue)" /> Tendencia del Balance de Caja
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Histórico acumulado</span>
              </div>
              
              <div style={{ width: '100%', height: '240px' }}>
                <ResponsiveContainer>
                  <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', background: 'var(--bg-card)' }}
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Balance Acumulado']}
                    />
                    <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBalance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Métrica de Cobranza (Recovery Rate) */}
            <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.02) 100%)' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Percent size={18} color="#10b981" /> Eficiencia de Cobro
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Relación entre dinero cobrado y deudas vigentes.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
                
                {/* Visual circular conic progress */}
                <div style={{ 
                  position: 'relative', 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  background: `conic-gradient(#10b981 ${recoveryRate * 3.6}deg, var(--border-color) 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.1)'
                }}>
                  <div style={{ 
                    width: '94px', 
                    height: '94px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-card)', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>{recoveryRate}%</span>
                    <span style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recuperado</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Cobrado:</span>
                  <strong style={{ color: '#16a34a' }}>${totalIngresos.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Por Cobrar:</span>
                  <strong style={{ color: '#ca8a04' }}>${totalAdeudos.toLocaleString()}</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Fila 2: Distribución de Ingresos y Egresos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Gráfica de Ingresos */}
            <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieIcon size={18} color="#10b981" /> Distribución de Ingresos
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                <div style={{ width: '130px', height: '130px', flexShrink: 0 }}>
                  {incomeChartData.length > 0 ? (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={incomeChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={58}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {incomeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_INCOME[index % COLORS_INCOME.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: any) => `$${val.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '12px', color: 'var(--text-secondary)' }}>Sin datos</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {incomeChartData.map((item, index) => {
                    const percentage = totalIngresos > 0 ? Math.round((item.value / totalIngresos) * 100) : 0;
                    const color = COLORS_INCOME[index % COLORS_INCOME.length];
                    return (
                      <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={item.name}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                            {item.name}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '11px', flexShrink: 0 }}>
                            ${item.value.toLocaleString()} ({percentage}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '100px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Gráfica de Egresos */}
            <div className="bento-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieIcon size={18} color="#ef4444" /> Distribución de Gastos (Salidas)
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                <div style={{ width: '130px', height: '130px', flexShrink: 0 }}>
                  {expenseChartData.length > 0 ? (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={expenseChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={58}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {expenseChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_EXPENSE[index % COLORS_EXPENSE.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: any) => `$${val.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '12px', color: 'var(--text-secondary)' }}>Sin datos</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {expenseChartData.map((item, index) => {
                    const percentage = totalEgresos > 0 ? Math.round((item.value / totalEgresos) * 100) : 0;
                    const color = COLORS_EXPENSE[index % COLORS_EXPENSE.length];
                    return (
                      <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={item.name}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                            {item.name}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '11px', flexShrink: 0 }}>
                            ${item.value.toLocaleString()} ({percentage}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '100px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Tabla de Adeudos por Alumno */}
        <div className="bento-card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--brand-blue)" /> Seguimiento de Adeudos
            </h3>
            
            {/* Pestañas de Filtro Financiero */}
            <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '4px', borderRadius: '8px', gap: '4px' }}>
              {[
                { id: 'Todos' as const, label: 'Todos con Adeudo' },
                { id: 'Atrasados' as const, label: `Atrasados 3+ Días ⚠️`, count: countAtrasados },
                { id: 'Liquidados' as const, label: 'Liquidados ✅', count: countLiquidados }
              ].map(t => {
                const isActive = debtTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDebtTab(t.id)}
                    style={{
                      flex: 1,
                      background: isActive ? 'var(--bg-card)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: isActive ? 'var(--brand-blue)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {t.label}
                    {t.count !== undefined && t.count > 0 && (
                      <span style={{
                        background: t.id === 'Atrasados' ? '#ef4444' : '#16a34a',
                        color: 'white',
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '100px',
                        fontWeight: '700'
                      }}>{t.count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>ALUMNO</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>PLAN / VENCIMIENTO</th>
                  <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>ESTADO / ADEUDO</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const debt = student.paymentPlan.totalCost - student.paymentPlan.amountPaid;
                    const overdueDays = getOverdueDays(student.nextPaymentDate);
                    const isOverdue = debt > 0 && overdueDays >= 3;

                    return (
                      <tr 
                        key={student.id} 
                        style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
                        onClick={() => navigate(`/alumnos/${student.id}`)}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.025)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--brand-blue)', fontSize: '14px' }}>
                          <span style={{ borderBottom: '1px solid transparent', transition: 'border-color 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--brand-blue)'}
                                onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                            {student.name}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          {student.paymentPlan.type} <br/>
                          {debt > 0 && student.nextPaymentDate ? (
                            <span style={{ fontSize: '11px', color: isOverdue ? '#ef4444' : 'var(--text-secondary)' }}>
                              Vence: {new Date(student.nextPaymentDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                            </span>
                          ) : debt === 0 ? (
                            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <BookmarkCheck size={12} /> Plan Liquidado
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px' }}>Sin vencimiento</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                            <span style={{ 
                              padding: '4px 10px', 
                              borderRadius: '100px', 
                              fontSize: '13px', 
                              fontWeight: '600',
                              background: debt > 0 ? (isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)') : 'rgba(34, 197, 94, 0.1)',
                              color: debt > 0 ? (isOverdue ? '#ef4444' : '#ca8a04') : '#16a34a'
                            }}>
                              ${debt.toLocaleString()}
                            </span>
                            
                            {/* Semaforización Badge */}
                            {debt > 0 && (
                              <span style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                padding: '2px 8px',
                                borderRadius: '100px',
                                background: isOverdue ? 'rgba(239, 68, 68, 0.08)' : 'rgba(100, 116, 139, 0.05)',
                                color: isOverdue ? '#ef4444' : 'var(--text-secondary)'
                              }}>
                                {isOverdue ? `⚠️ Atrasado: ${overdueDays} días` : 'Al corriente'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      No se encontraron alumnos en esta categoría.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historial de Transacciones (Entradas y Salidas) */}
        <div className="bento-card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="var(--brand-yellow)" /> Entradas y Salidas
            </h3>
            <button style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <Filter size={14} /> Filtrar
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>TIPO / CATEGORÍA</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>CONCEPTO / ORIGEN</th>
                  <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>MONTO</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item, i) => {
                  const pill = getCategoryColor(item.category);
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '6px', 
                            fontSize: '11px', 
                            fontWeight: '700',
                            background: item.type === 'Entrada' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: item.type === 'Entrada' ? '#16a34a' : '#ef4444',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {item.type === 'Entrada' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {item.type}
                          </span>
                          
                          {/* Categoría Badge */}
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '100px',
                            fontSize: '10px',
                            fontWeight: '600',
                            background: pill.bg,
                            color: pill.color,
                            display: 'inline-flex',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                          }}>
                            <span>{item.category}</span>
                            {item.subcategory && (
                              <>
                                <span style={{ opacity: 0.4, margin: '0 4px', fontSize: '9px' }}>&gt;</span>
                                <span style={{ opacity: 0.85, fontWeight: '500' }}>{item.subcategory}</span>
                              </>
                            )}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '14px' }}>{item.concept}</div>
                        {item.student !== '-' && (
                          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>Alumno: {item.student}</div>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: item.type === 'Entrada' ? 'var(--text-primary)' : '#ef4444' }}>
                        {item.type === 'Entrada' ? '+' : '-'}${item.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
