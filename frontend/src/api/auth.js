// src/api/auth.js
const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

export const registerUserService = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al procesar registro.');
  }

  return data;
};

  export const forgotPasswordService = async (email) => {
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error al procesar la solicitud.');
  }

  return data;
};