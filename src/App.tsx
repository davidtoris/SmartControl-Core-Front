import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import AlumnosPage from './pages/AlumnosPage';
import StudentDetailPage from './pages/StudentDetailPage';
import FinanzasPage from './pages/FinanzasPage';
import AcademicoPage from './pages/AcademicoPage';
import ComunicacionPage from './pages/ComunicacionPage';
import TicketsPage from './pages/TicketsPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import InscripcionPage from './pages/InscripcionPage';
import ExamenPage from './pages/ExamenPage';
import EstudiantePortalPage from './pages/EstudiantePortalPage';
import ExamenValidationPage from './pages/ExamenValidationPage';
import CRMPage from './pages/CRMPage';
import UsuariosPage from './pages/UsuariosPage';
import Modals from './components/Modals';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/inscripcion" element={<InscripcionPage />} />
        <Route path="/examen" element={<ExamenPage />} />
        <Route path="/estudiante" element={<EstudiantePortalPage />} />
        <Route path="/validar/intento/:attemptId" element={<ExamenValidationPage />} />

        {/* Rutas Administrativas */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="crm" element={<CRMPage />} />
          <Route path="alumnos" element={<AlumnosPage />} />
          <Route path="alumnos/:id" element={<StudentDetailPage />} />
          <Route path="finanzas" element={<FinanzasPage />} />
          <Route path="academico" element={<AcademicoPage />} />
          <Route path="comunicacion" element={<ComunicacionPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="categorias" element={<ConfiguracionPage />} />
          <Route path="enlaces" element={<ConfiguracionPage />} />
          <Route path="servicios" element={<ConfiguracionPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
        </Route>
      </Routes>
      <Modals />
    </BrowserRouter>
  );
}

export default App;
