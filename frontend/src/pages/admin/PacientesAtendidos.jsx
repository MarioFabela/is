import React, { useState } from 'react';
import { 
  Search, UserPlus, Stethoscope, MoreVertical, Ban, CheckCircle 
} from 'lucide-react';

function PacientesAtendidos({ pacientes, onRefresh }) {
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [actualizando, setActualizando] = useState(false);

  // Función para abrir/cerrar el menú desplegable de cada fila
  const toggleMenu = (id) => {
    setMenuAbierto(menuAbierto === id ? null : id);
  };

  // Función que se conecta a la nueva ruta que creaste en el backend
  const handleToggleEstado = async (pacienteId, estadoActual, nombre) => {
    const nuevoEstado = !estadoActual; // Si está true pasa a false y viceversa
    const accion = nuevoEstado ? 'reactivar' : 'suspender';
    
    // Confirmación de seguridad
    if (!window.confirm(`¿Estás seguro de que deseas ${accion} la cuenta de ${nombre}?`)) {
      setMenuAbierto(null);
      return;
    }

    setActualizando(true);
    try {
      const res = await fetch(`http://localhost:3000/api/admin/pacientes/${pacienteId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: nuevoEstado })
      });
      
      const result = await res.json();
      if (result.success) {
        if (onRefresh) onRefresh(); // Recarga la tabla para ver los cambios
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error de conexión con el servidor.');
    } finally {
      setActualizando(false);
      setMenuAbierto(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Historial de Pacientes</h1>
          <p className="text-sm text-gray-500 mt-1">Administración de visitas, registros y accesos a la clínica.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all text-sm">
          <UserPlus size={18} /> Nuevo Paciente
        </button>
      </div>

      {/* Buscadores... */}
      <div className="bg-white border border-gray-200 p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-end shadow-sm">
        <div className="md:col-span-5 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Buscador</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none text-sm transition-all" placeholder="Buscar..." type="text" />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm pb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Hora</th>
                <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Médico</th>
                <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Estado de Cita</th>
                <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pacientes.map((p) => (
                <tr key={p.cita_id} className={`transition-colors ${p.pacienteActivo === false ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-gray-50'}`}>
                  
                  {/* Celda del Paciente */}
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${p.colorAvatar}`}>
                      {p.iniciales}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`text-sm font-semibold ${p.pacienteActivo === false ? 'text-red-900' : 'text-gray-900'}`}>{p.nombre}</div>
                        {p.pacienteActivo === false && (
                          <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Suspendido</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {p.idCorto}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{p.hora}</td>
                  <td className="px-6 py-4 flex items-center gap-2 text-sm text-gray-700"><Stethoscope size={16} className="text-gray-400" />{p.medico}</td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${p.estado === 'Atendido' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                      {p.estado}
                    </span>
                  </td>
                  
                  {/* MENÚ DE OPCIONES (TRES PUNTITOS) */}
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={() => toggleMenu(p.cita_id)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-md transition-colors">
                      <MoreVertical size={20} />
                    </button>

                    {/* Menú Flotante */}
                    {menuAbierto === p.cita_id && (
                      <div className="absolute right-8 top-10 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        
                        {p.pacienteActivo !== false ? (
                           <button 
                             disabled={actualizando}
                             onClick={() => handleToggleEstado(p.id, p.pacienteActivo, p.nombre)}
                             className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors"
                           >
                             <Ban size={16} /> Suspender Cuenta
                           </button>
                        ) : (
                           <button 
                             disabled={actualizando}
                             onClick={() => handleToggleEstado(p.id, p.pacienteActivo, p.nombre)}
                             className="w-full text-left px-4 py-3 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 font-medium transition-colors"
                           >
                             <CheckCircle size={16} /> Reactivar Cuenta
                           </button>
                        )}

                      </div>
                    )}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PacientesAtendidos;