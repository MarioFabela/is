import React from 'react';

export function MenuPacientes() {
  const handleTabClick = (e, pestañaDestino) => {
    e.preventDefault();
    console.log(`Cambiando de vista móvil a: ${pestañaDestino}`);
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 z-50 flex justify-around items-center bg-white dark:bg-slate-900 px-6 pb-safe border-t border-[#E0E0E0] dark:border-slate-800">
      <a 
        onClick={(e) => handleTabClick(e, 'inicio')}
        className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 pt-2 transition-all duration-200 ease-in-out hover:text-[#2196F3]" 
        href="#"
      >
        <span className="material-symbols-outlined">home</span>
        <span className="font-sans text-[12px] font-medium">Inicio</span>
      </a>
      
      <a 
        onClick={(e) => handleTabClick(e, 'registros')}
        className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 pt-2 transition-all duration-200 ease-in-out hover:text-[#2196F3]" 
        href="#"
      >
        <span className="material-symbols-outlined">medical_services</span>
        <span className="font-sans text-[12px] font-medium">Registros</span>
      </a>
      
      <a 
        onClick={(e) => handleTabClick(e, 'cita')}
        className="flex flex-col items-center justify-center text-[#2196F3] dark:text-blue-400 border-t-2 border-[#2196F3] pt-2 transition-all duration-200 ease-in-out" 
        href="#"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
        <span className="font-sans text-[12px] font-medium">Cita</span>
      </a>
    </nav>
  );
}

export default MenuPacientes;