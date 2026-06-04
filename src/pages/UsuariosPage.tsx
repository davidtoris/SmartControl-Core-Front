import { useState, useEffect } from 'react';
import { 
  Users, Plus, Trash2, Edit2, Shield, Key, Check, X, Loader2, Mail, User, ShieldAlert, Award
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Usuario } from '../store/useAppStore';

const ROLES_DISPONIBLES = [
  { id: 'ADMIN', label: 'Administrador', desc: 'Acceso total y configuración del sistema' },
  { id: 'SUPERVISOR', label: 'Supervisor Académico', desc: 'Monitoreo de exámenes, bitácoras y alumnos' },
  { id: 'COBRADOR', label: 'Gestión Financiera', desc: 'Registro de pagos, mensualidades y comprobantes' },
  { id: 'DOCENTE', label: 'Profesor / Docencia', desc: 'Control de asistencias y calificaciones' }
];

const PERMISOS_DISPONIBLES = [
  { id: 'VER_DASHBOARD', label: 'Ver Dashboard', category: 'General' },
  { id: 'GESTIONAR_ALUMNOS', label: 'Gestionar Alumnos', category: 'Académico' },
  { id: 'GESTIONAR_FINANZAS', label: 'Gestionar Finanzas', category: 'Administrativo' },
  { id: 'GESTIONAR_ACADEMICO', label: 'Gestionar Académico', category: 'Académico' },
  { id: 'GESTIONAR_EXAMENES', label: 'Gestionar Exámenes', category: 'Académico' },
  { id: 'GESTIONAR_MENSAJES', label: 'Gestionar Mensajes', category: 'General' },
  { id: 'GESTIONAR_CONFIGURACION', label: 'Gestionar Configuración', category: 'Administrativo' },
  { id: 'GESTIONAR_USUARIOS', label: 'Gestionar Usuarios', category: 'Administrativo' }
];

export default function UsuariosPage() {
  const { usuarios, fetchUsuarios, createUsuario, updateUsuario, deleteUsuario } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  
  // Datos del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rolesSeleccionados, setRolesSeleccionados] = useState<string[]>(['USER']);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);
  
  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Obtener usuario actual en sesión
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchUsuarios();
      setIsLoading(false);
    };
    loadData();

    // Obtener sesión local
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error(e);
    }
  }, [fetchUsuarios]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setNombre('');
    setEmail('');
    setPassword('');
    setRolesSeleccionados(['USER']);
    setPermisosSeleccionados([]);
    setShowModal(true);
  };

  const handleOpenEdit = (user: Usuario) => {
    setEditingUser(user);
    setNombre(user.nombre);
    setEmail(user.email);
    setPassword(''); // Dejar vacío por seguridad
    setRolesSeleccionados(user.roles && user.roles.length > 0 ? user.roles : ['USER']);
    setPermisosSeleccionados(user.permisos || []);
    setShowModal(true);
  };

  const handleToggleRole = (roleId: string) => {
    setRolesSeleccionados(prev => {
      if (prev.includes(roleId)) {
        // Asegurarse de que quede al menos un rol
        if (prev.length === 1) return prev;
        return prev.filter(r => r !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleTogglePermission = (permId: string) => {
    setPermisosSeleccionados(prev => {
      if (prev.includes(permId)) {
        return prev.filter(p => p !== permId);
      } else {
        return [...prev, permId];
      }
    });
  };

  const handleSelectAllPermissions = () => {
    if (permisosSeleccionados.length === PERMISOS_DISPONIBLES.length) {
      setPermisosSeleccionados([]);
    } else {
      setPermisosSeleccionados(PERMISOS_DISPONIBLES.map(p => p.id));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim()) {
      showToast('Por favor completa los campos de nombre y correo.', 'error');
      return;
    }

    if (!editingUser && !password) {
      showToast('La contraseña es obligatoria para nuevos usuarios.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        nombre: nombre.trim(),
        email: email.toLowerCase().trim(),
        roles: rolesSeleccionados,
        permisos: permisosSeleccionados
      };

      if (password) {
        payload.password = password;
      }

      if (editingUser) {
        await updateUsuario(editingUser.id, payload);
        showToast('Usuario actualizado con éxito', 'success');
      } else {
        await createUsuario(payload);
        showToast('Usuario creado con éxito', 'success');
      }
      setShowModal(false);
      await fetchUsuarios(); // Recargar listado limpio
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.msg || 'Error al guardar el usuario';
      showToast(errMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (currentUser && currentUser.id === id) {
      showToast('No puedes eliminar tu propio usuario en sesión.', 'error');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteUsuario(id);
      showToast('Usuario eliminado con éxito', 'success');
      await fetchUsuarios();
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.msg || 'Error al eliminar el usuario';
      showToast(errMsg, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleGradient = (roles: string[]) => {
    if (roles.includes('ADMIN')) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'; // Ámbar/Oro
    if (roles.includes('SUPERVISOR')) return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'; // Azul
    if (roles.includes('COBRADOR')) return 'linear-gradient(135deg, #10b981 0%, #047857 100%)'; // Esmeralda
    if (roles.includes('DOCENTE')) return 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'; // Morado
    return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'; // Gris
  };

  const getAvatarInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .filter(n => n.length > 0)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');
  };

  return (
    <div style={{ padding: '24px', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
      <style>{`
        .glass-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .glass-panel:hover {
          box-shadow: var(--shadow-lg);
        }
        .user-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .user-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--accent-gradient, var(--gradient-primary));
        }
        .btn-action {
          border: 1px solid var(--border-color);
          background: var(--bg-main);
          color: var(--text-primary);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .btn-action:hover {
          background: rgba(15, 56, 105, 0.05);
          border-color: var(--brand-blue);
        }
        .btn-delete {
          color: #ef4444;
        }
        .btn-delete:hover {
          background: rgba(239, 68, 68, 0.08);
          border-color: #fca5a5;
        }
        .pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 100px;
          color: white;
        }
        .permiso-tag {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(15, 56, 105, 0.06);
          border: 1px solid rgba(15, 56, 105, 0.12);
          color: var(--brand-blue);
          text-transform: uppercase;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(8, 28, 51, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-content {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .form-input-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
        }
        .form-input-container input {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border: 1.5px solid var(--border-color);
          background: var(--bg-main);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .form-input-container input:focus {
          border-color: var(--brand-blue);
          box-shadow: 0 0 0 3px rgba(15, 56, 105, 0.1);
        }
        .form-input-icon {
          position: absolute;
          left: 14px;
          top: 36px;
          color: var(--text-secondary);
        }
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 16px 24px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          z-index: 2000;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .toast-success {
          background: #10b981;
          border-left: 5px solid #047857;
        }
        .toast-error {
          background: #ef4444;
          border-left: 5px solid #b91c1c;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <Check size={18} /> : <ShieldAlert size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={26} color="var(--brand-yellow)" /> Gestión de Usuarios
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Administra los roles de acceso, contraseñas y permisos del equipo escolar de CRECE.
          </p>
        </div>

        <button 
          onClick={handleOpenCreate}
          style={{
            background: 'var(--gradient-accent)',
            color: '#081c33',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(229, 169, 59, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={18} strokeWidth={2.5} /> Nuevo Usuario
        </button>
      </div>

      {/* MAIN LISTING */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
          <Loader2 size={36} className="animate-spin" style={{ color: 'var(--brand-yellow)' }} />
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Cargando usuarios autorizados...</span>
        </div>
      ) : usuarios.length === 0 ? (
        <div style={{
          padding: '60px 40px',
          textAlign: 'center',
          border: '2px dashed var(--border-color)',
          borderRadius: '20px',
          background: 'var(--bg-card)',
          color: 'var(--text-secondary)'
        }}>
          <Users size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>No hay usuarios adicionales registrados</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '13px' }}>Comienza registrando a tu personal de control escolar, cobranza o tutores académicos.</p>
          <button className="btn-action" style={{ margin: '0 auto', padding: '10px 20px' }} onClick={handleOpenCreate}>
            <Plus size={16} /> Crear primer usuario
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {usuarios.map(user => {
            const isMe = currentUser && currentUser.id === user.id;
            const gradient = getRoleGradient(user.roles || []);
            
            return (
              <div 
                key={user.id} 
                className="glass-panel user-card"
                style={{ '--accent-gradient': gradient } as React.CSSProperties}
              >
                <div>
                  {/* Encabezado Tarjeta */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: gradient,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: '800',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      flexShrink: 0
                    }}>
                      {getAvatarInitials(user.nombre)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.nombre} {isMe && <span style={{ fontSize: '10px', background: 'rgba(15, 56, 105, 0.08)', color: 'var(--brand-blue)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: '700' }}>TÚ</span>}
                      </h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all' }}>
                        <Mail size={12} /> {user.email}
                      </span>
                    </div>
                  </div>

                  {/* Roles */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Roles Asignados
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(user.roles || []).map(role => (
                        <span key={role} className="pill-badge" style={{ background: getRoleGradient([role]), fontSize: '10px' }}>
                          <Shield size={10} /> {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Permisos */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Permisos del Sistema ({user.permisos?.length || 0})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {user.permisos?.includes('ALL') ? (
                        <span className="permiso-tag" style={{ background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.2)', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Award size={10} /> Acceso Completo (ALL)
                        </span>
                      ) : user.permisos && user.permisos.length > 0 ? (
                        user.permisos.slice(0, 4).map(perm => (
                          <span key={perm} className="permiso-tag">
                            {perm.replace('GESTIONAR_', '').replace('VER_', '')}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Sin permisos específicos</span>
                      )}
                      {user.permisos && user.permisos.length > 4 && !user.permisos.includes('ALL') && (
                        <span className="permiso-tag" style={{ background: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
                          +{user.permisos.length - 4} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '14px',
                  marginTop: 'auto'
                }}>
                  <button className="btn-action" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleOpenEdit(user)}>
                    <Edit2 size={13} /> Editar
                  </button>
                  <button 
                    className="btn-action btn-delete" 
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => handleDelete(user.id, user.nombre)}
                    disabled={deletingId === user.id || isMe}
                  >
                    {deletingId === user.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FORM MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 28px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  {editingUser ? 'Editar Cuenta de Usuario' : 'Registrar Nuevo Integrante'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {editingUser ? 'Actualiza su información de credenciales y nivel de acceso.' : 'Crea una cuenta para dar acceso al personal administrativo.'}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Información Personal */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-input-container">
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>Nombre Completo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Ana Martínez" 
                    value={nombre} 
                    onChange={e => setNombre(e.target.value)} 
                    required 
                  />
                  <User size={16} className="form-input-icon" />
                </div>
                
                <div className="form-input-container">
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="Ej. ana@crece.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                  />
                  <Mail size={16} className="form-input-icon" />
                </div>
              </div>

              {/* Contraseña */}
              <div className="form-input-container">
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Contraseña {editingUser && <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>(Dejar en blanco para no cambiar)</span>}
                </label>
                <input 
                  type="password" 
                  placeholder={editingUser ? '••••••••' : 'Mínimo 6 caracteres'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required={!editingUser} 
                />
                <Key size={16} className="form-input-icon" />
              </div>

              {/* SELECCIÓN DE ROLES (MULTIROL) */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Roles Autorizados (Multirol)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {ROLES_DISPONIBLES.map(role => {
                    const active = rolesSeleccionados.includes(role.id);
                    return (
                      <div 
                        key={role.id}
                        onClick={() => handleToggleRole(role.id)}
                        style={{
                          border: '1.5px solid ' + (active ? 'var(--brand-blue)' : 'var(--border-color)'),
                          background: active ? 'rgba(15, 56, 105, 0.04)' : 'var(--bg-main)',
                          padding: '12px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '6px',
                          border: '2px solid ' + (active ? 'var(--brand-blue)' : 'var(--text-secondary)'),
                          background: active ? 'var(--brand-blue)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          marginTop: '2px',
                          flexShrink: 0
                        }}>
                          {active && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                            {role.label}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', lineHeight: '1.3' }}>
                            {role.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SELECCIÓN DE PERMISOS GRANIEL */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Permisos de Acceso Específicos ({permisosSeleccionados.length} seleccionados)
                  </label>
                  <button 
                    type="button"
                    onClick={handleSelectAllPermissions}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-blue)',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {permisosSeleccionados.length === PERMISOS_DISPONIBLES.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                  </button>
                </div>

                <div style={{
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  background: 'var(--bg-main)',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {PERMISOS_DISPONIBLES.map(perm => {
                      const active = permisosSeleccionados.includes(perm.id);
                      return (
                        <div 
                          key={perm.id}
                          onClick={() => handleTogglePermission(perm.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: '8px',
                            transition: 'background 0.15s ease',
                            background: active ? 'rgba(15, 56, 105, 0.04)' : 'transparent'
                          }}
                          onMouseOver={e => { if(!active) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                          onMouseOut={e => { if(!active) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            border: '1.5px solid ' + (active ? 'var(--brand-blue)' : 'var(--text-secondary)'),
                            background: active ? 'var(--brand-blue)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            flexShrink: 0
                          }}>
                            {active && <Check size={10} strokeWidth={3} />}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)' }}>
                              {perm.label}
                            </span>
                            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                              {perm.category}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Botones de Envío */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '10px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '20px'
              }}>
                <button 
                  type="button" 
                  className="btn-action" 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '12px 24px', borderRadius: '12px' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{
                    background: 'var(--gradient-accent)',
                    color: '#081c33',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 28px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 10px rgba(229, 169, 59, 0.2)'
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Usuario</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
