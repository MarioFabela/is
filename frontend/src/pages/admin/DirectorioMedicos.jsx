import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, X, Edit2, Trash2, Stethoscope, 
  CheckCircle, AlertTriangle, UserPlus, MoreVertical, User 
} from 'lucide-react';

// ✅ Definimos la variable de entorno para inyectar la URL correcta
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function DirectorioMedicos() {
  const [medicos, setMedicos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para el Modal (Crear / Editar)
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    // Datos de la cuenta (Solo para creación)
    nombreCompleto: '',
    email: '',
    password: '',
    telefono: '',
    // Datos médicos
    especialidad: '',
    cedula_profesional: '',
    numero_consultorio: '',
    duracion_consulta_min: 30
  });

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setMedicoSeleccionado(null);
    setFormData({ 
      nombreCompleto: '', email: '', password: '', telefono: '', 
      especialidad: '', cedula_profesional: '', numero_consultorio: '', duracion_consulta_min: 30 
    });
    setMostrarModal(true);
  };

  // Cargar médicos desde el backend
  const fetchMedicos = async () => {
    setCargando(true);
    try {
      // ✅ CORRECCIÓN 1
      const res = await fetch(`${API_URL}/admin/medicos`);
      const json = await res.json();
      if (json.success) {
        setMedicos(json.data);
      }
    } catch (err) {
      console.error('Error cargando el directorio:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchMedicos();
  }, []);

  // Filtrado de médicos
  const medicosFiltrados = medicos.filter(m => 
    m.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.especialidad?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirModalEditar = async (medico) => {
    setModoEdicion(true);
    setMedicoSeleccionado(medico.id);
    
    // Obtenemos los datos completos del médico (incluyendo cédula y duración que no vienen en la lista básica)
    try {
      // ✅ CORRECCIÓN 2
      const res = await fetch(`${API_URL}/admin/consultorio/${medico.id}`);
      const json = await res.json();
      if (json.success) {
        setFormData({
          perfil_id: json.data.medico.id, // Solo lectura en edición
          especialidad: json.data.especialidad,
          cedula_profesional: json.data.cedula_profesional || '', // Si tu backend ya lo envía
          numero_consultorio: json.data.numero_consultorio || '',
          duracion_consulta_min: json.data.duracion_consulta_min
        });
        setMostrarModal(true);
      }
    } catch (error) {
      alert("Error al cargar los datos del médico.");
    }
  };

  const handleGuardar = async () => {
    if (!formData.especialidad || !formData.cedula_profesional) {
      return alert("La especialidad y la cédula son obligatorias.");
    }
    
    setGuardando(true);
    try {
      // ✅ CORRECCIÓN 3 y 4
      const url = modoEdicion 
        ? `${API_URL}/admin/medicos/${medicoSeleccionado}`
        : `${API_URL}/admin/medicos`;
      
      const method = modoEdicion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();

      if (result.success) {
        alert(`Médico ${modoEdicion ? 'actualizado' : 'creado'} exitosamente.`);
        setMostrarModal(false);
        fetchMedicos(); // Recargar la lista
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error de conexión con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      // ✅ CORRECCIÓN 5
      const res = await fetch(`${API_URL}/admin/medicos/${id}`, { method: 'DELETE' });
      const result = await res.json();

      if (result.success) {
        alert('Médico eliminado del sistema.');
        fetchMedicos();
      } else {
        alert('Error al eliminar: ' + result.message);
      }
    } catch (error) {
      alert('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Directorio Médico</h1>
          <p className="text-sm text-gray-500 mt-1">Gestione el personal de salud, consultorios y especialidades.</p>
        </div>
        <button 
          onClick={abrirModalNuevo}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all text-sm active:scale-95"
        >
          <UserPlus size={18} /> Registrar Médico
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-white border border-gray-200 p-4 rounded-xl mb-6 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o especialidad..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none text-sm transition-all" 
          />
        </div>
      </div>

      {/* TABLA DE MÉDICOS */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Profesional</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Especialidad</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Consultorio</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargando ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500 font-medium">Cargando directorio...</td></tr>
              ) : medicosFiltrados.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500 font-medium">No se encontraron profesionales.</td></tr>
              ) : (
                medicosFiltrados.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img 
                        src={m.foto || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=100&auto=format&fit=crop'} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                      />
                      <div>
                        <div className="text-sm font-bold text-gray-900">{m.nombre}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">ID: {m.id.substring(0,8)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">{m.especialidad}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {m.numero_consultorio || 'No asignado'}
                    </td>
                    <td className="px-6 py-4">
                      {m.activo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle size={12} /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">
                          <AlertTriangle size={12} /> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => abrirModalEditar(m)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors tooltip"
                          title="Editar información"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleEliminar(m.id, m.nombre)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors tooltip"
                          title="Eliminar médico"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR MÉDICO */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-visible animate-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Stethoscope className="text-blue-600" size={20} />
                <h3 className="font-bold text-gray-900 text-lg">
                  {modoEdicion ? 'Editar Profesional' : 'Registrar Nuevo Profesional'}
                </h3>
              </div>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors">
                <X size={20}/>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              
              {/* SECCIÓN 1: DATOS DE LA CUENTA (Solo al crear) */}
              {!modoEdicion && (
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} /> Datos de Acceso
                  </h4>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Nombre Completo*</label>
                    <input 
                      type="text" 
                      value={formData.nombreCompleto}
                      onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})}
                      placeholder="Ej: Dr. Alejandro Martínez"
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Correo Electrónico*</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="doctor@centrovital.com"
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Contraseña Provisional*</label>
                      <input 
                        type="text" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="Min. 6 caracteres"
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 2: DATOS MÉDICOS (Crear y Editar) */}
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Stethoscope size={14} /> Perfil Profesional
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Especialidad*</label>
                  <input 
                    type="text" 
                    value={formData.especialidad}
                    onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                    placeholder="Ej: Cardiología" 
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Cédula Profesional*</label>
                  <input 
                    type="text" 
                    value={formData.cedula_profesional}
                    onChange={(e) => setFormData({...formData, cedula_profesional: e.target.value})}
                    placeholder="Ej: 8945612" 
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Consultorio Asignado</label>
                  <input 
                    type="text" 
                    value={formData.numero_consultorio}
                    onChange={(e) => setFormData({...formData, numero_consultorio: e.target.value})}
                    placeholder="Ej: 102A" 
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Duración Citas (Min)</label>
                  <select 
                    value={formData.duracion_consulta_min}
                    onChange={(e) => setFormData({...formData, duracion_consulta_min: Number(e.target.value)})}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none bg-white"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button 
                onClick={() => setMostrarModal(false)} 
                disabled={guardando}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleGuardar} 
                disabled={guardando}
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-lg shadow-sm transition-all ${guardando ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
              >
                {guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar Médico' : 'Registrar Médico')}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}