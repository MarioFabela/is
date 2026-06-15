// frontend/src/api/pacientes.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getDashboardDataService = async (userId) => {
  const response = await fetch(`${API_URL}/pacientes/dashboard/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener datos del dashboard');
  }

  return data.data;
};