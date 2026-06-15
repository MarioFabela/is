// src/api/disponibilidad.js

const API_BASE_URL = import.meta.env.VITE_API_URL; // Ajusta si usas variables de entorno como import.meta.env.VITE_API_URL

export const obtenerDisponibilidadDoctores = async (fechaStr) => {
  try {
    const response = await fetch(`${API_BASE_URL}/disponibilidad/${fechaStr}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();

    // Validamos la estructura estándar { success: true, data: ... } del backend
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Error al obtener la disponibilidad de los médicos');
    }

    return result.data;
  } catch (error) {
    console.error("Error en obtenerDisponibilidadDoctores:", error);
    throw error;
  }
};