import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' 
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// <-- Asegúrate de recibir el correoPaciente en los parámetros
export const crearEventoCalendar = async (citaData, nombrePaciente, correoPaciente, nombreMedico, especialidad) => {
  try {
    const fechaInicio = new Date(citaData.fecha_hora);
    const fechaFin = new Date(fechaInicio.getTime() + 30 * 60000);

    const event = {
      summary: `CentroVital: Cita Médica - ${especialidad}`,
      description: `Consulta médica programada.\n\nPaciente: ${nombrePaciente}\nDoctor(a): ${nombreMedico}\nMotivo: ${citaData.motivo}`,
      start: {
        dateTime: fechaInicio.toISOString(),
        timeZone: 'America/Mexico_City', 
      },
      end: {
        dateTime: fechaFin.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      // AQUÍ OCURRE LA MAGIA: Agregamos al paciente como invitado
      attendees: correoPaciente ? [{ email: correoPaciente }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
      // Esto le indica a Google que sí debe enviarle el correo al paciente
      sendUpdates: 'all', 
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all' // Garantiza el envío de la invitación
    });

    return response.data.id; 
  } catch (error) {
    console.error('Error creando evento en Google Calendar:', error);
    return null; 
  }
};