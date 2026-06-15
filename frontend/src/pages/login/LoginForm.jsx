import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabaseFrontend } from '../../api/supabaseClient';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  // Estado para controlar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  // --- LÓGICA DE LOGIN TRADICIONAL ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // 1. Iniciamos sesión directamente con Supabase en el frontend
      const { data: authData, error: authError } = await supabaseFrontend.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        throw new Error('Credenciales incorrectas o usuario no encontrado');
      }

      console.log('Login exitoso en el navegador:', authData);

      // 2. Buscamos el rol del usuario en la tabla perfiles
      const { data: perfilData, error: perfilError } = await supabaseFrontend
        .from('perfiles')
        .select('rol')
        .eq('id', authData.user.id)
        .single();

      if (perfilError || !perfilData) {
        throw new Error('No se pudo verificar el rol de tu cuenta.');
      }

      const userRole = perfilData.rol;

      // 3. Redirigimos según el rol exacto de la base de datos
      switch (userRole) {
        case 'administrador':
          navigate('/panel-admin');
          break;
        case 'medico':
          navigate('/dashboard-medicos');
          break;
        case 'paciente':
        default:
          navigate('/dashboard-pacientes');
          break;
      }
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Credenciales incorrectas o error de conexión.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabaseFrontend.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:5173/dashboard-pacientes' 
        }
      });

      if (error) throw new Error(error.message);
      
    } catch (err) {
      setError('Error al conectar con Google: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8fbff] relative font-sans">
      
      {/* Top Navbar */}
      <div className="absolute top-0 w-full flex justify-end items-center p-4 bg-white shadow-sm">
        <div className="flex items-center gap-2 pr-4">
          <img src="/logo2.png" alt="CentroVital Mini" className="w-10 h-10 object-contain" />
          <span className="text-sm font-bold text-[#005ba1]">CentroVital</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full mt-12">
        
        {/* Logo and Titles */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo2.png" alt="CentroVital Logo" className="w-50 h-50 object-contain mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Bienvenido</h2>
          <p className="text-sm text-gray-500 text-center">
            Ingrese sus credenciales para acceder al sistema clínico de precisión.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-md p-8 shadow-sm">
          
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                Correo Electrónico o Usuario
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@clinica.com"
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#005ba1] focus:border-[#005ba1]"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#005ba1] focus:border-[#005ba1]"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs text-center font-semibold bg-red-50 py-1 rounded">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#005ba1] hover:bg-[#004680] text-white font-bold py-3 px-4 rounded transition duration-200 flex justify-center items-center gap-2 mt-2 cursor-pointer"
            >
              INGRESAR 
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </form>

          {/* DIVISOR VISUAL */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold">O INGRESA CON</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* BOTÓN DE GOOGLE */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 rounded transition duration-200 text-sm tracking-wide flex justify-center items-center gap-3 shadow-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Links */}
          <div className="mt-6 text-center space-y-4">
            <Link to="/forgot-password" className="text-[11px] text-[#005ba1] font-semibold hover:underline block mx-auto">
              ¿Olvidó su contraseña?
            </Link>
            <div className="border-t border-gray-100 pt-4 mt-4">
              <span className="text-[11px] text-gray-500">¿No tienes una cuenta? </span>
              <Link to="/register" className="text-[11px] text-[#005ba1] font-bold hover:underline">
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;