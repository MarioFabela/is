import React from 'react';

export function NavegacionSuperior() {
  // Datos del administrador firmados en camelCase
  const nombreAdministrador = "Dr. Ricardo M.";
  const rolAdministrador = "Administrador";

  const handleBuscarPaciente = (e) => {
    console.log(`Filtrando lista global de pacientes por: ${e.target.value}`);
  };

  const handleNavClick = (e, seccionDestino) => {
    e.preventDefault();
    console.log(`Cambiando de módulo a: ${seccionDestino}`);
  };

  return (
    <header className="fixed top-0 right-0 left-0 h-16 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm flex items-center px-8 gap-8">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xl font-bold tracking-tight text-blue-600">Clínica Central</span>
      </div>
      
      <nav className="flex-1 flex items-center gap-1">
        <a 
          onClick={(e) => handleNavClick(e, 'pacientes')}
          className="px-4 py-2 text-blue-600 bg-slate-50 border-b-2 border-blue-600 font-semibold text-sm flex items-center gap-2" 
          href="#"
        >
          <span className="material-symbols-outlined text-lg">group</span>
          <span>Pacientes</span>
        </a>
        <a 
          onClick={(e) => handleNavClick(e, 'reportes')}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium text-sm flex items-center gap-2 transition-colors" 
          href="#"
        >
          <span className="material-symbols-outlined text-lg">analytics</span>
          <span>Reportes</span>
        </a>
      </nav>

      <div className="flex items-center gap-6">
        <div className="relative">
          <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg">search</span>
          <input 
            onChange={handleBuscarPaciente}
            className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-400 w-48 transition-all" 
            placeholder="Buscar..." 
            type="text" 
          />
        </div>
        
        <button className="relative text-slate-500 hover:bg-slate-100 rounded-full p-2 transition-all duration-200">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <img 
            className="w-8 h-8 rounded-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuALoBZu9BMY4U8yrlbr32mA_Lhcwr15ObTse_xKJW1Tg8_44NwwfZA0WLy2MqYhXOehBwxvaFj-IuAcvQKlF1vsvDVL5a2_iIHNcGNNLUncC3hlYTJOMu64MzMx1gp0U6cJohld7qFIaoWoQ28A2Ly92JZIccpxA_naLoZ1nK-ju8eDfjrw2Gy5JqLrmLD0ZER9BtG_ZXdh40UHBhOf7DMHRzK-FtaWv7avZ-Q03KFkTFcuws4c_qPtuuQ7UOym9i5R6wzlerSzWPw" 
            alt="Perfil Administrador"
          />
          <div className="hidden lg:block overflow-hidden text-xs">
            <p className="font-semibold truncate text-slate-800">{nombreAdministrador}</p>
            <p className="text-[10px] text-slate-500">{rolAdministrador}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default NavegacionSuperior;