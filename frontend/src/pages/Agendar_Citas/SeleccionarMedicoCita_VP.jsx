export default function AgendamientoMenSuperior() {
  return (
    <div className="flex flex-col bg-[#F5F5F5] min-w-full min-h-screen relative font-inter">
      
      {/* HEADER FIJO */}
      <div className="flex py-0 px-4 sm:px-6 justify-between items-center fixed top-0 left-0 right-0 border-b border-[#E0E0E0] bg-white w-full h-16 z-50 shadow-sm">
        <div className="flex items-center gap-4 sm:gap-8">
          <p className="text-[#0061A4] text-lg font-bold tracking-[0.05em]">
            CENTROVITAL
          </p>
          {/* Enlaces ocultos en móviles pequeños */}
          <div className="hidden md:flex items-center gap-6">
            <p className="text-[#1B1C1C] text-base font-medium cursor-pointer hover:text-[#0061A4]">
              Inicio
            </p>
            <div className="border-b-2 border-[#0061A4] py-5">
              <p className="text-[#0061A4] text-base font-bold">
                Citas
              </p>
            </div>
            <p className="text-[#1B1C1C] text-base font-medium cursor-pointer hover:text-[#0061A4]">
              Perfil
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex p-2 flex-col justify-center items-center hover:bg-gray-100 rounded-full transition">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 20V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V14C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16H4L0 20V20M3.15 14H18V14V14V2V2V2H2V2V2V15.125L3.15 14V14M2 14V14V2V2V2V2V2V2V14V14V14V14V14" fill="#526069" />
            </svg>
          </button>
          <div className="flex flex-col justify-center items-start rounded-xl border border-[#BFC7D4] w-10 h-10 overflow-hidden bg-gray-200">
            <img src="/Profile.png" className="w-full h-full object-cover" alt="Profile" />
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 w-full max-w-7xl mx-auto pt-24 pb-32 px-4 sm:px-6 flex flex-col gap-6">
        
        {/* Título y Descripción */}
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-[#1B1C1C] text-2xl sm:text-[32px] font-semibold leading-tight tracking-[-0.02em]">
            Programar Cita
          </h1>
          <p className="text-[#526069] text-sm leading-5 max-w-3xl">
            Reserve una consulta con nuestro equipo médico especializado en solo unos pocos pasos.
          </p>
        </div>

        {/* Sección de Médicos */}
        <div className="flex flex-col gap-6 w-full">
          
          {/* Header de Mes */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <h2 className="text-[#1B1C1C] text-xl sm:text-2xl font-semibold tracking-[-0.01em]">
              Médicos Disponibles
            </h2>
            <div className="flex p-2 items-center gap-4 rounded bg-[#F5F3F3]">
              <p className="text-[#526069] text-sm sm:text-base font-medium">
                OCTUBRE 2024
              </p>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                  <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 9L0 4.5L4.5 0L5.55 1.05L2.1 4.5L5.55 7.95L4.5 9V9" fill="#1B1C1C"/>
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                  <svg width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.45 4.5L0 1.05L1.05 0L5.55 4.5L1.05 9L0 7.95L3.45 4.5V4.5" fill="#1B1C1C"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Tarjetas de Médicos */}
          <div className="flex flex-col gap-6 w-full">
            
            {/* Médico 1 */}
            <div className="flex flex-col lg:flex-row p-4 sm:p-6 rounded border border-[#BFC7D4] bg-white w-full gap-6">
              <div className="flex items-center gap-4 lg:w-1/3 xl:w-1/4 shrink-0">
                <img src="/Doctor.png" className="rounded-xl border-2 border-[#D1E4FF] w-16 h-16 object-cover" alt="Doctor Wilson" />
                <div className="flex flex-col gap-1">
                  <p className="text-[#1B1C1C] text-lg font-semibold">Dr. James Wilson</p>
                  <div className="flex items-center gap-1">
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.66667 5.83333C4.9875 5.83333 5.26215 5.7191 5.49062 5.49062C5.7191 5.26215 5.83333 4.9875 5.83333 4.66667C5.83333 4.34583 5.7191 4.07118 5.49062 3.84271C5.26215 3.61424 4.9875 3.5 4.66667 3.5C4.34583 3.5 4.07118 3.61424 3.84271 3.84271C3.61424 4.07118 3.5 4.34583 3.5 4.66667C3.5 4.9875 3.61424 5.26215 3.84271 5.49062C4.07118 5.7191 4.34583 5.83333 4.66667 5.83333V5.83333M4.66667 10.1208C5.85278 9.03194 6.73264 8.04271 7.30625 7.15312C7.87986 6.26354 8.16667 5.47361 8.16667 4.78333C8.16667 3.72361 7.82882 2.8559 7.15312 2.18021C6.47743 1.50451 5.64861 1.16667 4.66667 1.16667C3.68472 1.16667 2.8559 1.50451 2.18021 2.18021C1.50451 2.8559 1.16667 3.72361 1.16667 4.78333C1.16667 5.47361 1.45347 6.26354 2.02708 7.15312C2.60069 8.04271 3.48056 9.03194 4.66667 10.1208V10.1208M4.66667 11.6667C3.10139 10.3347 1.93229 9.09757 1.15937 7.95521C0.386458 6.81285 0 5.75556 0 4.78333C0 3.325 0.469097 2.16319 1.40729 1.29792C2.34549 0.432639 3.43194 0 4.66667 0C5.90139 0 6.98785 0.432639 7.92604 1.29792C8.86424 2.16319 9.33333 3.325 9.33333 4.78333C9.33333 5.75556 8.94688 6.81285 8.17396 7.95521C7.40104 9.09757 6.23194 10.3347 4.66667 11.6667V11.6667" fill="#0061A4" />
                    </svg>
                    <p className="text-[#0061A4] text-base font-semibold">Consultorio 1</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full lg:w-2/3 xl:w-3/4">
                <p className="text-[#526069] text-[11px] font-bold tracking-[0.05em] uppercase">
                  Horarios Disponibles - 5 de Oct
                </p>
                {/* Grid Responsivo para Horarios */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 w-full">
                  <button className="py-2 px-3 rounded-sm border border-[#BFC7D4] text-[#1B1C1C] text-[13px] hover:bg-gray-50 transition">09:00 AM</button>
                  <button className="py-2 px-3 rounded-sm border border-[#BFC7D4] text-[#1B1C1C] text-[13px] hover:bg-gray-50 transition">09:30 AM</button>
                  <button className="py-2 px-3 rounded-sm border border-[#0061A4] bg-[#0061A4] text-white text-[13px] shadow-sm font-semibold">10:00 AM</button>
                  <button className="py-2 px-3 rounded-sm border border-[#BFC7D4] text-[#1B1C1C] text-[13px] hover:bg-gray-50 transition">11:00 AM</button>
                  <button className="py-2 px-3 rounded-sm border border-[#BFC7D4] bg-[#F5F3F3] text-[#1B1C1C] text-[13px] opacity-40 cursor-not-allowed">11:30 AM</button>
                  <button className="py-2 px-3 rounded-sm border border-[#BFC7D4] text-[#1B1C1C] text-[13px] hover:bg-gray-50 transition">12:00 PM</button>
                </div>
              </div>
            </div>

            {/* Médico 2 */}
            <div className="flex flex-col lg:flex-row p-4 sm:p-6 rounded border border-[#BFC7D4] bg-white w-full gap-6">
              <div className="flex items-center gap-4 lg:w-1/3 xl:w-1/4 shrink-0">
                <img src="/Doctor(1).png" className="rounded-xl border-2 border-[#D1E4FF] w-16 h-16 object-cover" alt="Doctor Chen" />
                <div className="flex flex-col gap-1">
                  <p className="text-[#1B1C1C] text-lg font-semibold">Dr. Sarah Chen</p>
                  <div className="flex items-center gap-1">
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.66667 5.83333C4.9875 5.83333 5.26215 5.7191 5.49062 5.49062C5.7191 5.26215 5.83333 4.9875 5.83333 4.66667C5.83333 4.34583 5.7191 4.07118 5.49062 3.84271C5.26215 3.61424 4.9875 3.5 4.66667 3.5C4.34583 3.5 4.07118 3.61424 3.84271 3.84271C3.61424 4.07118 3.5 4.34583 3.5 4.66667C3.5 4.9875 3.61424 5.26215 3.84271 5.49062C4.07118 5.7191 4.34583 5.83333 4.66667 5.83333V5.83333M4.66667 10.1208C5.85278 9.03194 6.73264 8.04271 7.30625 7.15312C7.87986 6.26354 8.16667 5.47361 8.16667 4.78333C8.16667 3.72361 7.82882 2.8559 7.15312 2.18021C6.47743 1.50451 5.64861 1.16667 4.66667 1.16667C3.68472 1.16667 2.8559 1.50451 2.18021 2.18021C1.50451 2.8559 1.16667 3.72361 1.16667 4.78333C1.16667 5.47361 1.45347 6.26354 2.02708 7.15312C2.60069 8.04271 3.48056 9.03194 4.66667 10.1208V10.1208M4.66667 11.6667C3.10139 10.3347 1.93229 9.09757 1.15937 7.95521C0.386458 6.81285 0 5.75556 0 4.78333C0 3.325 0.469097 2.16319 1.40729 1.29792C2.34549 0.432639 3.43194 0 4.66667 0C5.90139 0 6.98785 0.432639 7.92604 1.29792C8.86424 2.16319 9.33333 3.325 9.33333 4.78333C9.33333 5.75556 8.94688 6.81285 8.17396 7.95521C7.40104 9.09757 6.23194 10.3347 4.66667 11.6667V11.6667" fill="#0061A4" />
                    </svg>
                    <p className="text-[#0061A4] text-base font-semibold">Consultorio 2</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full lg:w-2/3 xl:w-3/4">
                <p className="text-[#526069] text-[11px] font-bold tracking-[0.05em] uppercase">
                  Horarios Disponibles - 5 de Oct
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 w-full">
                  <button className="py-2 px-3 rounded-sm border border-[#BFC7D4] text-[#1B1C1C] text-[13px] hover:bg-gray-50 transition">02:00 PM</button>
                  <button className="py-2 px-3 rounded-sm border border-[#BFC7D4] text-[#1B1C1C] text-[13px] hover:bg-gray-50 transition">02:30 PM</button>
                  <button className="py-2 px-3 rounded-sm border border-[#BFC7D4] text-[#1B1C1C] text-[13px] hover:bg-gray-50 transition">03:30 PM</button>
                  <button className="py-2 px-3 rounded-sm border border-[#BFC7D4] text-[#1B1C1C] text-[13px] hover:bg-gray-50 transition">04:00 PM</button>
                  <button className="py-2 px-3 rounded-sm border border-[#BFC7D4] text-[#1B1C1C] text-[13px] hover:bg-gray-50 transition">04:30 PM</button>
                  <button className="py-2 px-3 rounded-sm border border-[#BFC7D4] text-[#1B1C1C] text-[13px] hover:bg-gray-50 transition">05:00 PM</button>
                </div>
              </div>
            </div>

          </div>
          
          {/* Banner Resumen (Bottom) */}
          <div className="mt-4 flex flex-col md:flex-row p-6 justify-between items-start md:items-center rounded-lg bg-[#0061A4] shadow-lg w-full gap-4">
            <div className="flex flex-col gap-1 w-full md:w-auto">
              <p className="text-white text-[11px] font-bold tracking-[0.05em] opacity-90">
                RESUMEN DE LA RESERVA
              </p>
              <p className="text-white text-lg sm:text-xl font-semibold leading-tight">
                Cita con Dr. James Wilson en Consultorio 1
              </p>
              <p className="text-white text-[13px] opacity-80 tracking-[0.025em] uppercase">
                Sábado, 5 de Octubre, 2024 a las 10:00 AM
              </p>
            </div>
            <button className="py-3 px-8 rounded bg-white text-[#0061A4] text-xs font-bold tracking-[0.1em] shadow-md hover:bg-gray-50 transition w-full md:w-auto text-center">
              CONFIRMAR CITA
            </button>
          </div>

        </div>
      </div>

      {/* BOTÓN FLOTANTE CHAT */}
      <button className="flex justify-center items-center fixed right-4 bottom-4 sm:right-6 sm:bottom-6 rounded-xl bg-[#0061A4] shadow-xl w-14 h-14 z-50 hover:bg-blue-700 transition transform hover:scale-105">
        <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 13C2.16667 13 1.45833 12.7083 0.875 12.125C0.291667 11.5417 0 10.8333 0 10C0 9.16667 0.291667 8.45833 0.875 7.875C1.45833 7.29167 2.16667 7 3 7V5C3 4.45 3.19583 3.97917 3.5875 3.5875C3.97917 3.19583 4.45 3 5 3H8C8 2.16667 8.29167 1.45833 8.875 0.875C9.45833 0.291667 10.1667 0 11 0C11.8333 0 12.5417 0.291667 13.125 0.875C13.7083 1.45833 14 2.16667 14 3H17C17.55 3 18.0208 3.19583 18.4125 3.5875C18.8042 3.97917 19 4.45 19 5V7C19.8333 7 20.5417 7.29167 21.125 7.875C21.7083 8.45833 22 9.16667 22 10C22 10.8333 21.7083 11.5417 21.125 12.125C20.5417 12.7083 19.8333 13 19 13V17C19 17.55 18.8042 18.0208 18.4125 18.4125C18.0208 18.8042 17.55 19 17 19H5C4.45 19 3.97917 18.8042 3.5875 18.4125C3.19583 18.0208 3 17.55 3 17V13V13M8 11C8.41667 11 8.77083 10.8542 9.0625 10.5625C9.35417 10.2708 9.5 9.91667 9.5 9.5C9.5 9.08333 9.35417 8.72917 9.0625 8.4375C8.77083 8.14583 8.41667 8 8 8C7.58333 8 7.22917 8.14583 6.9375 8.4375C6.64583 8.72917 6.5 9.08333 6.5 9.5C6.5 9.91667 6.64583 10.2708 6.9375 10.5625C7.22917 10.8542 7.58333 11 8 11V11M14 11C14.4167 11 14.7708 10.8542 15.0625 10.5625C15.3542 10.2708 15.5 9.91667 15.5 9.5C15.5 9.08333 15.3542 8.72917 15.0625 8.4375C14.7708 8.14583 14.4167 8 14 8C13.5833 8 13.2292 8.14583 12.9375 8.4375C12.6458 8.72917 12.5 9.08333 12.5 9.5C12.5 9.91667 12.6458 10.2708 12.9375 10.5625C13.2292 10.8542 13.5833 11 14 11V11M7 15H15V13H7V15V15" fill="white" />
        </svg>
      </button>

    </div>
  );
}