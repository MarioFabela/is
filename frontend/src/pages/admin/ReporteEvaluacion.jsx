import React, { useState } from 'react';
import { 
  ChevronRight, Stethoscope, Users, FileText, Bell, Settings, 
  UserPlus, DoorOpen, Pill, Filter, Plus, CheckCircle, AlertTriangle, 
  Sun, ArrowRight, ChevronDown, TrendingUp, Wrench, UserSearch, 
  Clock, Home, Calendar, User, Search, MoreVertical, ChevronLeft, 
  Star, Download, ClipboardList
} from 'lucide-react';

function ReporteEvaluacion({ kpis, doctores }) {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reportes</h1></div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
        <div className="md:col-span-2 lg:col-span-2 bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Promedio Global</h4>
            <div className="mt-4 flex items-baseline gap-2"><span className="text-5xl font-black text-blue-600">{kpis.promedioGlobal}</span><span className="text-lg font-bold text-gray-400">/ 5</span></div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-green-600"><TrendingUp size={16} /><span className="text-sm font-medium">{kpis.tendenciaMes}</span></div>
        </div>
        
        <div className="md:col-span-4 lg:col-span-4 bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">Desempeño por Categoría</h4>
          <div className="space-y-4">
            {kpis.categorias.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-sm text-gray-700"><span>{cat.nombre}</span><span className="font-bold text-gray-900">{cat.score}</span></div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-blue-600 h-full rounded-full" style={{ width: `${cat.porcentaje}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 className="text-lg font-bold text-gray-900">Ranking de Doctores</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Especialidad</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Calificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doctores.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img className="w-10 h-10 rounded-full object-cover border border-gray-200" src={doctor.foto} alt="Dr" />
                    <div><div className="font-bold text-gray-900 text-sm">{doctor.nombre}</div><div className="text-xs text-gray-500">{doctor.sede}</div></div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doctor.especialidad}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-bold text-sm tabular-nums ${doctor.calificacionColor}`}>{doctor.calificacion}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReporteEvaluacion;