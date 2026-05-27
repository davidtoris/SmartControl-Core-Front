import { useState } from 'react';
import { 
  AlertTriangle, CreditCard, Target, Megaphone, CheckCircle2, 
  X, ArrowUpRight, ArrowDownRight, Check, Target as TargetIcon, 
  TrendingUp, Send 
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Student } from '../store/useAppStore';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';

export default function Modals() {
  const { 
    showParentPortal, setShowParentPortal, 
    showNewEntryModal, setShowNewEntryModal,
    showNewExpenseModal, setShowNewExpenseModal,
    showReportModal, setShowReportModal,
    students, addTransaction, recordStudentPayment,
    categories
  } = useAppStore();

  // --- ESTADOS LOCALES PARA REGISTROS ---
  // Nueva Entrada (Ingreso)
  const [entradaStudentId, setEntradaStudentId] = useState<string>('');
  const [entradaConcepto, setEntradaConcepto] = useState<string>('');
  const [entradaCategoria, setEntradaCategoria] = useState<string>('Colegiatura / Mensualidad');
  const [entradaSubcategoria, setEntradaSubcategoria] = useState<string>('UNAM');
  const [entradaMonto, setEntradaMonto] = useState<string>('');
  const [entradaMetodo, setEntradaMetodo] = useState<string>('Transferencia');

  // Nuevo Gasto (Egreso)
  const [gastoConcepto, setGastoConcepto] = useState<string>('');
  const [gastoCategoria, setGastoCategoria] = useState<string>('Otro Gasto');
  const [gastoSubcategoria, setGastoSubcategoria] = useState<string>('Caja Chica');
  const [gastoMonto, setGastoMonto] = useState<string>('');
  const [gastoMetodo, setGastoMetodo] = useState<string>('Efectivo');

  // --- MANEJADORES DE CAMBIO CASCADA ---
  const handleEntradaCategoriaChange = (catName: string) => {
    setEntradaCategoria(catName);
    const catObj = categories.find(c => c.name === catName);
    if (catObj && catObj.subcategories.length > 0) {
      setEntradaSubcategoria(catObj.subcategories[0].name);
    } else {
      setEntradaSubcategoria('');
    }
  };

  const handleGastoCategoriaChange = (catName: string) => {
    setGastoCategoria(catName);
    const catObj = categories.find(c => c.name === catName);
    if (catObj && catObj.subcategories.length > 0) {
      setGastoSubcategoria(catObj.subcategories[0].name);
    } else {
      setGastoSubcategoria('');
    }
  };

  // --- MANEJADORES DE GUARDADO ---
  const handleSaveEntrada = () => {
    const amount = Number(entradaMonto) || 0;
    if (amount <= 0 || !entradaConcepto.trim()) return;

    let studentName = '-';
    let sId = Number(entradaStudentId);
    if (sId) {
      const student = students.find(s => s.id === sId);
      if (student) {
        studentName = student.name;
        // Registrar abono reactivamente en el saldo del alumno
        recordStudentPayment(sId, amount);
      }
    }

    const newTx = {
      id: `REC-0${Date.now().toString().slice(-4)}`,
      type: 'Entrada' as const,
      student: studentName,
      studentId: sId || undefined,
      concept: entradaConcepto,
      category: entradaCategoria,
      subcategory: entradaSubcategoria || undefined,
      amount: amount,
      date: '26 May 2026',
      status: 'Pagado'
    };

    addTransaction(newTx);
    
    // Limpiar y Cerrar
    setEntradaStudentId('');
    setEntradaConcepto('');
    setEntradaMonto('');
    setShowNewEntryModal(false);
  };

  const handleSaveGasto = () => {
    const amount = Number(gastoMonto) || 0;
    if (amount <= 0 || !gastoConcepto.trim()) return;

    const newTx = {
      id: `GAS-0${Date.now().toString().slice(-4)}`,
      type: 'Salida' as const,
      student: '-',
      concept: gastoConcepto,
      category: gastoCategoria,
      subcategory: gastoSubcategoria || undefined,
      amount: amount,
      date: '26 May 2026',
      status: 'Pagado'
    };

    addTransaction(newTx);

    // Limpiar y Cerrar
    setGastoConcepto('');
    setGastoMonto('');
    setShowNewExpenseModal(false);
  };

  return (
    <>
      {/* MODAL: Portal de Padres (Celular) */}
      {showParentPortal && (
        <div className="modal-overlay" style={{ zIndex: 200, background: 'rgba(15, 23, 42, 0.8)' }} onClick={() => setShowParentPortal(false)}>
          <div className="phone-mockup-container" onClick={e => e.stopPropagation()}>
            <div className="phone-mockup">
              <div className="phone-notch"></div>
              
              <div className="phone-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>C</div>
                    <span style={{ fontWeight: '600', fontSize: '16px', color: 'var(--text-primary)' }}>CRECE Portal</span>
                  </div>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowParentPortal(false)}>
                    <X size={20} />
                  </button>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Hola, Carlos</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>Tutor de Ana Sofía Martínez</p>
              </div>

              <div className="phone-content" style={{ background: '#f8fafc' }}>
                
                {/* Alerta de Pago */}
                <div className="phone-card" style={{ borderLeft: '4px solid #ef4444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: '600', marginBottom: '8px' }}>
                    <AlertTriangle size={16} /> Mensualidad Vencida
                  </div>
                  <p style={{ fontSize: '14px', margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>La mensualidad de Mayo ($2,500.00) venció hace 2 días.</p>
                  <button style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <CreditCard size={16} /> Pagar Ahora
                  </button>
                </div>

                {/* Rendimiento */}
                <div className="phone-card">
                  <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <Target size={16} color="var(--brand-blue)" /> Meta de Admisión: UNAM
                  </h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Actual: <strong style={{ color: 'var(--text-primary)' }}>98</strong> aciertos</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Meta: 111</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: 'var(--border-color)', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)', borderRadius: '100px' }}></div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#10b981', marginTop: '8px', fontWeight: '500', margin: '8px 0 0 0' }}>
                      ¡A solo 13 aciertos de Medicina! Vamos por excelente camino.
                    </p>
                  </div>

                  <button style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                    Descargar Reporte Completo
                  </button>
                </div>

                {/* Avisos */}
                <div className="phone-card">
                  <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <Megaphone size={16} color="var(--brand-yellow)" /> Avisos Recientes
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>Simulacro Presencial</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sábado 15 de Mayo, 08:00 AM</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>Asistencia a Clase</div>
                      <div style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Ana Sofía asistió hoy a tiempo.
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nueva Entrada (Ingreso) */}
      {showNewEntryModal && (
        <div className="modal-overlay" onClick={() => setShowNewEntryModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '16px' }}>
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Registrar Nueva Entrada (Ingreso)</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Ingreso por pago de alumno u otro concepto de caja</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowNewEntryModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Vincular a Alumno (Opcional)</label>
                <select className="form-input" value={entradaStudentId} onChange={e => setEntradaStudentId(e.target.value)}>
                  <option value="">Ninguno (Ingreso General)</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.curso}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Concepto de Entrada *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej. Mensualidad Mayo" 
                  value={entradaConcepto} 
                  onChange={e => setEntradaConcepto(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Categoría *</label>
                  <select 
                    className="form-input" 
                    value={entradaCategoria} 
                    onChange={e => handleEntradaCategoriaChange(e.target.value)}
                  >
                    {categories.filter(c => c.type === 'income').map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Subcategoría *</label>
                  <select 
                    className="form-input" 
                    value={entradaSubcategoria} 
                    onChange={e => setEntradaSubcategoria(e.target.value)}
                  >
                    {categories.find(c => c.name === entradaCategoria)?.subcategories.map(sub => (
                      <option key={sub.id} value={sub.name}>{sub.name}</option>
                    )) || <option value="">Sin subcategorías</option>}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Monto a Cobrar ($) *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: '600' }}>$</span>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="0.00" 
                      style={{ paddingLeft: '32px' }} 
                      value={entradaMonto}
                      onChange={e => setEntradaMonto(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Método de Cobro</label>
                  <select className="form-input" value={entradaMetodo} onChange={e => setEntradaMetodo(e.target.value)}>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowNewEntryModal(false)}>
                Cancelar
              </button>
              <button 
                style={{ 
                  background: '#16a34a', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  color: 'white', 
                  fontWeight: '600', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: Number(entradaMonto) > 0 && entradaConcepto.trim() ? 'pointer' : 'not-allowed', 
                  opacity: Number(entradaMonto) > 0 && entradaConcepto.trim() ? 1 : 0.6,
                  boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)' 
                }} 
                disabled={!(Number(entradaMonto) > 0 && entradaConcepto.trim())}
                onClick={handleSaveEntrada}
              >
                <Check size={16} /> Registrar Cobro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nuevo Gasto (Egreso) */}
      {showNewExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowNewExpenseModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '16px' }}>
                  <ArrowDownRight size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Registrar Nuevo Egreso (Gasto)</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Registrar salida de capital por insumos, publicidad o rentas</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowNewExpenseModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Concepto de Gasto *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej. Renta Local Mayo" 
                  value={gastoConcepto} 
                  onChange={e => setGastoConcepto(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Categoría *</label>
                  <select 
                    className="form-input" 
                    value={gastoCategoria} 
                    onChange={e => handleGastoCategoriaChange(e.target.value)}
                  >
                    {categories.filter(c => c.type === 'expense').map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Subcategoría *</label>
                  <select 
                    className="form-input" 
                    value={gastoSubcategoria} 
                    onChange={e => setGastoSubcategoria(e.target.value)}
                  >
                    {categories.find(c => c.name === gastoCategoria)?.subcategories.map(sub => (
                      <option key={sub.id} value={sub.name}>{sub.name}</option>
                    )) || <option value="">Sin subcategorías</option>}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Monto del Gasto ($) *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: '600' }}>$</span>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="0.00" 
                      style={{ paddingLeft: '32px' }} 
                      value={gastoMonto}
                      onChange={e => setGastoMonto(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Método de Pago</label>
                  <select className="form-input" value={gastoMetodo} onChange={e => setGastoMetodo(e.target.value)}>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowNewExpenseModal(false)}>
                Cancelar
              </button>
              <button 
                style={{ 
                  background: '#ef4444', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  color: 'white', 
                  fontWeight: '600', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: Number(gastoMonto) > 0 && gastoConcepto.trim() ? 'pointer' : 'not-allowed', 
                  opacity: Number(gastoMonto) > 0 && gastoConcepto.trim() ? 1 : 0.6,
                  boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)' 
                }} 
                disabled={!(Number(gastoMonto) > 0 && gastoConcepto.trim())}
                onClick={handleSaveGasto}
              >
                <Check size={16} /> Guardar Gasto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reporte de Éxito */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '16px' }}>
                  {showReportModal.avatar}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Reporte de Éxito</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{showReportModal.name} • {showReportModal.curso}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowReportModal(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Evolución de Puntaje</h4>
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer>
                  <BarChart data={[
                    { examen: 'Diagnóstico', aciertos: 45 },
                    { examen: 'Simulacro 1', aciertos: 72 },
                    { examen: 'Simulacro Final', aciertos: 98 }
                  ]} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="examen" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="aciertos" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} name="Aciertos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <TargetIcon size={18} color="#3b82f6" /> Meta de Ingreso: Medicina UNAM
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Faltan 13 aciertos</span>
                  </div>
                  <div style={{ width: '100%', height: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #1e3a8a, #3b82f6)', borderRadius: '100px' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    <span>Diagnóstico: 45</span>
                    <span style={{ color: '#3b82f6', fontWeight: '600' }}>Simulacro Actual: 98</span>
                    <span style={{ fontWeight: '600' }}>Meta: 111</span>
                  </div>
                </div>

                <div className="success-badge" style={{ marginTop: '0' }}>
                  <TrendingUp size={16} /> Incremento del 117% en aciertos
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowReportModal(null)}>
                Cerrar
              </button>
              <button style={{ background: '#25D366', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 211, 102, 0.2)' }}>
                <Send size={16} /> Enviar PDF al Tutor
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
