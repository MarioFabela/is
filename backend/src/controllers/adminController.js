import * as adminService from '../services/adminService.js';

export const getDashboardDatos = async (req, res) => {
    try {
        const kpis = await adminService.getDashboardKPIs();
        const consultorios = await adminService.getConsultorios();
        
        return res.status(200).json({ success: true, data: { kpis, consultorios } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getHistorialPacientes = async (req, res) => {
    try {
        const pacientes = await adminService.getHistorialPacientes();
        return res.status(200).json({ success: true, data: pacientes });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getReportesEvaluacion = async (req, res) => {
    try {
        const reportes = await adminService.getReportes();
        return res.status(200).json({ success: true, data: reportes });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const postCrearTurno = async (req, res) => {
    try {
        const data = await adminService.crearTurno(req.body);
        return res.status(201).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getBuscarPacientes = async (req, res) => {
    try {
        const { q } = req.query; // Extraemos el término de búsqueda de la URL (?q=nombre)
        
        if (!q || q.length < 3) {
            return res.status(200).json({ success: true, data: [] });
        }

        const pacientes = await adminService.buscarPacientes(q);
        return res.status(200).json({ success: true, data: pacientes });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const putEstadoConsultorio = async (req, res) => {
    try {
        const { id } = req.params; // Sacamos el ID de la URL
        const { activo } = req.body; // Sacamos el nuevo estado (true/false)
        
        const data = await adminService.cambiarEstadoConsultorio(id, activo);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getConsultorioById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await adminService.getConsultorioById(id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getMedicosList = async (req, res) => {
    try {
        const data = await adminService.getMedicosList();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getHorariosMedico = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await adminService.getHorariosByMedico(id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const upsertHorarios = async (req, res) => {
    try {
        const { id } = req.params;
        const horarios = req.body.horarios || [];
        const data = await adminService.upsertHorariosMedico(id, horarios);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getDiasNoLaborales = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await adminService.getDiasNoLaboralesByMedico(id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const postDiaNoLaboral = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, motivo } = req.body;
        const data = await adminService.addDiaNoLaboral(id, fecha, motivo);
        return res.status(201).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteDiaNoLaboralController = async (req, res) => {
    try {
        const { diaId } = req.params;
        const data = await adminService.deleteDiaNoLaboral(diaId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const postCrearMedico = async (req, res) => {
    try {
        const data = await adminService.crearMedico(req.body);
        return res.status(201).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const putActualizarMedico = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await adminService.actualizarMedico(id, req.body);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteEliminarMedico = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await adminService.eliminarMedico(id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- NUEVO CONTROLADOR PARA VER LISTA DE CITAS ---
export const getCitasMedico = async (req, res) => {
    try {
        const { id } = req.params; // El ID del médico/consultorio
        const data = await adminService.getCitasPorMedico(id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- CONTROLADORES DE ACTIVIDAD Y REASIGNACIÓN ---
export const getActividad = async (req, res) => {
    try {
        const data = await adminService.getActividadConsultorio(req.params.id);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const putReasignarConsultorio = async (req, res) => {
    try {
        const { medicoActualId, nuevoMedicoId, numeroConsultorio } = req.body;
        const data = await adminService.reasignarConsultorio(medicoActualId, nuevoMedicoId, numeroConsultorio);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const putEstadoPaciente = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;
        const data = await adminService.cambiarEstadoPaciente(id, activo);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};