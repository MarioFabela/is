import supabase from '../config/supabase.js';

export const insertEvaluacion = async (datos) => {
    return await supabase
        .from('evaluaciones_medicas')
        .insert([datos])
        .select()
        .single();
};

export const getEstadisticasMedico = async (medicoId) => {
    // Obtenemos todas las evaluaciones de ese médico
    return await supabase
        .from('evaluaciones_medicas')
        .select('atencion, empatia, claridad, instalaciones')
        .eq('medico_id', medicoId);
};