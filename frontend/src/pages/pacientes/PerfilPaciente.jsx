import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  obtenerPerfilActual, 
  actualizarPerfilApi, 
  actualizarContrasenaApi, 
  cerrarSesionApi, 
  eliminarCuentaApi,
  subirFotoPerfilApi // <-- NUEVA API IMPORTADA
} from '../../api/perfil';

const PerfilPaciente = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [isGoogleAcc, setIsGoogleAcc] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false); // Estado de carga para la foto

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  // Modales
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados para contraseña y eliminación
  const [newPassword, setNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const { user, perfil, isGoogle } = await obtenerPerfilActual();
      setUserId(user.id);
      setIsGoogleAcc(isGoogle);
      if (perfil) {
        setNombre(perfil.nombre_completo || '');
        setTelefono(perfil.telefono || '');
        setFotoUrl(perfil.foto_url || '');
      }
    } catch (error) {
      console.error("Error al cargar perfil", error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // NUEVA FUNCIÓN: Maneja la selección y subida automática del archivo binario
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación rápida de tamaño (ej: máximo 3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert("La imagen es muy pesada. Selecciona una menor a 3MB.");
      return;
    }

    try {
      setIsUploadingFoto(true);
      const res = await subirFotoPerfilApi(userId, file);
      
      // Actualizamos el estado local con la URL pública que devolvió el servidor
      setFotoUrl(res.foto_url); 
      alert("¡Foto de perfil actualizada exitosamente!");
    } catch (error) {
      alert(`Error al subir la imagen: ${error.message}`);
    } finally {
      setIsUploadingFoto(false);
    }
  };

  const handleGuardarDatos = async () => {
    setIsSaving(true);
    try {
      await actualizarPerfilApi(userId, { 
        nombre_completo: nombre, 
        telefono: telefono,
        foto_url: fotoUrl 
      });
      alert('¡Datos guardados correctamente!');
    } catch (error) {
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    
    if (!passwordRegex.test(newPassword)) {
      setPassError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.");
      return;
    }

    setIsSaving(true);
    setPassError('');
    try {
      await actualizarContrasenaApi(newPassword);
      alert('Contraseña actualizada correctamente.');
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (error) {
      setPassError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'eliminar') return;
    setIsSaving(true);
    try {
      await eliminarCuentaApi(userId);
      await cerrarSesionApi();
      alert('Tu cuenta ha sido deshabilitada del sistema.');
      navigate('/');
    } catch (error) {
      alert(`Error al eliminar cuenta: ${error.message}`);
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await cerrarSesionApi();
      navigate('/');
    } catch (error) {
      alert("Error al cerrar sesión");
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fbff]">Cargando tu perfil clínico...</div>;

  return (
    <div className="min-h-screen bg-[#f8fbff] font-sans pb-12">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link to="/dashboard-pacientes" className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-[#005ba1] tracking-wide uppercase">CentroVital</span>
        </Link>
        <div className="hidden md:flex gap-8">
          <Link to="/dashboard-pacientes" className="text-gray-500 font-medium text-sm">Inicio</Link>
          <Link to="/agendar-cita" className="text-gray-500 font-medium text-sm">Citas</Link>
          <Link to="/historial" className="text-gray-500 font-medium text-sm">Historial</Link>
          <Link to="/perfil" className="text-[#005ba1] font-bold text-sm border-b-2 border-[#005ba1] pb-1">Perfil</Link>
        </div>
        <button onClick={handleLogout} className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
          Salir
        </button>
      </nav>

      <main className="max-w-2xl mx-auto px-6 mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          
          {/* SECCIÓN FOTO DE PERFIL MODIFICADA A ARCHIVO BINARIO */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-28 h-28 bg-[#e6f0fa] rounded-full flex items-center justify-center overflow-hidden mb-4 border-2 border-[#005ba1] relative group shadow-sm">
              {fotoUrl ? (
                <img src={fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-[#005ba1]">{nombre.charAt(0).toUpperCase() || 'U'}</span>
              )}
              
              {/* Spinner de carga visual sobre el avatar */}
              {isUploadingFoto && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Selector de archivos oculto estilizado mediante un label */}
            <label className={`bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors cursor-pointer ${isUploadingFoto ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isUploadingFoto ? 'Subiendo imagen...' : 'Seleccionar archivo de foto'}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                disabled={isUploadingFoto}
                className="hidden" 
              />
            </label>
            <p className="text-[10px] text-gray-400 mt-1.5">Formatos permitidos: JPG, PNG. Máximo 3MB.</p>
          </div>

          {/* Formulario de Datos */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#005ba1]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Número de Teléfono</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#005ba1]"
              />
            </div>
            <button 
              onClick={handleGuardarDatos}
              disabled={isSaving || isUploadingFoto}
              className="w-full bg-[#005ba1] text-white font-bold py-3 rounded-lg hover:bg-[#004680] transition-colors shadow-md disabled:opacity-50 mt-4"
            >
              {isSaving ? 'Guardando datos...' : 'Guardar Cambios'}
            </button>
          </div>

          <hr className="my-8 border-gray-100" />

          {/* Acciones de Seguridad */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-2">Seguridad de la Cuenta</h3>
            
            {!isGoogleAcc ? (
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cambiar Contraseña
              </button>
            ) : (
              <p className="text-xs text-gray-500 px-2">Tu cuenta está vinculada con Google. La gestión de contraseñas se realiza desde tu cuenta de Google.</p>
            )}

            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full text-left px-4 py-3 border border-red-200 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              Eliminar Cuenta Permanentemente
            </button>
          </div>

        </div>
      </main>

      {/* MODAL: CAMBIAR CONTRASEÑA */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">Nueva Contraseña</h3>
            <form onSubmit={handleChangePassword}>
              <input
                type="password"
                placeholder="Escribe tu nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#005ba1] mb-2"
                required
              />
              {passError && <p className="text-xs text-red-500 mb-4 font-medium">{passError}</p>}
              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-bold text-white bg-[#005ba1] rounded-lg">Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ELIMINAR CUENTA */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-extrabold text-red-600 mb-2">Eliminar Cuenta</h3>
            <p className="text-sm text-gray-600 mb-4">Esta acción no se puede deshacer. Por favor, escribe la palabra <strong className="text-gray-900">eliminar</strong> para confirmar.</p>
            <input
              type="text"
              placeholder="escribe eliminar"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full border border-red-300 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.toLowerCase() !== 'eliminar' || isSaving}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              >
                Eliminar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PerfilPaciente;