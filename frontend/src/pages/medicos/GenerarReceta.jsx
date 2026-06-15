import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabaseFrontend } from '../../api/supabaseClient';

const GenerarReceta = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const cita = location.state?.cita;
  const nombrePaciente = location.state?.paciente || cita?.perfiles?.nombre_completo || 'Paciente no identificado';
  const pacienteId = cita?.id_paciente_cita?.split('-')[0].toUpperCase() || 'S/N';

  const modoLectura = cita?.estado === 'completada';

  const [nombreMed, setNombreMed] = useState('');
  const [dosis, setDosis] = useState('');
  const [duracion, setDuracion] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [indicacionesGenerales, setIndicacionesGenerales] = useState('');
  const [listaMedicamentos, setListaMedicamentos] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(modoLectura);

// Nuevos estados para los datos del médico
  const [nombreMedico, setNombreMedico] = useState('Cargando...');
  const [idMedicoFormal, setIdMedicoFormal] = useState('');

  useEffect(() => {
    const fetchDatosRecetaYMedico = async () => {
      try {
        // 1. Traer datos de la receta si es modo lectura
        if (modoLectura && cita?.id) {
          const { data, error } = await supabaseFrontend
            .from('recetas')
            .select('*')
            .eq('cita_id', cita.id)
            .single();

          if (data) {
            setListaMedicamentos(data.medicamentos || []);
            setIndicacionesGenerales(data.indicaciones || '');
          }
        }

        // 2. BUSCAR DATOS DEL MÉDICO (Nueva lógica para la firma digital)
        if (cita?.medico_id) {
          const { data: medData, error: medError } = await supabaseFrontend
            .from('medicos')
            .select('id, perfiles(nombre_completo)')
            .eq('id', cita.medico_id)
            .single();

          if (medData) {
            setNombreMedico(medData.perfiles?.nombre_completo || 'Médico Autorizado');
            // Cortamos el UUID para que se vea como un folio de registro limpio (ej: MED-A1B2C3)
            setIdMedicoFormal(`MED-${medData.id.split('-')[0].toUpperCase()}`);
          }
        } else {
          setNombreMedico('Dr. Wilson'); // Respaldo por si la cita de prueba no tiene médico
          setIdMedicoFormal('MED-EXP759');
        }

      } catch (error) {
        console.error("Error cargando datos del recetario:", error);
      } finally {
        setCargandoDatos(false);
      }
    };

    fetchDatosRecetaYMedico();
  }, [cita, modoLectura]);

  const agregarMedicamento = () => {
    if (!nombreMed || !dosis) return alert("Ingresa al menos nombre y dosis.");
    const nuevoMedicamento = { id: Date.now(), nombre: nombreMed, dosis, duracion, instrucciones };
    setListaMedicamentos([...listaMedicamentos, nuevoMedicamento]);
    setNombreMed(''); setDosis(''); setDuracion(''); setInstrucciones('');
  };

  const eliminarMedicamento = (id) => {
    setListaMedicamentos(listaMedicamentos.filter(med => med.id !== id));
  };

  const handleImprimirPDF = () => window.print();

  // Guardar en Supabase
  const handleFinalizar = async () => {
    if (listaMedicamentos.length === 0) return alert("Agrega al menos un medicamento.");
    
    try {
      const { error } = await supabaseFrontend
        .from('recetas')
        .insert([{
          cita_id: cita.id,
          medicamentos: listaMedicamentos,
          indicaciones: indicacionesGenerales
        }]);

      if (error) throw error;

      alert("¡Receta guardada exitosamente en la base de datos!");
      navigate(-1);
    } catch (error) {
      console.error("Error guardando receta:", error);
      alert("Hubo un error al guardar la receta: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] print:bg-white font-sans pb-32 print:pb-0 print:min-h-0">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-2">
           <span className="text-xl font-extrabold text-[#005ba1] tracking-wide">CentroVital</span>
        </div>
        <div className="hidden md:flex gap-8">
          <span className="text-[#005ba1] font-bold text-sm border-b-2 border-[#005ba1] pb-1">
            {modoLectura ? 'Visor de Recetas' : 'Nueva Receta'}
          </span>
        </div>
        <button onClick={() => navigate(-1)} className="text-gray-500 text-xs font-bold uppercase hover:text-gray-800 transition-colors cursor-pointer">
          Volver
        </button>
      </nav>

      <main className={`mx-auto mt-10 px-4 relative ${modoLectura ? 'max-w-4xl' : 'max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8'}`}>
        
        {!modoLectura && (
          <div className="lg:col-span-5 space-y-6 print:hidden">
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 shadow-sm">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nombrePaciente.replace(/\s+/g, '')}`} alt="Avatar" className="w-12 h-12 bg-blue-50 rounded-lg border border-gray-100" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Paciente</p>
                <p className="text-lg font-bold text-gray-800 uppercase">{nombrePaciente}</p>
                <p className="text-xs text-gray-500">ID: {pacienteId}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Añadir Nuevo Medicamento</label>
              <input type="text" value={nombreMed} onChange={(e) => setNombreMed(e.target.value)} placeholder="Nombre del medicamento" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#005ba1] focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={dosis} onChange={(e) => setDosis(e.target.value)} placeholder="Dosis" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#005ba1] focus:outline-none" />
                <input type="text" value={duracion} onChange={(e) => setDuracion(e.target.value)} placeholder="Duración" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#005ba1] focus:outline-none" />
              </div>
              <input type="text" value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)} placeholder="Instrucciones adicionales" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#005ba1] focus:outline-none" />
              <button onClick={agregarMedicamento} className="w-full border border-dashed border-[#005ba1] text-[#005ba1] bg-blue-50/50 hover:bg-blue-50 font-bold text-xs py-2 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2">
                Añadir a la lista
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Indicaciones Generales</label>
              <textarea value={indicacionesGenerales} onChange={(e) => setIndicacionesGenerales(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#005ba1] resize-none" rows="3" placeholder="Reposo, dieta..."></textarea>
            </div>
          </div>
        )}

        <div className={modoLectura ? 'w-full' : 'lg:col-span-7'}>
          {modoLectura && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 print:hidden text-sm flex items-center gap-2">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              <strong>Modo Lectura:</strong> Esta consulta ya fue completada. La receta no puede modificarse.
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[600px] flex flex-col relative print:border-none print:shadow-none">
            <div className="border-b-2 border-[#005ba1] pb-4 mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-extrabold text-[#005ba1] tracking-wide">CentroVital</h1>
                <p className="text-xs text-gray-500 mt-1">Receta Médica Electrónica</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-800">Fecha: {new Date().toLocaleDateString()}</p>
                <p className="text-[10px] text-gray-500 uppercase mt-1">Cita ID: {cita?.id?.split('-')[0] || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded mb-6 border border-gray-100 flex justify-between print:bg-transparent">
              <p className="text-sm"><span className="font-bold text-gray-800">Paciente:</span> <span className="uppercase text-gray-700">{nombrePaciente}</span></p>
            </div>

            <div className="flex-grow">
              <h3 className="text-xs font-bold text-[#005ba1] mb-4">Prescripción (Rx)</h3>
              
              {cargandoDatos ? (
                <p className="text-sm text-gray-400 text-center py-10">Buscando receta en el archivo...</p>
              ) : listaMedicamentos.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg print:hidden">
                  <p className="text-sm text-gray-400">No hay medicamentos en esta receta.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {listaMedicamentos.map((item, index) => (
                    <li key={item.id} className="group flex justify-between items-start border-b border-gray-100 pb-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{index + 1}. {item.nombre}</p>
                        <p className="text-xs text-gray-700 mt-1">Tomar <span className="font-bold">{item.dosis}</span>, por <span className="font-bold">{item.duracion}</span>.</p>
                        {item.instrucciones && <p className="text-[10px] text-gray-500 italic mt-0.5">Nota: {item.instrucciones}</p>}
                      </div>
                      {!modoLectura && (
                        <button onClick={() => eliminarMedicamento(item.id)} className="text-red-400 hover:text-red-600 print:hidden cursor-pointer p-1">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {indicacionesGenerales && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Indicaciones Adicionales:</p>
                  <p className="text-xs text-gray-700 whitespace-pre-line">{indicacionesGenerales}</p>
                </div>
              )}
            </div>

              {/* Firma Digital Automática del Médico */}
              <div className="mt-16 pt-6 border-t border-gray-200 text-center w-72 mx-auto bg-gray-50/50 p-4 rounded-lg border border-dashed border-gray-200 print:bg-transparent print:border-none">
                <p className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">{nombreMedico}</p>
                <p className="text-[10px] text-[#005ba1] font-bold mt-1 bg-blue-50 px-2 py-0.5 rounded inline-block print:bg-transparent">
                  REGISTRO CLÍNICO: {idMedicoFormal}
                </p>
                <p className="text-[9px] text-gray-400 italic mt-3 block border-t border-gray-100 pt-2">
                  Documento validado digitalmente mediante identificador único de CentroVital
                </p>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-50 print:hidden">
        <div className="max-w-3xl mx-auto flex gap-3">
           <button onClick={handleImprimirPDF} className="w-full bg-white border border-gray-300 text-gray-700 text-xs font-bold py-3 rounded hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer">
             Imprimir / Guardar PDF
           </button>
           {!modoLectura && (
             <button onClick={handleFinalizar} className="w-full bg-[#005ba1] text-white text-xs font-bold py-3 rounded hover:bg-[#004680] flex items-center justify-center gap-2 cursor-pointer">
               Finalizar y Enviar
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default GenerarReceta;