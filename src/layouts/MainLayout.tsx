import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  LayoutDashboard, Users, CreditCard, GraduationCap,
  MessageSquare, Search, Smartphone, Bell,
  ClipboardList, Settings, Link2, Briefcase, HeartHandshake
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function MainLayout() {
  const { setShowParentPortal, fetchCategories, fetchTransactions, fetchStudents } = useAppStore();
  const location = useLocation();

  // Carga global de datos al montar el layout (una sola vez)
  useEffect(() => {
    fetchCategories();
    fetchTransactions();
    fetchStudents();
  }, [fetchCategories, fetchTransactions, fetchStudents]);

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/crm') return 'CRM Prospectos';
    if (path.startsWith('/alumnos')) return 'Alumnos';
    if (path === '/finanzas') return 'Finanzas';
    if (path === '/academico') return 'Académico';
    if (path === '/comunicacion') return 'Comunicación';
    if (path === '/categorias') return 'Categorías Financieras';
    if (path === '/enlaces') return 'Asignación de Costos';
    if (path === '/servicios') return 'Catálogo de Servicios';
    if (path === '/examen') return 'Exámenes';
    if (path === '/usuarios') return 'Gestión de Usuarios';
    return '';
  };



  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon-svg" style={{ color: 'var(--brand-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
              {/* Birrete Top */}
              <path d="M12 2L2 7.5L12 13L22 7.5L12 2Z" fill="var(--brand-yellow)" />
              {/* Birrete Base */}
              <path d="M17 10.25V14.5C17 16.5 14.75 18 12 18C9.25 18 7 16.5 7 14.5V10.25L12 13L17 10.25Z" fill="#ffffff" />
              {/* Borla / Tassel */}
              <path d="M18 7.5V12.5" stroke="var(--brand-yellow)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M17 12.5H19V14.5H17V12.5Z" fill="var(--brand-yellow)" />
            </svg>
          </div>
          <div className="logo-text">CRECE</div>
        </div>

        <nav className="nav-menu">
          {/* Módulos Principales */}
          {[
            { name: 'Dashboard', path: '/', icon: LayoutDashboard },
            { name: 'CRM Prospectos', path: '/crm', icon: HeartHandshake },
            { name: 'Alumnos', path: '/alumnos', icon: Users },
            { name: 'Finanzas', path: '/finanzas', icon: CreditCard },
            { name: 'Académico', path: '/academico', icon: GraduationCap },
            { name: 'Exámenes', path: '/examen', icon: ClipboardList },
            { name: 'Comunicación', path: '/comunicacion', icon: MessageSquare },
          ].map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}

          {/* Sección Configuración */}
          <div style={{ padding: '16px 16px 6px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255, 255, 255, 0.4)', opacity: 0.8 }}>
            Configuración
          </div>
          {[
            { name: 'Categorías', path: '/categorias', icon: Settings },
            { name: 'Servicios', path: '/servicios', icon: Briefcase },
            { name: 'Costos', path: '/enlaces', icon: Link2 },
            { name: 'Usuarios', path: '/usuarios', icon: Users },
          ].map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="header">
          <h1 className="header-title">{getHeaderTitle()}</h1>
          <div className="header-actions">
            <div className="search-bar">
              <Search size={18} className="text-secondary" />
              <input type="text" placeholder="Buscar alumno, recibo o clase..." className="search-input" />
            </div>
            <button className="btn-secondary" style={{ padding: '10px 20px', gap: '8px', background: 'rgba(15, 56, 105, 0.06)', color: 'var(--brand-blue)', border: '1px solid rgba(15, 56, 105, 0.15)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', height: '44px', fontWeight: '600' }} onClick={() => setShowParentPortal(true)}>
              <Smartphone size={16} /> Ver como Papá
            </button>
            <button className="btn-primary" style={{ padding: '10px 20px', gap: '8px', background: 'var(--gradient-accent)', color: '#081c33', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(229, 169, 59, 0.25)', display: 'flex', alignItems: 'center', height: '44px' }} onClick={() => window.open('/estudiante', '_blank')}>
              <GraduationCap size={16} /> Ver como Alumno
            </button>
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>
            <div className="user-profile">
              DT
            </div>
          </div>
        </header>

        {/* Page Content */}
        <Outlet />
      </main>
    </div>
  );
}
