import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabaseFrontend } from '../../api/supabaseClient';

const EvolucionPaciente = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const citaActiva = location.state?.cita; 
  const pacienteId = citaActiva?.id_paciente_cita || citaActiva?.paciente_id;
  const nombrePaciente = citaActiva?.perfiles?.nombre_completo || 'Paciente no seleccionado';
  
  const estadoCita = citaActiva?.estado || 'programada';

  const [nombreMedico, setNombreMedico] = useState('Cargando...');
  
  const [subjetivo, setSubjetivo] = useState(citaActiva?.motivo || '');
  const [objetivo, setObjetivo] = useState(citaActiva?.sintomas || '');
  const [diagnostico, setDiagnostico] = useState(citaActiva?.diagnostico || '');
  const [plan, setPlan] = useState('');

  const [historialCitas, setHistorialCitas] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);

const [mostrarSignosVitales, setMostrarSignosVitales] = useState(false);
const [signosVitales, setSignosVitales] = useState({
  ritmo_cardiaco: '',
  presion_arterial: '',
  peso: '',
  glucosa: ''
});
const [guardandoSignos, setGuardandoSignos] = useState(false);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const { data: { session } } = await supabaseFrontend.auth.getSession();
        if (session) {
          const { data: medicoData } = await supabaseFrontend
            .from('perfiles')
            .select('nombre_completo')
            .eq('id', session.user.id)
            .single();
          if (medicoData) setNombreMedico(medicoData.nombre_completo);
        }

        if (pacienteId && citaActiva) {
          const { data: citasAnteriores, error: citasError } = await supabaseFrontend
            .from('citas')
            .select('*')
            .eq('id_paciente_cita', pacienteId)
            .neq('id', citaActiva.id) 
            .neq('estado', 'programada') 
            .neq('estado', 'cancelada')  
            .order('fecha_hora', { ascending: false })
            .limit(4); 

          if (citasError) throw citasError;
          if (citasAnteriores) setHistorialCitas(citasAnteriores);
        }

      } catch (error) {
        console.error("Error cargando datos:", error.message);
      } finally {
        setCargandoHistorial(false);
      }
    };

    fetchDatos();
  }, [pacienteId, citaActiva]);

  const handleGuardarNota = async () => {
    if (!citaActiva?.id) return alert("Error: No hay una consulta activa para guardar.");
    
    try {
      const { error } = await supabaseFrontend
        .from('citas')
        .update({
          estado: 'completada',
          motivo: subjetivo, 
          sintomas: objetivo, 
          diagnostico: diagnostico, 
        })
        .eq('id', citaActiva.id);

      if (error) throw error;

      alert(`¡Expediente actualizado!\nLa consulta de ${nombrePaciente} se ha guardado exitosamente.`);
      navigate(`/medicos/pacientes/historial/${pacienteId}`); 

    } catch (error) {
      console.error("Error guardando nota:", error);
      alert(`Hubo un error al guardar: ${error.message}`);
    }
  };

const handleGuardarSignos = async () => {
  if (!pacienteId) return alert("No se pudo identificar al paciente. Verifica que la cita esté activa.");
  setGuardandoSignos(true);
  try {
    const fc = parseInt(signosVitales.ritmo_cardiaco);
    const peso = parseFloat(signosVitales.peso);
    const glucosa = parseInt(signosVitales.glucosa);

    const estadoRitmo = fc < 60 ? 'Bradicardia' : fc > 100 ? 'Taquicardia' : 'Normal';
    const estadoPeso = peso < 50 ? 'Bajo peso' : peso > 90 ? 'Sobrepeso' : 'Normal';
    const estadoGlucosa = glucosa < 70 ? 'Hipoglucemia' : glucosa > 140 ? 'Hiperglucemia' : 'Normal';

    // NUEVA LÓGICA PARA LA PRESIÓN ARTERIAL
    let estadoPresion = 'Registrado';
    if (signosVitales.presion_arterial && signosVitales.presion_arterial.includes('/')) {
      const partes = signosVitales.presion_arterial.split('/');
      const sistolica = parseInt(partes[0]);
      const diastolica = parseInt(partes[1]);

      if (sistolica < 90 || diastolica < 60) {
        estadoPresion = 'Hipotensión';
      } else if (sistolica > 120 || diastolica > 80) {
        estadoPresion = 'Hipertensión';
      } else {
        estadoPresion = 'Normal';
      }
    }

    const payload = {
      paciente_id: pacienteId,
      ritmo_cardiaco: fc || null,
      estado_ritmo: estadoRitmo,
      presion_arterial: signosVitales.presion_arterial || null,
      estado_presion: estadoPresion, // Aquí ya usamos el cálculo automático
      peso: peso || null,
      estado_peso: estadoPeso,
      glucosa: glucosa || null,
      estado_glucosa: estadoGlucosa,
      fecha_registro: new Date().toISOString()
    };

    const { data: existente } = await supabaseFrontend
      .from('signos_vitales')
      .select('id')
      .eq('paciente_id', pacienteId)
      .maybeSingle();

    let error;
    if (existente) {
      ({ error } = await supabaseFrontend
        .from('signos_vitales')
        .update(payload)
        .eq('paciente_id', pacienteId));
    } else {
      ({ error } = await supabaseFrontend
        .from('signos_vitales')
        .insert(payload));
    }

    if (error) throw error;

    alert('✅ Signos vitales guardados correctamente.');
    setMostrarSignosVitales(false);

  } catch (error) {
    alert(`Error al guardar: ${error.message}`);
  } finally {
    setGuardandoSignos(false);
  }
};

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans pb-24">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <span className="text-lg font-extrabold text-[#005ba1] tracking-wide">CentroVital</span>
          <div className="hidden md:flex gap-6 border-l border-gray-200 pl-4">
            <span className="text-[#005ba1] text-sm font-bold border-b-2 border-[#005ba1] pb-1">Expediente Actual</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">DR</span>
          <span className="text-sm font-bold text-gray-800 hidden md:block">{nombreMedico}</span>
          
          <button 
            onClick={() => navigate(`/medicos/pacientes/historial/${pacienteId}`)} 
            className="bg-white border border-gray-300 text-gray-600 text-xs font-bold py-1.5 px-4 rounded hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar / Volver
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA: HISTORIAL */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
             <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
               <svg width="16" height="16" fill="none" stroke="#005ba1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
               <h3 className="text-sm font-bold text-gray-800">Historial Clínico</h3>
             </div>
             
             {cargandoHistorial ? (
               <p className="text-xs text-gray-400">Cargando historial...</p>
             ) : historialCitas.length > 0 ? (
               <div className="space-y-4">
                 {historialCitas.map((citaPrevia) => (
                   <div key={citaPrevia.id} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                     <div className="flex justify-between items-center mb-1">
                       <p className="text-[10px] font-bold text-gray-500">
                         {new Date(citaPrevia.fecha_hora).toLocaleDateString()}
                       </p>
                       <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase border border-green-200">{citaPrevia.estado}</span>
                     </div>
                     
                     <div className="mb-1">
                       <p className="text-[10px] font-bold text-[#005ba1] uppercase">Motivo</p>
                       <p className="text-xs text-gray-700 mt-0.5">{citaPrevia.motivo || 'Sin registro'}</p>
                     </div>
                     
                     {citaPrevia.diagnostico && (
                       <div className="mb-2">
                         <p className="text-[10px] font-bold text-[#005ba1] uppercase">Diagnóstico</p>
                         <p className="text-xs text-gray-700 mt-0.5">{citaPrevia.diagnostico}</p>
                       </div>
                     )}

                     {/* BOTONES DEL HISTORIAL (PEQUEÑOS Y AZULES) */}
                     {citaPrevia.estado === 'completada' && (
                       <div className="flex flex-col gap-2 mt-3 border-t border-gray-100 pt-3">
                          <button 
                            onClick={() => navigate('/generar-receta', { state: { cita: citaPrevia, paciente: nombrePaciente } })}
                            className="text-[10px] font-bold text-[#005ba1] hover:text-[#004680] flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity cursor-pointer w-fit"
                          >
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            Receta
                          </button>
                          
                          <button 
                            onClick={() => navigate('/orden-laboratorio', { state: { cita: citaPrevia, paciente: nombrePaciente } })}
                            className="text-[10px] font-bold text-[#005ba1] hover:text-[#004680] flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity cursor-pointer w-fit"
                          >
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                            Orden de Laboratorio
                          </button>

                          <button 
                            onClick={() => setMostrarSignosVitales(true)}
                            className="bg-white border border-gray-300 text-gray-700 text-xs font-bold py-2 px-4 rounded hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                            Signos Vitales
                          </button>

                       </div>
                     )}
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-6">
                 <p className="text-xs text-gray-500 mb-2">No hay consultas previas.</p>
                 <span className="bg-blue-100 text-[#005ba1] text-[9px] font-bold px-2 py-1 rounded border border-blue-200 inline-block uppercase tracking-wide">Primera Consulta</span>
               </div>
             )}
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO PRINCIPAL */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
               <h2 className="text-sm font-bold text-gray-800 flex items-center">
                 Evolución de: <span className="text-[#005ba1] uppercase ml-1">{nombrePaciente}</span>
                 {estadoCita === 'completada' && (
                   <span className="ml-3 bg-green-100 text-green-700 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wide border border-green-200">
                     ✓ Completada
                   </span>
                 )}
               </h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
               <div className="p-4">
                 <label className="block text-[10px] font-bold text-[#005ba1] uppercase mb-2">Subjetivo (S) / Síntomas</label>
                 <textarea 
                   value={subjetivo}
                   onChange={(e) => setSubjetivo(e.target.value)}
                   className="w-full h-32 text-sm border-none focus:ring-0 resize-none text-gray-700 placeholder-gray-300" 
                   placeholder="Motivo de consulta, síntomas referidos..."
                 ></textarea>
               </div>
               <div className="p-4">
                 <label className="block text-[10px] font-bold text-[#005ba1] uppercase mb-2">Objetivo (O) / Exploración</label>
                 <textarea 
                   value={objetivo}
                   onChange={(e) => setObjetivo(e.target.value)}
                   className="w-full h-32 text-sm border-none focus:ring-0 resize-none text-gray-700 placeholder-gray-300" 
                   placeholder="Hallazgos del examen físico..."
                 ></textarea>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
             <h2 className="text-sm font-bold text-gray-800 mb-3">Diagnóstico Actual (Análisis)</h2>
             <div className="relative">
               <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               <input 
                 type="text" 
                 value={diagnostico}
                 onChange={(e) => setDiagnostico(e.target.value)}
                 placeholder="Ej. Faringoamigdalitis aguda (J03.9)..." 
                 className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:border-[#005ba1] focus:outline-none" 
               />
             </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
             <h2 className="text-sm font-bold text-gray-800 mb-3">Plan de Tratamiento y Pronóstico</h2>
             <textarea 
               value={plan}
               onChange={(e) => setPlan(e.target.value)}
               className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-[#005ba1] resize-none mb-4" 
               rows="3" 
               placeholder="Indicaciones terapéuticas..."
             ></textarea>
             
             {/* BOTONES PRINCIPALES (GRANDES Y BLANCOS) */}
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate('/generar-receta', { state: { cita: citaActiva, paciente: nombrePaciente } })}
                  className="bg-white border border-gray-300 text-gray-700 text-xs font-bold py-2 px-4 rounded hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Añadir Receta
                </button>
                <button 
                  onClick={() => navigate('/orden-laboratorio', { state: { cita: citaActiva, paciente: nombrePaciente } })}
                  className="bg-white border border-gray-300 text-gray-700 text-xs font-bold py-2 px-4 rounded hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  Orden de Laboratorio
                </button>

                {/* ← AGREGA ESTE BOTÓN AQUÍ */}
                <button 
                  onClick={() => setMostrarSignosVitales(true)}
                  className="bg-white border border-gray-300 text-gray-700 text-xs font-bold py-2 px-4 rounded hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  Signos Vitales
                </button>

              </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
           <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
           {estadoCita === 'completada' ? 'Revisando expediente guardado' : 'Completando información de consulta'}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGuardarNota}
            className="bg-[#005ba1] text-white text-xs font-bold py-2 px-6 rounded hover:bg-[#004680] flex items-center gap-2 transition-colors cursor-pointer"
          >
             <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
             {estadoCita === 'completada' ? 'Actualizar Consulta' : 'Guardar y Finalizar Consulta'}
          </button>
        </div>
      </div>

      {mostrarSignosVitales && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[100]">
          <div className="bg-white w-[480px] rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <svg width="16" height="16" fill="none" stroke="#005ba1" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                Registrar Signos Vitales
              </h3>
              <button onClick={() => setMostrarSignosVitales(false)} className="text-gray-400 hover:text-gray-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Campos */}
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              
              <div>
                <label className="block text-[10px] font-bold text-[#005ba1] uppercase mb-1.5">
                  Ritmo Cardíaco (bpm)
                </label>
                <input
                  type="number"
                  placeholder="Ej. 72"
                  value={signosVitales.ritmo_cardiaco}
                  onChange={(e) => setSignosVitales({...signosVitales, ritmo_cardiaco: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#005ba1]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#005ba1] uppercase mb-1.5">
                  Presión Arterial
                </label>
                <input
                  type="text"
                  placeholder="Ej. 120/80"
                  value={signosVitales.presion_arterial}
                  onChange={(e) => setSignosVitales({...signosVitales, presion_arterial: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#005ba1]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#005ba1] uppercase mb-1.5">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  placeholder="Ej. 70"
                  value={signosVitales.peso}
                  onChange={(e) => setSignosVitales({...signosVitales, peso: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#005ba1]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#005ba1] uppercase mb-1.5">
                  Glucosa (mg/dL)
                </label>
                <input
                  type="number"
                  placeholder="Ej. 90"
                  value={signosVitales.glucosa}
                  onChange={(e) => setSignosVitales({...signosVitales, glucosa: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#005ba1]"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setMostrarSignosVitales(false)}
                className="text-sm font-bold text-gray-500 hover:text-gray-700 px-4 py-2 rounded border border-gray-200 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarSignos}
                disabled={guardandoSignos}
                className="bg-[#005ba1] hover:bg-[#004680] text-white text-sm font-bold py-2 px-6 rounded transition-colors"
              >
                {guardandoSignos ? 'Guardando...' : 'Guardar Signos'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default EvolucionPaciente;