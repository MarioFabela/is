import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabaseFrontend } from '../../api/supabaseClient';

const ResetPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para mostrar/ocultar las contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  // Funciones para limpiar el error individual al escribir
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: null });
  };

  const validateForm = () => {
    const newErrors = {};

    // Contraseña: 1 Mayúscula, 1 Minúscula, 1 Número, 1 Especial, Mínimo 8 caracteres
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = 'Debe tener min. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.';
    }

    // Confirmar Contraseña
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    return newErrors;
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    // 1. Ejecutar validaciones locales
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // 2. Usar el cliente de Supabase para actualizar la contraseña de la sesión actual
      const { error: updateError } = await supabaseFrontend.auth.updateUser({
        password: password
      });

      if (updateError) throw new Error(updateError.message || 'Error al actualizar la contraseña.');

      // 3. Éxito y redirección
      setSuccess('Contraseña actualizada con éxito. Redirigiendo al inicio de sesión...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoClick = async () => {
    try {
      // 1. Verificamos si hay una sesión activa en el navegador
      const { data: { session }, error: authError } = await supabaseFrontend.auth.getSession();

      // Si no hay sesión, vamos directo al login
      if (authError || !session) {
        navigate('/login');
        return;
      }

      // 2. Si hay sesión, consultamos su rol en la base de datos
      const { data: perfil, error: perfilError } = await supabaseFrontend
        .from('perfiles')
        .select('rol')
        .eq('id', session.user.id)
        .single();

      if (perfilError) throw perfilError;

      // 3. Redireccionamos según el rol
      switch (perfil.rol) {
        case 'administrador':
          navigate('/dashboard');
          break;
        case 'medico':
          navigate('/gestion-pacientes');
          break;
        case 'paciente':
        default:
          navigate('/agendar-cita');
          break;
      }
    } catch (err) {
      console.error('Error al verificar la sesión:', err.message);
      navigate('/login'); // Ante cualquier error, lo más seguro es enviarlo al login
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8fbff] relative font-sans">
      
      {/* Top Navbar */}
          <div className="absolute top-0 w-full flex justify-end items-center p-4 bg-white shadow-sm">
            <button 
              onClick={handleLogoClick}
              type="button"
              className="flex items-center gap-2 pr-4 hover:opacity-80 transition-opacity focus:outline-none cursor-pointer bg-transparent border-none"
            >
              <img src="/logo2.png" alt="CentroVital Mini" className="w-10 h-10 object-contain" />
              <span className="text-sm font-bold text-[#005ba1]">CentroVital</span>
            </button>
          </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full mt-12">
        
        {/* Logo and Titles */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo2.png" alt="CentroVital Logo" className="w-50 h-50 object-contain mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Nueva Contraseña</h2>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            Cree una nueva credencial de acceso para su cuenta. Asegúrese de que sea segura.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-md p-8 shadow-sm">
          <form onSubmit={handleReset} className="space-y-5">
            
            {/* Contraseña */}
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={`w-full pl-4 pr-10 py-2.5 border rounded text-sm focus:outline-none focus:ring-1 ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#005ba1] focus:border-[#005ba1]'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#005ba1] transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-500 text-[10px] mt-1 font-semibold leading-tight">{fieldErrors.password}</p>}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="••••••••"
                  className={`w-full pl-4 pr-10 py-2.5 border rounded text-sm focus:outline-none focus:ring-1 ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#005ba1] focus:border-[#005ba1]'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#005ba1] transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 font-semibold leading-tight">{fieldErrors.confirmPassword}</p>}
            </div>

            {/* Mensajes Generales */}
            {error && <p className="text-red-500 text-xs text-center font-bold bg-red-50 py-1.5 rounded">{error}</p>}
            {success && <p className="text-green-600 text-xs text-center font-bold bg-green-50 py-1.5 rounded border border-green-200">{success}</p>}

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-bold py-3 px-4 rounded transition duration-200 text-sm tracking-wide flex justify-center items-center gap-2 mt-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#005ba1] hover:bg-[#004680]'}`}
            >
              {isLoading ? 'ACTUALIZANDO...' : 'GUARDAR CONTRASEÑA'}
            </button>
          </form>

          {/* Enlace de regreso (opcional en esta vista, pero útil por si el token expiró) */}
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <Link to="/login" className="text-[11px] text-[#005ba1] font-bold hover:underline flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResetPasswordForm;