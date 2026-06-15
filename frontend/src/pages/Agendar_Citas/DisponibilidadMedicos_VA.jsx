import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function ConfiguracionDeDisponibilidad() {
  // ================= ESTADOS PARA DARLE VIDA A LA VISTA =================
  const [isLoading, setIsLoading] = useState(true);
  const [medicos, setMedicos] = useState([]);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [horarios, setHorarios] = useState({});
  const [showToast, setShowToast] = useState(false);

  // ================= SIMULACIÓN DE FETCH A BASE DE DATOS =================
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        
        // Simulamos la respuesta por ahora
        setTimeout(() => {
          setMedicos([
            { id: 1, nombre: 'Dr. Julián Casablancas', especialidad: 'Cardiología', avatar: '/DrJulianCasablancas.png' },
            { id: 2, nombre: 'Dra. Elena Rossi', especialidad: 'Pediatría', avatar: '/DraElenaRossi.png' }
          ]);
          setMedicoSeleccionado(1); // Selecciona el primero por defecto
          setIsLoading(false);
        }, 800);

      } catch (error) {
        console.error("Error cargando configuración:", error);
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleGuardarCambios = () => {
    // Envia POST/PUT a tu backend con los estados actualizados
    console.log("Guardando en BD...", horarios);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Ocultar toast después de 3 seg
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#005ba1]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-[#FBF9F9] min-w-full min-h-screen relative font-sans">
      
      {/* ================= NAVBAR SUPERIOR ================= */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 w-full shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo2.png" alt="CentroVital Logo" className="w-8 h-8 object-contain" />
          <span className="text-lg font-extrabold text-[#005ba1] tracking-wide uppercase">CentroVital</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/admin/consultorios" className="text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors">Consultorios</Link>
          <Link to="/admin/pacientes" className="text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors">Pacientes</Link>
          <Link to="/admin/reportes" className="text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors">Reportes</Link>
          <div className="relative">
            <Link to="/admin/disponibilidad" className="text-[#005ba1] font-bold text-sm">Disponibilidad</Link>
            <div className="absolute -bottom-[17px] left-0 w-full h-1 bg-[#005ba1] rounded-t-md"></div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden border border-gray-200 cursor-pointer">
            <div className="flex justify-center items-center w-full h-full bg-[#2196F3] text-white">
              <span className="font-bold text-xs">GT</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= TOAST ALERTA ================= */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 flex py-3 px-6 items-center gap-3 rounded-lg bg-[#303031] shadow-xl animate-fade-in-up">
          <p className="text-[#F2F0F0] text-sm leading-5">Cambios guardados exitosamente</p>
        </div>
      )}

      {/* ================= CONTENEDOR PRINCIPAL ================= */}
      <div className="flex justify-center items-start w-full flex-1 p-4 md:px-[42px] py-8">
        <div className="flex w-full max-w-[1152px] flex-col items-start gap-8">
          
          {/* HEADER SECCIÓN */}
          <div className="flex flex-col md:flex-row justify-between md:items-center w-full gap-4">
            <div className="flex flex-col items-start">
              <h1 className="text-[#1B1C1C] text-[32px] font-extrabold leading-10 tracking-[-0.02em]">
                Configuración de Disponibilidad
              </h1>
              <p className="text-[#404752] text-sm leading-5 mt-1">
                Gestione los horarios operativos y bloqueos de agenda del centro.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="cursor-pointer flex py-2.5 px-6 justify-center items-center rounded-md border border-[#0061A4] text-[#0061A4] text-sm font-bold hover:bg-blue-50 transition-colors">
                Cancelar
              </button>
              <button 
                onClick={handleGuardarCambios}
                className="flex py-2.5 px-6 items-center gap-2 rounded-md bg-[#0061A4] hover:bg-[#004680] text-white text-sm font-bold shadow-sm transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
            
            {/* ================= COLUMNA IZQUIERDA ================= */}
            <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-6">
              
              {/* Seleccionar Médico Dinámico */}
              <div className="flex p-5 flex-col gap-4 rounded-xl border border-gray-200 bg-white shadow-sm w-full">
                <div className="flex pb-3 items-center gap-2 border-b border-gray-100 w-full">
                  <h2 className="text-[#1B1C1C] text-lg font-bold">Seleccionar Médico</h2>
                </div>
                
                <div className="relative w-full">
                  <input type="text" placeholder="Buscar por nombre..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#005ba1] text-sm" />
                </div>

                <div className="flex flex-col max-h-[300px] overflow-y-auto gap-2 w-full mt-2">
                  <div className="flex p-3 items-center gap-3 rounded-lg border border-[rgba(0,97,164,0.20)] bg-[rgba(211,226,237,0.50)] cursor-pointer">
                    <div className="flex justify-center items-center rounded-xl bg-[#D1E4FF] w-10 h-10 shrink-0">
                      <p className="text-[#001D36] text-base font-bold">CG</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[#1B1C1C] text-sm font-bold">Configuración Global</p>
                      <p className="text-gray-500 text-[11px]">Aplica a toda la clínica</p>
                    </div>
                  </div>

                  {/* Renderizado dinámico de médicos desde la Base de Datos */}
                  {medicos.map((medico) => (
                    <div 
                      key={medico.id} 
                      onClick={() => setMedicoSeleccionado(medico.id)}
                      className={`flex p-3 items-center gap-3 rounded-lg cursor-pointer transition-colors ${medicoSeleccionado === medico.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                      <img src={medico.avatar} className="rounded-xl w-10 h-10 object-cover bg-gray-200" alt={medico.nombre} />
                      <div className="flex flex-col">
                        <p className="text-[#1B1C1C] text-sm font-semibold">{medico.nombre}</p>
                        <p className="text-gray-500 text-[11px]">{medico.especialidad}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Días No Laborales */}
              <div className="flex p-5 flex-col gap-4 rounded-xl border border-gray-200 bg-white shadow-sm w-full">
                <div className="flex pb-3 justify-between items-center border-b border-gray-100 w-full">
                  <h2 className="text-[#1B1C1C] text-lg font-bold">Días No Laborales</h2>
                  <button className="flex p-1.5 justify-center items-center rounded-lg bg-blue-50 text-[#005ba1] hover:bg-blue-100 font-bold text-xl leading-none">
                    +
                  </button>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <div className="flex p-3 justify-between items-center rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-red-500 w-2 h-2"></div>
                      <p className="text-gray-700 text-sm font-medium">1 de Mayo - Día del Trabajo</p>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 font-bold">✕</button>
                  </div>
                  <div className="flex p-3 justify-between items-center rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-orange-500 w-2 h-2"></div>
                      <p className="text-gray-700 text-sm font-medium">16 Sep - Independencia</p>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 font-bold">✕</button>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= COLUMNA DERECHA ================= */}
            <div className="w-full flex-1 flex flex-col gap-6">
              <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm w-full overflow-hidden">
                <div className="flex p-5 items-center gap-2 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-[#1B1C1C] text-lg font-bold">Horarios de Atención Semanal</h2>
                </div>

                <div className="w-full overflow-x-auto">
                    <div className="flex flex-col min-w-[700px]">
                        <div className="grid grid-cols-[120px_130px_1fr_1fr_1fr] bg-white border-b border-gray-200 w-full">
                            <div className="py-3 px-6"><p className="text-gray-500 text-[10px] font-bold tracking-wider uppercase">Día</p></div>
                            <div className="py-3 px-6"><p className="text-gray-500 text-[10px] font-bold tracking-wider uppercase">Estado</p></div>
                            <div className="py-3 px-6"><p className="text-gray-500 text-[10px] font-bold tracking-wider uppercase">Entrada</p></div>
                            <div className="py-3 px-6"><p className="text-gray-500 text-[10px] font-bold tracking-wider uppercase">Salida</p></div>
                            <div className="py-3 px-6"><p className="text-gray-500 text-[10px] font-bold tracking-wider uppercase">Descanso</p></div>
                        </div>

                        {/* Fila Dinámica de Ejemplo */}
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((dia) => (
                          <div key={dia} className="grid grid-cols-[120px_130px_1fr_1fr_1fr] items-center border-b border-gray-100 w-full hover:bg-gray-50">
                              <div className="py-5 px-6"><p className="text-gray-800 text-sm font-bold">{dia}</p></div>
                              <div className="flex items-center gap-2 pl-6">
                                  <div className="rounded bg-[#005ba1] w-4 h-4 flex justify-center items-center">
                                      <svg width="10" height="10" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12.2069 4.79303C12.5973 5.18353 12.5973 5.81653 12.2069 6.20703L7.20692 11.207C6.81642 11.5974 6.18342 11.5974 5.79292 11.207L3.79292 9.20703C3.41395 8.81465 3.41937 8.19095 3.8051 7.80521C4.19083 7.41948 4.81454 7.41406 5.20692 7.79303L6.49992 9.08603L10.7929 4.79303C11.1834 4.40265 11.8164 4.40265 12.2069 4.79303V4.79303"/></svg>
                                  </div>
                                  <p className="text-[#005ba1] text-sm font-bold">Abierto</p>
                              </div>
                              <div className="px-6 py-4">
                                  <select className="w-full border border-gray-300 rounded-md py-1.5 px-2 text-sm bg-white cursor-pointer focus:outline-none focus:border-[#005ba1]">
                                      <option>08:00 AM</option>
                                  </select>
                              </div>
                              <div className="px-6 py-4">
                                  <select className="w-full border border-gray-300 rounded-md py-1.5 px-2 text-sm bg-white cursor-pointer focus:outline-none focus:border-[#005ba1]">
                                      <option>06:00 PM</option>
                                  </select>
                              </div>
                              <div className="px-6 py-4">
                                  <select className="w-full border border-gray-300 rounded-md py-1.5 px-2 text-sm bg-white cursor-pointer focus:outline-none focus:border-[#005ba1]">
                                      <option>60 min</option>
                                  </select>
                              </div>
                          </div>
                        ))}
                    </div>
                </div>

                <div className="flex p-6 flex-col gap-4 border-t border-gray-200 bg-gray-50">
                  <h3 className="text-gray-800 text-lg font-bold">Ajustes Adicionales</h3>
                  <div className="flex flex-col sm:flex-row gap-6 w-full">
                    <div className="flex flex-col gap-2 w-full sm:w-1/2">
                      <p className="text-gray-600 text-[11px] font-bold uppercase tracking-wider">Duración de la Cita</p>
                      <select className="w-full border border-gray-300 bg-white rounded-md py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-[#005ba1] cursor-pointer">
                        <option>30 minutos</option>
                        <option>45 minutos</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-1/2">
                      <p className="text-gray-600 text-[11px] font-bold uppercase tracking-wider">Intervalo entre Citas</p>
                      <select className="w-full border border-gray-300 bg-white rounded-md py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-[#005ba1] cursor-pointer">
                        <option>10 minutos</option>
                        <option>15 minutos</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}