import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabaseFrontend } from '../../api/supabaseClient';

const OrdenLaboratorio = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const cita = location.state?.cita;
  const nombrePaciente = location.state?.paciente || cita?.perfiles?.nombre_completo || 'Paciente no identificado';
  const pacienteId = cita?.id_paciente_cita?.split('-')[0].toUpperCase() || 'S/N';

  const modoLectura = cita?.estado === 'completada';

  const [nombreEstudio, setNombreEstudio] = useState('');
  const [indicacionEstudio, setIndicacionEstudio] = useState('');
  const [diagnosticoPresuntivo, setDiagnosticoPresuntivo] = useState('');
  
  const [listaEstudios, setListaEstudios] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(modoLectura);

  const [nombreMedico, setNombreMedico] = useState('Cargando...');
  const [idMedicoFormal, setIdMedicoFormal] = useState('');

  useEffect(() => {
    const fetchDatosYMedico = async () => {
      try {
        if (modoLectura && cita?.id) {
          const { data } = await supabaseFrontend
            .from('ordenes_laboratorio')
            .select('*')
            .eq('cita_id', cita.id)
            .single();

          if (data) {
            setListaEstudios(data.estudios || []);
            setDiagnosticoPresuntivo(data.diagnostico_presuntivo || '');
          }
        }

        if (cita?.medico_id) {
          const { data: medData } = await supabaseFrontend
            .from('medicos')
            .select('id, perfiles(nombre_completo)')
            .eq('id', cita.medico_id)
            .single();

          if (medData) {
            setNombreMedico(medData.perfiles?.nombre_completo || 'Médico Autorizado');
            setIdMedicoFormal(`MED-${medData.id.split('-')[0].toUpperCase()}`);
          }
        } else {
          setNombreMedico('Dr. Wilson');
          setIdMedicoFormal('MED-EXP759');
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setCargandoDatos(false);
      }
    };
    fetchDatosYMedico();
  }, [cita, modoLectura]);

  const agregarEstudio = () => {
    if (!nombreEstudio) return alert("Ingresa el nombre del estudio.");
    const nuevoEstudio = { id: Date.now(), nombre: nombreEstudio, indicacion: indicacionEstudio || 'N/A' };
    setListaEstudios([...listaEstudios, nuevoEstudio]);
    setNombreEstudio(''); setIndicacionEstudio('');
  };

  const eliminarEstudio = (id) => {
    setListaEstudios(listaEstudios.filter(est => est.id !== id));
  };

  const handleImprimirPDF = () => window.print();

  const handleFinalizar = async () => {
    if (listaEstudios.length === 0) return alert("Agrega al menos un estudio.");
    
    try {
      const { error } = await supabaseFrontend
        .from('ordenes_laboratorio')
        .insert([{
          cita_id: cita.id,
          estudios: listaEstudios,
          diagnostico_presuntivo: diagnosticoPresuntivo
        }]);

      if (error) throw error;

      alert("¡Orden de Laboratorio guardada exitosamente!");
      navigate(-1);
    } catch (error) {
      console.error("Error guardando orden:", error);
      alert("Hubo un error al guardar: " + error.message);
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
            {modoLectura ? 'Visor de Laboratorio' : 'Nueva Orden de Laboratorio'}
          </span>
        </div>
        <button onClick={() => navigate(-1)} className="text-gray-500 text-xs font-bold uppercase hover:text-gray-800 transition-colors cursor-pointer">
          Volver
        </button>
      </nav>

      <main className={`mx-auto mt-10 px-4 relative ${modoLectura ? 'max-w-4xl' : 'max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8'}`}>
        
        {/* PANEL IZQUIERDO DE CAPTURA */}
        {!modoLectura && (
          <div className="lg:col-span-4 space-y-6 print:hidden">
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 shadow-sm">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nombrePaciente.replace(/\s+/g, '')}`} alt="Avatar" className="w-12 h-12 bg-blue-50 rounded-lg border border-gray-100" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Paciente</p>
                <p className="text-sm font-bold text-gray-800 uppercase">{nombrePaciente}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Solicitar Estudio</label>
              <input type="text" value={nombreEstudio} onChange={(e) => setNombreEstudio(e.target.value)} placeholder="Ej: Química Sanguínea 6" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#005ba1] focus:outline-none" />
              <input type="text" value={indicacionEstudio} onChange={(e) => setIndicacionEstudio(e.target.value)} placeholder="Notas (Ej: Ayuno 12 hrs)" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#005ba1] focus:outline-none" />
              
              <button onClick={agregarEstudio} className="w-full border border-dashed border-[#005ba1] text-[#005ba1] bg-blue-50/50 hover:bg-blue-50 font-bold text-xs py-2 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2">
                Añadir Estudio
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Diagnóstico Presuntivo</label>
              <textarea value={diagnosticoPresuntivo} onChange={(e) => setDiagnosticoPresuntivo(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#005ba1] resize-none" rows="3" placeholder="Ej: Sospecha de diabetes mellitus..."></textarea>
            </div>
          </div>
        )}

        {/* FORMATO TIPO "SOLICITUD DE LABORATORIO" (PDF) */}
        <div className={modoLectura ? 'w-full' : 'lg:col-span-8'}>
          <div className="bg-white rounded-none shadow-sm border border-gray-300 p-8 min-h-[600px] flex flex-col relative print:border-none print:shadow-none">
            
            {/* Cabecera Técnica */}
            <div className="flex justify-between items-start border-b-[3px] border-gray-800 pb-4 mb-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">CentroVital</h1>
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mt-1">Solicitud de Laboratorio y Gabinete</p>
              </div>
              <div className="text-right border border-gray-300 p-2 rounded">
                <p className="text-[10px] text-gray-500 uppercase mb-1">Fecha de Solicitud</p>
                <p className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString()}</p>
                <p className="text-[9px] text-gray-400 mt-1 uppercase">Folio: {cita?.id?.split('-')[0] || 'N/A'}</p>
              </div>
            </div>

            {/* Datos del Paciente (Formato Cajas) */}
            <div className="grid grid-cols-3 gap-0 border border-gray-300 mb-6">
              <div className="col-span-2 border-r border-gray-300 p-2">
                <p className="text-[9px] font-bold text-gray-500 uppercase">Nombre del Paciente</p>
                <p className="text-sm font-bold text-gray-900 uppercase mt-0.5">{nombrePaciente}</p>
              </div>
              <div className="p-2 bg-gray-50">
                <p className="text-[9px] font-bold text-gray-500 uppercase">Expediente / ID</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{pacienteId}</p>
              </div>
            </div>

            {/* Diagnóstico Presuntivo Prominente */}
            <div className="border border-gray-300 p-3 mb-6 bg-blue-50/30">
               <p className="text-[10px] font-bold text-[#005ba1] uppercase mb-1 flex items-center gap-2">
                 <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                 Datos Clínicos / Diagnóstico Presuntivo
               </p>
               <p className="text-sm text-gray-800 font-medium">{diagnosticoPresuntivo || 'No se proporcionaron datos clínicos adicionales.'}</p>
            </div>

            {/* Tabla de Estudios */}
            <div className="flex-grow">
              <h3 className="text-[11px] font-bold text-gray-800 uppercase mb-2 bg-gray-100 p-1.5 border border-gray-300">Estudios Solicitados</h3>
              
              {cargandoDatos ? (
                <p className="text-sm text-gray-400 text-center py-10 border border-gray-200">Cargando...</p>
              ) : listaEstudios.length === 0 ? (
                <div className="text-center py-10 border border-gray-200 print:hidden">
                  <p className="text-sm text-gray-400">Añade estudios en el panel lateral.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse border border-gray-300 mb-8">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-[10px] font-bold text-gray-600 uppercase w-1/2">Estudio</th>
                      <th className="border border-gray-300 p-2 text-[10px] font-bold text-gray-600 uppercase">Especificaciones para el Laboratorio</th>
                      {!modoLectura && <th className="border border-gray-300 p-2 text-[10px] font-bold text-gray-600 uppercase text-center print:hidden w-12">Acción</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {listaEstudios.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 text-sm font-bold text-gray-900">{item.nombre}</td>
                        <td className="border border-gray-300 p-2 text-xs text-gray-700 italic">{item.indicacion}</td>
                        {!modoLectura && (
                          <td className="border border-gray-300 p-2 text-center print:hidden">
                            <button onClick={() => eliminarEstudio(item.id)} className="text-red-500 hover:text-red-700 cursor-pointer">
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Firma del Médico Dividida */}
            <div className="mt-10 border-t border-gray-300 pt-6 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Médico Solicitante</p>
                <p className="text-sm font-extrabold text-gray-900 uppercase">{nombreMedico}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">REGISTRO CLÍNICO: {idMedicoFormal}</p>
                <p className="text-[8px] text-gray-400 mt-2 italic">Firma electrónica generada por el sistema CentroVital</p>
              </div>
              <div className="w-48 border-b border-gray-800 text-center pb-1">
                <p className="text-[10px] text-gray-400 uppercase">Firma / Sello</p>
              </div>
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
               Finalizar y Guardar Orden
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default OrdenLaboratorio;