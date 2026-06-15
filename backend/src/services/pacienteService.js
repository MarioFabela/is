import { 
    getPerfilById, 
    getAuthUserById, 
    insertPerfil, 
    updatePerfil, // <-- Asegúrate de importar la nueva función
    getProximaCita, 
    getExpedienteReciente,
    getSignosVitales,
    getEquipoMedicoActivo,
    getDocumentosDelPaciente 
} from '../models/pacienteModels.js';

export const obtenerDatosDashboard = async (pacienteId) => {
    // 1. Obtener datos utilizando Promise.all de forma masiva
    let [
        { data: perfil, error: errPerfil },
        { data: citas, error: errCitas },
        { data: expediente, error: errExpediente },
        { data: signosDb, error: errSignos },
        { data: medicosDb, error: errMedicos }
    ] = await Promise.all([
        getPerfilById(pacienteId),
        getProximaCita(pacienteId),
        getExpedienteReciente(pacienteId),
        getSignosVitales(pacienteId),
        getEquipoMedicoActivo() 
    ]);

    // Rescate de perfil inexistente
    if (errPerfil || !perfil) {
        console.log(`Perfil no encontrado para el UUID ${pacienteId}. Recuperando desde auth.users...`);
        const { data: { user }, error: errAuthUser } = await getAuthUserById(pacienteId);

        if (errAuthUser || !user) throw new Error('El usuario no existe en el sistema de autenticación.');

        const nombreRegistrado = user.user_metadata?.full_name || user.email.split('@')[0];

        const { data: nuevoPerfil, error: errInsert } = await insertPerfil({ 
            id: pacienteId, 
            email: user.email, 
            nombre_completo: nombreRegistrado, 
            rol: 'paciente' 
        });

        if (errInsert) throw new Error('Error al inicializar el perfil clínico del paciente.');
        perfil = nuevoPerfil;
    }
// --- SOLUCIÓN AL "Hola Usuario" ---
    // Si el nombre está roto, tiene la palabra "Usuario" o está vacío
    if (!perfil.nombre_completo || perfil.nombre_completo.includes('Usuario')) {
        console.log(`[Corrección] Intentando recuperar nombre real para: ${pacienteId}`);
        
        const { data: authData, error: authError } = await getAuthUserById(pacienteId);

        if (authError) {
            // Si ves este error en tu consola, necesitas cambiar tu SUPABASE_KEY en el .env 
            // por la llave "service_role" de Supabase.
            console.error("❌ Error de permisos Auth.Admin:", authError.message);
        } else if (authData && authData.user) {
            const nombreReal = authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0];
            
            if (nombreReal && !nombreReal.includes('Usuario')) {
                perfil.nombre_completo = nombreReal;
                
                // Corregimos la base de datos (nombre y email que el bot rompió)
                await updatePerfil(pacienteId, { 
                    nombre_completo: nombreReal,
                    email: authData.user.email 
                });
                console.log("✅ Perfil restaurado con éxito a:", nombreReal);
            }
        }
    }

    // Extracción segura del primer nombre
    const primerNombre = perfil.nombre_completo ? perfil.nombre_completo.split(' ')[0] : 'Paciente';
    // 3. Formatear Documentos Recientes
    // 3. Formatear Documentos Recientes (LOGICA REAL)
    const { citas: citasCompletadas, recetas, ordenes } = await getDocumentosDelPaciente(pacienteId);
    
    // Mapeamos las recetas
    const docsRecetas = recetas.map(r => {
        const citaBase = citasCompletadas.find(c => c.id === r.cita_id);
        return {
            id: r.id,
            fecha: new Date(r.fecha_creacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
            fechaReal: new Date(r.fecha_creacion),
            prueba: 'Receta Médica',
            estado: 'Completado',
            tipo: 'receta',
            citaParaReact: citaBase // Guardamos la cita para enviarla al Frontend
        };
    });

    // Mapeamos las ordenes de laboratorio
    const docsOrdenes = ordenes.map(o => {
        const citaBase = citasCompletadas.find(c => c.id === o.cita_id);
        return {
            id: o.id,
            fecha: new Date(o.fecha_creacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
            fechaReal: new Date(o.fecha_creacion),
            prueba: 'Orden de Laboratorio',
            estado: 'Completado',
            tipo: 'orden',
            citaParaReact: citaBase
        };
    });

    // Juntamos ambos, los ordenamos del más nuevo al más viejo, y tomamos los últimos 5
    const documentos = [...docsRecetas, ...docsOrdenes]
        .sort((a, b) => b.fechaReal - a.fechaReal)
        .slice(0, 5);

    // --- SOLUCIÓN A LOS SIGNOS VITALES FALSOS ---
    // Si la BD retorna datos, los muestra. Si retorna Null o Undefined, pone "Sin registrar".
    let signosVitalesFormatted = signosDb ? {
        ritmoCardiaco: { valor: signosDb.ritmo_cardiaco || '--', estado: signosDb.estado_ritmo || 'Sin registrar' },
        presion: { valor: signosDb.presion_arterial || '--/--', estado: signosDb.estado_presion || 'Sin registrar' },
        peso: { valor: signosDb.peso || '--', estado: signosDb.estado_peso || 'Sin registrar' },
        glucosa: { valor: signosDb.glucosa || '--', estado: signosDb.estado_glucosa || 'Sin registrar' }
    } : {
        ritmoCardiaco: { valor: '--', estado: 'Sin registrar' },
        presion: { valor: '--/--', estado: 'Sin registrar' },
        peso: { valor: '--', estado: 'Sin registrar' },
        glucosa: { valor: '--', estado: 'Sin registrar' }
    };

    // 5. Formatear Directorio Médico
    let equipoMedico = [];
    if (medicosDb && medicosDb.length > 0) {
        equipoMedico = medicosDb.map(med => ({
            id: med.id,
            nombre: `Dr(a). ${med.perfiles?.nombre_completo || 'Especialista'}`,
            especialidad: med.especialidad,
            estrellas: med.promedio_estrellas || 0.0,
            foto: med.foto_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${med.id}`
        }));
    }

    // 6. Retorno Final
    return {
        paciente: { nombre: primerNombre, nombre_completo: perfil.nombre_completo },
        proximaCita: citas && citas.length > 0 ? citas[0] : null,
        documentos: documentos,
        signosVitales: signosVitalesFormatted,
        equipoMedico: equipoMedico 
    };
};

