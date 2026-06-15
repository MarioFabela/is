import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const obtenerHistorialPaciente = async (usuarioId) => {
    const { data, error } = await supabase
        .from('citas')
        .select(`
            id,
            fecha_hora,
            estado,
            medicos (
                id,
                especialidad,
                numero_consultorio,
                perfiles (nombre_completo)
            ),
            consultas_registros (id),
            resenas (id)
        `)
        .eq('id_paciente_tutor', usuarioId)
        .order('fecha_hora', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map(cita => {
        const nombreDoctor = cita.medicos?.perfiles?.nombre_completo || 'Médico Asignado';
        const iniciales = nombreDoctor.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const fechaObj = new Date(cita.fecha_hora);

        // Supabase devuelve arrays si usas relaciones (joins)
        const tieneReceta = cita.consultas_registros && cita.consultas_registros.length > 0;
        const estaEvaluado = cita.resenas && cita.resenas.length > 0;

        return {
            id: cita.id,
            medicoId: cita.medicos?.id,
            fecha: fechaObj.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
            hora: fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }),
            doctor: nombreDoctor,
            especialidad: cita.medicos?.especialidad || 'General',
            consultorio: cita.medicos?.numero_consultorio || 'Por asignar',
            iniciales: iniciales,
            evaluado: estaEvaluado,
            tieneReceta: tieneReceta,
            fechaHoraIso: cita.fecha_hora,
            estado: cita.estado
        };
    });
}; // <-- La llave que cerraba la función anterior estaba mal puesta

// Ahora está fuera, como una función independiente
export const cancelarCitaPaciente = async (citaId) => {
    const { data, error } = await supabase
        .from('citas')
        .update({ estado: 'cancelada' })
        .eq('id', citaId)
        .select()
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
};