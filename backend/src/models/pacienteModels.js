import supabase from '../config/supabase.js';

export const getPerfilById = async (pacienteId) => {
    return await supabase
        .from('perfiles')
        .select('nombre_completo, email')
        .eq('id', pacienteId)
        .maybeSingle();
};

export const getAuthUserById = async (pacienteId) => {
    return await supabase.auth.admin.getUserById(pacienteId);
};

export const insertPerfil = async (perfilData) => {
    return await supabase
        .from('perfiles')
        .insert([perfilData])
        .select()
        .single(); // Aquí sí usamos single() porque acaba de ser insertado
};

export const updatePerfil = async (pacienteId, datos) => {
    return await supabase
        .from('perfiles')
        .update(datos)
        .eq('id', pacienteId);
};

export const getProximaCita = async (pacienteId) => {
    return await supabase
        .from('citas')
        .select(`
            id,
            fecha_hora,
            estado,
            paciente_dependiente,
            medicos (
                especialidad,
                perfiles ( nombre_completo )
            )
        `)
        .eq('id_paciente_cita', pacienteId)  // ✅ sigue buscando por el usuario logueado
        .in('estado', ['programada', 'modificada'])
        .gte('fecha_hora', new Date().toISOString())
        .order('fecha_hora', { ascending: true })
        .limit(1);
};

export const getExpedienteReciente = async (pacienteId) => {
    return await supabase
        .from('expedientes_clinicos')
        .select(`
            id,
            consultas_registros (
                id,
                fecha,
                folio_receta
            )
        `)
        .eq('paciente_id', pacienteId)
        .maybeSingle(); 
};

export const getSignosVitales = async (pacienteId) => {
    return await supabase
        .from('signos_vitales')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('fecha_registro', { ascending: false })
        .limit(1)
        .maybeSingle(); 
};

export const getEquipoMedicoActivo = async () => {
    return await supabase
        .from('medicos')
        .select(`
            id,
            especialidad,
            promedio_estrellas,
            foto_url,
            perfiles (
                nombre_completo
            )
        `)
        .eq('activo', true)
        .order('promedio_estrellas', { ascending: false })
        .limit(4); // Traemos un top 4 de médicos activos
};

export const getDocumentosDelPaciente = async (pacienteId) => {
    // 1. Obtenemos las citas que ya sucedieron para sacar sus IDs
    const { data: citas } = await supabase
        .from('citas')
        .select('id, medico_id, estado')
        .eq('id_paciente_cita', pacienteId)
        .eq('estado', 'completada');

    if (!citas || citas.length === 0) return { citas: [], recetas: [], ordenes: [] };

    const citaIds = citas.map(c => c.id);

    // 2. Traemos las recetas y ordenes que pertenezcan a esas citas
    const [resRecetas, resOrdenes] = await Promise.all([
        supabase.from('recetas').select('id, fecha_creacion, cita_id').in('cita_id', citaIds),
        supabase.from('ordenes_laboratorio').select('id, fecha_creacion, cita_id').in('cita_id', citaIds)
    ]);

    return { 
        citas, 
        recetas: resRecetas.data || [], 
        ordenes: resOrdenes.data || [] 
    };
};