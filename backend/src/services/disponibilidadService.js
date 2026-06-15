import { createClient } from '@supabase/supabase-js';

// Asegúrate de tener estas variables en tu archivo .env
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const obtenerDisponibilidad = async (fechaStr) => {
  // 1. Determinar el día de la semana forzando mediodía UTC
  const fechaObj = new Date(`${fechaStr}T12:00:00Z`);
  const dayOfWeek = fechaObj.getUTCDay();
  const ahora = new Date();
  const esHoy = fechaStr === ahora.toISOString().split('T')[0];

  // 2. Extraer datos desde Supabase en paralelo
  const [resMedicos, resHorarios, resCitas] = await Promise.all([
    supabase.from('medicos')
      .select('id, duracion_consulta_min, numero_consultorio, perfiles(nombre_completo)')
      .eq('activo', true),
    supabase.from('horarios_atencion')
      .select('medico_id, hora_inicio, hora_fin')
      .eq('dia_semana', dayOfWeek),
    supabase.from('citas')
      .select('medico_id, fecha_hora')
      .eq('estado', 'programada')
      .gte('fecha_hora', `${fechaStr}T00:00:00`)
      .lte('fecha_hora', `${fechaStr}T23:59:59`)
  ]);

  if (resMedicos.error) throw new Error(resMedicos.error.message);
  if (resHorarios.error) throw new Error(resHorarios.error.message);
  if (resCitas.error) throw new Error(resCitas.error.message);

  const medicos = resMedicos.data || [];
  const horarios = resHorarios.data || [];
  const citas = resCitas.data || [];

  const doctoresProcesados = [];

  // 3. Procesamiento de bloques
  for (const medico of medicos) {
    const nombre = medico.perfiles?.nombre_completo || 'Médico Especialista';
    const initials = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const consultorioAsignado = medico.numero_consultorio || 'Por asignar';
    const horariosDelMedico = horarios.filter(h => h.medico_id === medico.id);

    let bloquesHorarios = [];

    for (const bloque of horariosDelMedico) {
      let start = new Date(`${fechaStr}T${bloque.hora_inicio}`);
      let end = new Date(`${fechaStr}T${bloque.hora_fin}`);
      let duracion = medico.duracion_consulta_min || 30;

      while (start < end) {
        const slotTime = start.toTimeString().substring(0, 5);

        const isOccupied = citas.some(c => {
          if (c.medico_id !== medico.id) return false;

          // Convertimos la hora UTC de Supabase a la zona horaria local antes de comparar
          const dateLocal = new Date(c.fecha_hora);
          const horaLocal = String(dateLocal.getHours()).padStart(2, '0');
          const minLocal = String(dateLocal.getMinutes()).padStart(2, '0');
          const tiempoLocal = `${horaLocal}:${minLocal}`;

          return tiempoLocal === slotTime;
        });

        let esHoraPasada = false;
        if (esHoy) {
          const [h, m] = slotTime.split(':');
          if (parseInt(h) < ahora.getHours() || (parseInt(h) === ahora.getHours() && parseInt(m) <= ahora.getMinutes())) {
            esHoraPasada = true;
          }
        }

        if (!esHoraPasada) {
          bloquesHorarios.push({
            hora: slotTime,
            ocupado: isOccupied
          });
        }

        start.setMinutes(start.getMinutes() + duracion);
      }
    }

    if (bloquesHorarios.length > 0) {
      doctoresProcesados.push({
        id: medico.id,
        nombre,
        avatar: initials,
        consultorio: consultorioAsignado,
        horas: bloquesHorarios
      });
    }
  }

  return doctoresProcesados;
};