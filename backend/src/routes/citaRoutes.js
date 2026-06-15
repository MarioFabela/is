import express from 'express';
import { agendarNuevaCitaCompleta } from '../controllers/citaController.js';

const router = express.Router();

// POST /api/citas/agendar
router.post('/agendar', agendarNuevaCitaCompleta);

export default router;