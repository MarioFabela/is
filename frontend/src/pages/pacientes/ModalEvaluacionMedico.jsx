import React, { useState, useEffect } from 'react';
import { supabaseFrontend } from '../../api/supabaseClient';
import { enviarEvaluacionMedico } from '../../api/evaluaciones'; // <-- Importación del servicio

const ModalEvaluacionMedico = ({ isOpen, onClose, userId }) => { // <-- Recibimos userId
  // Estados para controlar el flujo del modal
  const [step, setStep] = useState(1);
  const [medicos, setMedicos] = useState([]);
  const [isLoadingMedicos, setIsLoadingMedicos] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- Estado de carga para el botón
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);

  // Estados del formulario
  const [evaluaciones, setEvaluaciones] = useState({ atencion: null, empatia: null, claridad: null, instalaciones: null });
  const [comentarios, setComentarios] = useState('');

  const categorias = [
    { id: 'atencion', titulo: 'Atención Médica', desc: 'Calidad del diagnóstico y tratamiento recibido durante su consulta.', icono: '🩺' },
    { id: 'empatia', titulo: 'Empatía', desc: 'Trato humano y nivel de escucha por parte del personal médico.', icono: '♡' },
    { id: 'claridad', titulo: 'Claridad en la explicación', desc: 'Facilidad para comprender las instrucciones y el diagnóstico médico.', icono: '🗣' },
    { id: 'instalaciones', titulo: 'Instalaciones', desc: 'Limpieza y comodidad del consultorio y áreas comunes.', icono: '🏢' },
  ];

  // Cargar los médicos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const fetchMedicos = async () => {
        setIsLoadingMedicos(true);
        try {
          const { data, error } = await supabaseFrontend
            .from('medicos')
            .select(`
              id, 
              especialidad, 
              foto_url,
              perfiles (nombre_completo)
            `)
            .eq('activo', true);

          if (!error && data) {
            setMedicos(data);
          }
        } catch (err) {
          console.error("Error al cargar médicos:", err);
        } finally {
          setIsLoadingMedicos(false);
        }
      };
      
      fetchMedicos();
      // Reiniciar estados al abrir
      setStep(1);
      setMedicoSeleccionado(null);
      setEvaluaciones({ atencion: null, empatia: null, claridad: null, instalaciones: null });
      setComentarios('');
    }
  }, [isOpen]);

  const handleSeleccionarMedico = (medico) => {
    setMedicoSeleccionado(medico);
    setStep(2); // Avanzamos al formulario
  };

  const handleCalificar = (categoriaId, valor) => {
    setEvaluaciones({ ...evaluaciones, [categoriaId]: valor });
  };

  // <-- LÓGICA DE ENVÍO CONECTADA AL BACKEND
  const handleEnviar = async (e) => {
    e.preventDefault();
    
    // Validación básica: asegurarse de que todas las categorías tengan calificación
    const todasCalificadas = Object.values(evaluaciones).every(val => val !== null);
    if (!todasCalificadas) {
      return alert("Por favor, califique todas las categorías antes de enviar.");
    }

    // Validar que tengamos la sesión del paciente
    if (!userId) {
      return alert("Error: No se pudo identificar su sesión. Por favor, recargue la página.");
    }

    setIsSubmitting(true);

    try {
      const datosAEnviar = { 
        medico_id: medicoSeleccionado.id, 
        paciente_id: userId,
        evaluaciones, 
        comentarios 
      };

      await enviarEvaluacionMedico(datosAEnviar);
      
      alert("¡Evaluación enviada con éxito! Su opinión es muy valiosa para nosotros.");
      onClose(); // Cerramos el modal tras enviar exitosamente
    } catch (error) {
      alert("Hubo un problema al enviar su evaluación: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#f8fbff] w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden border border-gray-200">
        
        {/* Cabecera del Modal */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button 
                onClick={() => setStep(1)} 
                className="text-gray-400 hover:text-[#005ba1] transition-colors"
                title="Volver a la selección"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            )}
            <h2 className="text-xl font-extrabold text-gray-900">
              {step === 1 ? 'Seleccione un Médico' : 'Formulario de Evaluación'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 rounded-full p-2 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* ================= PASO 1: SELECCIONAR MÉDICO ================= */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <p className="text-sm text-gray-500 mb-6">¿A qué profesional de la salud desea evaluar el día de hoy?</p>
              
              {isLoadingMedicos ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#005ba1]"></div>
                </div>
              ) : medicos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {medicos.map((medico) => (
                    <button
                      key={medico.id}
                      onClick={() => handleSeleccionarMedico(medico)}
                      className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-[#005ba1] hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex-shrink-0 overflow-hidden">
                        <img 
                          src={medico.foto_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${medico.id}`} 
                          alt="Doctor" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 group-hover:text-[#005ba1] transition-colors">
                          Dr(a). {medico.perfiles?.nombre_completo || 'Especialista'}
                        </h4>
                        <p className="text-xs text-gray-500">{medico.especialidad}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No se encontraron médicos disponibles.</p>
              )}
            </div>
          )}

          {/* ================= PASO 2: FORMULARIO DE EVALUACIÓN ================= */}
          {step === 2 && medicoSeleccionado && (
            <form onSubmit={handleEnviar} className="space-y-6 animate-fade-in-up">
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white overflow-hidden shrink-0">
                  <img 
                    src={medicoSeleccionado.foto_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${medicoSeleccionado.id}`} 
                    alt="Doctor" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Evaluando a:</p>
                  <p className="text-sm font-bold text-[#005ba1]">Dr(a). {medicoSeleccionado.perfiles?.nombre_completo}</p>
                </div>
              </div>

              {categorias.map((cat) => (
                <div key={cat.id} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-bold text-gray-800">{cat.titulo}</h3>
                    <span className="text-[#005ba1] text-lg">{cat.icono}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{cat.desc}</p>
                  
                  {/* Botones del 0 al 10 */}
                  <div className="flex flex-wrap gap-1.5 justify-between sm:justify-start">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleCalificar(cat.id, num)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded border font-bold text-sm transition-all ${
                          evaluaciones[cat.id] === num
                            ? 'bg-[#005ba1] border-[#005ba1] text-white shadow-md transform scale-105'
                            : 'bg-white border-gray-300 text-gray-600 hover:border-[#005ba1] hover:text-[#005ba1]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Comentarios Libres */}
              <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-1">Comentarios Libres</h3>
                <p className="text-xs text-gray-500 mb-3">Detalle cualquier situación relevante o sugerencia para mejorar.</p>
                <textarea
                  className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-[#005ba1] focus:ring-1 focus:ring-[#005ba1] resize-none"
                  rows="3"
                  placeholder="Escriba aquí sus observaciones..."
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                ></textarea>
              </div>

              {/* <-- BOTÓN CON ESTADO DE CARGA --> */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#005ba1] hover:bg-[#004680] text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Evaluación'}
                {!isSubmitting && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ModalEvaluacionMedico;