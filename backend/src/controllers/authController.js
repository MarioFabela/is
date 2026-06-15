import * as authService from '../services/authService.js';

// --- CONTROLADOR DE LOGIN (AQUÍ ESTABA EL FALTANTE) ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'El correo y la contraseña son requeridos.' });
        }

        const sessionData = await authService.loginUser(email, password);

        return res.status(200).json({
            success: true,
            message: 'Login exitoso.',
            data: sessionData
        });

    } catch (error) {
        return res.status(401).json({ // 401 para credenciales incorrectas
            success: false,
            message: error.message || 'Error al iniciar sesión.'
        });
    }
};

// --- CONTROLADOR DE REGISTRO ---
export const register = async (req, res) => {
    try {
        const { nombreCompleto, fechaNacimiento, telefono, email, password, confirmPassword } = req.body;

        // Validaciones estrictas de negocio médico
        if (!nombreCompleto || !fechaNacimiento || !telefono || !email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Todos los campos de registro son requeridos.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Las contraseñas no coinciden.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'La contraseña debe contener 6 o más caracteres.' });
        }

        const userData = await authService.registerUser({
            email,
            password,
            nombreCompleto,
            telefono,
            fechaNacimiento
        });

        return res.status(201).json({
            success: true,
            message: 'Cuenta médica creada con éxito.',
            data: userData
        });

    } catch (error) {
        // Determinamos el tipo de error: Si es un mensaje de Supabase Auth, es un error del cliente (400)
        const isClientError = error.message && (
            error.message.includes('already registered') || 
            error.message.includes('password') ||
            error.message.includes('invalid')
        );

        const statusCode = isClientError ? 400 : 500;

        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Error en el servidor al registrar'
        });
    }
};

// --- CONTROLADOR DE OLVIDÓ CONTRASEÑA ---
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'El correo es obligatorio.' });
        }

        await authService.sendPasswordReset(email);
        return res.status(200).json({ success: true, message: 'Enlace enviado al correo electrónico ingresado.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};