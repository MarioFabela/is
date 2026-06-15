// routes/pacienteRoutes.js
import express from 'express';
import { getDashboardPaciente } from '../controllers/pacienteController.js'; // Verifica que el nombre del archivo del controlador sea correcto

const router = express.Router();

router.get('/dashboard/:id', getDashboardPaciente);

export default router;