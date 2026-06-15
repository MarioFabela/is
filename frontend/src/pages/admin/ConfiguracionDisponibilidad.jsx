import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, Plus, Clock, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';

// ✅ Declaramos la ruta dinámica para que Render inyecte la de producción
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ConfiguracionDisponibilidad() {
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [medicos, setMedicos] = useState([]);

  // Horarios Semanales
  const [horarios, setHorarios] = useState([
    { dia: 'Lunes', activo: true, entrada: '08:00 AM', salida: '06:00 PM', descanso: '60 min' },
    { dia: 'Martes', activo: true, entrada: '08:00 AM', salida: '06:00 PM', descanso: '60 min' },
    { dia: 'Miércoles', activo: true, entrada: '09:00 AM', salida: '02:00 PM', descanso: 'No aplica' },
    { dia: 'Jueves', activo: true, entrada: '08:00 AM', salida: '06:00 PM', descanso: '60 min' },
    { dia: 'Viernes', activo: true, entrada: '08:00 AM', salida: '04:00 PM', descanso: '30 min' },
    { dia: 'Sábado', activo: false, entrada: '--:--', salida: '--:--', descanso: '--' },
    { dia: 'Domingo', activo: false, entrada: '--:--', salida: '--:--', descanso: '--' },
  ]);

  const [diasNoLaborales, setDiasNoLaborales] = useState([]);
  const [nuevoDiaFecha, setNuevoDiaFecha] = useState('');
  const [nuevoDiaMotivo, setNuevoDiaMotivo] = useState('');

  // --- LÓGICA DEL MINICALENDARIO ---
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  
  const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  // Calcular días del mes actual
  const diasMes = new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + 1, 0).getDate();
  const primerDia = new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth(), 1).getDay();
  const celdasVacias = (primerDia + 6) % 7; // Ajuste para que la semana empiece en Lunes (0) en vez de Domingo

  // Función para saber si un día específico está en la lista de días inhábiles
  const esInhabil = (dia) => {
    const mesStr = String(fechaCalendario.getMonth() + 1).padStart(2, '0');
    const diaStr = String(dia).padStart(2, '0');
    const fechaFormat = `${fechaCalendario.getFullYear()}-${mesStr}-${diaStr}`; // YYYY-MM-DD
    return diasNoLaborales.some(d => d.fecha === fechaFormat);
  };

  const cambiarMes = (offset) => {
    setFechaCalendario(new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + offset, 1));
  };
  // ---------------------------------

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        // ✅ CORRECCIÓN 1
        const res = await fetch(`${API_URL}/admin/medicos`);
        const json = await res.json();
        if (json.success) {
          setMedicos(json.data);
          if (json.data.length > 0 && !selectedMedico) setSelectedMedico(json.data[0].id);
        }
      } catch (err) {
        console.error('Error cargando medicos', err);
      }
    };
    fetchMedicos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedMedico) return;
    const fetchDetalle = async () => {
      try {
        // ✅ CORRECCIÓN 2 y 3
        const [resHor, resDias] = await Promise.all([
          fetch(`${API_URL}/admin/medicos/${selectedMedico}/horarios`),
          fetch(`${API_URL}/admin/medicos/${selectedMedico}/dias-no-laborales`)
        ]);
        const horJson = await resHor.json();
        const diasJson = await resDias.json();
        
        if (horJson.success) {
          const nuevos = [
            { dia: 'Lunes', activo: false, entrada: '--:--', salida: '--:--', descanso: 'No aplica' },
            { dia: 'Martes', activo: false, entrada: '--:--', salida: '--:--', descanso: 'No aplica' },
            { dia: 'Miércoles', activo: false, entrada: '--:--', salida: '--:--', descanso: 'No aplica' },
            { dia: 'Jueves', activo: false, entrada: '--:--', salida: '--:--', descanso: 'No aplica' },
            { dia: 'Viernes', activo: false, entrada: '--:--', salida: '--:--', descanso: 'No aplica' },
            { dia: 'Sábado', activo: false, entrada: '--:--', salida: '--:--', descanso: 'No aplica' },
            { dia: 'Domingo', activo: false, entrada: '--:--', salida: '--:--', descanso: 'No aplica' }
          ];
          if (horJson.data && horJson.data.length) {
            horJson.data.forEach(h => {
              const idx = Number(h.dia_semana);
              if (idx >=0 && idx <=6) {
                nuevos[idx] = {
                  dia: nuevos[idx].dia,
                  activo: true,
                  entrada: h.hora_inicio ? h.hora_inicio.slice(0,5) : '--:--',
                  salida: h.hora_fin ? h.hora_fin.slice(0,5) : '--:--',
                  descanso: h.duracion_min ? `${h.duracion_min} min` : 'No aplica'
                };
              }
            });
          }
          setHorarios(nuevos);
        }
        if (diasJson.success) {
          setDiasNoLaborales(diasJson.data || []);
        }
      } catch (err) {
        console.error('Error cargando detalle disponibilidad', err);
      }
    };
    fetchDetalle();
  }, [selectedMedico]);

  const toggleDia = (index) => {
    const nuevosHorarios = [...horarios];
    nuevosHorarios[index].activo = !nuevosHorarios[index].activo;
    setHorarios(nuevosHorarios);
  };

  const handleGuardarHorarios = async () => {
    if (!selectedMedico) return alert('Selecciona un médico');
    
    const parseHourTo24 = (val) => {
      if (!val) return null;
      let s = String(val).trim().replace(/\u00A0/g, ' ');
      const timeMatch = s.match(/(\d{1,2}):(\d{2})/);
      if (!timeMatch) return null;
      let hours = parseInt(timeMatch[1], 10);
      let minutes = parseInt(timeMatch[2], 10);
      const ampmMatch = s.match(/(a\.?m\.?|p\.?m\.?|am|pm)/i);
      if (ampmMatch) {
        const suf = ampmMatch[0].toLowerCase().replace(/\./g, '');
        if ((suf === 'pm' || suf === 'pm') && hours < 12) hours += 12;
        if ((suf === 'am' || suf === 'am') && hours === 12) hours = 0;
      }
      if (isNaN(hours) || isNaN(minutes)) return null;
      hours = Math.max(0, Math.min(23, hours));
      minutes = Math.max(0, Math.min(59, minutes));
      return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:00`;
    };

    const activos = horarios.map((h,i)=>({h,i})).filter(x=>x.h.activo);
    const payload = [];
    const diasIncompletos = [];
    for (const item of activos) {
      const i = item.i;
      const h = item.h;
      if (!h.entrada || h.entrada === '--:--' || !h.salida || h.salida === '--:--') {
        diasIncompletos.push(h.dia);
        continue;
      }
      const inicio = parseHourTo24(h.entrada);
      const fin = parseHourTo24(h.salida);
      const dur = h.descanso === 'No aplica' ? 30 : parseInt(h.descanso);
      if (!inicio || !fin) {
        diasIncompletos.push(h.dia);
        continue;
      }
      if (dur <= 0 || isNaN(dur)) return alert(`Duración inválida en ${h.dia}`);
      
      const [hiH, hiM] = inicio.split(':').map(x=>parseInt(x,10));
      const [hfH, hfM] = fin.split(':').map(x=>parseInt(x,10));
      const minsInicio = hiH*60 + hiM;
      const minsFin = hfH*60 + hfM;
      if (minsInicio >= minsFin) return alert(`En ${h.dia} la hora de inicio debe ser anterior a la de fin (entrada: "${h.entrada}").`);
      payload.push({ dia_semana: i, hora_inicio: inicio, hora_fin: fin, duracion_min: dur });
    }
    if (diasIncompletos.length > 0) {
      return alert(`Completa entrada y salida usando el selector para: ${diasIncompletos.join(', ')}.`);
    }
    try {
      // ✅ CORRECCIÓN 4
      const res = await fetch(`${API_URL}/admin/medicos/${selectedMedico}/horarios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ horarios: payload }) });
      const json = await res.json();
      if (json.success) alert('Horarios guardados exitosamente');
      else alert('Error guardando horarios: ' + json.message);
    } catch (err) { console.error(err); alert('Error conectando con servidor'); }
  };

  const handleAgregarDiaNoLaboral = async () => {
    if (!selectedMedico || selectedMedico === 'global' || !nuevoDiaFecha) return alert('Selecciona fecha y médico válidos (no use "Configuración Global").');
    try {
      // ✅ CORRECCIÓN 5
      const res = await fetch(`${API_URL}/admin/medicos/${selectedMedico}/dias-no-laborales`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fecha: nuevoDiaFecha, motivo: nuevoDiaMotivo }) });
      const json = await res.json();
      if (json.success) {
        setDiasNoLaborales(prev => [ ...prev, ...json.data ]);
        setNuevoDiaFecha(''); setNuevoDiaMotivo('');
      } else alert('Error: ' + json.message);
    } catch (err) { console.error(err); alert('Error conectando con servidor'); }
  };

  const handleEliminarDiaNoLaboral = async (diaId) => {
    try {
      // ✅ CORRECCIÓN 6
      const res = await fetch(`${API_URL}/admin/medicos/${selectedMedico}/dias-no-laborales/${diaId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) setDiasNoLaborales(prev => prev.filter(d => d.id !== diaId));
      else alert('Error: ' + json.message);
    } catch (err) { console.error(err); alert('Error conectando con servidor'); }
  };

  const opcionesHora = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'];
  const opcionesDescanso = ['No aplica', '30 min', '60 min', '90 min'];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración de Disponibilidad</h2>
          <p className="text-sm text-gray-500 mt-1">Gestione los horarios operativos y bloqueos de agenda del centro.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm active:scale-95">
            Cancelar
          </button>
          <button onClick={handleGuardarHorarios} className="px-4 py-2 bg-[#0052cc] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm active:scale-95">
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda */}
        <div className="space-y-6">
          
          {/* Seleccionar Médico */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <Search size={18} className="text-blue-600" />
              <h3 className="font-bold text-gray-900">Seleccionar Médico</h3>
            </div>
            
            <div className="p-4 bg-gray-50/50">
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar profesional..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {medicos.filter(m => m.nombre?.toLowerCase().includes(searchTerm.toLowerCase())).map(medico => (
                  <div 
                    key={medico.id}
                    onClick={() => setSelectedMedico(medico.id)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border ${selectedMedico === medico.id ? 'bg-[#f0f4f8] border-blue-200 shadow-sm' : 'bg-white border-transparent hover:border-gray-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gray-100 text-gray-600">
                        {medico.nombre ? medico.nombre.split(' ').map(n=>n[0]).slice(0,2).join('') : 'MD'}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${selectedMedico === medico.id ? 'text-gray-900' : 'text-gray-700'}`}>{medico.nombre}</p>
                        <p className="text-xs text-gray-500">{medico.especialidad}</p>
                      </div>
                    </div>
                    {selectedMedico === medico.id && <CheckCircle2 size={18} className="text-[#0052cc]" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Días No Laborales */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} className="text-amber-700" />
                <h3 className="font-bold text-gray-900">Días No Laborales</h3>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex flex-col items-center">
              
              {/* MINICALENDARIO DINÁMICO */}
              <div className="w-full bg-white border border-gray-200 rounded-lg p-3 shadow-sm select-none">
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-800">{mesesNombres[fechaCalendario.getMonth()]} {fechaCalendario.getFullYear()}</span>
                    <div className="flex gap-2">
                      <button onClick={() => cambiarMes(-1)} className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"><ChevronLeft size={16}/></button>
                      <button onClick={() => cambiarMes(1)} className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"><ChevronRight size={16}/></button>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 mb-2">
                    <span>LU</span><span>MA</span><span>MI</span><span>JU</span><span>VI</span><span>SA</span><span>DO</span>
                 </div>
                 
                 <div className="grid grid-cols-7 text-center gap-y-1 text-xs">
                    {/* Celdas vacías previas al día 1 */}
                    {Array.from({ length: celdasVacias }).map((_, i) => (
                      <div key={`empty-${i}`} className="p-1.5"></div>
                    ))}
                    {/* Días del mes */}
                    {Array.from({ length: diasMes }).map((_, i) => {
                      const dia = i + 1;
                      const inhabil = esInhabil(dia);
                      return (
                        <div key={dia} className={`p-1.5 rounded-md font-medium mx-auto w-7 h-7 flex items-center justify-center transition-colors ${inhabil ? 'bg-red-100 text-red-700 font-bold border border-red-200' : 'text-gray-700 hover:bg-blue-50'}`}>
                          {dia}
                        </div>
                      );
                    })}
                 </div>
              </div>

              {/* Lista y Formulario */}
              <div className="w-full mt-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Bloqueos Registrados</h4>
                {diasNoLaborales.length === 0 ? (
                  <p className="text-sm text-gray-400 italic bg-white p-3 rounded-lg border border-gray-100 text-center">Sin días inhábiles en este mes.</p>
                ) : (
                  <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {diasNoLaborales.map(d => (
                      <li key={d.id} className="flex items-center justify-between bg-white border border-gray-200 p-2.5 rounded-lg shadow-sm group hover:border-red-200 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{d.fecha}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{d.motivo || 'Sin motivo'}</p>
                        </div>
                        <button onClick={() => handleEliminarDiaNoLaboral(d.id)} className="text-gray-300 hover:bg-red-50 hover:text-red-600 p-1.5 rounded-md transition-colors tooltip" title="Eliminar bloqueo">
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <input 
                    type="date" 
                    value={nuevoDiaFecha} 
                    onChange={(e)=>setNuevoDiaFecha(e.target.value)} 
                    className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors" 
                  />
                  <input 
                    type="text" 
                    placeholder="Motivo (opcional, ej. Vacaciones)" 
                    value={nuevoDiaMotivo} 
                    onChange={(e)=>setNuevoDiaMotivo(e.target.value)} 
                    className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-colors" 
                  />
                  <button onClick={handleAgregarDiaNoLaboral} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-sm rounded-lg transition-colors active:scale-95">
                    <Plus size={16} /> Agregar Bloqueo
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Columna Derecha: Horarios Semanales */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <Clock size={18} className="text-blue-600" />
              <h3 className="font-bold text-gray-900">Horarios de Atención Semanal</h3>
            </div>
            
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] font-bold text-gray-500 uppercase bg-white border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 w-32">Día</th>
                    <th className="px-4 py-4 w-28">Estado</th>
                    <th className="px-4 py-4">Entrada</th>
                    <th className="px-4 py-4">Salida</th>
                    <th className="px-4 py-4">Descanso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {horarios.map((horario, index) => (
                    <tr key={horario.dia} className={`transition-colors hover:bg-gray-50/50 ${!horario.activo ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                      <td className="px-6 py-4 font-bold text-gray-900">{horario.dia}</td>
                      <td className="px-4 py-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={horario.activo}
                            onChange={() => toggleDia(index)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <span className={horario.activo ? 'text-blue-700 font-semibold' : 'text-gray-500'}>
                            {horario.activo ? 'Abierto' : 'Cerrado'}
                          </span>
                        </label>
                      </td>
                      <td className="px-4 py-4">
                        <select 
                          disabled={!horario.activo}
                          value={horario.entrada}
                          onChange={(e) => { const nuevos=[...horarios]; nuevos[index].entrada = e.target.value; setHorarios(nuevos); }}
                          className="bg-white border border-gray-200 text-gray-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100 disabled:text-gray-400 outline-none transition-colors"
                        >
                          {horario.activo ? opcionesHora.map(h => <option key={`in-${h}`}>{h}</option>) : <option>--:--</option>}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <select 
                          disabled={!horario.activo}
                          value={horario.salida}
                          onChange={(e) => { const nuevos=[...horarios]; nuevos[index].salida = e.target.value; setHorarios(nuevos); }}
                          className="bg-white border border-gray-200 text-gray-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100 disabled:text-gray-400 outline-none transition-colors"
                        >
                          {horario.activo ? opcionesHora.map(h => <option key={`out-${h}`}>{h}</option>) : <option>--:--</option>}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <select 
                          disabled={!horario.activo}
                          value={horario.descanso}
                          onChange={(e) => { const nuevos=[...horarios]; nuevos[index].descanso = e.target.value; setHorarios(nuevos); }}
                          className="bg-white border border-gray-200 text-gray-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100 disabled:text-gray-400 outline-none transition-colors"
                        >
                          {horario.activo ? opcionesDescanso.map(d => <option key={`brk-${d}`}>{d}</option>) : <option>--</option>}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}