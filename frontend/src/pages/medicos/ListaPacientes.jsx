import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabaseFrontend } from '../../api/supabaseClient';
import { getAvatarMedico } from '../../api/avatarMedico';

const ListaPacientes = () => {
  const navigate = useNavigate();
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [medicoInfo, setMedicoInfo] = useState({ nombre: 'Cargando...', especialidad: '...' });
  const [pacientesLista, setPacientesLista] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  // Función para cerrar sesión
  const handleCerrarSesion = async () => {
    try {
      await supabaseFrontend.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const { data: { session } } = await supabaseFrontend.auth.getSession();
        if (!session) return;

        const { data: medicoData, error: medicoError } = await supabaseFrontend
          .from('medicos')
          .select('id, especialidad, perfiles(nombre_completo)')
          .eq('perfil_id', session.user.id)
          .single();

        if (medicoError) throw medicoError;

        if (medicoData) {
          const nombreMed = medicoData.perfiles.nombre_completo;
          setMedicoInfo({ nombre: nombreMed, especialidad: medicoData.especialidad });

          const { data: citasData, error: citasError } = await supabaseFrontend
          .from('citas')
          .select(`
            id,
            fecha_hora,
            estado,
            motivo,
            id_paciente_cita,
            paciente_dependiente,
            es_menor_dependiente,
            perfiles!citas_id_paciente_cita_fkey(id, nombre_completo, email)
          `)
          .eq('medico_id', medicoData.id)
          .order('fecha_hora', { ascending: true });

          if (citasError) throw citasError;

          if (citasData) {
            const pacientesUnicos = new Map();
            
            citasData.forEach(cita => {
            const perfil = cita.perfiles;
            if (!perfil) return;

            // Si tiene dependiente, usamos una clave única para no sobreescribir al paciente real
            const clave = cita.paciente_dependiente 
              ? `${perfil.id}-${cita.paciente_dependiente}` 
              : perfil.id;

            if (!pacientesUnicos.has(clave)) {
              const nombreFinal = cita.paciente_dependiente || perfil.nombre_completo || 'Paciente Desconocido';
              
              const inicialesStr = nombreFinal
                ? nombreFinal.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                : 'XX';

              const idCorto = `ID-${perfil.id.substring(0, 6).toUpperCase()}`;
              const fechaCita = new Date(cita.fecha_hora).toLocaleDateString('es-MX', {
                day: '2-digit', month: 'short', year: 'numeric'
              });

              pacientesUnicos.set(clave, {
                id: clave, // ← usamos la clave compuesta
                iniciales: inicialesStr,
                nombre: nombreFinal,
                info: perfil.email || 'Sin datos de contacto',
                cedula: idCorto,
                ultima: fechaCita,
                medico: nombreMed,
                estatus: cita.estado || 'Activo',
                bg: 'bg-blue-50 text-blue-600',
                pill: 'bg-green-50 text-green-600',
                esMenor: cita.es_menor_dependiente || false,
                citaOriginal: cita
              });
            }
          });

            setPacientesLista(Array.from(pacientesUnicos.values()));
          }
        }
      } catch (error) {
        console.error("Error cargando pacientes:", error);
      }
    };

    fetchPacientes();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans pb-12">
      {/* Navbar Superior */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-[#005ba1] tracking-wide">CentroVital</span>
        </div>
        <div className="hidden md:flex gap-8">
          <Link to="/dashboard-medicos" className="text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors">Panel de Control</Link>
          <Link to="/lista-pacientes" className="text-[#005ba1] font-bold text-sm border-b-2 border-[#005ba1] pb-1">Pacientes</Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block mr-2">
            <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="bg-gray-100 border-none text-sm rounded-md pl-8 pr-4 py-1.5 focus:outline-none" />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          
          {/* Menú Desplegable */}
          <div className="relative">
            <button 
              onClick={() => setMostrarMenu(!mostrarMenu)}
              className="flex items-center gap-3 hover:bg-gray-50 p-2 pr-3 rounded-xl transition-colors cursor-pointer z-10"
            >
              <img 
                src={getAvatarMedico(medicoInfo.nombre)} 
                alt="Doctor" 
                className="w-9 h-9 rounded-full border border-gray-200 bg-gray-100" 
              />
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-gray-800 leading-tight">{medicoInfo.nombre}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{medicoInfo.especialidad}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform ${mostrarMenu ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
            </button>

            {mostrarMenu && (
              <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                <div className="py-1">
                  <button 
                    onClick={handleCerrarSesion}
                    className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Gestión &gt; Pacientes</p>
            <h1 className="text-2xl font-extrabold text-gray-900">Listado de Pacientes</h1>
          </div>
          
          <button 
            onClick={() => navigate('/nuevo-paciente')}
            className="bg-[#005ba1] hover:bg-[#004680] text-white text-sm font-bold py-2.5 px-5 rounded shadow-sm transition-colors flex items-center gap-2 mt-4 md:mt-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            Nuevo Paciente
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 w-64 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mis Pacientes Históricos</p>
            <h2 className="text-2xl font-extrabold text-gray-800">{pacientesLista.length}</h2>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre del Paciente</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">ID / Cédula</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Última Consulta</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Médico Asignado</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Estatus</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pacientesLista.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                      No tienes pacientes asignados todavía.
                    </td>
                  </tr>
                ) : (
                  pacientesLista
                    .filter((p) => busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
                    .map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.nombre.replace(/\s+/g, '')}`} 
                        className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200" 
                        alt="Avatar del paciente" 
                      />
                        <div>
                          {/* --- PUENTE CONECTADO AQUÍ --- */}
                          <Link 
                            to={`/medicos/pacientes/historial/${p.id}`} 
                            state={{ cita: p.citaOriginal }}
                            className="font-bold text-sm text-gray-900 hover:text-[#005ba1]"
                          >
                            {p.nombre}
                          </Link>
                          {p.esMenor && (
                            <span className="ml-2 bg-purple-50 text-purple-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                              Menor de edad
                            </span>
                          )}
                          <p className="text-[10px] text-gray-400">{p.info}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600">{p.cedula}</td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600">{p.ultima}</td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600">{p.medico}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.pill}`}>{p.estatus}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* --- EL BOTÓN DE ACCIONES AHORA TAMBIÉN LLEVA AL EXPEDIENTE --- */}
                        <button 
                          onClick={() => navigate(`/medicos/pacientes/historial/${p.id}`, { state: { cita: p.citaOriginal } })}
                          className="text-gray-400 hover:text-gray-800 cursor-pointer"
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-xs font-bold text-gray-500">
            <button className="text-gray-400 hover:text-gray-800">&lt; Anterior</button>
            <div className="flex gap-1">
              <button className="bg-[#005ba1] text-white w-6 h-6 rounded flex items-center justify-center">1</button>
              <button className="hover:bg-gray-100 w-6 h-6 rounded flex items-center justify-center">2</button>
              <button className="hover:bg-gray-100 w-6 h-6 rounded flex items-center justify-center">3</button>
              <span className="w-6 h-6 flex items-center justify-center">...</span>
              <button className="hover:bg-gray-100 w-8 h-6 rounded flex items-center justify-center">10</button>
            </div>
            <button className="hover:text-gray-800">Siguiente &gt;</button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ListaPacientes;