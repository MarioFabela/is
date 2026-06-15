import React from 'react';

export function MenuMedicoEvo() {
  // Datos locales del especialista estructurados en camelCase
  const nombreDoctor = "Dr. Armando Casas";
  const especialidadDoctor = "Cardiólogo";

  const handleNavegacion = (e, vistaDestino) => {
    e.preventDefault();
    console.log(`Navegando de forma interna hacia: ${vistaDestino}`);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-20 md:w-64 border-r border-slate-200 bg-slate-50 flex flex-col z-50">
      <div className="p-6">
        <span className="text-xl font-bold text-blue-600">MedEvo</span>
      </div>
      
      <nav className="flex-1 space-y-1 px-3">
        <a 
          onClick={(e) => handleNavegacion(e, 'panel')}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" 
          href="#"
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="hidden md:block font-sans text-sm font-medium">Panel</span>
        </a>
        <a 
          onClick={(e) => handleNavegacion(e, 'pacientes')}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-blue-600 font-bold border-r-4 border-blue-600 bg-slate-100/50" 
          href="#"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
          <span className="hidden md:block font-sans text-sm font-bold">Pacientes</span>
        </a>
        <a 
          onClick={(e) => handleNavegacion(e, 'reportes')}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" 
          href="#"
        >
          <span className="material-symbols-outlined">assessment</span>
          <span className="hidden md:block font-sans text-sm font-medium">Reportes</span>
        </a>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
            <span className="font-bold">DR</span>
          </div>
          <div className="hidden md:block text-xs">
            <p className="font-bold text-slate-800">{nombreDoctor}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{especialidadDoctor}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default MenuMedicoEvo;