import supabase from '../config/supabase.js';

// 1. Obtener KPIs del Dashboard
export const getDashboardKPIs = async () => {
    // Obtener inicio y fin del día actual para filtrar citas de hoy
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Pacientes Hoy (Citas programadas o completadas de hoy)
    const { count: pacientesHoy, error: errCitas } = await supabase
        .from('citas')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_hora', startOfDay.toISOString())
        .lte('fecha_hora', endOfDay.toISOString())
        .in('estado', ['programada', 'completada']);

    // Consultorios Activos (Médicos con activo = true)
    const { count: consultoriosActivos, error: errMedicosActivos } = await supabase
        .from('medicos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true);

    // Consultorios Totales
    const { count: consultoriosTotales, error: errMedicosTotales } = await supabase
        .from('medicos')
        .select('*', { count: 'exact', head: true });

    // NUEVO: Órdenes de Farmacia Reales (Consultas de hoy que tienen una receta generada)
    const { count: ordenesFarmacia, error: errFarmacia } = await supabase
        .from('consultas_registros')
        .select('*', { count: 'exact', head: true })
        .gte('fecha', startOfDay.toISOString())
        .lte('fecha', endOfDay.toISOString())
        .not('receta_json', 'is', null); // Solo contamos las que sí traen receta

    if (errCitas || errMedicosActivos || errMedicosTotales || errFarmacia) {
        throw new Error('Error al calcular los KPIs del administrador');
    }

    return {
        pacientesHoy: pacientesHoy || 0,
        consultoriosActivos: consultoriosActivos || 0,
        consultoriosTotales: consultoriosTotales || 0,
        ordenesFarmacia: ordenesFarmacia || 0 // ¡DATO REAL AHORA!
    };
};

// 2. Obtener lista de Consultorios / Médicos
export const getConsultorios = async () => {
    const { data, error } = await supabase
        .from('medicos')
        .select(`
            id,
            especialidad,
            activo,
            duracion_consulta_min,
            numero_consultorio,
            perfiles ( nombre_completo )
        `);

    if (error) throw new Error(error.message);

    return data.map((medico, index) => ({
        id: medico.id,
        // Si tiene un consultorio asignado lo mostramos, si no, usamos un genérico
        nombre: medico.numero_consultorio ? `Consultorio ${medico.numero_consultorio}` : `Consultorio Sin Asignar`,
        especialidad: medico.especialidad,
        estado: medico.activo ? 'OPERATIVO' : 'MANTENIMIENTO',
        medicoManana: medico.perfiles?.nombre_completo || 'No asignado',
        medicoTarde: 'No asignado', 
        tiempoPromedio: medico.duracion_consulta_min
    }));
};

// 3. Obtener Historial de Pacientes (Citas globales)
export const getHistorialPacientes = async () => {
    const { data, error } = await supabase
        .from('citas')
        .select(`
            id,
            fecha_hora,
            estado,
            motivo,
            paciente:id_paciente_cita ( id, nombre_completo, activo ),
            medico:medico_id ( perfiles ( nombre_completo ) )
        `)
        .order('fecha_hora', { ascending: false })
        .limit(50); 

    if (error) throw new Error(error.message);

    return data.map(cita => ({
        cita_id: cita.id,
        id: cita.paciente?.id, // ID Completo necesario para actualizar
        idCorto: cita.paciente?.id ? cita.paciente.id.substring(0, 8).toUpperCase() : 'XXXX',
        nombre: cita.paciente?.nombre_completo,
        pacienteActivo: cita.paciente?.activo, // <-- Dato clave para saber si está bloqueado
        iniciales: cita.paciente?.nombre_completo ? cita.paciente.nombre_completo.substring(0, 2).toUpperCase() : 'XX',
        colorAvatar: cita.paciente?.activo === false ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700',
        hora: new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        fecha: new Date(cita.fecha_hora).toLocaleDateString('es-MX'),
        medico: cita.medico?.perfiles?.nombre_completo,
        motivo: cita.motivo,
        estado: cita.estado === 'completada' ? 'Atendido' : (cita.estado === 'programada' ? 'En Espera' : cita.estado)
    }));
};

// 4. Obtener Reportes y Ranking de Médicos
export const getReportes = async () => {
    // Obtenemos los médicos ordenados por su promedio de estrellas (calculado por tu Trigger en SQL)
    const { data: doctores, error } = await supabase
        .from('medicos')
        .select(`
            id,
            especialidad,
            promedio_estrellas,
            foto_url,
            perfiles ( nombre_completo )
        `)
        .order('promedio_estrellas', { ascending: false });

    if (error) throw new Error(error.message);

    const ranking = doctores.map(doc => ({
        id: doc.id,
        nombre: doc.perfiles?.nombre_completo,
        sede: 'Sede Principal', 
        especialidad: doc.especialidad,
        calificacion: doc.promedio_estrellas,
        estrellas: Math.round(doc.promedio_estrellas),
        encuestas: Math.floor(Math.random() * 100) + 50, // Simulado hasta que agreguemos COUNT a las reseñas
        estado: doc.promedio_estrellas >= 9 ? 'Excelente' : 'Cumple',
        estadoColor: doc.promedio_estrellas >= 9 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800',
        calificacionColor: doc.promedio_estrellas >= 9 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700',
        foto: doc.foto_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=100&auto=format&fit=crop"
    }));

    return {
        kpis: {
            promedioGlobal: ranking.length > 0 ? (ranking.reduce((acc, curr) => acc + Number(curr.calificacion), 0) / ranking.length).toFixed(1) : "0.0",
            tendenciaMes: "+0.2 vs mes anterior",
            totalEncuestas: "354",
            tasaRespuesta: "82% tasa de respuesta",
            categorias: [
                { nombre: "Atención Médica", score: "9.4", porcentaje: 94 },
                { nombre: "Empatía", score: "9.1", porcentaje: 91 },
                { nombre: "Instalaciones", score: "8.5", porcentaje: 85 }
            ]
        },
        doctores: ranking
    };
};

export const crearTurno = async (datosTurno) => {
    // AHORA RECIBIMOS EL paciente_id DESDE EL FRONTEND
    const { paciente_id, medico_id, fecha_hora, motivo } = datosTurno;
    
    // Insertamos la nueva cita en Supabase directamente con ese ID
    const { data, error } = await supabase
        .from('citas')
        .insert([{
            id_paciente_tutor: paciente_id,  // Quién reserva
            id_paciente_cita: paciente_id,   // Quién se atiende
            medico_id: medico_id,
            fecha_hora: fecha_hora,
            motivo: motivo || 'Consulta general',
            sintomas: 'No especificados',
            estado: 'programada'
        }])
        .select();

    if (error) throw new Error(error.message);
    return data;
};

// --- BÚSQUEDA DE PACIENTES PARA EL MODAL ---
export const buscarPacientes = async (termino) => {
    const { data, error } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, email')
        .eq('rol', 'paciente')
        .ilike('nombre_completo', `%${termino}%`) // Busca coincidencias que contengan el término
        .limit(5); // Solo traemos 5 para no saturar el modal

    if (error) throw new Error(error.message);
    return data;
};

// --- ACTUALIZAR ESTADO DEL CONSULTORIO (MÉDICO) ---
export const cambiarEstadoConsultorio = async (id, activo) => {
    const { data, error } = await supabase
        .from('medicos')
        .update({ activo: activo })
        .eq('id', id)
        .select();

    if (error) throw new Error(error.message);
    return data;
};

// Obtener detalle de un consultorio/médico por id
// Obtener detalle de un consultorio/médico por id
export const getConsultorioById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('medicos')
            .select(`
                id,
                especialidad,
                activo,
                duracion_consulta_min,
                numero_consultorio,
                perfiles ( id, nombre_completo, email )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Formateamos la respuesta para el frontend
        return {
            id: data.id,
            nombre: data.numero_consultorio ? `Consultorio ${data.numero_consultorio}` : 'Consultorio Sin Asignar',
            especialidad: data.especialidad,
            activo: data.activo,
            duracion_consulta_min: data.duracion_consulta_min,
            numero_consultorio: data.numero_consultorio,
            foto: null, // Desactivado temporalmente para evitar error 500
            medico: {
                id: data.perfiles?.id,
                nombre_completo: data.perfiles?.nombre_completo,
                email: data.perfiles?.email
            },
            horarios: [] // Desactivado temporalmente para evitar error de relación
        };
    } catch (error) {
        // Esto imprimirá el error exacto en tu terminal para que sepas qué falta en la BD
        console.error("🔥 Error exacto de Supabase en getConsultorioById:", error.message);
        throw new Error(error.message);
    }
};

// Obtener lista de médicos (con datos básicos)
export const getMedicosList = async () => {
    const { data, error } = await supabase
        .from('medicos')
        .select(`id, especialidad, activo, numero_consultorio, perfiles ( id, nombre_completo, email, foto_url )`)
        .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return data.map(m => ({
        id: m.id,
        nombre: m.perfiles?.nombre_completo || 'Sin nombre',
        especialidad: m.especialidad,
        activo: m.activo,
        numero_consultorio: m.numero_consultorio,
        foto: m.perfiles?.foto_url || m.foto_url || null
    }));
};

export const getHorariosByMedico = async (medicoId) => {
    const { data, error } = await supabase
        .from('horarios_atencion')
        .select('id, dia_semana, hora_inicio, hora_fin, duracion_min')
        .eq('medico_id', medicoId)
        .order('dia_semana', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
};

export const upsertHorariosMedico = async (medicoId, horarios) => {
    // horarios: array of { dia_semana, hora_inicio, hora_fin, duracion_min }
    // For simplicity we delete existing horarios for medico and insert the provided ones
    const { error: delErr } = await supabase.from('horarios_atencion').delete().eq('medico_id', medicoId);
    if (delErr) throw new Error(delErr.message);

    const payload = horarios.map(h => ({ medico_id: medicoId, dia_semana: h.dia_semana, hora_inicio: h.hora_inicio, hora_fin: h.hora_fin, duracion_min: h.duracion_min }));
    const { data, error } = await supabase.from('horarios_atencion').insert(payload).select();
    if (error) throw new Error(error.message);
    return data;
};

export const getDiasNoLaboralesByMedico = async (medicoId) => {
    const { data, error } = await supabase
        .from('dias_no_laborales')
        .select('id, fecha, motivo')
        .eq('medico_id', medicoId)
        .order('fecha', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
};

export const addDiaNoLaboral = async (medicoId, fecha, motivo) => {
    const { data, error } = await supabase.from('dias_no_laborales').insert([{ medico_id: medicoId, fecha, motivo }]).select();
    if (error) throw new Error(error.message);
    return data;
};

export const deleteDiaNoLaboral = async (id) => {
    const { data, error } = await supabase.from('dias_no_laborales').delete().eq('id', id).select();
    if (error) throw new Error(error.message);
    return data;
};

// --- CREAR MÉDICO (Auth + Perfil + Médico) ---
export const crearMedico = async (medicoData) => {
    const { 
        nombreCompleto, email, password, telefono, 
        especialidad, cedula_profesional, numero_consultorio, duracion_consulta_min 
    } = medicoData;
    
    // 1. Crear el usuario en Supabase Auth
    // Nota: Usamos auth.admin para no cerrar la sesión del administrador actual
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true // Autoconfirmado
    });

    if (authError) throw new Error("Error creando acceso: " + authError.message);

    const newUserId = authData.user.id;

    // 2. Crear o actualizar el Perfil (Usamos upsert por si tienes un Trigger automático)
    const { error: perfilError } = await supabase
        .from('perfiles')
        .upsert({
            id: newUserId,
            nombre_completo: nombreCompleto,
            email: email,
            telefono: telefono || null,
            rol: 'medico', // Asignamos el rol directamente
            activo: true
        });

    if (perfilError) throw new Error("Error creando perfil: " + perfilError.message);

    // 3. Vincularlo como Médico
    const { data, error: medicoError } = await supabase
        .from('medicos')
        .insert([{
            perfil_id: newUserId,
            especialidad,
            cedula_profesional,
            numero_consultorio,
            duracion_consulta_min: duracion_consulta_min || 30
        }])
        .select();

    if (medicoError) throw new Error("Error registrando especialidad: " + medicoError.message);

    return data;
};

// --- ACTUALIZAR DATOS DEL MÉDICO ---
export const actualizarMedico = async (id, medicoData) => {
    const { especialidad, cedula_profesional, numero_consultorio, duracion_consulta_min } = medicoData;
    
    const { data, error } = await supabase
        .from('medicos')
        .update({ 
            especialidad, 
            cedula_profesional, 
            numero_consultorio, 
            duracion_consulta_min 
        })
        .eq('id', id)
        .select();

    if (error) throw new Error(error.message);
    return data;
};

// --- ELIMINAR MÉDICO (Borrado físico) ---
export const eliminarMedico = async (id) => {
    const { data, error } = await supabase
        .from('medicos')
        .delete()
        .eq('id', id)
        .select();

    // Importante: Si el médico ya tiene citas o evaluaciones registradas, 
    // Supabase bloqueará el borrado por seguridad (llaves foráneas). 
    // En la vida real se prefiere usar la función que ya tienes de "cambiarEstadoConsultorio" (Borrado lógico).
    if (error) throw new Error(error.message);
    return data;
};

// --- OBTENER CITAS DE UN MÉDICO ESPECÍFICO (Para el botón "Ver Lista") ---
export const getCitasPorMedico = async (medicoId) => {
    // Obtenemos citas desde el inicio del día actual
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('citas')
        .select(`
            id,
            fecha_hora,
            estado,
            motivo,
            paciente:id_paciente_cita ( nombre_completo, email )
        `)
        .eq('medico_id', medicoId)
        .gte('fecha_hora', startOfDay.toISOString())
        .order('fecha_hora', { ascending: true }); // Ordenadas por hora

    if (error) throw new Error(error.message);

    // Formateamos para que el frontend lo consuma fácil
    return data.map(cita => ({
        id: cita.id,
        hora: new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        paciente: cita.paciente?.nombre_completo || 'Paciente Desconocido',
        motivo: cita.motivo,
        estado: cita.estado === 'completada' ? 'Atendido' : (cita.estado === 'programada' ? 'En Espera' : cita.estado)
    }));
};

// --- OBTENER MÉTRICAS E HISTORIAL DEL CONSULTORIO/MÉDICO ---
export const getActividadConsultorio = async (medicoId) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. Métricas: Contar citas completadas hoy por este médico
    const { count: atendidosHoy } = await supabase
        .from('citas')
        .select('*', { count: 'exact', head: true })
        .eq('medico_id', medicoId)
        .gte('fecha_hora', startOfDay.toISOString())
        .in('estado', ['completada']);

    // 2. Historial: Últimas 5 citas/movimientos de la agenda
    const { data: historial } = await supabase
        .from('citas')
        .select('id, fecha_hora, estado, paciente:id_paciente_cita(nombre_completo)')
        .eq('medico_id', medicoId)
        .order('fecha_hora', { ascending: false })
        .limit(5);

    return {
        atendidosHoy: atendidosHoy || 0,
        historial: (historial || []).map(cita => ({
            id: cita.id,
            titulo: cita.estado === 'programada' ? 'Cita Agendada' : 'Consulta Completada',
            descripcion: `Paciente: ${cita.paciente?.nombre_completo || 'Desconocido'}`,
            hora: new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            estado: cita.estado
        }))
    };
};

// --- REASIGNAR CONSULTORIO A OTRO MÉDICO ---
export const reasignarConsultorio = async (medicoActualId, nuevoMedicoId, numeroConsultorio) => {
    // 1. Le quitamos el espacio físico (número) al doctor anterior
    if (medicoActualId) {
        await supabase.from('medicos').update({ numero_consultorio: null }).eq('id', medicoActualId);
    }
    // 2. Le asignamos ese mismo espacio físico al nuevo doctor seleccionado
    const { data, error } = await supabase
        .from('medicos')
        .update({ numero_consultorio: numeroConsultorio })
        .eq('id', nuevoMedicoId)
        .select();

    if (error) throw new Error(error.message);
    return data;
};

// --- CAMBIAR ESTADO (SUSPENDER/REACTIVAR) PACIENTE ---
export const cambiarEstadoPaciente = async (id, activo) => {
    const { data, error } = await supabase
        .from('perfiles')
        .update({ activo: activo })
        .eq('id', id)
        .select();

    if (error) throw new Error(error.message);
    return data;
};