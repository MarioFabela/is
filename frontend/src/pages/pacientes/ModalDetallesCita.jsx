import React, { useState } from 'react';

const ModalDetallesCita = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
  const [paraQuien, setParaQuien] = useState('mi'); // 'mi' o 'otra'
  const [nombreOtraPersona, setNombreOtraPersona] = useState('');
  const [esMenor, setEsMenor] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [sintomas, setSintomas] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (paraQuien === 'otra' && !nombreOtraPersona.trim()) {
      return alert("Por favor, ingrese el nombre de la persona que asistirá a la cita.");
    }
    if (!motivo.trim()) {
      return alert("Por favor, indique el motivo de la consulta.");
    }

    // Enviamos los datos ordenados al componente padre
    onConfirm({
      paraQuien,
      nombreCompleto: paraQuien === 'mi' ? null : nombreOtraPersona.trim(),
      esMenor: paraQuien === 'mi' ? false : esMenor,
      motivo: motivo.trim(),
      sintomas: sintomas.trim() || "No especificado"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col relative overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8fbff]">
          <h2 className="text-lg font-extrabold text-gray-900">Detalles de la Consulta</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          
          {/* ¿Para quién es la cita? */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">¿Para quién es la consulta?</label>
            <select
              value={paraQuien}
              onChange={(e) => setParaQuien(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:border-[#005ba1] bg-white cursor-pointer"
            >
              <option value="mi">Para mí</option>
              <option value="otra">Para otra persona</option>
            </select>
          </div>

          {/* Campos condicionales para otra persona */}
          {paraQuien === 'otra' && (
            <div className="space-y-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Nombre completo del paciente</label>
                <input
                  type="text"
                  placeholder="Ej. Carlos Suárez Lara"
                  value={nombreOtraPersona}
                  onChange={(e) => setNombreOtraPersona(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#005ba1] bg-white"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="esMenor"
                  checked={esMenor}
                  onChange={(e) => setEsMenor(e.target.checked)}
                  className="w-4 h-4 text-[#005ba1] border-gray-300 rounded focus:ring-[#005ba1] cursor-pointer"
                />
                <label htmlFor="esMenor" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                  El paciente es menor de edad
                </label>
              </div>
            </div>
          )}

          {/* Motivo de la consulta */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Motivo de la consulta</label>
            <input
              type="text"
              placeholder="Ej. Revisión general, Dolor persistente..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#005ba1]"
            />
          </div>

          {/* Síntomas */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Síntomas (Opcional)</label>
            <textarea
              rows="3"
              placeholder="Describa brevemente cómo se siente el paciente..."
              value={sintomas}
              onChange={(e) => setSintomas(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#005ba1] resize-none"
            ></textarea>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#005ba1] hover:bg-[#004680] text-white font-bold py-3 rounded-lg transition-colors shadow-md text-sm uppercase tracking-wider disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Procesando Reserva...' : 'Confirmar y Agendar Cita'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ModalDetallesCita;