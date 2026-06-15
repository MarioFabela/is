import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabaseFrontend } from '../../api/supabaseClient';

const NuevoPaciente = () => {
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState(null);
  
  // Estados de carga
  const [cargando, setCargando] = useState(false);
  const [buscando, setBuscando] = useState(false);

  // Estados para la búsqueda y vinculación
  const [emailBusqueda, setEmailBusqueda] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);

  // Estados para la consulta inicial
  const [motivo, setMotivo] = useState('Consulta inicial');
  const [sintomas, setSintomas] = useState('Chequeo general de ingreso');
  const [fechaHora, setFechaHora] = useState('');

  // Obtener el ID del médico actual y configurar fecha
  useEffect(() => {
    const getDoctor = async () => {
      try {
        const { data: { session } } = await supabaseFrontend.auth.getSession();
        if (session) {
          const { data: medicoData } = await supabaseFrontend
            .from('medicos')
            .select('id')
            .eq('perfil_id', session.user.id)
            .single();
          
          if (medicoData) setDoctorId(medicoData.id);
        }
      } catch (error) {
        console.error("Error obteniendo el ID del médico:", error);
      }
    };
    getDoctor();
    
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    setFechaHora(ahora.toISOString().slice(0, 16));
  }, []);

  // Función exclusiva para buscar al paciente por correo
  const handleBuscarPaciente = async () => {
    if (!emailBusqueda) return alert("Por favor, ingresa un correo para buscar.");
    setBuscando(true);
    setPacienteEncontrado(null); // Limpiamos búsquedas anteriores

    try {
      const { data, error } = await supabaseFrontend
        .from('perfiles')
        .select('*')
        .eq('email', emailBusqueda)
        .eq('rol', 'paciente') // Asegurarnos de que sea paciente y no otro doctor
        .single();

      if (error || !data) {
        alert("No se encontró ningún paciente con este correo. Asegúrate de que el paciente ya se haya registrado en CentroVital.");
      } else {
        setPacienteEncontrado(data);
      }
    } catch (err) {
      console.error("Error en búsqueda:", err);
      alert("Hubo un error al buscar en la base de datos.");
    } finally {
      setBuscando(false);
    }
  };

  // Función para guardar solo la cita (el paciente ya existe)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId) return alert("Error: No se detectó la sesión del médico.");
    if (!pacienteEncontrado) return alert("Error: Primero debes buscar y encontrar un paciente válido.");
    
    setCargando(true);

    try {
      // Solo insertamos en 'citas' usando el ID del paciente que encontramos
      const { error: citaError } = await supabaseFrontend
        .from('citas')
        .insert([
          {
            id_paciente_cita: pacienteEncontrado.id,
            id_paciente_tutor: pacienteEncontrado.id,
            medico_id: doctorId,
            fecha_hora: new Date(fechaHora).toISOString(),
            estado: 'programada',
            motivo: motivo,
            sintomas: sintomas
          }
        ]);

      if (citaError) throw citaError;

      alert("¡Paciente vinculado y consulta agendada con éxito!");
      navigate('/lista-pacientes'); 
      
    } catch (error) {
      console.error("Error agendando cita:", error);
      alert(`Error de base de datos: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans pb-12">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-[#005ba1] tracking-wide">CentroVital</span>
        </div>
        <div className="flex gap-4">
          <Link to="/lista-pacientes" className="text-gray-500 hover:text-gray-800 text-sm font-bold transition-colors">
            Volver a Lista
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 mt-10">
        <div className="mb-6">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Pacientes &gt; Vincular</p>
          <h1 className="text-2xl font-extrabold text-gray-900">Vincular Paciente Existente</h1>
          <p className="text-sm text-gray-500 mt-1">Busca al paciente en el sistema y agenda su primera consulta para añadirlo a tu directorio.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
          
          {/* 1. SECCIÓN DE BÚSQUEDA */}
          <div>
            <h2 className="text-xs font-bold text-[#005ba1] uppercase tracking-wider mb-4 pb-1 border-b border-gray-100">Paso 1: Buscar en el Sistema</h2>
            <div className="flex gap-3 items-end">
              <div className="flex-grow">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Correo Electrónico del Paciente</label>
                <input 
                  type="email" 
                  value={emailBusqueda}
                  onChange={(e) => setEmailBusqueda(e.target.value)}
                  placeholder="paciente@ejemplo.com" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#005ba1] focus:bg-white transition-colors"
                />
              </div>
              <button 
                type="button"
                onClick={handleBuscarPaciente}
                disabled={buscando || !emailBusqueda}
                className="px-6 py-2.5 bg-gray-800 hover:bg-black text-white rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {buscando ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Tarjeta de resultado (Solo aparece si se encuentra al paciente) */}
          {pacienteEncontrado && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-4">
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-green-800 uppercase">Paciente Encontrado</p>
                <p className="text-sm font-bold text-gray-900">{pacienteEncontrado.nombre_completo}</p>
                <p className="text-xs text-gray-600">Tel: {pacienteEncontrado.telefono || 'No registrado'}</p>
              </div>
            </div>
          )}

          {/* 2. FORMULARIO DE CONSULTA (Solo se activa si hay un paciente encontrado) */}
          <form onSubmit={handleSubmit} className={`space-y-6 transition-opacity ${!pacienteEncontrado ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            <div>
              <h2 className="text-xs font-bold text-[#005ba1] uppercase tracking-wider mb-4 pb-1 border-b border-gray-100">Paso 2: Agendar Consulta de Ingreso</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Motivo de Consulta *</label>
                    <input 
                      type="text" 
                      required
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#005ba1] focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha y Hora *</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={fechaHora}
                      onChange={(e) => setFechaHora(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#005ba1] focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notas preliminares *</label>
                  <textarea 
                    required
                    rows="3"
                    value={sintomas}
                    onChange={(e) => setSintomas(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#005ba1] focus:bg-white transition-colors resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t border-gray-100 pt-4">
              <button 
                type="submit"
                disabled={cargando || !pacienteEncontrado}
                className={`px-6 py-2.5 bg-[#005ba1] hover:bg-[#004680] text-white rounded-lg text-sm font-bold shadow-sm transition-colors ${(cargando || !pacienteEncontrado) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {cargando ? 'Agendando...' : 'Vincular y Agendar'}
              </button>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
};

export default NuevoPaciente;