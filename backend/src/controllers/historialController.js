import { obtenerHistorialPaciente, cancelarCitaPaciente } from '../services/historialService.js';

export const getHistorialCitas = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    if (!pacienteId) {
      return res.status(400).json({ error: "El ID del paciente es requerido." });
    }

    const data = await obtenerHistorialPaciente(pacienteId);
    
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error en getHistorialCitas:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const cancelarCita = async (req, res) => {
  try {
    const { citaId } = req.params;
    
    if (!citaId) return res.status(400).json({ error: "ID de cita requerido." });

    const data = await cancelarCitaPaciente(citaId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    return res.status(500).json({ error: error.message });
  }
};