import React, { useState, useEffect } from 'react';
import { obtenerEstadisticasMedico } from '../../api/evaluaciones';

const ModalEstadisticasMedico = ({ isOpen, onClose, medico }) => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && medico) {
      const fetchStats = async () => {
        setIsLoading(true);
        try {
          const data = await obtenerEstadisticasMedico(medico.id);
          setEstadisticas(data);
        } catch (error) {
          console.error("Error cargando estadísticas:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStats();
    }
  }, [isOpen, medico]);

  if (!isOpen || !medico) return null;

  // Función para calcular el ancho de la barra (0 a 100%)
  const calcularPorcentaje = (valor) => `${(valor / 10) * 100}%`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden border border-gray-200">
        
        {/* Cabecera con botón de cerrar */}
        <div className="absolute top-4 right-4 z-10">
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-white/80 rounded-full p-1.5 transition-colors shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Perfil del Médico */}
        <div className="bg-[#f8fbff] p-6 text-center border-b border-gray-100">
          <div className="w-24 h-24 mx-auto rounded-full bg-blue-50 border-4 border-white shadow-md overflow-hidden mb-3">
            <img 
              src={medico.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${medico.id}`} 
              alt={medico.nombre} 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">{medico.nombre}</h2>
          <p className="text-sm font-bold text-[#005ba1] uppercase tracking-wider mt-1">{medico.especialidad}</p>
        </div>

        {/* Sección de Estadísticas */}
        <div className="p-6">
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-bold text-gray-800">Métricas de Evaluación</h3>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
              {isLoading ? '...' : estadisticas?.total_votos} reseñas
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#005ba1]"></div>
            </div>
          ) : estadisticas && estadisticas.total_votos > 0 ? (
            <div className="space-y-5">
              {/* Barra: Atención */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5"><span className="text-blue-500">🩺</span> Atención Médica</span>
                  <span className="font-black text-[#005ba1]">{estadisticas.atencion} <span className="text-gray-400 text-xs font-normal">/10</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#005ba1] h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: calcularPorcentaje(estadisticas.atencion) }}></div>
                </div>
              </div>

              {/* Barra: Empatía */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5"><span className="text-red-400">♡</span> Empatía y Trato</span>
                  <span className="font-black text-[#005ba1]">{estadisticas.empatia} <span className="text-gray-400 text-xs font-normal">/10</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-red-400 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: calcularPorcentaje(estadisticas.empatia) }}></div>
                </div>
              </div>

              {/* Barra: Claridad */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5"><span className="text-yellow-500">🗣</span> Claridad en Diagnóstico</span>
                  <span className="font-black text-[#005ba1]">{estadisticas.claridad} <span className="text-gray-400 text-xs font-normal">/10</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-yellow-400 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: calcularPorcentaje(estadisticas.claridad) }}></div>
                </div>
              </div>

              {/* Barra: Instalaciones */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5"><span className="text-teal-500">🏢</span> Instalaciones</span>
                  <span className="font-black text-[#005ba1]">{estadisticas.instalaciones} <span className="text-gray-400 text-xs font-normal">/10</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: calcularPorcentaje(estadisticas.instalaciones) }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">Este especialista aún no cuenta con evaluaciones detalladas de sus pacientes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEstadisticasMedico;