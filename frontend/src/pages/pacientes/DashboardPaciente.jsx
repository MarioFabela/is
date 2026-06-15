import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabaseFrontend } from '../../api/supabaseClient';
import { getDashboardDataService } from '../../api/pacientes';

import ModalEstadisticasMedico from './ModalEstadisticasMedico';
import ModalEvaluacionMedico from './ModalEvaluacionMedico'; 
import ChatbotCentrovitalRediseoModerno from '../Agendar_Citas/Chatbot_VP';

export default function DashboardPaciente() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatNotification, setShowChatNotification] = useState(false);
  
  const [isEvaluacionModalOpen, setIsEvaluacionModalOpen] = useState(false); 
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [medicoParaStats, setMedicoParaStats] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const { data: { user }, error } = await supabaseFrontend.auth.getUser();

        if (error || !user) {
          throw new Error("No hay sesión activa");
        }
        
        setCurrentUserId(user.id);
      } catch (err) {
        console.error("Error verificando sesión:", err);
        navigate('/login');
      } finally {
        setIsAuthLoading(false);
      }
    };

    verificarSesion();
  }, [navigate]);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchDashboard = async () => {
      setIsDataLoading(true);
      try {
        const data = await getDashboardDataService(currentUserId);

        if (!data) throw new Error("No se recibieron datos del servidor");

        setDashboardData(data);

        setTimeout(() => {
          setShowChatNotification(true);
        }, 1000);

      } catch (err) {
        console.error("Error cargando dashboard:", err);
        alert("No pudimos cargar su información clínica. Por seguridad, inicie sesión nuevamente.");
        navigate('/login');
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchDashboard();
  }, [currentUserId, navigate]);

  const handleLogout = async () => {
    await supabaseFrontend.auth.signOut();
    navigate('/');
  };

  if (isAuthLoading || isDataLoading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#005ba1]"></div>
      </div>
    );
  }

  const { paciente, proximaCita, documentos, signosVitales, equipoMedico } = dashboardData.data ? dashboardData.data : dashboardData;

  const formatDateBoxes = (dateString) => {
    const d = new Date(dateString);
    return {
      dia: d.getDate(),
      mes: d.toLocaleDateString('es-MX', { month: 'short' }),
      hora: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const citaFormateada = proximaCita ? formatDateBoxes(proximaCita.fecha_hora) : null;

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans pb-12 relative">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo2.png" alt="CentroVital Logo" className="w-8 h-8 object-contain" />
          <span className="text-lg font-extrabold text-[#005ba1] tracking-wide uppercase">CentroVital</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="relative">
            <Link to="/dashboard-pacientes" className="text-[#005ba1] font-bold text-sm">Inicio</Link>
            <div className="absolute -bottom-[17px] left-0 w-full h-1 bg-[#005ba1] rounded-t-md"></div>
          </div>
          <Link to="/agendar-cita" className="text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors">Citas</Link>
          <Link to="/historial" className="text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors">Historial</Link>
          <Link to="/perfil" className="text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors">Perfil</Link>
        </div>

        <div className="flex items-center gap-4">
          
          {/* ELIMINAMOS LA CAMPANA DE AQUÍ */}
          
          <div 
            className="relative"
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            <div 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-9 h-9 bg-[#e6f0fa] rounded-full overflow-hidden border-2 border-white shadow-[0_2px_8px_rgba(0,91,161,0.15)] cursor-pointer flex items-center justify-center hover:scale-105 transition-transform"
            >
              {paciente?.foto ? (
                <img src={paciente.foto} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#005ba1] font-black text-sm">{paciente?.nombre?.charAt(0) || 'U'}</span>
              )}
            </div>

            {isMenuOpen && (
              <div className="absolute right-0 top-full pt-2 w-52 z-50">
                <div className="bg-white border border-gray-100 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                  
                  {/* OPCIÓN CONFIGURACIÓN CON NUEVO ICONO */}
                  <Link 
                    to="/perfil" 
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#005ba1] font-bold transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Configuración
                  </Link>
                  
                  <div className="h-px bg-gray-100 my-1 mx-4"></div>
                  
                  {/* OPCIÓN CERRAR SESIÓN CON NUEVO ICONO */}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 font-bold transition-colors text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    Cerrar Sesión
                  </button>
                  
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Hola, {paciente?.nombre}</h1>
          <p className="text-sm text-gray-500 mt-1">Bienvenida de nuevo. {proximaCita ? 'Tienes una cita programada pronto.' : 'Actualmente no tienes citas programadas.'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Próxima Cita</span>
              {proximaCita && (
                <span className="bg-blue-50 text-[#005ba1] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {proximaCita.estado}
                </span>
              )}
            </div>

            {proximaCita ? (
              <>
                <div className="flex items-center gap-5 mb-8">
                  <div className="bg-[#99c2ff] text-[#003d73] rounded-lg p-3 flex flex-col items-center justify-center min-w-[70px] shadow-sm">
                    <span className="text-2xl font-black leading-none">{citaFormateada?.dia}</span>
                    <span className="text-[10px] font-bold uppercase mt-1">{citaFormateada?.mes}</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">
                      Dr. {proximaCita.medicos?.perfiles?.nombre_completo || 'No asignado'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{proximaCita.medicos?.especialidad || 'Consulta'} • Presencial</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-gray-800">{citaFormateada?.hora}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Consultorio</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <button className="flex-1 bg-[#005ba1] hover:bg-[#004680] text-white font-bold py-2.5 px-4 rounded-md transition-colors text-sm">
                    Confirmar Asistencia
                  </button>
                  <button className="flex-1 bg-white border border-[#005ba1] text-[#005ba1] hover:bg-blue-50 font-bold py-2.5 px-4 rounded-md transition-colors text-sm">
                    Reprogramar
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full pb-4">
                <p className="text-gray-500 mb-4 text-sm">No tienes citas próximas agendadas.</p>
                <Link to="/agendar-cita" className="bg-[#005ba1] text-white px-6 py-2 rounded font-bold text-sm hover:bg-[#004680] transition-colors">Agendar Nueva Cita</Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Ritmo Cardiaco</span>
              </div>
              <p className="text-2xl font-black text-gray-800">{signosVitales?.ritmoCardiaco?.valor} <span className="text-xs font-medium text-gray-400">bpm</span></p>
              <p className={`text-[10px] font-semibold mt-1 ${signosVitales?.ritmoCardiaco?.estado === 'Normal' ? 'text-green-600' : 'text-red-500'}`}>{signosVitales?.ritmoCardiaco?.estado}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Presión Arterial</span>
              </div>
              <p className="text-2xl font-black text-gray-800">{signosVitales?.presion?.valor}</p>
              <p className={`text-[10px] font-semibold mt-1 ${signosVitales?.presion?.estado === 'Normal' ? 'text-green-600' : 'text-red-500'}`}>{signosVitales?.presion?.estado}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Peso</span>
              </div>
              <p className="text-2xl font-black text-gray-800">{signosVitales?.peso?.valor} <span className="text-xs font-medium text-gray-400">kg</span></p>
              <p className={`text-[10px] font-semibold mt-1 ${signosVitales?.peso?.estado === 'Normal' ? 'text-green-600' : 'text-red-500'}`}>{signosVitales?.peso?.estado}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Glucosa</span>
              </div>
              <p className="text-2xl font-black text-gray-800">{signosVitales?.glucosa?.valor} <span className="text-xs font-medium text-gray-400">mg/dL</span></p>
              <p className={`text-[10px] font-semibold mt-1 ${signosVitales?.glucosa?.estado === 'Normal' ? 'text-green-600' : 'text-red-500'}`}>{signosVitales?.glucosa?.estado}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-800">Documentos Recientes</h3>
            <button className="text-[#005ba1] text-xs font-bold hover:underline">VER TODO</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Prueba</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Estado</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documentos && documentos.length > 0 ? (
                  documentos.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-medium text-gray-600">{doc.fecha}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800">{doc.prueba}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
                          {doc.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex justify-center">
                        {/* BOTÓN VER: Navega e inyecta los datos de la cita y el nombre del paciente */}
                        <button 
                          onClick={() => {
                            const ruta = doc.tipo === 'receta' ? '/generar-receta' : '/orden-laboratorio';
                            navigate(ruta, { 
                              state: { 
                                cita: doc.citaParaReact, 
                                paciente: paciente?.nombre_completo 
                              } 
                            });
                          }}
                          className="bg-white border border-[#005ba1] text-[#005ba1] px-4 py-1.5 rounded text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm"
                        >
                          VER
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">
                      Aún no cuentas con documentos en tu expediente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 mb-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-800">Nuestro Equipo Médico</h3>
            <button 
              onClick={() => setIsEvaluacionModalOpen(true)} 
              className="text-[#005ba1] text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
              EVALUAR A UN MÉDICO
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {equipoMedico && equipoMedico.length > 0 ? (
              equipoMedico.map((doc) => (
                <div 
                  key={doc.id} 
                  onClick={() => {
                    setMedicoParaStats(doc);
                    setIsStatsModalOpen(true);
                  }}
                  className="border border-gray-100 rounded-lg p-4 flex gap-4 hover:shadow-md hover:border-[#005ba1] transition-all cursor-pointer group"
                >
                  <img 
                    src={doc.foto} 
                    alt={doc.nombre} 
                    className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 object-cover" 
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800 group-hover:text-[#005ba1] transition-colors">{doc.nombre}</h4>
                      <div className="flex items-center text-yellow-400 text-xs font-bold">
                        ★ {Number(doc.estrellas).toFixed(1)}
                      </div>
                    </div>
                    <p className="text-xs text-[#005ba1] font-semibold mb-2">{doc.especialidad}</p>
                    <p className="text-[11px] text-gray-500 italic">Clic para ver estadísticas de atención.</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm col-span-2 text-center py-4">
                No hay médicos disponibles en el directorio actualmente.
              </p>
            )}
          </div>
        </div>
      </main>

      {showChatNotification && !isChatOpen && (
        <div className="fixed bottom-24 right-6 bg-white border border-blue-100 shadow-xl rounded-xl p-4 max-w-[260px] z-40 transition-all duration-500 ease-in-out transform translate-y-0">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-[#005ba1] font-bold text-[15px] flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#005ba1]"></span>
              </span>
              ¡Prueba nuestra IA!
            </h4>
            <button onClick={() => setShowChatNotification(false)} className="text-gray-400 hover:text-gray-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            Te puedo ayudar a Programar, Reagendar o Cancelar tus citas.
          </p>
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b border-r border-blue-100 transform rotate-45 shadow-sm"></div>
        </div>
      )}

      <button
        onClick={() => {
          setIsChatOpen(true);
          setShowChatNotification(false);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#005ba1] hover:bg-[#004680] rounded-2xl shadow-lg flex items-center justify-center transition-transform hover:scale-105 focus:outline-none z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>
      </button>

      {isChatOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[100]">
          <div className="bg-white w-[500px] h-[600px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <ChatbotCentrovitalRediseoModerno onClose={() => setIsChatOpen(false)} />
          </div>
        </div>
      )}

      <ModalEvaluacionMedico 
        isOpen={isEvaluacionModalOpen} 
        onClose={() => setIsEvaluacionModalOpen(false)} 
        userId={currentUserId}
      />

      <ModalEstadisticasMedico 
        isOpen={isStatsModalOpen} 
        onClose={() => setIsStatsModalOpen(false)} 
        medico={medicoParaStats}
      />

    </div>
  );
}