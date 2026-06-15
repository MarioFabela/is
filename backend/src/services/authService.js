import supabase from '../config/supabase.js';

// --- LOGEAR USUARIO ---
export const loginUser = async (email, password) => {
    // 1. Validar credenciales con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (authError) {
        throw new Error(authError.message);
    }

    // 2. Buscar el rol en la tabla perfiles usando el ID del usuario
    const { data: profileData, error: profileError } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', authData.user.id)
        .single();

    if (profileError) {
        throw new Error('No se pudo obtener el perfil del usuario.');
    }

    // 3. Devolver los datos de sesión junto con el rol
    return {
        session: authData.session,
        user: authData.user,
        rol: profileData.rol 
    };
};

// --- REGISTRAR USUARIO ---
export const registerUser = async ({ email, password, nombreCompleto, telefono, fechaNacimiento }) => {
    // 1. Crear el usuario en auth.users de Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { full_name: nombreCompleto }
        }
    });

    if (authError) throw new Error(authError.message);
    if (!authData?.user) throw new Error('No se pudo crear la sesión del usuario.');

    // 2. Modificar la tabla public.perfiles que el Trigger creó automáticamente
    const { error: profileError } = await supabase
        .from('perfiles')
        .update({
            nombre_completo: nombreCompleto,
            telefono: telefono,
            fecha_nacimiento: fechaNacimiento
        })
        .eq('id', authData.user.id);

    if (profileError) {
        throw new Error(`Usuario autenticado, pero falló el perfil: ${profileError.message}`);
    }

    return authData;
};

// --- ENVIAR ENLACE DE RECUPERACIÓN ---
export const sendPasswordReset = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:5173/reset-password', 
    });

    if (error) throw new Error(error.message);
    return data;
};