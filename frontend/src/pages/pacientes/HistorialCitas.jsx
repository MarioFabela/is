import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { supabaseFrontend } from '../../api/supabaseClient';
import { fetchHistorialCitas, cancelarCitaApi } from '../../api/historial';
import ModalEvaluacionMedico from './ModalEvaluacionMedico'; 

const HistorialCitas = () => {
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null); 
  
  const navigate = useNavigate();

  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [citaAevaluar, setCitaAevaluar] = useState(null);

  const [isReagendarModalOpen, setIsReagendarModalOpen] = useState(false);
  const [citaAreagendar, setCitaAreagendar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    supabaseFrontend.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        setUserId(data.user.id);
        const { data: perfil } = await supabaseFrontend
          .from('perfiles')
          .select('nombre_completo, foto_url')
          .eq('id', data.user.id)
          .maybeSingle();
        if (perfil) setUserProfile(perfil);
      }
    });
  }, []);

  const cargarHistorial = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const data = await fetchHistorialCitas(userId);
      setHistorial(data);
    } catch (error) {
      console.error("No se pudo cargar el historial", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [userId]);

  const handleVerReceta = (citaId) => {
    alert(`Cargando receta médica para la cita: ${citaId}...`);
  };

  const confirmarReagendar = async () => {
    if (!citaAreagendar) return;
    
    setIsDeleting(true);
    try {
      await cancelarCitaApi(citaAreagendar.id);
      setIsReagendarModalOpen(false);
      navigate('/agendar-cita');
    } catch (error) {
      alert("Hubo un error al intentar cancelar la cita. Intente nuevamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    await supabaseFrontend.auth.signOut();
    navigate('/');
  };

  const totalConsultas = historial.filter(c => c.estado === 'completada' || c.estado === 'programada').length;
  const ultimaVisita = historial.length > 0 ? historial[0].fecha : 'Sin registros';

  return (
    <div className="min-h-screen bg-[#f8fbff] font-sans pb-12 relative">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <Link to="/dashboard-pacientes" className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-[#005ba1] tracking-wide uppercase">CentroVital</span>
        </Link>
        <div className="hidden md:flex gap-8">
          <Link to="/dashboard-pacientes" className="text-gray-500 font-medium text-sm">Inicio</Link>
          <Link to="/agendar-cita" className="text-gray-500 font-medium text-sm">Citas</Link>
          <div className="relative">
            <Link to="/historial" className="text-[#005ba1] font-bold text-sm">Historial</Link>
            <div className="absolute -bottom-[17px] left-0 w-full h-1 bg-[#005ba1] rounded-t-md"></div>
          </div>
          <Link to="/perfil" className="text-gray-500 font-medium text-sm">Perfil</Link>
        </div>
        
        <div 
          className="relative"
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 bg-[#e6f0fa] rounded-full overflow-hidden border-2 border-white shadow-[0_2px_8px_rgba(0,91,161,0.15)] cursor-pointer flex items-center justify-center hover:scale-105 transition-transform"
          >
            {userProfile?.foto_url ? (
              <img src={userProfile.foto_url} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#005ba1] font-black text-sm">{userProfile?.nombre_completo?.charAt(0) || 'U'}</span>
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
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1-1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
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
      </nav>

      <main className="max-w-5xl mx-auto px-6 mt-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Historial de Citas</h1>
            <p className="text-sm text-gray-500">Consulta el registro detallado de tus visitas anteriores en CentroVital.</p>
          </div>
          <Link 
            to="/agendar-cita" 
            className="bg-[#005ba1] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-[#004680] transition-colors"
          >
            + Agendar nueva cita
          </Link>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="bg-white border border-gray-200 p-5 rounded-lg w-48 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Consultas</p>
            <p className="text-3xl font-bold text-[#005ba1]">{isLoading ? '...' : totalConsultas}</p>
          </div>
          <div className="bg-white border border-gray-200 p-5 rounded-lg w-48 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Última Visita</p>
            <p className="text-xl font-bold text-gray-800">{isLoading ? '...' : ultimaVisita}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Consultorio</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-medium animate-pulse">Cargando historial médico...</td></tr>
              ) : historial.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No tienes citas registradas.</td></tr>
              ) : (
                historial.map((cita) => {
                  const esFutura = new Date(cita.fechaHoraIso) > new Date() && cita.estado === 'programada';

                  return (
                    <tr key={cita.id} className={`hover:bg-gray-50 transition-colors ${cita.estado === 'cancelada' ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4">
                        <p className={`font-bold text-sm ${cita.estado === 'cancelada' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{cita.fecha}</p>
                        <p className="text-xs text-gray-400 mt-1">{cita.hora}</p>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#e6f0fa] flex items-center justify-center text-xs font-bold text-[#005ba1]">
                          {cita.iniciales}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{cita.doctor}</p>
                          <p className="text-xs text-gray-500 mt-1">{cita.especialidad}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-medium border border-gray-200">
                          {cita.consultorio}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        
                        {cita.estado === 'cancelada' ? (
                          <span className="text-xs font-bold text-red-500 px-2 py-1">Cancelada</span>
                        ) : (
                          <>
                            {esFutura && (
                              <button 
                                onClick={() => { setCitaAreagendar(cita); setIsReagendarModalOpen(true); }}
                                className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded text-xs font-bold hover:bg-gray-50 transition-colors"
                              >
                                Reagendar
                              </button>
                            )}

                            {!esFutura && cita.tieneReceta && (
                              <button onClick={() => handleVerReceta(cita.id)} className="bg-white border border-[#005ba1] text-[#005ba1] px-4 py-2 rounded text-xs font-bold hover:bg-blue-50 transition-colors">
                                Ver Receta
                              </button>
                            )}
                            
                            {!esFutura && (cita.evaluado ? (
                              <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded text-xs font-bold cursor-not-allowed border border-gray-200">
                                Evaluado
                              </button>
                            ) : (
                              <button 
                                onClick={() => { setCitaAevaluar(cita); setIsEvalModalOpen(true); }}
                                className="bg-[#005ba1] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#004680] transition-colors"
                              >
                                Evaluar Doctor
                              </button>
                            ))}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {isEvalModalOpen && citaAevaluar && (
        <ModalEvaluacionMedico
          isOpen={isEvalModalOpen}
          onClose={() => { setIsEvalModalOpen(false); setCitaAevaluar(null); }}
          citaId={citaAevaluar.id}
          medicoId={citaAevaluar.medicoId}
          onEvaluacionExitosa={() => {
            setIsEvalModalOpen(false);
            cargarHistorial(); 
          }}
        />
      )}

      {isReagendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">¿Deseas reagendar tu cita?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Para seleccionar un nuevo horario, primero debemos <strong>eliminar tu reserva actual</strong> con el {citaAreagendar?.doctor} del {citaAreagendar?.fecha}. Esta acción liberará el espacio para otros pacientes.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsReagendarModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarReagendar}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-md disabled:opacity-50"
              >
                {isDeleting ? 'Procesando...' : 'Sí, eliminar y reagendar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HistorialCitas;