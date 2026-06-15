import { createClient } from '@supabase/supabase-js';
import { crearEventoCalendar } from '../services/googleCalendarService.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const agendarNuevaCitaCompleta = async (req, res) => {
  try {
    const citaData = req.body;

    // 1. Extraemos nombre y AHORA TAMBIÉN el email del paciente
    const [resPaciente, resMedico] = await Promise.all([
      supabase.from('perfiles').select('nombre_completo, email').eq('id', citaData.id_paciente_cita).maybeSingle(),
      supabase.from('medicos').select('especialidad, perfiles(nombre_completo)').eq('id', citaData.medico_id).maybeSingle()
    ]);

    const nombrePaciente = resPaciente.data?.nombre_completo || 'Paciente Registrado';
    const correoPaciente = resPaciente.data?.email; // <-- El correo capturado
    const nombreMedico = resMedico.data?.perfiles?.nombre_completo || 'Especialista';
    const especialidad = resMedico.data?.especialidad || 'Consulta General';

    // 2. Le pasamos el correoPaciente a nuestro servicio de Google
    const googleEventId = await crearEventoCalendar(citaData, nombrePaciente, correoPaciente, nombreMedico, especialidad);

    const citaFinal = {
      ...citaData,
      google_event_id: googleEventId
    };

    const { data, error: dbError } = await supabase
      .from('citas')
      .insert([citaFinal])
      .select()
      .single();

    if (dbError) {
      if (dbError.code === '23505') {
        return res.status(409).json({ success: false, error: "Lo sentimos, este horario acaba de ser reservado por otro paciente." });
      }
      throw dbError;
    }

    return res.status(201).json({ success: true, message: "¡Cita agendada y vinculada a Google Calendar!", data });

  } catch (error) {
    console.error("Error crítico en agendarNuevaCitaCompleta:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};