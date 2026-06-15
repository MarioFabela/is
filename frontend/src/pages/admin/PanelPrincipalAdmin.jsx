import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Users, FileText, Home, Settings, UserPlus 
} from 'lucide-react';

// Importamos tus componentes secundarios
import GestionConsultorio, { DetalleConsultorio } from './GestionConsultorio';
import PacientesAtendidos from './PacientesAtendidos';
import ReporteEvaluacion from './ReporteEvaluacion';
import ConfiguracionDisponibilidad from './ConfiguracionDisponibilidad';
import DirectorioMedicos from './DirectorioMedicos';

// ✅ Declaramos la ruta dinámica globalmente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PanelPrincipalAdmin() {
  const [activeTab, setActiveTab] = useState('Consultorios');
  const [selectedConsultorio, setSelectedConsultorio] = useState(null);

  // 1. ESTADOS REALES PARA LAS 3 PESTAÑAS
  const [kpis, setKpis] = useState({ pacientesHoy: 0, consultoriosActivos: 0, consultoriosTotales: 0, ordenesFarmacia: 0 });
  const [consultorios, setConsultorios] = useState([]);
  
  const [pacientes, setPacientes] = useState([]); // <-- El estado que faltaba
  
  const [reporteKpis, setReporteKpis] = useState({ categorias: [] });
  const [reporteDoctores, setReporteDoctores] = useState([]);
  
  const [cargando, setCargando] = useState(true);

  const fetchAllData = async () => {
      try {
        // ✅ CORRECCIÓN: Hacemos las 3 peticiones usando la API dinámica
        const [resDashboard, resPacientes, resReportes] = await Promise.all([
          fetch(`${API_URL}/admin/dashboard`),
          fetch(`${API_URL}/admin/pacientes`),
          fetch(`${API_URL}/admin/reportes`)
        ]);

        const dataDashboard = await resDashboard.json();
        const dataPacientes = await resPacientes.json();
        const dataReportes = await resReportes.json();

        // Asignamos datos de Dashboard (Consultorios)
        if (dataDashboard.success) {
          setKpis(dataDashboard.data.kpis);
          setConsultorios(dataDashboard.data.consultorios);
        }

        // Asignamos datos de Pacientes
        if (dataPacientes.success) {
          setPacientes(dataPacientes.data);
        }

        // Asignamos datos de Reportes
        if (dataReportes.success) {
          setReporteKpis(dataReportes.data.kpis);
          setReporteDoctores(dataReportes.data.doctores);
        }

      } catch (error) {
        console.error("Error al conectar con el backend:", error);
      } finally {
        setCargando(false);
      }
  };

  // 2. FETCH PARA CONECTAR AL BACKEND AL CARGAR LA PÁGINA
  useEffect(() => {
    fetchAllData();
  }, []);

  // Pantalla de carga mientras se obtienen los datos
  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-600 font-bold">Conectando con Supabase...</p>
      </div>
    );
  }

  // 3. RENDERIZADO DINÁMICO DE PESTAÑAS (Aquí pasamos los estados correctos)
  const renderContent = () => {
    if (activeTab === 'Consultorios') {
      return !selectedConsultorio 
        ? <GestionConsultorio consultorios={consultorios} kpis={kpis} onSelect={setSelectedConsultorio} 
            onRefresh={fetchAllData} 
          />
        : <DetalleConsultorio consultorio={selectedConsultorio} onBack={() => setSelectedConsultorio(null)} onRefresh={fetchAllData} />;
    }
    if (activeTab === 'Pacientes') {
      return <PacientesAtendidos pacientes={pacientes} onRefresh={fetchAllData} />;
    }
    if (activeTab === 'Reportes') {
      // Ahora usamos los estados del reporte
      return <ReporteEvaluacion kpis={reporteKpis} doctores={reporteDoctores} />;
    }

    if (activeTab === 'Disponibilidad') {
      return <ConfiguracionDisponibilidad />;
    }

    if (activeTab === 'Directorio') {
      return <DirectorioMedicos />;
    }

  };

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col pb-16 lg:pb-0 font-sans">
      {/* NAVBAR GLOBAL */}
      <header className="bg-white border-b border-gray-200 fixed top-0 z-50 flex justify-between items-center h-16 px-6 w-full shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setActiveTab('Consultorios'); setSelectedConsultorio(null); }}>
          <Stethoscope className="text-blue-600" size={24} />
          <span className="text-xl font-bold text-blue-600">CentroVital</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4">
            <button onClick={() => { setActiveTab('Consultorios'); setSelectedConsultorio(null); }} className={`text-sm font-medium px-3 py-1.5 rounded transition-colors ${activeTab === 'Consultorios' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
              Consultorios
            </button>
            <button onClick={() => { setActiveTab('Pacientes'); setSelectedConsultorio(null); }} className={`text-sm font-medium px-3 py-1.5 rounded transition-colors ${activeTab === 'Pacientes' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
              Pacientes
            </button>
            <button onClick={() => { setActiveTab('Reportes'); setSelectedConsultorio(null); }} className={`text-sm font-medium px-3 py-1.5 rounded transition-colors ${activeTab === 'Reportes' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
              Reportes
            </button>
            <button 
              onClick={() => { setActiveTab('Disponibilidad'); setSelectedConsultorio(null); }} 
              className={`text-sm font-medium px-3 py-1.5 flex items-center gap-2 rounded transition-colors ${activeTab === 'Disponibilidad' ? 'text-blue-600 font-bold border-b-2 border-blue-600 rounded-none' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Settings size={16} /> Disponibilidad
            </button>
            <button 
              onClick={() => { setActiveTab('Directorio'); setSelectedConsultorio(null); }} 
              className={`text-sm font-medium px-3 py-1.5 flex items-center gap-2 rounded transition-colors ${activeTab === 'Directorio' ? 'text-blue-600 font-bold border-b-2 border-blue-600 rounded-none' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <UserPlus size={16} /> Directorio
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden md:block">Administrador</span>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              A
            </div>
          </div>
        </div>
      </header>

      {/* ÁREA PRINCIPAL DINÁMICA */}
      <main className="pt-16 w-full flex-grow">
        {renderContent()}
      </main>

      {/* MOBILE BOTTOM NAVBAR */}
      <nav className="fixed bottom-0 left-0 w-full lg:hidden z-50 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-4 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={() => { setActiveTab('Consultorios'); setSelectedConsultorio(null); }} className={`flex flex-col items-center justify-center transition-colors p-2 ${activeTab === 'Consultorios' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
          <Home size={24} /> <span className="text-[10px] font-bold mt-1">Inicio</span>
        </button>
        <button onClick={() => { setActiveTab('Pacientes'); setSelectedConsultorio(null); }} className={`flex flex-col items-center justify-center transition-colors p-2 ${activeTab === 'Pacientes' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
          <Users size={24} /> <span className="text-[10px] font-bold mt-1">Pacientes</span>
        </button>
        <button onClick={() => { setActiveTab('Reportes'); setSelectedConsultorio(null); }} className={`flex flex-col items-center justify-center transition-colors p-2 ${activeTab === 'Reportes' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
          <FileText size={24} /> <span className="text-[10px] font-bold mt-1">Reportes</span>
        </button>
        <button onClick={() => { setActiveTab('Disponibilidad'); setSelectedConsultorio(null); }} className={`flex flex-col items-center justify-center transition-colors p-2 ${activeTab === 'Disponibilidad' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
          <Settings size={24} /> <span className="text-[10px] font-bold mt-1">Disponibilidad</span>
        </button>
        <button onClick={() => { setActiveTab('Directorio'); setSelectedConsultorio(null); }} className={`flex flex-col items-center justify-center transition-colors p-2 ${activeTab === 'Directorio' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
          <UserPlus size={24} /> <span className="text-[10px] font-bold mt-1">Directorio</span>
        </button>
      </nav>
    </div>
  );
}