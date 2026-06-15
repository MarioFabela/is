import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/admin/PanelPrincipalAdmin.jsx';
import MedicSidebar from './components/MedicSidebar.jsx';
import MenuPacientes from './components/MenuPacientes.jsx';

// --- Vistas de Autenticación ---
import LoginForm from './pages/login/LoginForm'; 
import RegisterForm from './pages/registro/RegisterForm';
import ForgotPasswordForm from './pages/login/ForgotPasswordForm';
import ResetPasswordForm from './pages/login/ResetPasswordForm';


//--- Vistas para Pacientes ---
import DashboardPaciente from './pages/pacientes/DashboardPaciente';
import AgendarCita from './pages/pacientes/AgendarCita';
import PerfilPaciente from './pages/pacientes/PerfilPaciente';
import HistorialCitas from './pages/pacientes/HistorialCitas';

//--- Vistas para Médicos ---
import DashboardMedico from './pages/medicos/DashboardMedico';
import HistorialPaciente from './pages/medicos/HistorialPaciente';
import ListaPacientes from './pages/medicos/ListaPacientes';
import NuevoPaciente from './pages/medicos/NuevoPaciente';
import EvolucionPaciente from './pages/medicos/EvolucionPaciente';
import GenerarReceta from './pages/medicos/GenerarReceta';
import AgendarSeguimiento from './pages/medicos/AgendarSeguimiento';
import OrdenLaboratorio from './pages/medicos/OrdenLaboratorio';

//--- Vistas para Administradores ---
import PanelPrincipalAdmin from './pages/admin/PanelPrincipalAdmin.jsx';
import GestionConsultorio from './pages/admin/GestionConsultorio.jsx';
import PacientesAtendidos from './pages/admin/PacientesAtendidos.jsx';
import ReporteEvaluacion from './pages/admin/ReporteEvaluacion.jsx';

//--- ChatBot ---
import Chatbot from "./pages/Agendar_Citas/Chatbot_VP";
import SeleccionDoctor from "./pages/Agendar_Citas/DisponibilidadMedicos_VA";
import PanelMedicoAgendamiento from "./pages/Agendar_Citas/ReAgendamiento_VM";
import ConfiguracionDisponibilidad from "./pages/Agendar_Citas/SeleccionarMedicoCita_VP";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas Públicas de Autenticación */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />

        {/* Rutas para Paciente*/}
        <Route path="/dashboard-pacientes" element={<DashboardPaciente />} />
        <Route path="/agendar-cita" element={<AgendarCita />} />
        <Route path="/perfil" element={<PerfilPaciente />} />
        <Route path="/historial" element={<HistorialCitas />} />

        {/* Rutas para Médico */}
        <Route path="/dashboard-medicos" element={<DashboardMedico />} />
        <Route path="/evolucion-paciente" element={<EvolucionPaciente />} />
        <Route path="/medicos/pacientes/evolucion/:id" element={<EvolucionPaciente />} />
        <Route path="/medicos/pacientes/historial/:id" element={<HistorialPaciente />} />
        <Route path="/lista-pacientes" element={<ListaPacientes />} />
        <Route path="/generar-receta" element={<GenerarReceta />} />
        <Route path="/agendar-seguimiento" element={<AgendarSeguimiento />} />
        <Route path="/nuevo-paciente" element={<NuevoPaciente />} />
        <Route path="/orden-laboratorio" element={<OrdenLaboratorio />} />

        {/* Rutas para Administrador */}
        <Route path="/panel-admin" element={<PanelPrincipalAdmin />} />
        <Route path="/gestion-consultorio" element={<GestionConsultorio />} />
        <Route path="/pacientes-atendidos" element={<PacientesAtendidos />} />
        <Route path="/reporte-evaluacion" element={<ReporteEvaluacion />} />

        {/* ChatBot */}
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/seleccion-doctor" element={<SeleccionDoctor />} />
        <Route path="/panel-medico" element={<PanelMedicoAgendamiento />} />
        <Route path="/configuracion-horarios" element={<ConfiguracionDisponibilidad />} />

        {/* Ruta para capturar cualquier dirección inválida (404) */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <h1 className="text-2xl font-bold">404 - Página no encontrada</h1>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;