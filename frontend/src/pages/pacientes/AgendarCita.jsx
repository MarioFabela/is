import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ChatbotCentrovitalRediseoModerno from '../Agendar_Citas/Chatbot_VP';
import { supabaseFrontend } from '../../api/supabaseClient';
import ModalDetallesCita from './ModalDetallesCita';
import { obtenerDisponibilidadDoctores } from '../../api/disponibilidad';

// ✅ Declaramos la ruta dinámica globalmente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AgendarCita = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [doctoresDisponibles, setDoctoresDisponibles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null);
  const [medicoIdSeleccionado, setMedicoIdSeleccionado] = useState(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

  useEffect(() => {
    const fetchDisponibilidad = async () => {
      setIsLoading(true);
      setHoraSeleccionada(null);
      setDoctorSeleccionado(null);
      setMedicoIdSeleccionado(null);

      // AQUÍ SOLO NECESITAMOS LA FECHA EN TEXTO (YYYY-MM-DD) PARA BUSCAR DISPONIBILIDAD
      const year = fechaActual.getFullYear();
      const month = String(fechaActual.getMonth() + 1).padStart(2, '0');
      const day = String(fechaActual.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      try {
        const doctoresProcesados = await obtenerDisponibilidadDoctores(dateStr);
        setDoctoresDisponibles(doctoresProcesados);
      } catch (error) {
        console.error(error.message);
        setDoctoresDisponibles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisponibilidad();
  }, [fechaActual, refreshKey]);

  useEffect(() => {
    const canalCitas = supabaseFrontend
      .channel('citas-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'citas' },
        (payload) => {
          setRefreshKey((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabaseFrontend.removeChannel(canalCitas);
    };
  }, []);

  const diaSiguiente = () => {
    setFechaActual(new Date(fechaActual.setDate(fechaActual.getDate() + 1)));
  };

  const diaAnterior = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() - 1);

    if (nuevaFecha >= hoy) {
      setFechaActual(nuevaFecha);
    }
  };

 const handleConfirmarCita = async (datosFormulario) => {
    if (!userId) return alert("Por favor, inicia sesión para agendar una cita.");
    if (!horaSeleccionada || !medicoIdSeleccionado) return alert("Por favor, selecciona un médico y una hora.");

    setIsSubmitting(true);

    const { paraQuien, nombreCompleto, esMenor, motivo, sintomas } = datosFormulario;

    // Lógica matemática de zonas horarias impecable que ya corregiste
    const [hora, minuto] = horaSeleccionada.split(':').map(Number);
    const citaDate = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), hora, minuto);
    const fechaHoraIso = citaDate.toISOString(); 

    try {
      const cuerpoPeticion = {
        id_paciente_tutor: userId,
        id_paciente_cita: userId,
        medico_id: medicoIdSeleccionado,
        fecha_hora: fechaHoraIso,
        estado: "programada",
        motivo: motivo || "Consulta general",
        sintomas: sintomas || "No especificado",
        paciente_dependiente: paraQuien === 'otra' ? nombreCompleto : null,
        es_menor_dependiente: paraQuien === 'otra' ? esMenor : false
      };

      // ✅ CORRECCIÓN: Inyección de la URL de producción
      const response = await fetch(`${API_URL}/citas/agendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cuerpoPeticion)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al procesar la reservación");
      }

      alert("✅ ¡Tu cita ha sido confirmada exitosamente y agendada en Google Calendar!");
      setIsDetailsModalOpen(false);
      setFechaActual(new Date(fechaActual)); // Forzamos la actualización de la interfaz

    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabaseFrontend.auth.signOut();
    navigate('/');
  };

  const fechaFormateada = fechaActual.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#f8fbff] font-sans pb-32 relative">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <Link to="/dashboard-pacientes" className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-[#005ba1] tracking-wide uppercase">CentroVital</span>
        </Link>
        <div className="hidden md:flex gap-8">
          <Link to="/dashboard-pacientes" className="text-gray-500 font-medium text-sm">Inicio</Link>
          <div className="relative">
            <Link to="/agendar-cita" className="text-[#005ba1] font-bold text-sm">Citas</Link>
            <div className="absolute -bottom-[17px] left-0 w-full h-1 bg-[#005ba1] rounded-t-md"></div>
          </div>
          <Link to="/historial" className="text-gray-500 font-medium text-sm">Historial</Link>
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
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Programar Cita</h1>
        <p className="text-sm text-gray-500 mb-8">Reserve una consulta con nuestro equipo médico especializado en solo unos pocos pasos.</p>

        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800 capitalize">{fechaFormateada}</h2>

          <div className="flex items-center gap-6">
            <DatePicker
              selected={fechaActual}
              onChange={(date) => setFechaActual(date)}
              customInput={
                <button className="text-[#005ba1] font-bold text-sm uppercase hover:underline">
                  Cambiar Fecha
                </button>
              }
              dateFormat="MMMM d, yyyy"
              popperPlacement="bottom-end"
              minDate={new Date()}
            />

            <div className="flex items-center gap-4">
              <button
                onClick={diaAnterior}
                className="text-2xl font-light text-[#005ba1] hover:text-[#003d6d] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={fechaActual <= new Date().setHours(0, 0, 0, 0)}
                title="Día anterior"
              >
                &lt;
              </button>
              <button
                onClick={diaSiguiente}
                className="text-2xl font-light text-[#005ba1] hover:text-[#003d6d] transition-colors"
                title="Día siguiente"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500 font-bold animate-pulse">Buscando disponibilidad...</div>
          ) : doctoresDisponibles.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-sm">
              <p className="text-gray-500 text-lg mb-2">No hay médicos disponibles para esta fecha.</p>
              <button onClick={diaSiguiente} className="text-[#005ba1] font-bold hover:underline">Revisar el día siguiente</button>
            </div>
          ) : (
            doctoresDisponibles.map((doc, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow">

                <div className="flex items-center gap-4 md:w-1/4 shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-[#e6f0fa] text-[#005ba1] flex items-center justify-center font-bold text-lg">
                    {doc.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{doc.nombre}</h3>
                    <p className="text-xs text-[#005ba1] flex items-center gap-1 mt-1 font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                      {doc.consultorio}
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Horarios Disponibles</p>
                  <div className="flex flex-wrap gap-2">
                    {doc.horas.map((slot, i) => (
                      <button
                        key={i}
                        disabled={slot.ocupado}
                        onClick={() => {
                          if (!slot.ocupado) {
                            setHoraSeleccionada(slot.hora);
                            setDoctorSeleccionado(doc.nombre);
                            setMedicoIdSeleccionado(doc.id);
                          }
                        }}
                        className={`px-4 py-2 border rounded text-xs font-bold transition-colors ${slot.ocupado
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60 line-through'
                            : horaSeleccionada === slot.hora && medicoIdSeleccionado === doc.id
                              ? 'bg-[#005ba1] text-white border-[#005ba1] shadow-md'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#005ba1] hover:text-[#005ba1]'
                          }`}
                        title={slot.ocupado ? "Horario no disponible" : "Seleccionar horario"}
                      >
                        {slot.hora}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </main>

      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#005ba1] hover:bg-[#004680] rounded-2xl shadow-lg flex items-center justify-center transition-transform hover:scale-105 focus:outline-none z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16" />
          <line x1="16" y1="16" x2="16" y2="16" />
        </svg>
      </button>

      {isChatOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[100]">
          <div className="bg-white w-[500px] h-[600px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <ChatbotCentrovitalRediseoModerno onClose={() => setIsChatOpen(false)} />
          </div>
        </div>
      )}

      <div className={`fixed bottom-0 left-0 w-full bg-[#005ba1] text-white p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] z-20 transition-transform duration-300 ${horaSeleccionada ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Resumen de la reserva</p>
            <h3 className="text-xl font-bold">Cita con {doctorSeleccionado}</h3>
            <p className="text-xs text-blue-100 mt-1 uppercase capitalize">{fechaFormateada} a las {horaSeleccionada}</p>
          </div>
          <button
            onClick={() => setIsDetailsModalOpen(true)}
            className="mt-4 md:mt-0 bg-white text-[#005ba1] px-8 py-3 rounded font-bold text-sm hover:bg-gray-100 transition-colors shadow-md"
          >
            CONFIRMAR CITA
          </button>
        </div>
      </div>

      <ModalDetallesCita
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onConfirm={handleConfirmarCita}
        isSubmitting={isSubmitting}
      />

    </div>
  );
};

export default AgendarCita;