import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabaseFrontend } from '../../api/supabaseClient';
import { getAvatarMedico } from '../../api/avatarMedico';

const DashboardMedico = () => {

  const navigate = useNavigate();

  const [nombreMedico, setNombreMedico] = useState('Cargando...');

  const [especialidadMedico, setEspecialidadMedico] = useState('...');

 

  // 1. Estado para guardar la lista de citas (SOLO PROGRAMADAS)

  const [proximasCitas, setProximasCitas] = useState([]);

 

  // NUEVO: Estado para controlar las métricas matemáticas

  const [metricas, setMetricas] = useState({

    atendidos: 0,

    pendientes: 0,

    totalHoy: 0,

    satisfaccion: 0,

    promedioCrudo: 0

  });



  // NUEVO: Estado para el gráfico

  const [datosGrafico, setDatosGrafico] = useState([]);



  // Estado para controlar el menú flotante del doctor

  const [mostrarMenu, setMostrarMenu] = useState(false);



  // Función para cerrar sesión con Supabase

  const handleCerrarSesion = async () => {

    try {

      await supabaseFrontend.auth.signOut();

      navigate('/login');

    } catch (error) {

      console.error("Error al cerrar sesión:", error);

    }

  };



  useEffect(() => {

    const fetchDatos = async () => {

      try {

        const { data: { session } } = await supabaseFrontend.auth.getSession();

       

        if (session) {

          // Agregamos promedio_estrellas a la consulta

          const { data: medicoData, error: medicoError } = await supabaseFrontend

            .from('medicos')

            .select('id, especialidad, promedio_estrellas, perfiles(nombre_completo)')

            .eq('perfil_id', session.user.id)

            .single();



          if (medicoError) throw medicoError;



          if (medicoData) {

            setNombreMedico(medicoData.perfiles.nombre_completo);

            setEspecialidadMedico(medicoData.especialidad);



            // Calcular porcentaje de satisfacción

            const promedio = parseFloat(medicoData.promedio_estrellas || 0);

            const satisfaccionCalc = Math.round((promedio / 5) * 100);



            // Rango de fechas para buscar solo las citas de HOY

            const hoy = new Date();

            hoy.setHours(0, 0, 0, 0);

            const manana = new Date(hoy);

            manana.setDate(manana.getDate() + 1);



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
                perfiles!citas_id_paciente_cita_fkey(nombre_completo)
              `)

              .eq('medico_id', medicoData.id)

              .gte('fecha_hora', hoy.toISOString())

              .lt('fecha_hora', manana.toISOString())

              .order('fecha_hora', { ascending: true });



            if (citasError) throw citasError;

           

            if (citasData) {

              // Separamos atendidas de pendientes

              const completadas = citasData.filter(c => c.estado === 'completada').length;

              const programadas = citasData.filter(c => c.estado === 'programada' || c.estado === 'en_curso');



              setMetricas({

                atendidos: completadas,

                pendientes: programadas.length,

                totalHoy: completadas + programadas.length,

                satisfaccion: satisfaccionCalc,

                promedioCrudo: promedio.toFixed(1)

              });



              // La lista de próximas citas ahora SÓLO muestra las que no se han atendido

              setProximasCitas(programadas.slice(0, 3));



              // Lógica para el gráfico de barras por hora (8:00 a 14:00)

              const conteoPorHora = { 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0 };

              citasData.forEach(cita => {

                const horaCita = new Date(cita.fecha_hora).getHours();

                if (conteoPorHora[horaCita] !== undefined) {

                  conteoPorHora[horaCita]++;

                }

              });

             

              const maxCitas = Math.max(...Object.values(conteoPorHora), 1);

              const formatoGrafico = Object.keys(conteoPorHora).map(hora => ({

                hora: hora,

                cantidad: conteoPorHora[hora],

                altura: `${(conteoPorHora[hora] / maxCitas) * 100}%`

              }));

             

              setDatosGrafico(formatoGrafico);

            }

          }

        }

      } catch (error) {

        console.error("Error cargando el panel:", error.message);

        setNombreMedico("Doctor");

        setEspecialidadMedico("");

      }

    };



    fetchDatos();

  }, []);



  const formatearHora = (fechaIso) => {

    const fecha = new Date(fechaIso);

    let horas = fecha.getHours();

    let minutos = fecha.getMinutes();

    const ampm = horas >= 12 ? 'PM' : 'AM';

    horas = horas % 12;

    horas = horas ? horas : 12;

    minutos = minutos < 10 ? '0' + minutos : minutos;

    return { horaStr: `${horas}:${minutos}`, ampm };

  };



  return (

    <div className="min-h-screen bg-[#f4f7f6] font-sans pb-12">

      {/* Navbar Superior */}

      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">

        <div className="flex items-center gap-2">

          <span className="text-xl font-extrabold text-[#005ba1] tracking-wide">CentroVital</span>

        </div>

        <div className="hidden md:flex gap-8">

          <Link to="/dashboard-medicos" className="text-[#005ba1] font-bold text-sm border-b-2 border-[#005ba1] pb-1">Panel de Control</Link>

          <Link to="/lista-pacientes" className="text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors">Pacientes</Link>

        </div>

        <div className="flex items-center gap-4">

         

          {/* Contenedor Relativo para el Menú Desplegable */}

          <div className="relative">

            <button

              onClick={() => setMostrarMenu(!mostrarMenu)}

              className="flex items-center gap-3 hover:bg-gray-50 p-2 pr-3 rounded-xl transition-colors cursor-pointer z-10"

            >

              <img 
                src={getAvatarMedico(nombreMedico)} 
                alt="Doctor" 
                className="w-9 h-9 rounded-full border border-gray-200 bg-gray-100" 
              />

              <div className="text-right hidden md:block">

                <p className="text-xs font-bold text-gray-800 leading-tight">{nombreMedico}</p>

                <p className="text-[10px] text-gray-500 leading-tight">{especialidadMedico}</p>

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

        {/* Encabezado y Estado */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center relative overflow-hidden">

            <div className="z-10">

              <h1 className="text-2xl font-bold text-gray-800">Buenos días, {nombreMedico}</h1>

              <p className="text-sm text-gray-500 mt-1">Usted tiene {metricas.pendientes} pacientes próximos programados.</p>

            </div>

            <div className="absolute right-[-20px] opacity-5">

               <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V8.11l7-3.11v7.99z"></path></svg>

            </div>

          </div>

         

          <div className="bg-[#2196F3] rounded-xl shadow-sm p-6 text-white flex flex-col justify-center relative overflow-hidden">

            <p className="text-xs uppercase font-bold text-blue-100 tracking-wider mb-1">Estado Actual</p>

            <h2 className="text-3xl font-extrabold mb-1">En Turno</h2>

            <p className="text-sm text-blue-50">Revisando agenda</p>

            <svg className="absolute top-4 right-4 w-6 h-6 text-blue-300 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>

          </div>

        </div>



        {/* Tarjetas de Estadísticas */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

          {/* PACIENTES ATENDIDOS DINÁMICO */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

            <div className="flex justify-between items-start mb-2">

              <div className="bg-blue-50 text-blue-500 p-2 rounded"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>

              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Hoy</span>

            </div>

            <h3 className="text-2xl font-bold text-gray-800">{metricas.atendidos} / {metricas.totalHoy}</h3>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pacientes Atendidos</p>

          </div>

         

          {/* PACIENTES PENDIENTES DINÁMICO */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

            <div className="flex justify-between items-start mb-2">

              <div className="bg-purple-50 text-purple-500 p-2 rounded"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></div>

              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded">En Cola</span>

            </div>

            <h3 className="text-2xl font-bold text-gray-800">{metricas.pendientes}</h3>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pendientes de Atender</p>

          </div>



          {/* SATISFACCIÓN DINÁMICA */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

            <div className="flex justify-between items-start mb-2">

              <div className="bg-green-50 text-green-500 p-2 rounded"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>

              <span className="text-green-500 text-xs font-bold">{metricas.promedioCrudo} ★</span>

            </div>

            <h3 className="text-2xl font-bold text-gray-800">{metricas.satisfaccion}%</h3>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Satisfacción</p>

          </div>

        </div>



        {/* Citas y Gráfico */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

         

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">

            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">

              <h3 className="font-bold text-gray-800">Próximas 3 Citas</h3>

              <Link to="/lista-pacientes" className="text-xs font-bold text-[#005ba1] hover:underline uppercase tracking-wider">

                Ver Todas

              </Link>

            </div>

            <div className="p-5 flex-1 space-y-4">

             

              {proximasCitas.length === 0 ? (

                <div className="text-center py-6">

                  <p className="text-sm text-gray-500">No tienes citas programadas por el momento.</p>

                </div>

              ) : (

                proximasCitas.map((cita) => {

                  const { horaStr, ampm } = formatearHora(cita.fecha_hora);

                  const nombrePaciente = cita.paciente_dependiente || cita.perfiles?.nombre_completo || 'Paciente Desconocido';
                  const esMenor = cita.es_menor_dependiente || false;

                  return (

                    <div key={cita.id} className="flex items-center justify-between border-b border-gray-50 pb-4">

                      <div className="flex items-center gap-3">

                        <div className="text-center">

                          <p className="text-xs font-bold text-[#005ba1]">{horaStr}</p>

                          <p className="text-[10px] text-gray-400 uppercase">{ampm}</p>

                        </div>

                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nombrePaciente.replace(/\s+/g, '')}`} className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200" alt="Paciente" />

                        <div>
                          <p className="font-bold text-sm text-gray-800">{nombrePaciente}</p>
                          {esMenor && (
                            <span className="bg-purple-50 text-purple-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                              Menor de edad
                            </span>
                          )}
                          <p className="text-[10px] text-gray-500">{cita.motivo}</p>
                        </div>

                      </div>

                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded border border-gray-200 uppercase">

                        {cita.estado}

                      </span>

                    </div>

                  );

                })

              )}



            </div>

            <div className="p-4 border-t border-gray-100">

              <button

                onClick={() => navigate('/evolucion-paciente', { state: { cita: proximasCitas[0] } })}

                disabled={proximasCitas.length === 0}

                className={`w-full font-bold text-xs py-3 rounded transition-colors uppercase tracking-wider ${proximasCitas.length > 0 ? 'bg-[#2196F3] hover:bg-blue-600 text-white cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}

              >

                Atender Siguiente Paciente

              </button>

            </div>

          </div>



          {/* Gráfico de Consultas DINÁMICO */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">

            <div className="flex justify-between items-center mb-6">

              <h3 className="font-bold text-gray-800">Actividad de Consultas (Hoy)</h3>

              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2196F3]"></span><span className="text-[10px] text-gray-500 uppercase font-bold">Consultas</span></div>

            </div>

            <div className="flex-1 flex items-end justify-between gap-2 h-40 mb-4 px-2">

             

              {datosGrafico.length > 0 ? datosGrafico.map((dato, i) => (

                <div

                  key={i}

                  className={`w-full rounded-t transition-all duration-500 relative group ${dato.cantidad > 0 ? 'bg-[#2196F3] hover:bg-blue-600' : 'bg-gray-100'}`}

                  style={{ height: dato.cantidad > 0 ? dato.altura : '10%' }}

                >

                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-2 py-0.5 rounded transition-opacity">

                    {dato.cantidad}

                  </span>

                </div>

              )) : (

                <div className="w-full bg-gray-100 rounded-t h-[10%]"></div>

              )}



            </div>

            <div className="flex justify-between text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-2">

              <span>08:00</span>

              <span>09:00</span>

              <span>10:00</span>

              <span>11:00</span>

              <span>12:00</span>

              <span>13:00</span>

              <span>14:00</span>

            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">

               <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Información de Sistema</p>

               <p className="text-sm font-bold text-gray-800">Actualizado en tiempo real</p>

            </div>

          </div>

        </div>

      </main>

    </div>

  );

};



export default DashboardMedico;