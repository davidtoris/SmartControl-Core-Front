import React, { useState } from 'react';
import { 
  Tag, Plus, TrendingUp, TrendingDown, 
  Check, AlertCircle, Sparkles, FolderPlus,
  Coins, Folder, FolderOpen, ChevronRight, ChevronDown, 
  CornerDownRight, Layers
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Category } from '../store/useAppStore';

export default function ConfiguracionPage() {
  const { 
    categories,
    addCategory, 
    addSubcategory,
    transactions
  } = useAppStore();

  // --- CONFIGURACIÓN DE MODOS DE FORMULARIO ---
  // 'category' = Crear Categoría Principal
  // 'subcategory' = Agregar Subcategoría a una existente
  const [formMode, setFormMode] = useState<'category' | 'subcategory'>('category');

  // Categoría Principal
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('income');

  // Subcategoría
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');

  // Feedback y Árbol de Expansión
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null
  });

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // --- MANEJADORES DE ÁRBOL EXPANDIBLE ---
  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: prev[catId] === false ? true : false // Se asume true por defecto
    }));
  };

  // --- CÓMPUTOS DE FRECUENCIAS REACTIVAS ---
  const getCategoryCount = (catName: string) => {
    return transactions.filter(t => t.category === catName).length;
  };

  const getSubcategoryCount = (catName: string, subName: string) => {
    return transactions.filter(t => t.category === catName && t.subcategory === subName).length;
  };

  const totalSubcategoriesCount = categories.reduce((acc, cat) => acc + cat.subcategories.length, 0);

  // --- ENVIAR NUEVO REGISTRO ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formMode === 'category') {
      const cleanName = categoryName.trim();
      if (!cleanName) {
        setFeedback({ message: 'El nombre de la categoría no puede estar vacío.', type: 'error' });
        return;
      }

      // Validar si ya existe una con el mismo nombre y tipo
      const exists = categories.some(
        cat => cat.type === categoryType && cat.name.toLowerCase() === cleanName.toLowerCase()
      );

      if (exists) {
        setFeedback({ 
          message: `La categoría de ${categoryType === 'income' ? 'ingreso' : 'egreso'} "${cleanName}" ya existe.`, 
          type: 'error' 
        });
        return;
      }

      const newId = `CAT-${categoryType === 'income' ? 'INC' : 'EXP'}-${Date.now().toString().slice(-4)}`;
      const newCat: Category = {
        id: newId,
        name: cleanName,
        type: categoryType,
        subcategories: []
      };

      addCategory(newCat);
      setFeedback({ message: `Categoría Principal "${cleanName}" creada con éxito.`, type: 'success' });
      setCategoryName('');
    } else {
      const cleanSubName = subcategoryName.trim();
      if (!parentCategoryId) {
        setFeedback({ message: 'Selecciona una Categoría Principal.', type: 'error' });
        return;
      }
      if (!cleanSubName) {
        setFeedback({ message: 'El nombre de la subcategoría no puede estar vacío.', type: 'error' });
        return;
      }

      const parentCat = categories.find(c => c.id === parentCategoryId);
      if (!parentCat) {
        setFeedback({ message: 'La categoría principal seleccionada no existe.', type: 'error' });
        return;
      }

      // Validar duplicados en la misma categoría principal
      const exists = parentCat.subcategories.some(
        sub => sub.name.toLowerCase() === cleanSubName.toLowerCase()
      );

      if (exists) {
        setFeedback({ 
          message: `La subcategoría "${cleanSubName}" ya existe dentro de "${parentCat.name}".`, 
          type: 'error' 
        });
        return;
      }

      addSubcategory(parentCategoryId, cleanSubName);
      setFeedback({ 
        message: `Subcategoría "${cleanSubName}" agregada con éxito a "${parentCat.name}".`, 
        type: 'success' 
      });
      setSubcategoryName('');
    }

    // Limpiar mensaje
    setTimeout(() => {
      setFeedback({ message: '', type: null });
    }, 4000);
  };

  return (
    <div className="dashboard-grid" style={{ paddingTop: '8px' }}>
      <style>{`
        .category-item-hover {
          transition: var(--transition);
        }
        .category-item-hover:hover {
          border-color: var(--accent-primary) !important;
          background: var(--bg-card) !important;
          box-shadow: var(--shadow-sm);
        }
        .form-mode-btn {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .form-mode-btn.active {
          background: var(--bg-card);
          border-color: var(--brand-blue);
          color: var(--brand-blue);
          box-shadow: var(--shadow-sm);
        }
        .folder-tree-node {
          padding: 10px 14px;
          border-radius: 8px;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justifyContent: space-between;
          cursor: pointer;
          transition: all 0.2s;
        }
        .folder-tree-node:hover {
          background: var(--bg-card);
          border-color: var(--border-color-hover);
        }
        .sub-tree-connector {
          width: 2px;
          background: var(--border-color);
          margin-left: 20px;
          position: relative;
        }
      `}</style>

      {/* 1. Header Banner */}
      <div className="bento-card col-span-3" style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        color: 'white',
        border: 'none',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '32px',
        gap: '24px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={20} color="var(--brand-yellow)" />
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', color: 'rgba(255,255,255,0.8)' }}>
              Centro de Operaciones
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#ffffff' }}>
            Configuración de Estructuras Financieras Anidadas
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '15px', lineHeight: '1.6', maxWidth: '820px' }}>
            Gestiona la jerarquía de Categorías y Subcategorías para el registro de transacciones de caja de CRECE. 
            Define grupos principales de ingresos o gastos y añade subgrupos especializados para obtener análisis 
            financieros detallados. Los cambios se sincronizarán instantáneamente en todos los módulos de cobros.
          </p>
        </div>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: '50%', 
          padding: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <FolderPlus size={44} color="#3b82f6" />
        </div>
      </div>

      {/* 2. Columna Izquierda: Formulario de Alta Dual */}
      <div className="bento-card col-span-1" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="card-header" style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="card-title">
            <Plus size={20} color="var(--accent-primary)" /> Registrar Elemento
          </div>
        </div>

        {/* Dual Mode Selector */}
        <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '4px', borderRadius: '10px', gap: '4px', marginBottom: '20px' }}>
          <button 
            type="button" 
            className={`form-mode-btn ${formMode === 'category' ? 'active' : ''}`}
            onClick={() => setFormMode('category')}
          >
            Categoría Principal
          </button>
          <button 
            type="button" 
            className={`form-mode-btn ${formMode === 'subcategory' ? 'active' : ''}`}
            onClick={() => {
              setFormMode('subcategory');
              // Inicializar con la primera categoría si no hay seleccionada
              if (!parentCategoryId && categories.length > 0) {
                setParentCategoryId(categories[0].id);
              }
            }}
          >
            Subcategoría
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          
          {/* MODO 1: CATEGORÍA PRINCIPAL */}
          {formMode === 'category' && (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ marginBottom: '10px' }}>Tipo de Categoría</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setCategoryType('income')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid ' + (categoryType === 'income' ? '#22c55e' : 'var(--border-color)'),
                      background: categoryType === 'income' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                      color: categoryType === 'income' ? '#16a34a' : 'var(--text-secondary)',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <TrendingUp size={16} />
                    Ingreso
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryType('expense')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid ' + (categoryType === 'expense' ? '#ef4444' : 'var(--border-color)'),
                      background: categoryType === 'expense' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                      color: categoryType === 'expense' ? '#ef4444' : 'var(--text-secondary)',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <TrendingDown size={16} />
                    Egreso
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nombre de Categoría Principal *</label>
                <div style={{ position: 'relative' }}>
                  <Tag size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Servicios de Consultoría" 
                    style={{ paddingLeft: '42px', borderRadius: '12px' }} 
                    value={categoryName}
                    onChange={e => setCategoryName(e.target.value)}
                  />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Creará un nodo superior bajo el cual podrás anidar subcategorías de ingresos/egresos.
                </p>
              </div>
            </>
          )}

          {/* MODO 2: AGREGAR SUBCATEGORÍA */}
          {formMode === 'subcategory' && (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Categoría Principal Padre *</label>
                <div style={{ position: 'relative' }}>
                  <Layers size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <select 
                    className="form-input" 
                    style={{ paddingLeft: '42px', borderRadius: '12px' }}
                    value={parentCategoryId} 
                    onChange={e => setParentCategoryId(e.target.value)}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type === 'income' ? 'Ingreso' : 'Egreso'})
                      </option>
                    ))}
                  </select>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Selecciona el nodo principal donde deseas añadir la nueva subcategoría.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nombre de la Subcategoría *</label>
                <div style={{ position: 'relative' }}>
                  <Tag size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Material UNAM, Caja Chica" 
                    style={{ paddingLeft: '42px', borderRadius: '12px' }} 
                    value={subcategoryName}
                    onChange={e => setSubcategoryName(e.target.value)}
                  />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Los nombres de subcategorías deben ser específicos para detallar la facturación.
                </p>
              </div>
            </>
          )}

          {/* MENSAJE DE FEEDBACK */}
          {feedback.message && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              fontSize: '13px',
              fontWeight: '500',
              background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: feedback.type === 'success' ? '#16a34a' : '#ef4444',
              border: '1px solid ' + (feedback.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
              marginTop: 'auto'
            }}>
              {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* BOTÓN DE ENVIAR */}
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              marginTop: feedback.message ? '10px' : 'auto', 
              borderRadius: '12px',
              background: formMode === 'category' 
                ? (categoryType === 'income' ? '#16a34a' : '#ef4444') 
                : 'var(--brand-blue)',
              color: 'white',
              border: 'none',
              boxShadow: formMode === 'category' 
                ? (categoryType === 'income' ? '0 4px 12px rgba(22, 163, 74, 0.2)' : '0 4px 12px rgba(239, 68, 68, 0.2)') 
                : '0 4px 12px rgba(59, 130, 246, 0.2)'
            }}
          >
            <Plus size={18} /> {formMode === 'category' ? 'Registrar Categoría' : 'Agregar Subcategoría'}
          </button>
        </form>
      </div>

      {/* 3. Columna Derecha: Árbol Visual Expandible */}
      <div className="bento-card col-span-2" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="card-title">
            <Coins size={20} color="var(--brand-yellow)" /> Árbol Jerárquico de Categorías
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
            <span style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '4px 12px', borderRadius: '100px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {categories.length} Principales
            </span>
            <span style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '4px 12px', borderRadius: '100px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {totalSubcategoriesCount} Subcategorías
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, overflowY: 'auto' }}>
          
          {/* Subcolumna 1: Ingresos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '2px solid rgba(34, 197, 94, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: '700', fontSize: '15px' }}>
                <TrendingUp size={18} /> Ingresos
              </div>
              <span style={{ fontSize: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', padding: '2px 8px', borderRadius: '100px', fontWeight: '700' }}>
                {categories.filter(c => c.type === 'income').length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categories.filter(c => c.type === 'income').map(cat => {
                const count = getCategoryCount(cat.name);
                const isExpanded = expandedCategories[cat.id] !== false; // expanded por defecto
                return (
                  <div key={cat.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Nodo Categoría Principal */}
                    <div 
                      className="folder-tree-node"
                      onClick={() => toggleCategory(cat.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isExpanded ? <ChevronDown size={16} color="var(--text-secondary)" /> : <ChevronRight size={16} color="var(--text-secondary)" />}
                        {isExpanded ? <FolderOpen size={18} color="#22c55e" /> : <Folder size={18} color="#22c55e" />}
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {cat.name}
                        </span>
                      </div>
                      <span style={{ 
                        fontSize: '11px', 
                        background: count > 0 ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-main)', 
                        color: count > 0 ? '#16a34a' : 'var(--text-secondary)',
                        border: '1px solid ' + (count > 0 ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-color)'),
                        padding: '2px 8px', 
                        borderRadius: '100px', 
                        fontWeight: '600' 
                      }}>
                        {count === 0 ? 'Sin movimientos' : `${count} mov.`}
                      </span>
                    </div>

                    {/* Subcategorías Anidadas */}
                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '12px', marginTop: '4px', borderLeft: '1.5px dashed var(--border-color)', paddingLeft: '8px' }}>
                        {cat.subcategories.length > 0 ? (
                          cat.subcategories.map(sub => {
                            const subCount = getSubcategoryCount(cat.name, sub.name);
                            return (
                              <div 
                                key={sub.id} 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  padding: '8px 12px 8px 6px',
                                  fontSize: '13px',
                                  color: 'var(--text-secondary)',
                                  transition: 'all 0.2s',
                                  borderRadius: '6px'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <CornerDownRight size={14} style={{ color: 'var(--text-secondary)', opacity: 0.7 }} />
                                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{sub.name}</span>
                                </div>
                                <span style={{ 
                                  fontSize: '10px', 
                                  color: subCount > 0 ? 'var(--brand-blue)' : 'var(--text-secondary)',
                                  background: subCount > 0 ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: '600'
                                }}>
                                  {subCount} reg.
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ padding: '8px 12px 8px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Sin subcategorías anidadas.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subcolumna 2: Egresos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '2px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: '700', fontSize: '15px' }}>
                <TrendingDown size={18} /> Egresos
              </div>
              <span style={{ fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: '100px', fontWeight: '700' }}>
                {categories.filter(c => c.type === 'expense').length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categories.filter(c => c.type === 'expense').map(cat => {
                const count = getCategoryCount(cat.name);
                const isExpanded = expandedCategories[cat.id] !== false; // expanded por defecto
                return (
                  <div key={cat.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Nodo Categoría Principal */}
                    <div 
                      className="folder-tree-node"
                      onClick={() => toggleCategory(cat.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isExpanded ? <ChevronDown size={16} color="var(--text-secondary)" /> : <ChevronRight size={16} color="var(--text-secondary)" />}
                        {isExpanded ? <FolderOpen size={18} color="#ef4444" /> : <Folder size={18} color="#ef4444" />}
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {cat.name}
                        </span>
                      </div>
                      <span style={{ 
                        fontSize: '11px', 
                        background: count > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-main)', 
                        color: count > 0 ? '#ef4444' : 'var(--text-secondary)',
                        border: '1px solid ' + (count > 0 ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-color)'),
                        padding: '2px 8px', 
                        borderRadius: '100px', 
                        fontWeight: '600' 
                      }}>
                        {count === 0 ? 'Sin movimientos' : `${count} mov.`}
                      </span>
                    </div>

                    {/* Subcategorías Anidadas */}
                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '12px', marginTop: '4px', borderLeft: '1.5px dashed var(--border-color)', paddingLeft: '8px' }}>
                        {cat.subcategories.length > 0 ? (
                          cat.subcategories.map(sub => {
                            const subCount = getSubcategoryCount(cat.name, sub.name);
                            return (
                              <div 
                                key={sub.id} 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  padding: '8px 12px 8px 6px',
                                  fontSize: '13px',
                                  color: 'var(--text-secondary)',
                                  transition: 'all 0.2s',
                                  borderRadius: '6px'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <CornerDownRight size={14} style={{ color: 'var(--text-secondary)', opacity: 0.7 }} />
                                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{sub.name}</span>
                                </div>
                                <span style={{ 
                                  fontSize: '10px', 
                                  color: subCount > 0 ? 'var(--brand-blue)' : 'var(--text-secondary)',
                                  background: subCount > 0 ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: '600'
                                }}>
                                  {subCount} reg.
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ padding: '8px 12px 8px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Sin subcategorías anidadas.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
