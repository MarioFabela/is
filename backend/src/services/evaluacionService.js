import { insertEvaluacion, getEstadisticasMedico } from '../models/evaluacionModels.js';

export const guardarEvaluacion = async (datos) => {
    const { data, error } = await insertEvaluacion(datos);
    if (error) throw new Error(`Error al guardar evaluación: ${error.message}`);
    return data;
};

export const calcularPromediosMedico = async (medicoId) => {
    const { data, error } = await getEstadisticasMedico(medicoId);
    if (error) throw new Error(`Error al obtener estadísticas: ${error.message}`);

    if (!data || data.length === 0) {
        return { atencion: 0, empatia: 0, claridad: 0, instalaciones: 0, total_votos: 0 };
    }

    const total = data.length;
    const sumas = data.reduce((acc, curr) => {
        acc.atencion += curr.atencion;
        acc.empatia += curr.empatia;
        acc.claridad += curr.claridad;
        acc.instalaciones += curr.instalaciones;
        return acc;
    }, { atencion: 0, empatia: 0, claridad: 0, instalaciones: 0 });

    return {
        atencion: (sumas.atencion / total).toFixed(1),
        empatia: (sumas.empatia / total).toFixed(1),
        claridad: (sumas.claridad / total).toFixed(1),
        instalaciones: (sumas.instalaciones / total).toFixed(1),
        total_votos: total
    };
};
