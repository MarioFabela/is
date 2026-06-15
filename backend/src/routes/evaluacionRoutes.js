import { Router } from 'express';
import { crearEvaluacion, getEstadisticas } from '../controllers/evaluacionController.js';

const router = Router();

// Ruta: POST http://localhost:3000/api/evaluaciones
// Sirve para guardar la nueva evaluación del formulario
router.post('/', crearEvaluacion);

// Ruta: GET http://localhost:3000/api/evaluaciones/:medicoId/estadisticas
// Servirá más adelante para ver el promedio de estrellas en el dashboard
router.get('/:medicoId/estadisticas', getEstadisticas);

export default router;