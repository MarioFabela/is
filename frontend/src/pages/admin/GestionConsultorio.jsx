import React, { useState, useEffect } from 'react';
import { Calendar, UserPlus, DoorOpen, Pill, Filter, Plus, X, Search, CheckCircle, AlertTriangle, Sun, ArrowRight, ChevronDown, TrendingUp, UserSearch, Clock, ChevronRight } from 'lucide-react';

// ✅ Declaramos la ruta dinámica globalmente para que ambos componentes la puedan usar
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function GestionConsultorio({ consultorios = [], kpis = {}, onSelect, onRefresh }) {
  const [filtroActivo, setFiltroActivo] = useState('TODOS');
  const [mostrarModalTurno, setMostrarModalTurno] = useState(false);
  const [mostrarMenuFiltro, setMostrarMenuFiltro] = useState(false);

  // --- ESTADOS DEL FORMULARIO Y BUSCADOR ---
  const [formData, setFormData] = useState({
    paciente_id: '',
    paciente_nombre: '', // Solo para mostrarlo en la UI
    medico_id: '',
    fecha_hora: '',
    motivo: ''
  });
  
  const [busqueda, setBusqueda] = useState('');
  const [resultadosPacientes, setResultadosPacientes] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // (Debajo de los estados que ya tenías)
  const [mostrarModalLista, setMostrarModalLista] = useState(false);
  const [consultorioSeleccionado, setConsultorioSeleccionado] = useState(null);
  const [listaTurnos, setListaTurnos] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);

  const consultoriosFiltrados = consultorios.filter((c) => {
    if (filtroActivo === 'TODOS') return true;
    return c.estado === filtroActivo;
  });

  const getStatusStyles = (status) => {
    if (status === 'OPERATIVO') return 'bg-green-50 text-green-700 border-green-300';
    if (status === 'A CAPACIDAD') return 'bg-yellow-50 text-yellow-700 border-yellow-300';
    if (status === 'MANTENIMIENTO') return 'bg-red-50 text-red-700 border-red-300';
    return 'bg-gray-50 text-gray-700 border-gray-300';
  };

  // --- LÓGICA DEL BUSCADOR DE PACIENTES ---
  const handleBuscarPaciente = async (termino) => {
    setBusqueda(termino);
    if (termino.length < 3) {
      setResultadosPacientes([]);
      return;
    }
    
    setBuscando(true);
    try {
      // ✅ CORRECCIÓN 1
      const res = await fetch(`${API_URL}/admin/buscar-paciente?q=${termino}`);
      const result = await res.json();
      
      if (result.success) {
         setResultadosPacientes(result.data);
      }
    } catch (error) {
      console.error("Error buscando paciente:", error);
    } finally {
      setBuscando(false);
    }
  };

  const seleccionarPaciente = (paciente) => {
    setFormData({ ...formData, paciente_id: paciente.id, paciente_nombre: paciente.nombre_completo });
    setBusqueda('');
    setResultadosPacientes([]);
  };

  // --- LÓGICA PARA VER LISTA DE TURNOS ---
  const handleAbrirLista = async (consultorio) => {
    setConsultorioSeleccionado(consultorio);
    setMostrarModalLista(true);
    setCargandoLista(true);
    
    try {
      // ✅ CORRECCIÓN 2
      const res = await fetch(`${API_URL}/admin/medicos/${consultorio.id}/citas`);
      const result = await res.json();
      if (result.success) {
        setListaTurnos(result.data);
      } else {
        alert('Error cargando la lista: ' + result.message);
      }
    } catch (error) {
      console.error("Error al obtener citas:", error);
    } finally {
      setCargandoLista(false);
    }
  };

  // --- LÓGICA DE GUARDADO ---
  const handleGuardarTurno = async () => {
    if (!formData.paciente_id || !formData.medico_id || !formData.fecha_hora) {
      alert("Por favor selecciona un paciente, un médico y una fecha.");
      return;
    }

    setGuardando(true);
    try {
      // ✅ CORRECCIÓN 3
      const res = await fetch(`${API_URL}/admin/turno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();

      if (result.success) {
        alert('¡Turno creado exitosamente!');
        setMostrarModalTurno(false);
        setFormData({ paciente_id: '', paciente_nombre: '', medico_id: '', fecha_hora: '', motivo: '' });
        if (onRefresh) onRefresh(); 
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error de conexión con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-300 relative">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div><p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Pacientes Hoy</p><h2 className="text-3xl font-semibold text-gray-900">{kpis.pacientesHoy || 0}</h2></div>
          <div className="bg-blue-50 p-3 rounded-lg"><UserPlus className="text-blue-600" size={32} /></div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div><p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Consultorios Activos</p><h2 className="text-3xl font-semibold text-gray-900">{kpis.consultoriosActivos || 0} <span className="text-lg text-gray-500 font-normal">/ {kpis.consultoriosTotales || 0}</span></h2></div>
          <div className="bg-blue-50 p-3 rounded-lg"><DoorOpen className="text-blue-600" size={32} /></div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div><p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Órdenes Farmacia</p><h2 className="text-3xl font-semibold text-red-600">{kpis.ordenesFarmacia || 0}</h2></div>
          <div className="bg-red-50 p-3 rounded-lg"><Pill className="text-red-600" size={32} /></div>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-2xl font-semibold text-gray-900">Gestión de Consultorios</h3>
        <div className="flex gap-3 relative">
          <button onClick={() => setMostrarMenuFiltro(!mostrarMenuFiltro)} className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors rounded-lg border ${filtroActivo !== 'TODOS' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={18} /> {filtroActivo === 'TODOS' ? 'Filtrar' : filtroActivo}
          </button>
          {mostrarMenuFiltro && (
            <div className="absolute top-12 left-0 w-48 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-10">
              {['TODOS', 'OPERATIVO', 'A CAPACIDAD', 'MANTENIMIENTO'].map(estado => (
                <button key={estado} onClick={() => { setFiltroActivo(estado); setMostrarMenuFiltro(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  {estado}
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setMostrarModalTurno(true)} className="bg-blue-600 text-white px-4 py-2 flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors rounded-lg shadow-sm active:scale-95">
            <Plus size={18} /> Nuevo Turno
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {consultoriosFiltrados.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-blue-400 hover:shadow-md flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
              <div><h4 className="text-lg font-semibold text-gray-900">{c.nombre}</h4><p className="text-xs text-gray-500 mt-0.5">{c.especialidad}</p></div>
              <span className={`px-2.5 py-1 text-[10px] font-bold border rounded-full ${getStatusStyles(c.estado)}`}>{c.estado}</span>
            </div>
            <div className="p-4 space-y-5 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Turno Mañana</p><p className={`text-sm ${c.medicoManana ? 'font-semibold text-gray-800' : 'italic text-gray-400'}`}>{c.medicoManana || 'No asignado'}</p></div>
                <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Turno Tarde</p><p className={`text-sm ${c.medicoTarde ? 'font-semibold text-gray-800' : 'italic text-gray-400'}`}>{c.medicoTarde || 'No asignado'}</p></div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3 bg-white mt-auto">
              <button onClick={() => onSelect && onSelect(c)} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm active:scale-95">Gestionar</button>
              <button 
                onClick={() => handleAbrirLista(c)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
              >
                Ver Lista
              </button>
            </div>
          </div>
        ))}
      </div>

      {mostrarModalTurno && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-visible animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900">Programar Nuevo Turno</h3>
              <button onClick={() => setMostrarModalTurno(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Paciente</label>
                
                {!formData.paciente_id ? (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre... (ej. Ricardo)"
                      value={busqueda}
                      onChange={(e) => handleBuscarPaciente(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none transition-colors"
                    />
                    
                    {busqueda.length >= 3 && (
                      <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        {buscando ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">Buscando...</div>
                        ) : resultadosPacientes.length > 0 ? (
                          resultadosPacientes.map(p => (
                            <div key={p.id} onClick={() => seleccionarPaciente(p)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                              <p className="font-bold text-gray-900 text-sm">{p.nombre_completo}</p>
                              <p className="text-xs text-gray-500">{p.email}</p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-center text-gray-500 flex flex-col gap-2 items-center">
                            <span>No se encontró el paciente.</span>
                            <button 
                              onClick={() => alert("Aquí abriríamos otro modal o redirigiríamos a la vista de Pacientes para crear uno nuevo.")}
                              className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <Plus size={14}/> Agregar nuevo
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    <span className="text-sm font-bold text-green-700 flex items-center gap-2">
                      <CheckCircle size={16}/> {formData.paciente_nombre}
                    </span>
                    <button 
                      onClick={() => setFormData({...formData, paciente_id: '', paciente_nombre: ''})} 
                      className="text-green-700 hover:text-green-900 p-1 hover:bg-green-100 rounded transition-colors"
                    >
                      <X size={16}/>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Médico</label>
                <select 
                  value={formData.medico_id}
                  onChange={(e) => setFormData({...formData, medico_id: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-blue-500 outline-none"
                >
                  <option value="">Seleccione...</option>
                  {consultorios.map(c => (
                    <option key={c.id} value={c.id}>{c.medicoManana} - {c.especialidad}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha y Hora</label>
                <input 
                  type="datetime-local" 
                  value={formData.fecha_hora}
                  onChange={(e) => setFormData({...formData, fecha_hora: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-blue-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Motivo (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.motivo}
                  onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                  placeholder="Ej: Control general..." 
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-blue-500 outline-none" 
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button 
                onClick={() => setMostrarModalTurno(false)} 
                disabled={guardando}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleGuardarTurno} 
                disabled={guardando}
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-colors ${guardando ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {guardando ? 'Guardando...' : 'Guardar Turno'}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalLista && consultorioSeleccionado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Agenda del Día</h3>
                <p className="text-xs text-gray-500">{consultorioSeleccionado.nombre} • {consultorioSeleccionado.especialidad}</p>
              </div>
              <button onClick={() => setMostrarModalLista(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X size={20}/></button>
            </div>
            
            <div className="p-0 max-h-[60vh] overflow-y-auto bg-white">
              {cargandoLista ? (
                <div className="p-8 text-center text-gray-500 text-sm font-medium">Cargando agenda...</div>
              ) : listaTurnos.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-3"><Clock size={32} className="text-gray-300"/></div>
                  <p className="text-gray-500 font-medium">No hay citas programadas para hoy</p>
                  <p className="text-xs text-gray-400 mt-1">Los turnos agendados aparecerán aquí.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 sticky top-0 border-b border-gray-100 shadow-sm">
                    <tr>
                      <th className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Hora</th>
                      <th className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Paciente</th>
                      <th className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Motivo</th>
                      <th className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Estado</th>
                    </tr>
                  </thead>
                  <div className="h-0 border-b-0"></div> 
                  <tbody className="divide-y divide-gray-100">
                    {listaTurnos.map((turno) => (
                      <tr key={turno.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-gray-700 whitespace-nowrap">{turno.hora}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{turno.paciente}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">{turno.motivo}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${turno.estado === 'Atendido' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {turno.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setMostrarModalLista(false)} 
                className="px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors shadow-sm"
              >
                Cerrar Lista
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function DetalleConsultorio({ consultorio = {}, onBack, onRefresh }) {
  const [detalle, setDetalle] = useState(null);
  const [isMaintenance, setIsMaintenance] = useState(consultorio.estado === 'MANTENIMIENTO');
  const [actualizando, setActualizando] = useState(false);
  
  const [actividad, setActividad] = useState({ atendidosHoy: 0, historial: [] });
  const [listaMedicos, setListaMedicos] = useState([]);
  const [nuevoMedicoId, setNuevoMedicoId] = useState('');

  const fetchData = async (id) => {
    try {
      // ✅ CORRECCIÓN 4
      const resDetalle = await fetch(`${API_URL}/admin/consultorio/${id}`);
      const jsonDetalle = await resDetalle.json();
      if (jsonDetalle.success) {
        setDetalle(jsonDetalle.data);
        setIsMaintenance(jsonDetalle.data.activo === false);
      }

      // ✅ CORRECCIÓN 5
      const resAct = await fetch(`${API_URL}/admin/consultorio/${id}/actividad`);
      const jsonAct = await resAct.json();
      if (jsonAct.success) setActividad(jsonAct.data);

      // ✅ CORRECCIÓN 6
      const resMed = await fetch(`${API_URL}/admin/medicos`);
      const jsonMed = await resMed.json();
      if (jsonMed.success) {
        setListaMedicos(jsonMed.data);
        setNuevoMedicoId(jsonMed.data[0]?.id); 
      }
    } catch (err) {
      console.error('Error cargando la vista:', err);
    }
  };

  React.useEffect(() => {
    if (consultorio?.id) fetchData(consultorio.id);
  }, [consultorio?.id]);

  const handleToggleEstado = async (nuevoEstadoMantenimiento) => { /* ... tu código actual ... */ };

  const handleReasignar = async () => {
    if (!nuevoMedicoId) return;
    
    if (nuevoMedicoId === detalle?.id) {
      return alert("El profesional seleccionado ya se encuentra en este consultorio.");
    }

    setActualizando(true);
    try {
      // ✅ CORRECCIÓN 7
      const res = await fetch(`${API_URL}/admin/consultorio/reasignar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicoActualId: detalle.id,
          nuevoMedicoId: nuevoMedicoId,
          numeroConsultorio: detalle.numero_consultorio 
        })
      });
      
      const result = await res.json();
      if (result.success) {
        alert("¡Consultorio reasignado exitosamente!");
        if (onRefresh) await onRefresh();
        onBack(); 
      } else {
        alert("Error al reasignar: " + result.message);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    } finally {
      setActualizando(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-in fade-in duration-300">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Asignación de Médico</h2>
            <button className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-full transition-colors">
              <UserPlus size={20} />
            </button>
          </div>
          <div className="p-6 space-y-5 flex-grow">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Asignar Nuevo Profesional</label>
              <div className="relative">
                <select 
                  value={nuevoMedicoId} 
                  onChange={(e) => setNuevoMedicoId(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none appearance-none transition-all"
                >
                  {listaMedicos.map(med => (
                    <option key={med.id} value={med.id}>
                      {med.nombre} ({med.especialidad})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 pointer-events-none text-gray-500" size={20} />
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
              <div className="relative">
                <img alt="Doctor Actual" className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover" src={detalle?.foto || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=100&auto=format&fit=crop'} />
              </div>
              <div className="flex-grow">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Asignación Actual</p>
                <p className="text-sm font-bold text-gray-900">{detalle?.medico?.nombre_completo || 'Sin médico'}</p>
                <p className="text-xs text-gray-500">{detalle?.especialidad}</p>
              </div>
            </div>
            
            <div className="pt-4 flex gap-3">
              <button 
                onClick={handleReasignar}
                disabled={actualizando}
                className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-lg shadow-sm hover:shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all text-sm disabled:opacity-50"
              >
                Confirmar Reasignación
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Métricas del Día</h2>
            <TrendingUp className="text-gray-500" size={20} />
          </div>
          <div className="p-6 grid grid-cols-1 gap-4 flex-grow">
            <div className="p-6 border border-gray-200 rounded-xl bg-gradient-to-b from-white to-gray-50 shadow-sm flex flex-col items-center justify-center text-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Pacientes Atendidos Hoy</p>
              <p className="text-6xl font-black text-blue-600 tabular-nums tracking-tighter">
                {actividad.atendidosHoy}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Actividad Reciente</h2>
        </div>
        <div className="p-6">
          <div className="relative space-y-8 py-4 before:absolute before:inset-0 before:ml-[1.25rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-200">
            
            {actividad.historial.length === 0 ? (
               <p className="text-sm text-gray-500 ml-12">No hay actividad registrada el día de hoy.</p>
            ) : (
               actividad.historial.map((log, index) => (
                  <div key={index} className="relative flex items-start gap-6 group">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border z-10 shadow-sm ${log.estado === 'programada' ? 'border-yellow-200 bg-yellow-50 text-yellow-600' : 'border-green-200 bg-green-50 text-green-600'}`}>
                      {log.estado === 'programada' ? <Calendar size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <div className="flex-grow pb-5 border-b border-gray-100">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-gray-900">{log.titulo}</p>
                        <span className="text-[11px] font-bold text-gray-400">{log.hora}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{log.descripcion}</p>
                    </div>
                  </div>
               ))
            )}

          </div>
        </div>
      </section>

    </div>
  );
}
export { DetalleConsultorio };