import { obtenerDisponibilidad } from '../services/disponibilidadService.js';

export const getDisponibilidad = async (req, res) => {
  try {
    const { fecha } = req.params;
    
    // Validación de formato
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ error: "Formato de fecha inválido. Use YYYY-MM-DD." });
    }

    const data = await obtenerDisponibilidad(fecha);
    
    // Respuesta exitosa estandarizada
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error en getDisponibilidad:", error);
    // Respuesta de error estandarizada
    return res.status(500).json({ error: error.message });
  }
};