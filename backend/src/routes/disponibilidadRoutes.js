import express from 'express';
import { getDisponibilidad } from '../controllers/disponibilidadController.js';

const router = express.Router();

// GET /api/disponibilidad/2026-06-15
router.get('/:fecha', getDisponibilidad);

export default router;