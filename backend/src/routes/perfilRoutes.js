import express from 'express';
import multer from 'multer';
import { updatePerfil, deleteCuenta, uploadFotoPerfil } from '../controllers/perfilController.js';

const router = express.Router();

// Configuración de multer guardando temporalmente en la memoria RAM del servidor
const storageTemporal = multer.memoryStorage();
const upload = multer({ storage: storageTemporal });

router.patch('/:userId', updatePerfil);
router.delete('/:userId', deleteCuenta);

// NUEVA RUTA: El parámetro 'foto' debe coincidir exactamente con el campo del FormData en el Frontend
router.post('/:userId/upload-foto', upload.single('foto'), uploadFotoPerfil);

export default router;