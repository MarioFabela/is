import { createClient } from '@supabase/supabase-js';

// NOTA: Para eliminar usuarios, necesitas el SUPABASE_SERVICE_ROLE_KEY, no el anónimo.
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const actualizarDatosPerfil = async (userId, datos) => {
  const { data, error } = await supabase
    .from('perfiles')
    .update(datos)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

export const eliminarCuentaPaciente = async (userId) => {
  // 1. Borrado Lógico: Marcamos el perfil como inactivo y anonimizamos un poco por privacidad
  const { error: dbError } = await supabase
    .from('perfiles')
    .update({ 
        activo: false, 
        telefono: 'Eliminado',
        // Opcional: podrías cambiar el nombre a 'Paciente Inactivo'
    })
    .eq('id', userId);

  if (dbError) throw new Error(dbError.message);

  // 2. Suspensión de Autenticación: En lugar de borrar (que causa el error de FK), 
  // le bloqueamos el acceso usando la llave maestra de Supabase Admin
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { ban_duration: '876000h' } // Lo suspendemos por 100 años
  );
  
  if (authError) throw new Error(authError.message);

  return true;
};

export const subirFotoAlStorage = async (userId, file) => {
  // 1. Extraer la extensión del archivo original (ej: .png o .jpg)
  const fileExt = file.originalname.split('.').pop();
  
  // 2. Crear un nombre único para el archivo usando el ID del usuario y un timestamp
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatares/${fileName}`;

  // 3. Subir el archivo binario al bucket 'perfiles' de Supabase
  const { data, error: uploadError } = await supabase.storage
    .from('perfiles')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true // Si ya existe una foto vieja, la sobrescribe
    });

  if (uploadError) throw new Error(`Error en Storage: ${uploadError.message}`);

  // 4. Obtener la URL pública generada automáticamente por Supabase
  const { data: { publicUrl } } = supabase.storage
    .from('perfiles')
    .getPublicUrl(filePath);

  // 5. Actualizar la columna 'foto_url' en la tabla 'perfiles' de la BD
  const { error: dbError } = await supabase
    .from('perfiles')
    .update({ foto_url: publicUrl })
    .eq('id', userId);

  if (dbError) throw new Error(`Error en Base de Datos: ${dbError.message}`);

  return publicUrl;
};