import { actualizarDatosPerfil, eliminarCuentaPaciente, subirFotoAlStorage } from '../services/perfilService.js';
export const updatePerfil = async (req, res) => {
  try {
    const { userId } = req.params;
    const datos = req.body;
    
    const data = await actualizarDatosPerfil(userId, datos);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteCuenta = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await eliminarCuentaPaciente(userId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const uploadFotoPerfil = async (req, res) => {
  try {
    const { userId } = req.params;
    const file = req.file; // Multer inyecta el archivo aquí

    if (!file) {
      return res.status(400).json({ success: false, error: "No se recibió ningún archivo de imagen." });
    }

    const fotoUrl = await subirFotoAlStorage(userId, file);

    return res.status(200).json({ 
      success: true, 
      message: "Foto de perfil actualizada con éxito",
      data: { foto_url: fotoUrl } 
    });
  } catch (error) {
    console.error("Error en uploadFotoPerfil:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};