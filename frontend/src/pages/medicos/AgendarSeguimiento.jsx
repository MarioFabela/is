import React from 'react';
import { Link } from 'react-router-dom';

const AgendarSeguimiento = () => {
  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans pb-32">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#005ba1]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>
          <span className="text-lg font-extrabold text-[#005ba1] tracking-wide">CentroVital</span>
        </div>
        <div className="hidden md:flex gap-8">
          <span className="text-gray-500 font-medium text-sm">Panel de Control</span>
          <span className="text-[#005ba1] font-bold text-sm border-b-2 border-[#005ba1] pb-1">Pacientes</span>
          <span className="text-gray-500 font-medium text-sm">Reportes</span>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div className="hidden md:block">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Ward 4B</p>
            <p className="text-xs text-gray-800">12 Oct 2023</p>
          </div>
          <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-100 overflow-hidden">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=DrRicardo" alt="Dr." className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto mt-8 px-4">
        {/* Banner Paciente */}
        <div className="bg-white border border-gray-200 rounded-t-lg p-5 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-[#005ba1] rounded flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800 leading-tight">Juan Pérez</p>
              <p className="text-xs text-gray-500 mt-1">ID: 12.345.678-9 - Plan Fonasa B</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-full border border-gray-200 tracking-wider">HISTORIAL ACTIVO</span>
            <span className="bg-blue-50 text-[#005ba1] text-[10px] font-bold px-3 py-1.5 rounded-full border border-blue-100 tracking-wider">POST-OPERATORIO</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 border-t-0 bg-white rounded-b-lg shadow-sm">
          {/* Lado Izquierdo: Calendario y Horas */}
          <div className="border-r border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seleccionar Fecha</p>
              <div className="flex items-center gap-2 font-bold text-sm text-gray-800">
                <button className="text-gray-400 hover:text-gray-800">&lt;</button>
                Octubre 2023
                <button className="text-gray-400 hover:text-gray-800">&gt;</button>
              </div>
            </div>
            
            {/* Calendario Mock */}
            <div className="mb-8">
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 mb-2">
                <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
              </div>
              <div className="grid grid-cols-7 text-center text-sm font-medium gap-y-2">
                <span className="text-gray-300">28</span><span className="text-gray-300">29</span><span className="text-gray-300">30</span>
                <span>1</span><span>2</span><span>3</span><span>4</span>
                <span>5</span>
                <span className="bg-[#005ba1] text-white rounded font-bold py-1">6</span>
                <span>7</span><span>8</span><span>9</span><span>10</span><span>11</span>
                <span>12</span><span>13</span>
              </div>
            </div>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-t border-gray-100 pt-4">Horarios Disponibles (6 Oct)</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="border border-gray-200 text-gray-600 text-sm font-bold py-2 rounded hover:border-[#005ba1] hover:text-[#005ba1]">08:30</button>
              <button className="border border-gray-200 text-gray-600 text-sm font-bold py-2 rounded hover:border-[#005ba1] hover:text-[#005ba1]">09:15</button>
              <button className="border border-[#005ba1] bg-[#005ba1] text-white text-sm font-bold py-2 rounded shadow-md">10:00</button>
              <button className="border border-gray-200 text-orange-400 text-sm font-bold py-2 rounded hover:border-orange-500">10:45</button>
              <button className="border border-gray-200 text-gray-600 text-sm font-bold py-2 rounded hover:border-[#005ba1] hover:text-[#005ba1]">11:30</button>
              <button className="border border-gray-200 text-gray-300 text-sm font-bold py-2 rounded cursor-not-allowed">12:15</button>
              <button className="border border-gray-200 text-gray-600 text-sm font-bold py-2 rounded hover:border-[#005ba1] hover:text-[#005ba1]">15:00</button>
              <button className="border border-gray-200 text-orange-400 text-sm font-bold py-2 rounded hover:border-orange-500">15:45</button>
            </div>
          </div>

          {/* Lado Derecho: Detalles */}
          <div className="p-6 bg-gray-50 rounded-br-lg flex flex-col">
            <div className="mb-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Urgencia / Prioridad</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-white border border-[#005ba1] rounded shadow-sm cursor-pointer">
                  <input type="radio" name="prioridad" defaultChecked className="text-[#005ba1] focus:ring-[#005ba1]" />
                  <span className="text-sm font-bold text-[#005ba1]">Control de Rutina</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded cursor-pointer hover:border-gray-300">
                  <input type="radio" name="prioridad" className="text-[#005ba1]" />
                  <span className="text-sm font-medium text-gray-600">Revisión de Resultados</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded cursor-pointer hover:border-red-300">
                  <input type="radio" name="prioridad" className="text-red-500" />
                  <span className="text-sm font-medium text-red-600">Urgente</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recurrencia</p>
              <select className="w-full border border-gray-300 rounded p-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#005ba1]">
                <option>Cita Única</option>
                <option>Semanal</option>
                <option>Mensual</option>
              </select>
            </div>

            <div className="mb-6 flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Motivo del Seguimiento</p>
              <textarea className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-[#005ba1] resize-none h-24" placeholder="Escriba notas adicionales para la próxima visita..."></textarea>
              <p className="text-[10px] text-gray-500 italic mt-2 bg-gray-100 p-2 rounded border border-gray-200">
                "Revisar evolución de herida quirúrgica y ajustar dosificación de fármacos según laboratorios."
              </p>
            </div>

            <div className="space-y-3 mt-auto">
              <button className="w-full bg-[#2196F3] hover:bg-blue-600 text-white font-bold py-3.5 rounded flex items-center justify-center gap-2 shadow-sm transition-colors">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Confirmar y Agendar
              </button>
              <Link to="/medicos/pacientes/evolucion" className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3.5 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Volver a la Nota
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgendarSeguimiento;