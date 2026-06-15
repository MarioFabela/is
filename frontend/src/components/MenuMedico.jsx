import React from 'react';

export function MenuMedico() {
  // Datos lógicos del especialista en camelCase
  const nombreDoctor = "Dr. Julian Vance";
  const especialidadDoctor = "Cirugía General";

  const handleLogout = () => {
    console.log("Cerrando sesión del especialista médico...");
  };

  const handleLinkClick = (e, seccionDestino) => {
    e.preventDefault();
    console.log(`Cambiando a la sección médica: ${seccionDestino}`);
  };

  return (
    <aside className="h-screen fixed left-0 top-0 w-64 border-r border-[#E0E0E0] bg-[#F5F5F5] flex flex-col overflow-y-auto z-50">
      <div className="p-6">
        <h1 className="text-xl font-black tracking-tighter text-[#2196F3]">CMS PRO</h1>
      </div>
      
      <div className="px-6 py-4 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <img 
            alt="Doctor Avatar" 
            className="w-10 h-10 rounded-full border border-outline-variant" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHzjZphIBsETBSDdx9biiZs2oeDr-ViXQKLHRoinZ2fqU5ujPJUrFp5dZ7-TRsW_MDgL1wxV9FXMDgV1CR049ggSuozjl08WQLnwYhcbo3hGaarssWizquVIRUtaTIGpAzFJMXHVJtLuh3VT_L3yIx8GykAl9n696Vvvyb5o4TqWI3VhscLO59_IMvzfVzAiwU50cn7UBvdpRRQPfx0H3msc4JC9w09RjUZYF1Yn4Pj12xwIEQUhoetx-JpGZB2QMsOk_LNab-iTo"
          />
          <div>
            <p className="font-sans text-sm font-bold tracking-tight text-slate-800">{nombreDoctor}</p>
            <p className="text-[10px] text-slate-500">{especialidadDoctor}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 mt-4">
        <a 
          className="text-slate-500 py-3 px-4 hover:bg-slate-100 transition-colors duration-150 flex items-center gap-3 font-sans text-sm font-medium tracking-tight" 
          href="#"
          onClick={(e) => handleLinkClick(e, 'dashboard')}
        >
          <span className="material-symbols-outlined">dashboard</span> Panel de Control
        </a>
        <a 
          className="bg-white text-[#2196F3] border-r-4 border-[#2196F3] font-bold py-3 px-4 flex items-center gap-3 font-sans text-sm tracking-tight" 
          href="#"
          onClick={(e) => handleLinkClick(e, 'pacientes')}
        >
          <span className="material-symbols-outlined">person</span> Pacientes
        </a>
        <a 
          className="text-slate-500 py-3 px-4 hover:bg-slate-100 transition-colors duration-150 flex items-center gap-3 font-sans text-sm font-medium tracking-tight" 
          href="#"
          onClick={(e) => handleLinkClick(e, 'listaEspera')}
        >
          <span className="material-symbols-outlined">hourglass_empty</span> Lista de Espera
        </a>
        <a 
          className="text-slate-500 py-3 px-4 hover:bg-slate-100 transition-colors duration-150 flex items-center gap-3 font-sans text-sm font-medium tracking-tight" 
          href="#"
          onClick={(e) => handleLinkClick(e, 'reportes')}
        >
          <span className="material-symbols-outlined">bar_chart</span> Reportes
        </a>
      </nav>

      <div className="p-6 border-t border-[#E0E0E0]">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined">logout</span> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default MenuMedico;