import express from 'express';
import { getHistorialCitas } from '../controllers/historialController.js';
import { cancelarCita } from '../controllers/historialController.js';

const router = express.Router();

// GET /api/historial/:pacienteId
router.get('/:pacienteId', getHistorialCitas);
router.patch('/:citaId/cancelar', cancelarCita);

export default router;