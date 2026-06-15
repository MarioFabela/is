const API_BASE_URL = import.meta.env.VITE_API_URL; // Ajusta esto al puerto de tu backend en Node 

export const fetchHistorialCitas = async (pacienteId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/historial/${pacienteId}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Error al obtener el historial de citas');
    }

    return result.data;
  } catch (error) {
    console.error("Error en fetchHistorialCitas:", error);
    throw error;
  }
};

export const cancelarCitaApi = async (citaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/historial/${citaId}/cancelar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error);
    
    return result.data;
  } catch (error) {
    console.error("Error en cancelarCitaApi:", error);
    throw error;
  }
};