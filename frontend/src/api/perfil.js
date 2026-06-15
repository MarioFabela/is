import { supabaseFrontend } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Obtener datos iniciales del usuario
export const obtenerPerfilActual = async () => {
  const { data: { user }, error: authError } = await supabaseFrontend.auth.getUser();
  if (authError || !user) throw new Error('No hay sesión activa');

  const { data: perfil, error: dbError } = await supabaseFrontend
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (dbError) throw dbError;

  // Verificamos si el proveedor de inicio de sesión fue Google
  const isGoogle = user.app_metadata.providers.includes('google');

  return { user, perfil, isGoogle };
};

// Actualizar datos en nuestro backend Node
export const actualizarPerfilApi = async (userId, datos) => {
  const response = await fetch(`${API_BASE_URL}/perfil/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.error);
  return result.data;
};

// Eliminar cuenta en nuestro backend Node
export const eliminarCuentaApi = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/perfil/${userId}`, {
    method: 'DELETE'
  });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.error);
  return result.data;
};

// Actualizar contraseña directo con Supabase Auth
export const actualizarContrasenaApi = async (nuevaContrasena) => {
  const { error } = await supabaseFrontend.auth.updateUser({ password: nuevaContrasena });
  if (error) throw new Error(error.message);
  return true;
};

// Cerrar sesión
export const cerrarSesionApi = async () => {
  const { error } = await supabaseFrontend.auth.signOut();
  if (error) throw new Error(error.message);
};

export const subirFotoPerfilApi = async (userId, archivoImagen) => {
  try {
    const formData = new FormData();
    formData.append('foto', archivoImagen); // 'foto' coincide con upload.single('foto') del backend

    const response = await fetch(`${API_BASE_URL}/perfil/${userId}/upload-foto`, {
      method: 'POST',
      body: formData // Enviamos el formulario binario directo
    });

    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || 'Error al subir la imagen');

    return result.data; // Retorna { foto_url: "https://..." }
  } catch (error) {
    console.error("Error en subirFotoPerfilApi:", error);
    throw error;
  }
};