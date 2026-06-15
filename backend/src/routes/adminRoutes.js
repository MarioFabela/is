import { Router } from 'express';
import { 
    getDashboardDatos, 
    getHistorialPacientes, 
    getReportesEvaluacion, 
    postCrearTurno,
    getBuscarPacientes,
    putEstadoConsultorio,
    getConsultorioById,
    postCrearMedico,
    putActualizarMedico,
    deleteEliminarMedico,
    getCitasMedico,
    getActividad, 
    putReasignarConsultorio,
    putEstadoPaciente
} from '../controllers/adminController.js';
import { getMedicosList, getHorariosMedico, upsertHorarios, getDiasNoLaborales, postDiaNoLaboral, deleteDiaNoLaboralController } from '../controllers/adminController.js';

const router = Router();

router.get('/dashboard', getDashboardDatos);        
router.get('/pacientes', getHistorialPacientes);    
router.get('/reportes', getReportesEvaluacion);     
router.post('/turno', postCrearTurno);
router.put('/consultorio/:id/estado', putEstadoConsultorio);
router.get('/consultorio/:id', getConsultorioById);
router.get('/medicos', getMedicosList);
router.get('/medicos/:id/horarios', getHorariosMedico);
router.post('/medicos/:id/horarios', upsertHorarios);
router.get('/medicos/:id/dias-no-laborales', getDiasNoLaborales);
router.post('/medicos/:id/dias-no-laborales', postDiaNoLaboral);
router.delete('/medicos/:id/dias-no-laborales/:diaId', deleteDiaNoLaboralController);
router.post('/medicos', postCrearMedico);
router.put('/medicos/:id', putActualizarMedico);
router.delete('/medicos/:id', deleteEliminarMedico);
router.get('/buscar-paciente', getBuscarPacientes);
router.get('/medicos/:id/citas', getCitasMedico); 
router.get('/consultorio/:id/actividad', getActividad);
router.put('/consultorio/reasignar', putReasignarConsultorio);
router.put('/pacientes/:id/estado', putEstadoPaciente);
export default router;