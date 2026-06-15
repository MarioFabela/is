import React from 'react';

export function MenuClinica() {
  // Datos lógicos del usuario/administrador usando camelCase
  const nombreUsuario = "Dr. Ricardo Sosa";
  const rolUsuario = "Admin General";

  const handleLinkClick = (e, seccionDestino) => {
    e.preventDefault();
    console.log(`Redireccionando de forma lógica a: ${seccionDestino}`);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-white border-r border-slate-200 flex flex-col py-6 font-sans antialiased text-sm font-medium">
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold tracking-tight text-blue-600">Clínica Central</h1>
      </div>
      
      <nav className="flex-1 space-y-1">
        <div 
          onClick={(e) => handleLinkClick(e, 'pacientes')}
          className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-colors duration-200 cursor-pointer active:opacity-80"
        >
          <span className="material-symbols-outlined">group</span>
          <span>Pacientes</span>
        </div>
        <div 
          onClick={(e) => handleLinkClick(e, 'listaEspera')}
          className="flex items-center gap-3 px-4 py-3 text-blue-600 bg-slate-50 border-r-4 border-blue-600 font-semibold cursor-pointer active:opacity-80"
        >
          <span className="material-symbols-outlined">format_list_bulleted</span>
          <span>Lista de Espera</span>
        </div>
        <div 
          onClick={(e) => handleLinkClick(e, 'farmacia')}
          className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-colors duration-200 cursor-pointer active:opacity-80"
        >
          <span className="material-symbols-outlined">medical_services</span>
          <span>Farmacia</span>
        </div>
        <div 
          onClick={(e) => handleLinkClick(e, 'inventario')}
          className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-colors duration-200 cursor-pointer active:opacity-80"
        >
          <span className="material-symbols-outlined">inventory_2</span>
          <span>Inventario</span>
        </div>
        <div 
          onClick={(e) => handleLinkClick(e, 'reportes')}
          className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-colors duration-200 cursor-pointer active:opacity-80"
        >
          <span className="material-symbols-outlined">analytics</span>
          <span>Reportes</span>
        </div>
      </nav>

      <div className="px-4 mt-auto">
        <div className="p-4 bg-[#efeded] rounded-xl flex items-center gap-3">
          <img 
            alt="Avatar" 
            className="w-10 h-10 rounded-full bg-slate-200 object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrs8FCCQTgtYJEaEbaPHHPWhmRL8kq0lrStbwST1-NPA6t57dlVA4hyQcU8GW6BVU8nB391YmG8yEcoKKp1Lr6jLAt-aHe4UvNfV_tXlxFRa3yzpnRfj_paC5_64IKBdG3Glni5TtoNhFGne77NSOhg0xGqNnZ7S6EmwHpW95FT2VE7KyEWsnwEBlnZG9GEi5JNBf_-F3hj8pOcKPTfwOLhFS-WwRYypT50XO0DG4-xrMM07_JM8g9tQjIbXssD4NgyQiDeun97xs"
          />
          <div className="overflow-hidden">
            <p className="font-bold text-xs truncate">{nombreUsuario}</p>
            <p className="text-[10px] text-slate-500">{rolUsuario}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default MenuClinica;