export const getAvatarMedico = (nombreCompleto = '') => {
  // Cambiamos startsWith por includes para detectar "dra" aunque esté después de "Dr(a)."
  const esDoctora = nombreCompleto.toLowerCase().includes('dra');
  
  // Limpiamos la semilla: quitamos espacios, puntos y paréntesis para que la URL nunca se rompa
  const seed = nombreCompleto.replace(/[^a-zA-Z0-9]/g, '');

  if (esDoctora) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&top=longButNotTooLong,bob,miaWallace,straight01,straight02&mouth=smile,default&eyebrows=defaultNatural,default&eyes=default,happy&facialHairProbability=0`;
  } else {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&top=shortCurly,shortFlat,shortRound,shortWaved&mouth=smile,default&eyebrows=default&eyes=default,happy&facialHairProbability=40`;
  }
};