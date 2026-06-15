// src/api/evaluaciones.js

const API_BASE_URL = import.meta.env.VITE_API_URL; // Ajusta si usas variables de entorno como import.meta.env.VITE_API_URL

export const enviarEvaluacionMedico = async (evaluacionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(evaluacionData),
    });

    const result = await response.json();

    // Validamos la estructura estándar { success, data/error } que armaste en el backend
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Error al enviar la evaluación');
    }

    return result.data;
  } catch (error) {
    console.error("Error en enviarEvaluacionMedico:", error);
    throw error;
  }
};

export const obtenerEstadisticasMedico = async (medicoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluaciones/${medicoId}/estadisticas`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Error al obtener estadísticas');
    }

    return result.data;
  } catch (error) {
    console.error("Error en obtenerEstadisticasMedico:", error);
    throw error;
  }
};