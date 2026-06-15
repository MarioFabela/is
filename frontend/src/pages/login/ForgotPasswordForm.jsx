import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordService } from '../../api/auth';
import { supabaseFrontend } from '../../api/supabaseClient';

const ForgotPasswordForm = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true); // Desactiva el botón mientras carga

    try {
      // Llamada limpia a nuestra API centralizada
      const data = await forgotPasswordService(email);
      
      setSuccess(data.message || 'Se ha enviado un enlace a su correo.');
      setEmail('');
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
          <img src="/logo.png" alt="CentroVital Logo" className="w-50 h-50 object-contain mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Recuperar Contraseña</h2>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            Ingrese su correo electrónico y le enviaremos un enlace seguro para restablecer su acceso.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-md p-8 shadow-sm">
          <form onSubmit={handleResetRequest} className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#005ba1] focus:border-[#005ba1]"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Mensajes de Alerta */}
            {error && <p className="text-red-500 text-xs text-center font-bold bg-red-50 py-1.5 rounded">{error}</p>}
            {success && <p className="text-green-600 text-xs text-center font-bold bg-green-50 py-1.5 rounded border border-green-200">{success}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-bold py-3 px-4 rounded transition duration-200 text-sm tracking-wide flex justify-center items-center gap-2 mt-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#005ba1] hover:bg-[#004680]'}`}
            >
              {isLoading ? 'ENVIANDO ENLACE...' : 'ENVIAR ENLACE'}
            </button>
          </form>

          {/* Enlace de regreso */}
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

export default ForgotPasswordForm;