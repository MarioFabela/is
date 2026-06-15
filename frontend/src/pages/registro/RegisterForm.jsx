import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { registerUserService } from '../../api/auth'; 
import { supabaseFrontend } from '../../api/supabaseClient';

// Lista de países con las URLs de sus banderas reales
const paises = [
  { codigo: '+52', bandera: 'https://flagcdn.com/w20/mx.png', nombre: 'México' },
  { codigo: '+1', bandera: 'https://flagcdn.com/w20/us.png', nombre: 'Estados Unidos' },
  { codigo: '+1', bandera: 'https://flagcdn.com/w20/ca.png', nombre: 'Canadá' },
  { codigo: '+33', bandera: 'https://flagcdn.com/w20/fr.png', nombre: 'Francia' },
  { codigo: '+55', bandera: 'https://flagcdn.com/w20/br.png', nombre: 'Brasil' }
];

const RegisterForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Estados para manejar el menú de banderas
  const [paisSeleccionado, setPaisSeleccionado] = useState(paises[0]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)+$/;
    if (!nombreRegex.test(formData.nombreCompleto.trim())) {
      newErrors.nombreCompleto = 'Debe contener al menos nombre y apellido, sin números ni símbolos.';
    }

    if (formData.fechaNacimiento) {
      const hoy = new Date();
      const fechaNac = new Date(formData.fechaNacimiento);
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mes = hoy.getMonth() - fechaNac.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
      if (edad < 18) {
        newErrors.fechaNacimiento = 'Debes ser mayor de edad para registrarte.';
      }
    }

    const telefonoRegex = /^\d{10}$/;
    if (!telefonoRegex.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener exactamente 10 dígitos.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido.';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Debe tener min. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({}); 

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return; 
    }

    try {
      // Concatenamos el código seleccionado con el teléfono al enviar
      const dataToSend = {
        ...formData,
        telefono: `${paisSeleccionado.codigo} ${formData.telefono}`
      };

      const data = await registerUserService(dataToSend);
      
      setSuccess(data.message);
      setFormData({ nombreCompleto: '', fechaNacimiento: '', telefono: '', email: '', password: '', confirmPassword: '' });
      setPaisSeleccionado(paises[0]); // Reiniciamos a México
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabaseFrontend.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:5173/agendar-cita' 
        }
      });

      if (error) throw new Error(error.message);
      
    } catch (err) {
      setError('Error al conectar con Google: ' + err.message);
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
    <div className="min-h-screen flex flex-col items-center bg-[#f8fbff] relative font-sans py-12">
      
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

      <div className="flex flex-col items-center justify-center flex-1 w-full mt-8">
        
        <div className="flex flex-col items-center mb-8">
          <img src="/logo2.png" alt="CentroVital Logo" className="w-50 h-50 object-contain mb-3" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Crear Cuenta</h2>
          <p className="text-sm text-gray-500 text-center">
            Complete sus datos para acceder al portal de salud.
          </p>
        </div>

        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-md p-8 shadow-sm">
          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* Nombre Completo */}
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">Nombre Completo</label>
              <div className="relative">
                <input
                  type="text"
                  name="nombreCompleto"
                  value={formData.nombreCompleto}
                  onChange={handleChange}
                  placeholder="Ej: Juan Pérez"
                  className={`w-full pl-4 pr-10 py-2.5 border rounded text-sm focus:outline-none focus:ring-1 ${fieldErrors.nombreCompleto ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#005ba1] focus:border-[#005ba1]'}`}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              </div>
              {fieldErrors.nombreCompleto && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.nombreCompleto}</p>}
            </div>

            {/* Fecha y Teléfono */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">Fecha de Nacimiento</label>
                <div className="relative">
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    className={`w-full pl-3 pr-9 py-2.5 border rounded text-sm text-gray-700 focus:outline-none focus:ring-1 ${fieldErrors.fechaNacimiento ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#005ba1] focus:border-[#005ba1]'}`}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  </div>
                </div>
                {fieldErrors.fechaNacimiento && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.fechaNacimiento}</p>}
              </div>
              
              {/* COMPONENTE PERSONALIZADO: TELÉFONO CON BANDERAS */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">Teléfono</label>
                {/* onMouseLeave permite que el menú se cierre solo si el usuario mueve el cursor fuera */}
                <div className="relative flex" onMouseLeave={() => setMostrarDropdown(false)}>
                  
                  {/* Botón del selector de País */}
                  <button
                    type="button"
                    onClick={() => setMostrarDropdown(!mostrarDropdown)}
                    className="flex items-center gap-1.5 bg-gray-50 border border-gray-300 border-r-0 text-gray-700 text-[13px] rounded-l focus:outline-none focus:ring-1 focus:ring-[#005ba1] focus:border-[#005ba1] pl-3 pr-2 py-2.5 cursor-pointer"
                  >
                    <img src={paisSeleccionado.bandera} alt="Bandera" className="w-5 h-3.5 object-cover rounded-sm" />
                    <span className="font-medium">{paisSeleccionado.codigo}</span>
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>

                  {/* Menú Desplegable con z-20 para que flote sobre el campo de email */}
                  {mostrarDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20 overflow-hidden">
                      {paises.map((pais, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2.5 hover:bg-blue-50 cursor-pointer text-[13px] transition-colors"
                          onClick={() => {
                            setPaisSeleccionado(pais);
                            setMostrarDropdown(false);
                          }}
                        >
                          <img src={pais.bandera} alt={pais.nombre} className="w-5 h-3.5 object-cover rounded-sm border border-gray-100" />
                          <span className="text-gray-700 font-bold w-8">{pais.codigo}</span>
                          <span className="text-gray-500 text-xs truncate">{pais.nombre}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input de Dígitos */}
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="5500000000"
                    className={`w-full pl-2 pr-8 py-2.5 border rounded-r text-sm focus:outline-none focus:ring-1 ${fieldErrors.telefono ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#005ba1] focus:border-[#005ba1]'}`}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                </div>
                {fieldErrors.telefono && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.telefono}</p>}
              </div>
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nombre@ejemplo.com"
                  className={`w-full pl-4 pr-10 py-2.5 border rounded text-sm focus:outline-none focus:ring-1 ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#005ba1] focus:border-[#005ba1]'}`}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
              </div>
              {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.email}</p>}
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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
              
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">Confirmar Contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
            </div>

            {error && <p className="text-red-500 text-xs text-center font-bold bg-red-50 py-1.5 rounded">{error}</p>}
            {success && <p className="text-green-600 text-xs text-center font-bold bg-green-50 py-1.5 rounded border border-green-200">{success}</p>}

            <button
              type="submit"
              className="w-full bg-[#005ba1] hover:bg-[#004680] text-white font-bold py-3 px-4 rounded transition duration-200 text-sm tracking-wide flex justify-center items-center gap-2 mt-2"
            >
              REGISTRARSE
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold">O REGÍSTRATE CON</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 rounded transition duration-200 text-sm tracking-wide flex justify-center items-center gap-3 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Continuar con Google
          </button>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-[11px] text-[#005ba1] font-bold hover:underline">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterForm;