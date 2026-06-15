import React from 'react';

export function MenuMedicoPlus() {
  // Datos lógicos del especialista usando camelCase
  const nombreEspecialista = "Dr. Clinical Lead";
  const especialidadEspecialista = "Cirugía General";

  const handleLinkClick = (e, vistaDestino) => {
    e.preventDefault();
    console.log(`Cambiando de sección médica a: ${vistaDestino}`);
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 border-r border-[#E0E0E0] dark:border-slate-800 bg-[#F5F5F5] dark:bg-slate-950 flex flex-col py-6 z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <span className="material-symbols-outlined text-2xl text-[#2196F3] dark:text-blue-400">medical_services</span>
        <span className="text-lg font-black text-[#2196F3] dark:text-blue-400">CLINIC+</span>
      </div>
      
      <div className="px-4 mb-8 flex flex-col items-start">
        <img 
          alt="Doctor Avatar" 
          className="w-12 h-12 rounded-full mb-3 border-2 border-white shadow-sm object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLiaqUNaNiVgMaQL3q4PI3cYgPiVZmpRUjHdzjbmRyHRlzmh-54hMajPK7vr-F4SJk5vj3uu745s8kcFkHILPsDkineh158MKYlOFNQQNq_JDMbZqWHP2DQC2etKtcs9DhThXouiI1ql_RV17A_KmRNkIATcgHKGYqy4swSoXWdCPYuWG3KEhNhPOVozZrExRrPAvRKf7M12KhysdiTfeQJsGqdrOf8gQtfAkScITvjd9J_7uQdM9-XMsk3XZoMj5TwHLaodLQHso"
        />
        <h3 className="text-sm font-bold text-slate-800 leading-tight">{nombreEspecialista}</h3>
        <p className="text-xs text-slate-500">{especialidadEspecialista}</p>
      </div>

      <div className="flex-1 space-y-1">
        <a 
          onClick={(e) => handleLinkClick(e, 'panelControl')}
          className="flex items-center gap-4 px-6 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all font-sans text-sm tracking-tight" 
          href="#"
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>Panel de Control</span>
        </a>
        <a 
          onClick={(e) => handleLinkClick(e, 'pacientes')}
          className="flex items-center gap-4 px-6 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all font-sans text-sm tracking-tight" 
          href="#"
        >
          <span className="material-symbols-outlined">person</span>
          <span>Pacientes</span>
        </a>
        <a 
          onClick={(e) => handleLinkClick(e, 'listaEspera')}
          className="flex items-center gap-4 px-6 py-3 text-[#2196F3] dark:text-blue-400 font-bold border-r-4 border-[#2196F3] bg-white dark:bg-slate-900 transition-all font-sans text-sm tracking-tight" 
          href="#"
        >
          <span className="material-symbols-outlined">hourglass_empty</span>
          <span>Lista de Espera</span>
        </a>
        <a 
          onClick={(e) => handleLinkClick(e, 'reportes')}
          className="flex items-center gap-4 px-6 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all font-sans text-sm tracking-tight" 
          href="#"
        >
          <span className="material-symbols-outlined">bar_chart</span>
          <span>Reportes</span>
        </a>
      </div>
    </nav>
  );
}

export default MenuMedicoPlus;