import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabaseFrontend } from '../../api/supabaseClient';

const HistorialPaciente = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); 
  
  const citaOriginal = location.state?.cita;
  
  // En lugar de asumir que siempre llega el nombre, lo metemos a un estado
  const [nombrePaciente, setNombrePaciente] = useState(citaOriginal?.perfiles?.nombre_completo || 'Cargando...');
  const [historialCitas, setHistorialCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchHistorialYPaciente = async () => {
      try {
        // 1. Buscamos el historial limpio
        const { data: citasData, error: citasError } = await supabaseFrontend
          .from('citas')
          .select('*')
          .eq('id_paciente_cita', id)
          .neq('estado', 'programada') 
          .order('fecha_hora', { ascending: false });

        if (citasError) throw citasError;
        setHistorialCitas(citasData || []);

        // 2. Si el nombre se perdió en la recarga, lo buscamos en la BD
        if (!citaOriginal?.perfiles?.nombre_completo) {
          const { data: perfilData, error: perfilError } = await supabaseFrontend
            .from('perfiles')
            .select('nombre_completo')
            .eq('id', id)
            .single();
          
          if (!perfilError && perfilData) {
            setNombrePaciente(perfilData.nombre_completo);
          } else {
            setNombrePaciente('Paciente'); // Respaldo final si todo falla
          }
        }
      } catch (error) {
        console.error("Error cargando historial:", error);
      } finally {
        setCargando(false);
      }
    };

    if (id) fetchHistorialYPaciente();
  }, [id, citaOriginal]);

  const handleIniciarConsulta = async () => {
    try {
      const { data: { session } } = await supabaseFrontend.auth.getSession();
      const { data: medicoData } = await supabaseFrontend
        .from('medicos')
        .select('id')
        .eq('perfil_id', session.user.id)
        .single();

      if (!medicoData) throw new Error("No se pudo identificar la sesión.");

      const { data: nuevaCita, error } = await supabaseFrontend
        .from('citas')
        .insert([{
          id_paciente_cita: id,
          id_paciente_tutor: id, 
          medico_id: medicoData.id,
          fecha_hora: new Date().toISOString(),
          estado: 'programada',
          motivo: 'Consulta de seguimiento',
          sintomas: 'Evaluación general'
        }])
        .select() 
        .single();

      if (error) throw error;

      const citaParaEnviar = {
        ...nuevaCita,
        perfiles: { nombre_completo: nombrePaciente }
      };

      navigate(`/medicos/pacientes/evolucion/${id}`, { state: { cita: citaParaEnviar } });

    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans pb-12">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-[#005ba1] tracking-wide">CentroVital</span>
        </div>
        <div>
          <button 
            onClick={() => navigate('/lista-pacientes')}
            className="text-gray-500 hover:text-gray-800 text-sm font-bold transition-colors cursor-pointer"
          >
            Volver al Directorio
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-10">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nombrePaciente.replace(/\s+/g, '')}`} 
              className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200" 
              alt="Avatar" 
            />
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Expediente Clínico</p>
              <h1 className="text-2xl font-extrabold text-gray-900 uppercase">{nombrePaciente}</h1>
              <p className="text-xs text-gray-500 mt-1">ID: {id}</p>
            </div>
          </div>
          
          <button 
            onClick={handleIniciarConsulta}
            className="bg-[#005ba1] hover:bg-[#004680] text-white text-sm font-bold py-3 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            Iniciar Nueva Consulta
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <svg width="18" height="18" fill="none" stroke="#005ba1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Historial de Atenciones
          </h2>

          {cargando ? (
            <p className="text-center text-gray-500 text-sm py-8">Cargando expediente...</p>
          ) : historialCitas.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500">Este paciente no tiene consultas registradas.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {historialCitas.map((cita) => (
                <div key={cita.id} className="border border-gray-100 rounded-lg p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {new Date(cita.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 mt-1">{cita.motivo || 'Consulta Médica'}</h3>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide ${cita.estado === 'completada' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                      {cita.estado}
                    </span>
                  </div>

                  {cita.estado === 'completada' && (
                    <div className="bg-white border border-gray-100 rounded p-3 mb-4">
                      <div className="mb-2">
                        <p className="text-[10px] font-bold text-[#005ba1] uppercase">Diagnóstico</p>
                        <p className="text-xs text-gray-700 mt-1">{cita.diagnostico || 'Sin diagnóstico registrado'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#005ba1] uppercase">Observaciones (Objetivo/Subjetivo)</p>
                        <p className="text-xs text-gray-700 mt-1">{cita.sintomas || 'Sin observaciones'}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate('/generar-receta', { state: { cita: cita, paciente: nombrePaciente } })}
                      className={`text-xs font-bold py-2 px-4 rounded border flex items-center gap-2 transition-colors ${cita.estado === 'completada' ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer' : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'}`}
                      disabled={cita.estado !== 'completada'}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      Receta
                    </button>
                    <button 
                      onClick={() => navigate('/orden-laboratorio', { state: { cita: cita, paciente: nombrePaciente } })}
                      className={`text-xs font-bold py-2 px-4 rounded border flex items-center gap-2 transition-colors ${cita.estado === 'completada' ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer' : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'}`}
                      disabled={cita.estado !== 'completada'}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                      Orden de Laboratorio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistorialPaciente;