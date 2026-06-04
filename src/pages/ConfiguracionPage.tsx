import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Tag, Plus, TrendingUp, TrendingDown, 
  Check, AlertCircle,
  Coins, Folder, FolderOpen, ChevronRight, ChevronDown, 
  CornerDownRight, Layers, Trash2, Pencil, X, AlertTriangle,
  Link2, Lock, Unlock, Users, DollarSign, Briefcase, Clock, BookOpen
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Category } from '../store/useAppStore';

export default function ConfiguracionPage() {
  const { 
    categories,
    addCategory, 
    addSubcategory,
    deleteCategory,
    deleteSubcategory,
    updateCategory,
    updateSubcategory,
    transactions,
    enlacesInscripcion,
    fetchEnlacesInscripcion,
    createEnlaceInscripcion,
    toggleEnlaceInscripcion,
    deleteEnlaceInscripcion,
    updateEnlaceInscripcion,
    servicios,
    fetchServicios,
    createServicio,
    updateServicio,
    toggleServicio,
    deleteServicio
  } = useAppStore();

  const location = useLocation();
  const activeTab = location.pathname === '/enlaces' ? 'enlaces' : location.pathname === '/servicios' ? 'servicios' : 'categorias';

  // --- ESTADO PARA CATEGORÍAS ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; type: 'category' | 'subcategory' } | null>(null);
  const [formMode, setFormMode] = useState<'category' | 'subcategory'>('category');
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('income');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // --- ESTADO PARA SERVICIOS ---
  const DOCS_OPCIONES = ['Acta de Nacimiento', 'CURP', 'Foto', 'Comprobante de Domicilio', 'INE/IFE', 'Certificado Primaria', 'Certificado Secundaria'];
  const MATERIALES_OPCIONES = [
    'Guía de Estudios (Matemáticas)',
    'Guía de Estudios (Español)',
    'Pasos de Bienvenida (CRECE)',
    'Reglamento Interno',
    'Examen Diagnóstico UAM',
    'Guía COMIPEMS 2026',
    'Manual del Estudiante'
  ];
  const [showCreateServicioModal, setShowCreateServicioModal] = useState(false);
  const [showEditServicioModal, setShowEditServicioModal] = useState(false);
  const [editingServicio, setEditingServicio] = useState<any>(null);
  const [deleteServicioConfirm, setDeleteServicioConfirm] = useState<any>(null);
  const [newServicio, setNewServicio] = useState({
    nombre: '',
    descripcion: '',
    duracionMeses: 3,
    documentosRequeridos: [] as string[],
    materiales: [] as string[],
    proceso: '',
    tieneCertificado: false,
    requiereEvidencia: false
  });

  // --- ESTADO PARA ENLACES SEGUROS ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEnlace, setEditingEnlace] = useState<any>(null);
  const [deleteEnlaceConfirm, setDeleteEnlaceConfirm] = useState<any>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [newEnlace, setNewEnlace] = useState({
    curso: '',
    costoInscripcion: '',
    costoContado: '',
    costoPagos: '',
    planPagosTotales: '',
    usosMaximos: '',
    expiraEn: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FEEDBACK TOAST ---
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null
  });

  // --- AUTOCLEAR FEEDBACK TOAST ---
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', type: null });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback.message]);

  // Carga de enlaces al cambiar a la pestaña correspondiente
  useEffect(() => {
    if (activeTab === 'enlaces') {
      fetchEnlacesInscripcion();
      fetchServicios();
    }
    if (activeTab === 'servicios') {
      fetchServicios();
    }
  }, [activeTab, fetchEnlacesInscripcion, fetchServicios]);

  // --- MANEJADORES DE ÁRBOL EXPANDIBLE DE CATEGORÍAS ---
  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: prev[catId] === false ? true : false
    }));
  };

  const getCategoryCount = (catName: string) => {
    return transactions.filter(t => t.category === catName).length;
  };

  const getSubcategoryCount = (catName: string, subName: string) => {
    return transactions.filter(t => t.category === catName && t.subcategory === subName).length;
  };

  const totalSubcategoriesCount = categories.reduce((acc, cat) => acc + cat.subcategories.length, 0);

  // --- MANEJADOR DE ENVÍO DE CATEGORÍA/SUBCATEGORÍA ---
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formMode === 'category') {
      const cleanName = categoryName.trim();
      if (!cleanName) {
        setFeedback({ message: 'El nombre de la categoría no puede estar vacío.', type: 'error' });
        return;
      }

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
  };

  // --- MANEJADORES DE ENLACES DE INVITACIÓN ---
  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/inscripcion?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setFeedback({ message: '¡Enlace de inscripción copiado al portapapeles! 🔒', type: 'success' });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleEnlaceInscripcion(id, !currentStatus);
      setFeedback({ message: 'Estado del enlace actualizado correctamente.', type: 'success' });
    } catch (error) {
      setFeedback({ message: 'Error al actualizar el estado del enlace.', type: 'error' });
    }
  };

  const handleCreateEnlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnlace.curso) {
      setFeedback({ message: 'Por favor, selecciona un servicio del catálogo.', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSend = {
        ...newEnlace,
        costoInscripcion: Number(newEnlace.costoInscripcion || 0),
        costoContado: Number(newEnlace.costoContado || 0),
        costoPagos: Number(newEnlace.costoPagos || 0),
        planPagosTotales: Number(newEnlace.planPagosTotales || 0),
        usosMaximos: Number(newEnlace.usosMaximos || 0),
        expiraEn: newEnlace.expiraEn ? new Date(newEnlace.expiraEn).toISOString() : null
      };
      
      await createEnlaceInscripcion(dataToSend);
      setShowCreateModal(false);
      setFeedback({ message: '¡Tarifas asignadas y enlace generado exitosamente! 🔒', type: 'success' });
      
      setNewEnlace({
        curso: '',
        costoInscripcion: '',
        costoContado: '',
        costoPagos: '',
        planPagosTotales: '',
        usosMaximos: '',
        expiraEn: ''
      });
    } catch (error) {
      setFeedback({ message: 'Error al registrar la asignación de costos.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEnlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnlace) return;
    setIsSubmitting(true);
    try {
      if (editingEnlace.usosMaximos < editingEnlace.usosActuales) {
        setFeedback({ 
          message: `El límite de usos no puede ser menor que los usos actuales (${editingEnlace.usosActuales}).`, 
          type: 'error' 
        });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        usosMaximos: Number(editingEnlace.usosMaximos),
        expiraEn: editingEnlace.expiraEn ? new Date(editingEnlace.expiraEn).toISOString() : null
      };

      await updateEnlaceInscripcion(editingEnlace.id, payload);
      setShowEditModal(false);
      setEditingEnlace(null);
      setFeedback({ message: '¡Enlace de pre-inscripción actualizado exitosamente! 🔒', type: 'success' });
    } catch (error) {
      setFeedback({ message: 'Error al actualizar el enlace de invitación.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEnlace = async () => {
    if (!deleteEnlaceConfirm) return;
    try {
      await deleteEnlaceInscripcion(deleteEnlaceConfirm.id);
      setDeleteEnlaceConfirm(null);
      setFeedback({ message: 'Enlace de inscripción eliminado correctamente. 🗑️', type: 'success' });
    } catch (error) {
      setFeedback({ message: 'Error al eliminar el enlace de inscripción.', type: 'error' });
    }
  };

  // --- HANDLERS PARA SERVICIOS ---
  const toggleDocServicio = (doc: string, isEditing = false) => {
    if (isEditing && editingServicio) {
      const current = editingServicio.documentosRequeridos || [];
      const updated = current.includes(doc) ? current.filter((d: string) => d !== doc) : [...current, doc];
      setEditingServicio({ ...editingServicio, documentosRequeridos: updated });
    } else {
      const current = newServicio.documentosRequeridos;
      const updated = current.includes(doc) ? current.filter(d => d !== doc) : [...current, doc];
      setNewServicio({ ...newServicio, documentosRequeridos: updated });
    }
  };

  const toggleMaterialServicio = (material: string, isEditing = false) => {
    if (isEditing && editingServicio) {
      const current = editingServicio.materiales || [];
      const updated = current.includes(material) ? current.filter((m: string) => m !== material) : [...current, material];
      setEditingServicio({ ...editingServicio, materiales: updated });
    } else {
      const current = newServicio.materiales || [];
      const updated = current.includes(material) ? current.filter(m => m !== material) : [...current, material];
      setNewServicio({ ...newServicio, materiales: updated });
    }
  };

  const handleCreateServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServicio.nombre.trim()) {
      setFeedback({ message: 'El nombre del servicio es obligatorio.', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    try {
      await createServicio({
        nombre: newServicio.nombre.trim(),
        descripcion: newServicio.descripcion.trim() || undefined,
        duracionMeses: Number(newServicio.duracionMeses),
        documentosRequeridos: newServicio.documentosRequeridos,
        materiales: newServicio.materiales,
        proceso: newServicio.proceso.trim() || undefined,
        tieneCertificado: newServicio.tieneCertificado,
        requiereEvidencia: newServicio.requiereEvidencia
      });
      setShowCreateServicioModal(false);
      setNewServicio({ nombre: '', descripcion: '', duracionMeses: 3, documentosRequeridos: [], materiales: [], proceso: '', tieneCertificado: false, requiereEvidencia: false });
      setFeedback({ message: '¡Servicio creado exitosamente! 🎯', type: 'success' });
    } catch {
      setFeedback({ message: 'Error al crear el servicio.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditServicioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServicio) return;
    setIsSubmitting(true);
    try {
      await updateServicio(editingServicio.id, {
        nombre: editingServicio.nombre,
        descripcion: editingServicio.descripcion || undefined,
        duracionMeses: Number(editingServicio.duracionMeses),
        documentosRequeridos: editingServicio.documentosRequeridos,
        materiales: editingServicio.materiales,
        proceso: editingServicio.proceso || undefined,
        tieneCertificado: editingServicio.tieneCertificado,
        requiereEvidencia: editingServicio.requiereEvidencia
      });
      setShowEditServicioModal(false);
      setEditingServicio(null);
      setFeedback({ message: 'Servicio actualizado correctamente. ✅', type: 'success' });
    } catch {
      setFeedback({ message: 'Error al actualizar el servicio.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleServicio = async (id: string, activo: boolean) => {
    try {
      await toggleServicio(id, activo);
      setFeedback({ message: `Servicio ${activo ? 'activado' : 'desactivado'} correctamente.`, type: 'success' });
    } catch {
      setFeedback({ message: 'Error al cambiar el estado del servicio.', type: 'error' });
    }
  };

  const handleDeleteServicio = async () => {
    if (!deleteServicioConfirm) return;
    try {
      await deleteServicio(deleteServicioConfirm.id);
      setDeleteServicioConfirm(null);
      setFeedback({ message: 'Servicio eliminado correctamente. 🗑️', type: 'success' });
    } catch (error: any) {
      const msg = error?.response?.data?.msg || 'Error al eliminar el servicio.';
      setFeedback({ message: msg, type: 'error' });
      setDeleteServicioConfirm(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Permanente';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <div className="categorias-page-wrapper" style={{ width: '100%', padding: '0 40px 40px' }}>
      
      {/* Cabecera de Configuración */}
      <div className="card-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', background: 'linear-gradient(90deg, #fff, #a3a3a3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Configuración del Sistema
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>
            Panel de control para servicios, categorías financieras y asignación de costos de inscripción.
          </p>
        </div>

        {activeTab === 'enlaces' && (
          <button 
            className="btn-primary" 
            style={{ width: 'auto', padding: '10px 24px', gap: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, var(--brand-blue), #1d4ed8)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600' }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} /> Asignar Costos
          </button>
        )}
        {activeTab === 'servicios' && (
          <button 
            className="btn-primary" 
            style={{ width: 'auto', padding: '10px 24px', gap: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600' }}
            onClick={() => setShowCreateServicioModal(true)}
          >
            <Plus size={18} /> Nuevo Servicio
          </button>
        )}
      </div>


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
        @keyframes slideDown {
          from {
            transform: translate(-50%, -20px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .toast-float {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          z-index: 99999;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }
        .toast-success {
          background: rgba(16, 185, 129, 0.95);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .toast-error {
          background: rgba(239, 68, 68, 0.95);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* CONTENIDO DE PESTAÑAS */}
      {activeTab === 'categorias' ? (
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          
          {/* 1. Columna Izquierda: Formulario de Alta Dual */}
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
                  if (!parentCategoryId && categories.length > 0) {
                    setParentCategoryId(categories[0].id);
                  }
                }}
              >
                Subcategoría
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              
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

              {/* BOTÓN DE ENVIAR */}
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ 
                  marginTop: 'auto', 
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

          {/* 2. Columna Derecha: Árbol Visual Expandible */}
          <div className="bento-card col-span-1" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                    const isExpanded = expandedCategories[cat.id] !== false;
                    return (
                      <div key={cat.id} style={{ display: 'flex', flexDirection: 'column' }}>
                        
                        <div 
                          className="folder-tree-node category-item-hover"
                          style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}
                        >
                          {editingId === cat.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="text" 
                                className="form-input" 
                                style={{ padding: '4px 8px', fontSize: '13px', borderRadius: '6px', height: '28px', flex: 1, margin: 0 }}
                                value={editingName} 
                                onChange={(e) => setEditingName(e.target.value)} 
                              />
                              <button 
                                type="button" 
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#16a34a', padding: '2px', display: 'flex', alignItems: 'center' }}
                                onClick={async () => {
                                  try {
                                    await updateCategory(cat.id, editingName, cat.type);
                                    setEditingId(null);
                                    setFeedback({ message: 'Categoría actualizada con éxito.', type: 'success' });
                                  } catch (e: any) {
                                    setFeedback({ message: e.response?.data?.msg || 'Error al actualizar.', type: 'error' });
                                  }
                                }}
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                type="button" 
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', display: 'flex', alignItems: 'center' }}
                                onClick={() => setEditingId(null)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }} onClick={() => toggleCategory(cat.id)}>
                                {isExpanded ? <ChevronDown size={16} color="var(--text-secondary)" /> : <ChevronRight size={16} color="var(--text-secondary)" />}
                                {isExpanded ? <FolderOpen size={18} color="#22c55e" /> : <Folder size={18} color="#22c55e" />}
                                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                  {cat.name}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button 
                                  type="button" 
                                  title="Editar"
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex', alignItems: 'center' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(cat.id);
                                    setEditingName(cat.name);
                                  }}
                                >
                                  <Pencil size={13} />
                                </button>
                                <button 
                                  type="button" 
                                  title="Eliminar"
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex', alignItems: 'center' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({ id: cat.id, name: cat.name, type: 'category' });
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                                <span style={{ 
                                  fontSize: '11px', 
                                  background: count > 0 ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-main)', 
                                  color: count > 0 ? '#16a34a' : 'var(--text-secondary)',
                                  border: '1px solid ' + (count > 0 ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-color)'),
                                  padding: '2px 8px', 
                                  borderRadius: '100px', 
                                  fontWeight: '600' 
                                }}>
                                  {count === 0 ? '0' : count}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

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
                                    {editingId === sub.id ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginLeft: '14px' }}>
                                        <input 
                                          type="text" 
                                          className="form-input" 
                                          style={{ padding: '2px 6px', fontSize: '12px', borderRadius: '4px', height: '24px', flex: 1, margin: 0 }}
                                          value={editingName} 
                                          onChange={(e) => setEditingName(e.target.value)} 
                                        />
                                        <button 
                                          type="button" 
                                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#16a34a', padding: '2px', display: 'flex', alignItems: 'center' }}
                                          onClick={async () => {
                                            try {
                                              await updateSubcategory(sub.id, editingName, cat.id);
                                              setEditingId(null);
                                              setFeedback({ message: 'Subcategoría actualizada.', type: 'success' });
                                            } catch (e: any) {
                                              setFeedback({ message: e.response?.data?.msg || 'Error al actualizar.', type: 'error' });
                                            }
                                          }}
                                        >
                                          <Check size={14} />
                                        </button>
                                        <button 
                                          type="button" 
                                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', display: 'flex', alignItems: 'center' }}
                                          onClick={() => setEditingId(null)}
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <CornerDownRight size={14} style={{ color: 'var(--text-secondary)', opacity: 0.7 }} />
                                          <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{sub.name}</span>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <button 
                                            type="button" 
                                            title="Editar"
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex', alignItems: 'center' }}
                                            onClick={() => {
                                              setEditingId(sub.id);
                                              setEditingName(sub.name);
                                            }}
                                          >
                                            <Pencil size={12} />
                                          </button>
                                          <button 
                                            type="button" 
                                            title="Eliminar"
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex', alignItems: 'center' }}
                                            onClick={() => {
                                              setDeleteConfirm({ id: sub.id, name: sub.name, type: 'subcategory' });
                                            }}
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                          <span style={{ 
                                            fontSize: '10px', 
                                            color: subCount > 0 ? 'var(--brand-blue)' : 'var(--text-secondary)',
                                            background: subCount > 0 ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                            padding: '1px 6px',
                                            borderRadius: '4px',
                                            fontWeight: '600'
                                          }}>
                                            {subCount}
                                          </span>
                                        </div>
                                      </>
                                    )}
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
                    const isExpanded = expandedCategories[cat.id] !== false;
                    return (
                      <div key={cat.id} style={{ display: 'flex', flexDirection: 'column' }}>
                        
                        <div 
                          className="folder-tree-node category-item-hover"
                          style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}
                        >
                          {editingId === cat.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="text" 
                                className="form-input" 
                                style={{ padding: '4px 8px', fontSize: '13px', borderRadius: '6px', height: '28px', flex: 1, margin: 0 }}
                                value={editingName} 
                                onChange={(e) => setEditingName(e.target.value)} 
                              />
                              <button 
                                type="button" 
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#16a34a', padding: '2px', display: 'flex', alignItems: 'center' }}
                                onClick={async () => {
                                  try {
                                    await updateCategory(cat.id, editingName, cat.type);
                                    setEditingId(null);
                                    setFeedback({ message: 'Categoría actualizada con éxito.', type: 'success' });
                                  } catch (e: any) {
                                    setFeedback({ message: e.response?.data?.msg || 'Error al actualizar.', type: 'error' });
                                  }
                                }}
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                type="button" 
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', display: 'flex', alignItems: 'center' }}
                                onClick={() => setEditingId(null)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }} onClick={() => toggleCategory(cat.id)}>
                                {isExpanded ? <ChevronDown size={16} color="var(--text-secondary)" /> : <ChevronRight size={16} color="var(--text-secondary)" />}
                                {isExpanded ? <FolderOpen size={18} color="#ef4444" /> : <Folder size={18} color="#ef4444" />}
                                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                  {cat.name}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button 
                                  type="button" 
                                  title="Editar"
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex', alignItems: 'center' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(cat.id);
                                    setEditingName(cat.name);
                                  }}
                                >
                                  <Pencil size={13} />
                                </button>
                                <button 
                                  type="button" 
                                  title="Eliminar"
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex', alignItems: 'center' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({ id: cat.id, name: cat.name, type: 'category' });
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                                <span style={{ 
                                  fontSize: '11px', 
                                  background: count > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-main)', 
                                  color: count > 0 ? '#ef4444' : 'var(--text-secondary)',
                                  border: '1px solid ' + (count > 0 ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-color)'),
                                  padding: '2px 8px', 
                                  borderRadius: '100px', 
                                  fontWeight: '600' 
                                }}>
                                  {count === 0 ? '0' : count}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

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
                                    {editingId === sub.id ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginLeft: '14px' }}>
                                        <input 
                                          type="text" 
                                          className="form-input" 
                                          style={{ padding: '2px 6px', fontSize: '12px', borderRadius: '4px', height: '24px', flex: 1, margin: 0 }}
                                          value={editingName} 
                                          onChange={(e) => setEditingName(e.target.value)} 
                                        />
                                        <button 
                                          type="button" 
                                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#16a34a', padding: '2px', display: 'flex', alignItems: 'center' }}
                                          onClick={async () => {
                                            try {
                                              await updateSubcategory(sub.id, editingName, cat.id);
                                              setEditingId(null);
                                              setFeedback({ message: 'Subcategoría actualizada.', type: 'success' });
                                            } catch (e: any) {
                                              setFeedback({ message: e.response?.data?.msg || 'Error al actualizar.', type: 'error' });
                                            }
                                          }}
                                        >
                                          <Check size={14} />
                                        </button>
                                        <button 
                                          type="button" 
                                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', display: 'flex', alignItems: 'center' }}
                                          onClick={() => setEditingId(null)}
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <CornerDownRight size={14} style={{ color: 'var(--text-secondary)', opacity: 0.7 }} />
                                          <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{sub.name}</span>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <button 
                                            type="button" 
                                            title="Editar"
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex', alignItems: 'center' }}
                                            onClick={() => {
                                              setEditingId(sub.id);
                                              setEditingName(sub.name);
                                            }}
                                          >
                                            <Pencil size={12} />
                                          </button>
                                          <button 
                                            type="button" 
                                            title="Eliminar"
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex', alignItems: 'center' }}
                                            onClick={() => {
                                              setDeleteConfirm({ id: sub.id, name: sub.name, type: 'subcategory' });
                                            }}
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                          <span style={{ 
                                            fontSize: '10px', 
                                            color: subCount > 0 ? 'var(--brand-blue)' : 'var(--text-secondary)',
                                            background: subCount > 0 ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                            padding: '1px 6px',
                                            borderRadius: '4px',
                                            fontWeight: '600'
                                          }}>
                                            {subCount}
                                          </span>
                                        </div>
                                      </>
                                    )}
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
      ) : activeTab === 'servicios' ? (
        /* =====================================================
           VISTA DEL CATÁLOGO DE SERVICIOS
           ===================================================== */
        <div className="bento-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--bg-card)' }}>
          {servicios.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Briefcase size={48} style={{ color: '#7c3aed', marginBottom: '16px', opacity: 0.6 }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>No hay servicios en el catálogo</h3>
              <p style={{ fontSize: '14px', marginTop: '8px', maxWidth: '420px', marginInline: 'auto' }}>
                Agrega servicios con su duración, documentos requeridos y proceso de entrega para pre-llenar automáticamente el alta de alumnos.
              </p>
              <button
                style={{ marginTop: '20px', padding: '10px 24px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                onClick={() => setShowCreateServicioModal(true)}
              >
                <Plus size={16} /> Crear Primer Servicio
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(124, 58, 237, 0.05)' }}>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Servicio</th>
                    <th style={{ padding: '16px 14px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duración</th>
                    <th style={{ padding: '16px 14px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Documentos</th>
                    <th style={{ padding: '16px 14px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requisitos</th>
                    <th style={{ padding: '16px 14px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alumnos</th>
                    <th style={{ padding: '16px 14px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estatus</th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {servicios.map((srv) => (
                    <tr key={srv.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Nombre + Descripción */}
                      <td style={{ padding: '16px 20px' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>{srv.nombre}</div>
                          {srv.descripcion && (
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{srv.descripcion}</div>
                          )}
                          {srv.materiales && srv.materiales.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                              {srv.materiales.map(mat => (
                                <span key={mat} style={{ fontSize: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '4px', padding: '1px 6px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                  <BookOpen size={9} /> {mat}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Duración */}
                      <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '6px', padding: '4px 10px', fontSize: '13px', fontWeight: '600' }}>
                          <Clock size={12} />
                          {srv.duracionMeses} {srv.duracionMeses === 1 ? 'mes' : 'meses'}
                        </div>
                      </td>
                      {/* Documentos */}
                      <td style={{ padding: '16px 14px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '220px' }}>
                          {srv.documentosRequeridos.length === 0 ? (
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Sin documentos</span>
                          ) : srv.documentosRequeridos.map(doc => (
                            <span key={doc} style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '4px', padding: '2px 7px', fontWeight: '500', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                              {doc}
                            </span>
                          ))}
                        </div>
                      </td>
                      {/* Requisitos de Entrega */}
                      <td style={{ padding: '16px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '600', color: srv.tieneCertificado ? '#10b981' : 'var(--text-secondary)' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: srv.tieneCertificado ? '#10b981' : 'rgba(255,255,255,0.15)' }} />
                            {srv.tieneCertificado ? 'Certificado' : 'Sin Certificado'}
                          </div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '600', color: srv.requiereEvidencia ? '#8b5cf6' : 'var(--text-secondary)' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: srv.requiereEvidencia ? '#8b5cf6' : 'rgba(255,255,255,0.15)' }} />
                            {srv.requiereEvidencia ? 'Requiere Evidencia' : 'Sin Evidencia'}
                          </div>
                        </div>
                      </td>
                      {/* Conteo Alumnos */}
                      <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '600', color: srv.alumnosCount > 0 ? '#3b82f6' : 'var(--text-secondary)' }}>
                          <Users size={13} />
                          {srv.alumnosCount}
                        </div>
                      </td>
                      {/* Estatus Toggle */}
                      <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleServicio(srv.id, !srv.activo)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '5px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                            fontSize: '12px', fontWeight: '600',
                            background: srv.activo ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)',
                            color: srv.activo ? '#10b981' : '#ef4444',
                            transition: 'all 0.2s'
                          }}
                        >
                          {srv.activo ? <><Unlock size={12} /> Activo</> : <><Lock size={12} /> Inactivo</>}
                        </button>
                      </td>
                      {/* Acciones */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button
                            title="Editar servicio"
                            onClick={() => { setEditingServicio({ ...srv }); setShowEditServicioModal(true); }}
                            style={{ background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            title={srv.alumnosCount > 0 ? 'No se puede eliminar: tiene alumnos' : 'Eliminar servicio'}
                            onClick={() => setDeleteServicioConfirm(srv)}
                            style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', padding: '7px', cursor: srv.alumnosCount > 0 ? 'not-allowed' : 'pointer', color: '#ef4444', opacity: srv.alumnosCount > 0 ? 0.45 : 1, display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* VISTA DE ASIGNACIÓN DE COSTOS DE INSCRIPCIÓN */
        <div className="bento-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--bg-card)' }}>

          {enlacesInscripcion.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Link2 size={48} style={{ color: 'var(--brand-blue)', marginBottom: '16px', opacity: '0.6' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>No hay costos configurados</h3>
              <p style={{ fontSize: '14px', marginTop: '8px', maxWidth: '400px', marginInline: 'auto' }}>
                Asigna costos personalizados a tus servicios para generar un enlace de inscripción seguro e inalterable, con cuotas, mensualidades y límites de uso.
              </p>
              <button 
                className="btn-primary" 
                style={{ marginTop: '20px', width: 'auto', padding: '10px 24px', marginInline: 'auto', cursor: 'pointer' }}
                onClick={() => setShowCreateModal(true)}
              >
                Asignar mi primer costo
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Oferta / Curso</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Costo Inscrip. / Contado</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Costo Pagos (Cuotas)</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usos / Expiración</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estatus</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {enlacesInscripcion.map(enlace => {
                  const isLinkExpired = enlace.expiraEn && new Date(enlace.expiraEn) < new Date();
                  const isUsageExceeded = enlace.usosActuales >= enlace.usosMaximos;
                  const isActuallyActive = enlace.activo && !isLinkExpired && !isUsageExceeded;

                  return (
                    <tr 
                      key={enlace.id} 
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} 
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} 
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block', fontSize: '14px' }}>{enlace.curso}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>Por: {enlace.creadoPorUser || 'Administración'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600', display: 'block', fontSize: '14px' }}>{formatCurrency(enlace.costoContado)}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>Inscrip: {formatCurrency(enlace.costoInscripcion)}</span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600', display: 'block', fontSize: '14px' }}>{formatCurrency(enlace.costoPagos)}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{enlace.planPagosTotales} mensualidades</span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>
                          <Users size={14} style={{ color: 'var(--text-secondary)' }} />
                          <span style={{ color: isUsageExceeded ? '#ef4444' : 'var(--text-primary)' }}>
                            {enlace.usosActuales} / {enlace.usosMaximos}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: isLinkExpired ? '#ef4444' : 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                          Exp: {formatDate(enlace.expiraEn)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleActive(enlace.id, enlace.activo)}
                          style={{
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '100px',
                            fontSize: '12px',
                            fontWeight: '700',
                            transition: 'all 0.2s',
                            backgroundColor: isActuallyActive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: isActuallyActive ? '#22c55e' : '#ef4444',
                            border: `1px solid ${isActuallyActive ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                          }}
                        >
                          {isActuallyActive ? (
                            <>
                              <Unlock size={12} /> Activo
                            </>
                          ) : (
                            <>
                              <Lock size={12} /> {isLinkExpired ? 'Expirado' : isUsageExceeded ? 'Agotado' : 'Inactivo'}
                            </>
                          )}
                        </button>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                          <button
                            onClick={() => handleCopyLink(enlace.token)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: copiedToken === enlace.token ? '#22c55e' : 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={e => {
                              if (copiedToken !== enlace.token) e.currentTarget.style.color = 'var(--brand-blue)';
                            }}
                            onMouseOut={e => {
                              if (copiedToken !== enlace.token) e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                            title="Copiar Enlace de Inscripción"
                          >
                            {copiedToken === enlace.token ? <Check size={15} /> : <Link2 size={15} />}
                          </button>
                          <button
                            onClick={() => {
                              const expDate = enlace.expiraEn ? new Date(enlace.expiraEn).toISOString().split('T')[0] : '';
                              setEditingEnlace({
                                ...enlace,
                                expiraEn: expDate
                              });
                              setShowEditModal(true);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.color = 'var(--brand-blue)'}
                            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            title="Editar Enlace"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (enlace.usosActuales > 0) {
                                setFeedback({ 
                                  message: 'No puedes eliminar un enlace que ya tiene alumnos registrados. Desactívalo en su lugar.', 
                                  type: 'error' 
                                });
                                return;
                              }
                              setDeleteEnlaceConfirm(enlace);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: enlace.usosActuales > 0 ? 'not-allowed' : 'pointer',
                              color: 'var(--text-secondary)',
                              opacity: enlace.usosActuales > 0 ? 0.35 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={e => {
                              if (enlace.usosActuales === 0) e.currentTarget.style.color = '#ef4444';
                            }}
                            onMouseOut={e => {
                              if (enlace.usosActuales === 0) e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                            title={enlace.usosActuales > 0 ? "No se puede eliminar (enlace con usos)" : "Eliminar Enlace"}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE BORRADO DE ALTA FIDELIDAD (CATEGORÍAS) */}
      {deleteConfirm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }} 
          onClick={() => setDeleteConfirm(null)}
        >
          <div 
            style={{
              background: 'rgba(22, 28, 45, 0.95)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              width: '90%',
              maxWidth: '400px',
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', color: '#fff' }}>¿Confirmar Eliminación?</h4>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: '1.5' }}>
                ¿Estás seguro de que deseas eliminar la {deleteConfirm.type === 'category' ? 'categoría principal' : 'subcategoría'}{' '}
                <strong style={{ color: '#fff' }}>"{deleteConfirm.name}"</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <button 
                type="button" 
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.75)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                style={{
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.2s'
                }}
                onClick={async () => {
                  const target = deleteConfirm;
                  setDeleteConfirm(null);
                  try {
                    if (target.type === 'category') {
                      await deleteCategory(target.id);
                      setFeedback({ message: 'Categoría eliminada con éxito.', type: 'success' });
                    } else {
                      await deleteSubcategory(target.id);
                      setFeedback({ message: 'Subcategoría eliminada con éxito.', type: 'success' });
                    }
                  } catch (err: any) {
                    setFeedback({ message: err.response?.data?.msg || 'No se pudo eliminar.', type: 'error' });
                  }
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLASSMORPHIC MODAL - ASIGNAR COSTOS A SERVICIO (COSTOS) */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '24px'
        }}>
          <div style={{
            background: 'rgba(22, 28, 45, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)'
            }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={20} style={{ color: 'var(--brand-blue)' }} /> Asignar Costos a Servicio
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginTop: '4px' }}>
                  Define y protege las tarifas de inscripción para tus programas.
                </p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateEnlace} style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                
                {/* Curso */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Curso Aplicable
                  </label>
                  <select
                    value={newEnlace.curso}
                    onChange={e => setNewEnlace({ ...newEnlace, curso: e.target.value })}
                    required
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px', fontWeight: '500', outline: 'none' }}
                  >
                    <option value="" disabled style={{ background: '#161c2d' }}>-- Selecciona un Servicio del Catálogo --</option>
                    {servicios.filter(s => s.activo).map(srv => (
                      <option key={srv.id} value={srv.nombre} style={{ background: '#161c2d' }}>{srv.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Costo Inscripción */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Inscripción ($)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.5)' }} />
                    <input
                      type="number"
                      required
                      min="0"
                      value={newEnlace.costoInscripcion}
                      onChange={e => setNewEnlace({ ...newEnlace, costoInscripcion: e.target.value })}
                      placeholder="0"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px 12px 12px 32px', color: '#fff', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Costo Contado */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Costo Contado ($)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.5)' }} />
                    <input
                      type="number"
                      required
                      min="1"
                      value={newEnlace.costoContado}
                      onChange={e => setNewEnlace({ ...newEnlace, costoContado: e.target.value })}
                      placeholder="0"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px 12px 12px 32px', color: '#fff', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Costo Pagos */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Financiado ($)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.5)' }} />
                    <input
                      type="number"
                      required
                      min="1"
                      value={newEnlace.costoPagos}
                      onChange={e => setNewEnlace({ ...newEnlace, costoPagos: e.target.value })}
                      placeholder="0"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px 12px 12px 32px', color: '#fff', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Número de Mensualidades */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Mensualidades (Cuotas)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="12"
                    value={newEnlace.planPagosTotales}
                    onChange={e => setNewEnlace({ ...newEnlace, planPagosTotales: e.target.value })}
                    placeholder="0"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                {/* Usos Máximos */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Límite de Usos (Cupos)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newEnlace.usosMaximos}
                    onChange={e => setNewEnlace({ ...newEnlace, usosMaximos: e.target.value })}
                    placeholder="0"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none' }}
                    title="1 para promociones personalizadas de un solo alumno, o más para campaigns abiertas."
                  />
                </div>

                {/* Fecha Expiración */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Fecha de Expiración
                  </label>
                  <input
                    type="date"
                    value={newEnlace.expiraEn}
                    onChange={e => setNewEnlace({ ...newEnlace, expiraEn: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none', colorScheme: 'dark' }}
                  />
                </div>
              </div>

              {/* Warning box */}
              <div style={{ display: 'flex', gap: '10px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: '12px', padding: '14px', marginBottom: '24px' }}>
                <AlertCircle size={18} style={{ color: 'var(--brand-blue)', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.5' }}>
                  <strong>Seguridad de Datos:</strong> Al enviar, este registro se guardará permanentemente en base de datos. Ningún usuario externo o aspirante podrá registrarse alterando los valores en la URL.
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyItems: 'flex-end', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, var(--brand-blue), #1d4ed8)',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isSubmitting ? 'Guardando...' : 'Asignar y Guardar 🔒'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLASSMORPHIC MODAL - EDITAR ENLACE SEGURO (ENLACES) */}
      {showEditModal && editingEnlace && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '24px'
        }}>
          <div style={{
            background: 'rgba(22, 28, 45, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)'
            }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pencil size={20} style={{ color: 'var(--brand-blue)' }} /> Editar Asignación de Costos
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginTop: '4px' }}>
                  Actualiza parámetros de control. Los precios se encuentran fijos por seguridad.
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEnlace(null);
                }}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditEnlaceSubmit} style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                
                {/* Curso (Read Only) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Curso Aplicable (Protegido 🔒)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingEnlace.curso}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', fontWeight: '500', cursor: 'not-allowed', outline: 'none' }}
                  />
                </div>

                {/* Costo Inscripción (Read Only) */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Inscripción (Fijo 🔒)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.5)' }} />
                    <input
                      type="text"
                      disabled
                      value={editingEnlace.costoInscripcion}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px 12px 12px 32px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', cursor: 'not-allowed', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Costo Contado (Read Only) */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Costo Contado (Fijo 🔒)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.5)' }} />
                    <input
                      type="text"
                      disabled
                      value={editingEnlace.costoContado}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px 12px 12px 32px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', cursor: 'not-allowed', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Costo Pagos (Read Only) */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Financiado (Fijo 🔒)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.5)' }} />
                    <input
                      type="text"
                      disabled
                      value={editingEnlace.costoPagos}
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px 12px 12px 32px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', cursor: 'not-allowed', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Número de Mensualidades (Read Only) */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Mensualidades (Fijo 🔒)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingEnlace.planPagosTotales}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', cursor: 'not-allowed', outline: 'none' }}
                  />
                </div>

                {/* Usos Máximos (Editable) */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Límite de Usos (Cupos) *
                  </label>
                  <input
                    type="number"
                    required
                    min={editingEnlace.usosActuales}
                    value={editingEnlace.usosMaximos}
                    onChange={e => setEditingEnlace({ ...editingEnlace, usosMaximos: Number(e.target.value) })}
                    placeholder="0"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                  <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                    Usos actuales: {editingEnlace.usosActuales} cupo(s).
                  </p>
                </div>

                {/* Fecha Expiración (Editable) */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Fecha de Expiración
                  </label>
                  <input
                    type="date"
                    value={editingEnlace.expiraEn}
                    onChange={e => setEditingEnlace({ ...editingEnlace, expiraEn: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none', colorScheme: 'dark' }}
                  />
                </div>
              </div>

              {/* Security info box */}
              <div style={{ display: 'flex', gap: '10px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: '12px', padding: '14px', marginBottom: '24px' }}>
                <AlertCircle size={18} style={{ color: 'var(--brand-blue)', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.5' }}>
                  <strong>Edición de Costos:</strong> Por seguridad de los aspirantes y auditoría escolar, solo puedes expandir la vigencia o aumentar los cupos. Si deseas cambiar las tarifas, realiza una nueva asignación de costos.
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEnlace(null);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, var(--brand-blue), #1d4ed8)',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios 🔒'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE BORRADO DE ENLACE */}
      {deleteEnlaceConfirm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }} 
          onClick={() => setDeleteEnlaceConfirm(null)}
        >
          <div 
            style={{
              background: 'rgba(22, 28, 45, 0.95)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              width: '90%',
              maxWidth: '420px',
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', color: '#fff' }}>¿Confirmar Eliminación de Asignación de Costos?</h4>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: '1.5' }}>
                ¿Estás completamente seguro de que deseas eliminar la asignación de costos para <strong style={{ color: '#fff' }}>"{deleteEnlaceConfirm.curso}"</strong>?<br/>
                <span style={{ fontSize: '12px', display: 'block', marginTop: '6px', color: '#f87171', fontWeight: '600' }}>
                  Esta acción borrará permanentemente la configuración de tarifas y no se puede deshacer.
                </span>
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <button 
                type="button" 
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.75)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setDeleteEnlaceConfirm(null)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                style={{
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.2s'
                }}
                onClick={async () => {
                  await handleDeleteEnlace();
                }}
              >
                Eliminar Enlace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION FLOATING AT TOP-CENTER */}
      {feedback.message && (
        <div className={`toast-float toast-${feedback.type}`}>
          {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Estilos locales para las animaciones del modal */}
      <style>{`
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* ==========================================
          MODAL: CREAR SERVICIO
          ========================================== */}
      {showCreateServicioModal && (
        <div
          onClick={() => setShowCreateServicioModal(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'rgba(22, 28, 45, 0.96)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards', boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.15)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={20} color="white" />
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: 0 }}>Nuevo Servicio</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>Configura el catálogo de tu servicio educativo</p>
                </div>
              </div>
              <button onClick={() => setShowCreateServicioModal(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateServicio} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Nombre del Servicio *</label>
                <input type="text" required placeholder="Ej. Ingreso UNAM 2027" value={newServicio.nombre} onChange={e => setNewServicio({ ...newServicio, nombre: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Descripción (opcional)</label>
                <input type="text" placeholder="Breve descripción del servicio" value={newServicio.descripcion} onChange={e => setNewServicio({ ...newServicio, descripcion: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Duración (meses) *</label>
                <input type="number" min="1" max="60" required value={newServicio.duracionMeses} onChange={e => setNewServicio({ ...newServicio, duracionMeses: Number(e.target.value) })}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>Documentos Requeridos</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {DOCS_OPCIONES.map(doc => {
                    const checked = newServicio.documentosRequeridos.includes(doc);
                    return (
                      <button key={doc} type="button" onClick={() => toggleDocServicio(doc, false)}
                        style={{ padding: '6px 12px', borderRadius: '20px', border: `1px solid ${checked ? '#10b981' : 'rgba(255,255,255,0.15)'}`, background: checked ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: checked ? '#10b981' : 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {checked && <Check size={11} />}{doc}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>Materiales y Guías Incluidos</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {MATERIALES_OPCIONES.map(material => {
                    const checked = (newServicio.materiales || []).includes(material);
                    return (
                      <button key={material} type="button" onClick={() => toggleMaterialServicio(material, false)}
                        style={{ padding: '6px 12px', borderRadius: '20px', border: `1px solid ${checked ? '#3b82f6' : 'rgba(255,255,255,0.15)'}`, background: checked ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)', color: checked ? '#3b82f6' : 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {checked && <Check size={11} />}{material}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Proceso de Entrega</label>
                <textarea rows={2} placeholder="Ej. Se solicita documentación al terminar el ciclo..." value={newServicio.proceso} onChange={e => setNewServicio({ ...newServicio, proceso: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={newServicio.tieneCertificado} onChange={e => setNewServicio({ ...newServicio, tieneCertificado: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Tiene Certificado</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Emite certificado digital (PDF/XML)</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={newServicio.requiereEvidencia} onChange={e => setNewServicio({ ...newServicio, requiereEvidencia: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#8b5cf6' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Requiere Evidencia</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Obligatorio subir foto de recibido</div>
                  </div>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowCreateServicioModal(false)} style={{ padding: '11px 22px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '11px 28px', background: isSubmitting ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #5b21b6)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                  {isSubmitting ? 'Guardando...' : '+ Crear Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: EDITAR SERVICIO
          ========================================== */}
      {showEditServicioModal && editingServicio && (
        <div
          onClick={() => { setShowEditServicioModal(false); setEditingServicio(null); }}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'rgba(22, 28, 45, 0.96)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pencil size={18} color="white" />
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: 0 }}>Editar Servicio</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>{editingServicio.alumnosCount} alumno(s) vinculado(s)</p>
                </div>
              </div>
              <button onClick={() => { setShowEditServicioModal(false); setEditingServicio(null); }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditServicioSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Nombre *</label>
                <input type="text" required value={editingServicio.nombre} onChange={e => setEditingServicio({ ...editingServicio, nombre: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Descripción</label>
                <input type="text" value={editingServicio.descripcion || ''} onChange={e => setEditingServicio({ ...editingServicio, descripcion: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Duración (meses) *</label>
                <input type="number" min="1" max="60" required value={editingServicio.duracionMeses} onChange={e => setEditingServicio({ ...editingServicio, duracionMeses: Number(e.target.value) })}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>Documentos Requeridos</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {DOCS_OPCIONES.map(doc => {
                    const checked = (editingServicio.documentosRequeridos || []).includes(doc);
                    return (
                      <button key={doc} type="button" onClick={() => toggleDocServicio(doc, true)}
                        style={{ padding: '6px 12px', borderRadius: '20px', border: `1px solid ${checked ? '#10b981' : 'rgba(255,255,255,0.15)'}`, background: checked ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: checked ? '#10b981' : 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {checked && <Check size={11} />}{doc}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>Materiales y Guías Incluidos</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {MATERIALES_OPCIONES.map(material => {
                    const checked = (editingServicio.materiales || []).includes(material);
                    return (
                      <button key={material} type="button" onClick={() => toggleMaterialServicio(material, true)}
                        style={{ padding: '6px 12px', borderRadius: '20px', border: `1px solid ${checked ? '#3b82f6' : 'rgba(255,255,255,0.15)'}`, background: checked ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)', color: checked ? '#3b82f6' : 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {checked && <Check size={11} />}{material}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Proceso de Entrega</label>
                <textarea rows={2} value={editingServicio.proceso || ''} onChange={e => setEditingServicio({ ...editingServicio, proceso: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={editingServicio.tieneCertificado || false} onChange={e => setEditingServicio({ ...editingServicio, tieneCertificado: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Tiene Certificado</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Emite certificado digital (PDF/XML)</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={editingServicio.requiereEvidencia || false} onChange={e => setEditingServicio({ ...editingServicio, requiereEvidencia: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#8b5cf6' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Requiere Evidencia</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Obligatorio subir foto de recibido</div>
                  </div>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" onClick={() => { setShowEditServicioModal(false); setEditingServicio(null); }} style={{ padding: '11px 22px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '11px 28px', background: isSubmitting ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CONFIRMAR ELIMINACIÓN DE SERVICIO
          ========================================== */}
      {deleteServicioConfirm && (
        <div
          onClick={() => setDeleteServicioConfirm(null)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'rgba(22, 28, 45, 0.96)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px', animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', textAlign: 'center' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={28} />
            </div>
            <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: '0 0 10px' }}>¿Eliminar Servicio?</h4>
            {deleteServicioConfirm.alumnosCount > 0 ? (
              <>
                <p style={{ color: '#f87171', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px' }}>
                  Este servicio tiene <strong>{deleteServicioConfirm.alumnosCount} alumno(s)</strong> vinculado(s). No es posible eliminarlo para mantener la trazabilidad. Puedes desactivarlo en su lugar.
                </p>
                <button onClick={() => setDeleteServicioConfirm(null)} style={{ padding: '11px 28px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                  Entendido
                </button>
              </>
            ) : (
              <>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
                  Vas a eliminar el servicio <strong style={{ color: '#fff' }}>"{deleteServicioConfirm.nombre}"</strong>. Esta acción no se puede deshacer.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button onClick={() => setDeleteServicioConfirm(null)} style={{ padding: '11px 22px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                    Cancelar
                  </button>
                  <button onClick={handleDeleteServicio} style={{ padding: '11px 22px', background: '#ef4444', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>

  );
}
