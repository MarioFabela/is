import { guardarEvaluacion, calcularPromediosMedico } from '../services/evaluacionService.js';

export const crearEvaluacion = async (req, res) => {
    try {
        const { medico_id, paciente_id, evaluaciones, comentarios } = req.body;
        
        const datosBD = {
            medico_id,
            paciente_id,
            atencion: evaluaciones.atencion,
            empatia: evaluaciones.empatia,
            claridad: evaluaciones.claridad,
            instalaciones: evaluaciones.instalaciones,
            comentarios
        };

        const data = await guardarEvaluacion(datosBD);
        return res.status(201).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getEstadisticas = async (req, res) => {
    try {
        const { medicoId } = req.params;
        const data = await calcularPromediosMedico(medicoId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};