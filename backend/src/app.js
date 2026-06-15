import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Asegúrate de importar dotenv si usas variables de entorno aquí

import authRoutes from './routes/authRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';
import evaluacionRoutes from './routes/evaluacionRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 
import disponibilidadRoutes from './routes/disponibilidadRoutes.js';
import historialRoutes from './routes/historialRoutes.js'; 
import perfilRoutes from './routes/perfilRoutes.js'; 
import citaRoutes from './routes/citaRoutes.js';

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Acepta producción, o localhost para cuando programes
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas base
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRoutes); 
app.use('/api/evaluaciones', evaluacionRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/disponibilidad', disponibilidadRoutes);
app.use('/api/historial', historialRoutes); 
app.use('/api/perfil', perfilRoutes); 
app.use('/api/citas', citaRoutes); 

app.get('/', (req, res) => {
    res.json({ mensaje: 'API funcionando y segura' });
});

export default app;