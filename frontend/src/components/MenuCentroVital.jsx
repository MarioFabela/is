import React from 'react';

export function MenuCentroVital() {
  // Lógica de navegación del ecosistema CentroVital
  const handleNavigation = (e, seccionDestino) => {
    e.preventDefault();
    console.log(`Cambiando de módulo hacia: ${seccionDestino}`);
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-[#ffffff] border-r border-[#bfc7d4] flex flex-col z-40 hidden md:flex">
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-4">
          <button 
            onClick={(e) => handleNavigation(e, 'volverPaciente')}
            className="w-full flex items-center gap-3 p-3 text-[#526069] hover:bg-[#f5f3f3] rounded-lg transition-colors group"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-sans text-sm">Volver al Paciente</span>
          </button>
        </div>
        
        <div className="space-y-1 px-2">
          <a 
            onClick={(e) => handleNavigation(e, 'dashboard')}
            className="flex items-center gap-3 p-3 cursor-pointer text-slate-600 hover:bg-[#e9e8e7] transition-all rounded-lg" 
            href="#"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-sans text-sm">Dashboard</span>
          </a>
          <a 
            onClick={(e) => handleNavigation(e, 'pacientes')}
            className="flex items-center gap-3 p-3 cursor-pointer text-slate-600 hover:bg-[#e9e8e7] transition-all rounded-lg" 
            href="#"
          >
            <span className="material-symbols-outlined">person</span>
            <span className="font-sans text-sm">Pacientes</span>
          </a>
          <a 
            onClick={(e) => handleNavigation(e, 'ordenLab')}
            className="flex items-center gap-3 p-3 cursor-pointer bg-[#d3e2ed] text-[#002c4f] font-bold rounded-lg shadow-sm" 
            href="#"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            <span className="font-sans text-sm">Orden de Lab</span>
          </a>
          <a 
            onClick={(e) => handleNavigation(e, 'citas')}
            className="flex items-center gap-3 p-3 cursor-pointer text-slate-600 hover:bg-[#e9e8e7] transition-all rounded-lg" 
            href="#"
          >
            <span className="material-symbols-outlined">event</span>
            <span className="font-sans text-sm">Citas</span>
          </a>
          <a 
            onClick={(e) => handleNavigation(e, 'configuracion')}
            className="flex items-center gap-3 p-3 cursor-pointer text-slate-600 hover:bg-[#e9e8e7] transition-all rounded-lg" 
            href="#"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-sans text-sm">Configuración</span>
          </a>
        </div>
      </nav>

      <div className="p-4 border-t border-[#bfc7d4]">
        <div className="flex items-center gap-3 p-2 bg-[#f5f3f3] rounded-lg">
          <div className="w-8 h-8 rounded bg-[#ffdcc2] text-[#904d00] flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">local_hospital</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#526069] uppercase">Clínica</span>
            <span className="text-xs font-semibold">Sede Principal A-12</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default MenuCentroVital;