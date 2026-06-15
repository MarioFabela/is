export default function AgendarSeguimientoMenSuperior() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F9] font-inter">
      
      {/* NAVEGACIÓN (HEADER) */}
      <div className="flex py-4 px-4 sm:px-6 items-center border-b border-[#BFC7D4] bg-[#FBF9F9] w-full shrink-0">
        <div className="flex max-w-7xl mx-auto justify-between items-center w-full">
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <img src="/CentrovitalLogo.png" className="w-[59px] h-8 object-contain" alt="CentroVital Logo" />
              <p className="text-[#0061A4] text-lg font-bold">CentroVital</p>
            </div>
            {/* Oculto en móviles muy pequeños, visible en tabletas+ */}
            <div className="hidden sm:flex items-center gap-1">
              <button className="py-2 px-4 text-[#526069] text-base hover:bg-gray-100 rounded-md transition">Panel de Control</button>
              <button className="py-2 px-4 text-[#526069] text-base hover:bg-gray-100 rounded-md transition">Pacientes</button>
              <button className="py-2 px-4 text-[#526069] text-base hover:bg-gray-100 rounded-md transition">Reportes</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-[#526069] text-xs font-semibold">Ward 4B</p>
              <p className="text-[#707883] text-xs">12 Oct 2023</p>
            </div>
            <div className="flex justify-center items-center rounded-xl border border-[#BFC7D4] w-10 h-10 overflow-hidden bg-gray-200 shrink-0">
              <img src="/DrProfile.png" className="w-full h-full object-cover" alt="Dr. Profile" />
            </div>
          </div>
          
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex flex-col items-center w-full flex-1 p-4 sm:p-6">
        <div className="flex flex-col gap-6 w-full max-w-5xl">
          
          {/* BANNER PACIENTE */}
          <div className="flex flex-col md:flex-row p-4 justify-between items-start md:items-center border border-[#BFC7D4] bg-white w-full rounded-md gap-4">
            <div className="flex items-center gap-4">
              <div className="flex justify-center items-center rounded bg-[#D3E2ED] w-12 h-12 shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8V8M0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0V16M2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14V14M8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6V6" fill="#0061A4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <p className="text-[#1B1C1C] text-lg font-semibold leading-6">Juan Pérez</p>
                <p className="text-[#526069] text-[13px] leading-[18px]">ID: 12.345.678-9 • Plan Fonasa B</p>
              </div>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <div className="py-1 px-3 rounded-xl border border-[#BFC7D4] bg-[#EFEDED]">
                <p className="text-[#526069] text-xs font-bold leading-4">HISTORIAL ACTIVO</p>
              </div>
              <div className="py-1 px-3 rounded-xl border border-[rgba(0,97,164,0.20)] bg-[rgba(33,150,243,0.10)]">
                <p className="text-[#0061A4] text-xs font-bold leading-4">POST-OPERATORIO</p>
              </div>
            </div>
          </div>

          {/* GRID PRINCIPAL (2 Columnas en Desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
            
            {/* COLUMNA IZQUIERDA: CALENDARIO Y HORARIOS */}
            <div className="flex flex-col gap-6 w-full">
              
              {/* Box Calendario */}
              <div className="flex flex-col border border-[#BFC7D4] bg-white w-full rounded-md overflow-hidden">
                <div className="flex p-3 justify-between items-center border-b border-[#BFC7D4] bg-[#EFEDED]">
                  <p className="text-[#526069] text-[11px] font-bold tracking-[0.05em]">SELECCIONAR FECHA</p>
                  <div className="flex items-center gap-4">
                    <button className="text-[#526069] hover:text-black">
                      <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 12L0 6L6 0L7.4 1.4L2.8 6L7.4 10.6L6 12V12"/></svg>
                    </button>
                    <p className="text-[#1B1C1C] text-sm font-medium">Octubre 2023</p>
                    <button className="text-[#526069] hover:text-black">
                       <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4.6 6L0 1.4L1.4 0L7.4 6L1.4 12L0 10.6L4.6 6V6"/></svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-4 w-full">
                  {/* Días de la semana */}
                  <div className="grid grid-cols-7 mb-2 text-center">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                      <p key={day} className="text-[#707883] text-[10px] font-bold">{day}</p>
                    ))}
                  </div>
                  {/* Números del calendario */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    <button className="h-10 opacity-30 text-[#707883] text-sm font-medium hover:bg-gray-100 rounded">28</button>
                    <button className="h-10 opacity-30 text-[#707883] text-sm font-medium hover:bg-gray-100 rounded">29</button>
                    <button className="h-10 opacity-30 text-[#707883] text-sm font-medium hover:bg-gray-100 rounded">30</button>
                    <button className="h-10 text-[#1B1C1C] text-sm font-medium hover:bg-gray-100 rounded">1</button>
                    <button className="h-10 text-[#1B1C1C] text-sm font-medium hover:bg-gray-100 rounded">2</button>
                    <button className="h-10 text-[#1B1C1C] text-sm font-medium hover:bg-gray-100 rounded">3</button>
                    <button className="h-10 text-[#0061A4] text-sm font-bold hover:bg-blue-50 rounded">4</button>
                    <button className="h-10 text-[#1B1C1C] text-sm font-medium hover:bg-gray-100 rounded">5</button>
                    <button className="h-10 bg-[#0061A4] text-white text-sm font-bold shadow-md rounded">6</button>
                    <button className="h-10 text-[#1B1C1C] text-sm font-medium hover:bg-gray-100 rounded">7</button>
                    <button className="h-10 text-[#1B1C1C] text-sm font-medium hover:bg-gray-100 rounded">8</button>
                    <button className="h-10 text-[#1B1C1C] text-sm font-medium hover:bg-gray-100 rounded">9</button>
                    <button className="h-10 text-[#1B1C1C] text-sm font-medium hover:bg-gray-100 rounded">10</button>
                    <button className="h-10 text-[#1B1C1C] text-sm font-medium hover:bg-gray-100 rounded">11</button>
                    <button className="h-10 text-[#1B1C1C] text-sm font-medium hover:bg-gray-100 rounded">12</button>
                    <button className="h-10 text-[#1B1C1C] text-sm font-medium hover:bg-gray-100 rounded">13</button>
                  </div>
                </div>
              </div>

              {/* Box Horarios */}
              <div className="flex flex-col border border-[#BFC7D4] bg-white w-full rounded-md overflow-hidden">
                <div className="p-3 border-b border-[#BFC7D4] bg-[#EFEDED]">
                  <p className="text-[#526069] text-[11px] font-bold tracking-[0.05em]">HORARIOS DISPONIBLES (6 OCT)</p>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                  <button className="py-2 px-4 rounded border border-[#BFC7D4] text-[#526069] text-sm font-medium hover:bg-gray-50">08:30</button>
                  <button className="py-2 px-4 rounded border border-[#BFC7D4] text-[#526069] text-sm font-medium hover:bg-gray-50">09:15</button>
                  <button className="py-2 px-4 rounded border-[#0061A4] bg-[#0061A4] text-white text-sm font-bold shadow-sm">10:00</button>
                  <button className="py-2 px-4 rounded border border-[#BFC7D4] text-[#526069] text-sm font-medium hover:bg-gray-50">10:45</button>
                  <button className="py-2 px-4 rounded border border-[#BFC7D4] text-[#526069] text-sm font-medium hover:bg-gray-50">11:30</button>
                  <button className="py-2 px-4 rounded border border-[#BFC7D4] bg-[#EFEDED] text-[#526069] text-sm font-medium opacity-50 cursor-not-allowed">12:15</button>
                  <button className="py-2 px-4 rounded border border-[#BFC7D4] text-[#526069] text-sm font-medium hover:bg-gray-50">15:00</button>
                  <button className="py-2 px-4 rounded border border-[#BFC7D4] text-[#526069] text-sm font-medium hover:bg-gray-50">15:45</button>
                </div>
              </div>

            </div>

            {/* COLUMNA DERECHA: PRIORIDAD Y NOTAS */}
            <div className="flex flex-col gap-6 w-full">
              
              <div className="flex flex-col p-4 gap-5 border border-[#BFC7D4] bg-white rounded-md w-full">
                
                {/* Urgencia / Prioridad */}
                <div className="flex flex-col gap-3 w-full">
                  <p className="text-[#526069] text-[11px] font-bold tracking-[0.05em]">URGENCIA / PRIORIDAD</p>
                  <div className="flex flex-col gap-2 w-full">
                    
                    <label className="flex p-3 items-center gap-3 rounded border border-[#BFC7D4] w-full cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex justify-center items-center rounded-full bg-[#0061A4] w-[18px] h-[18px]">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 8C5 9.65575 6.34425 11 8 11C9.65575 11 11 9.65575 11 8C11 6.34425 9.65575 5 8 5C6.34425 5 5 6.34425 5 8V8" fill="white" />
                        </svg>
                      </div>
                      <p className="text-[#1B1C1C] text-base">Control de Rutina</p>
                    </label>

                    <label className="flex p-3 items-center gap-3 rounded border border-[#BFC7D4] w-full cursor-pointer hover:bg-gray-50 transition">
                      <div className="rounded-full border border-[#6B7280] bg-white w-[18px] h-[18px]"></div>
                      <p className="text-[#1B1C1C] text-base">Revisión de Resultados</p>
                    </label>

                    <label className="flex p-3 items-center gap-3 rounded border border-[rgba(186,26,26,0.30)] bg-[rgba(186,26,26,0.05)] w-full cursor-pointer hover:bg-red-50 transition">
                      <div className="rounded-full border border-[#6B7280] bg-white w-[18px] h-[18px]"></div>
                      <p className="text-[#BA1A1A] text-base font-semibold">Urgente</p>
                    </label>
                  </div>
                </div>

                {/* Recurrencia */}
                <div className="flex flex-col gap-2 w-full">
                  <p className="text-[#526069] text-[11px] font-bold tracking-[0.05em]">RECURRENCIA</p>
                  <button className="flex p-3 justify-between items-center rounded border border-[#BFC7D4] bg-white w-full hover:bg-gray-50 transition">
                    <p className="text-[#1B1C1C] text-base">Cita Única</p>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.2 9.6L12 14.4L16.8 9.6" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Motivo del Seguimiento */}
              <div className="flex flex-col p-4 gap-3 border border-[#BFC7D4] bg-white rounded-md w-full">
                <p className="text-[#526069] text-[11px] font-bold tracking-[0.05em]">MOTIVO DEL SEGUIMIENTO</p>
                <textarea 
                  className="w-full p-3 rounded border border-[#BFC7D4] text-[#1B1C1C] text-base resize-none h-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Escriba notas adicionales para la próxima visita..."
                ></textarea>
                
                <div className="flex p-3 items-start gap-3 rounded-sm bg-[#F5F3F3] w-full">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-1 shrink-0">
                    <path d="M5.25 8.75H6.41667V5.25H5.25V8.75V8.75M5.83333 4.08333C5.99861 4.08333 6.13715 4.02743 6.24896 3.91563C6.36076 3.80382 6.41667 3.66528 6.41667 3.5C6.41667 3.33472 6.36076 3.19618 6.24896 3.08437C6.13715 2.97257 5.99861 2.91667 5.83333 2.91667C5.66806 2.91667 5.52951 2.97257 5.41771 3.08437C5.3059 3.19618 5.25 3.33472 5.25 3.5C5.25 3.66528 5.3059 3.80382 5.41771 3.91563C5.52951 4.02743 5.66806 4.08333 5.83333 4.08333V4.08333M5.83333 11.6667C5.02639 11.6667 4.26806 11.5135 3.55833 11.2073C2.84861 10.901 2.23125 10.4854 1.70625 9.96042C1.18125 9.43542 0.765625 8.81806 0.459375 8.10833C0.153125 7.39861 0 6.64028 0 5.83333C0 5.02639 0.153125 4.26806 0.459375 3.55833C0.765625 2.84861 1.18125 2.23125 1.70625 1.70625C2.23125 1.18125 2.84861 0.765625 3.55833 0.459375C4.26806 0.153125 5.02639 0 5.83333 0C6.64028 0 7.39861 0.153125 8.10833 0.459375C8.81806 0.765625 9.43542 1.18125 9.96042 1.70625C10.4854 2.23125 10.901 2.84861 11.2073 3.55833C11.5135 4.26806 11.6667 5.02639 11.6667 5.83333C11.6667 6.64028 11.5135 7.39861 11.2073 8.10833C10.901 8.81806 10.4854 9.43542 9.96042 9.96042C9.43542 10.4854 8.81806 10.901 8.10833 11.2073C7.39861 11.5135 6.64028 11.6667 5.83333 11.6667V11.6667M5.83333 10.5C7.13611 10.5 8.23958 10.0479 9.14375 9.14375C10.0479 8.23958 10.5 7.13611 10.5 5.83333C10.5 4.53056 10.0479 3.42708 9.14375 2.52292C8.23958 1.61875 7.13611 1.16667 5.83333 1.16667C4.53056 1.16667 3.42708 1.61875 2.52292 2.52292C1.61875 3.42708 1.16667 4.53056 1.16667 5.83333C1.16667 7.13611 1.61875 8.23958 2.52292 9.14375C3.42708 10.0479 4.53056 10.5 5.83333 10.5V10.5M5.83333 5.83333V5.83333V5.83333V5.83333V5.83333V5.83333V5.83333V5.83333V5.83333V5.83333" fill="#526069"/>
                  </svg>
                  <p className="text-[#526069] text-[13px] leading-[18px]">
                    &quot;Revisar evolución de herida quirúrgica y ajustar dosificación de fármacos según laboratorios.&quot;
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-3 w-full mt-2">
                  <button className="flex py-3 justify-center items-center gap-2 rounded bg-[#2196F3] text-white hover:bg-blue-600 transition shadow-sm w-full">
                    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.95 16.35L4.4 12.8L5.85 11.35L7.95 13.45L12.15 9.25L13.6 10.7L7.95 16.35V16.35M2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H3V0H5V2H13V0H15V2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V18C18 18.55 17.8042 19.0208 17.4125 19.4125C17.0208 19.8042 16.55 20 16 20H2V20M2 18H16V18V18V8H2V18V18V18V18M2 6H16V4V4V4H2V4V4V6V6M2 6V4V4V4V4V4V4V6V6V6" fill="white" />
                    </svg>
                    <span className="font-semibold text-base">Confirmar y Agendar</span>
                  </button>
                  <button className="flex py-3 justify-center items-center gap-2 rounded border border-[#0061A4] text-[#0061A4] hover:bg-blue-50 transition w-full">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825V9" fill="currentColor"/>
                    </svg>
                    <span className="font-medium text-base">Volver a la Nota</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}