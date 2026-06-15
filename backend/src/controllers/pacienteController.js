import { obtenerDatosDashboard } from '../services/pacienteService.js';

export const getDashboardPaciente = async (req, res) => {
    try {
        // Única declaración de 'id' al inicio del bloque
        const { id } = req.params; 
        console.log("ID recibido en controlador:", id);
        
        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID de paciente requerido' 
            });
        }

        const data = await obtenerDatosDashboard(id);
        
        // Patrón de respuesta estandarizado
        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error("Error crítico en getDashboardPaciente:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};