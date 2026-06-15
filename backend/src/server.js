import 'dotenv/config';
import app from './app.js';
import supabase from './config/supabase.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);

    try {
        const { error } = await supabase.from('usuarios').select('*').limit(1);

        if (error && error.code === 'PGRST301') {
            console.error('Error de conexion: Verifica tus llaves de Supabase en el archivo .env');
        } else {
            console.log('Conexion exitosa con la base de datos en Supabase');
        }
    } catch (err) {
        console.error('Error de red al intentar conectar con Supabase:', err.message);
    }
});