import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, GraduationCap, 
  MessageSquare, Settings, Search, Smartphone, Bell,
  ClipboardList
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function MainLayout() {
  const { setShowParentPortal } = useAppStore();
  const location = useLocation();

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/alumnos')) return 'Alumnos';
    if (path === '/finanzas') return 'Finanzas';
    if (path === '/academico') return 'Académico';
    if (path === '/comunicacion') return 'Comunicación';
    if (path === '/configuracion') return 'Configuración';
    if (path === '/examen') return 'Exámenes';
    return '';
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Alumnos', path: '/alumnos', icon: Users },
    { name: 'Finanzas', path: '/finanzas', icon: CreditCard },
    { name: 'Académico', path: '/academico', icon: GraduationCap },
    { name: 'Exámenes', path: '/examen', icon: ClipboardList },
    { name: 'Comunicación', path: '/comunicacion', icon: MessageSquare },
    { name: 'Configuración', path: '/configuracion', icon: Settings },
  ];

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">C</div>
          <div className="logo-text">CRECE</div>
        </div>
        
        <nav className="nav-menu">
          {navItems.map((item) => (
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
            <button className="btn-secondary" style={{ padding: '8px 16px', gap: '8px', background: 'var(--brand-blue)', color: 'white', border: 'none', cursor: 'pointer' }} onClick={() => setShowParentPortal(true)}>
              <Smartphone size={16} /> Ver como Papá
            </button>
            <button className="btn-secondary" style={{ padding: '8px 16px', gap: '8px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(30, 58, 138, 0.2)', display: 'flex', alignItems: 'center' }} onClick={() => window.open('/estudiante', '_blank')}>
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
