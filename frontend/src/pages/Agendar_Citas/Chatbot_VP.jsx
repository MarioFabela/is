import React, { useState, useRef, useEffect } from 'react';
import { supabaseFrontend } from '../../api/supabaseClient';

// ✅ Nueva ruta dinámica exclusiva para el microservicio de Python
const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://127.0.0.1:8000/api';

export default function ChatbotCentrovitalRediseoModerno({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [citaActiva, setCitaActiva] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showTextInput, setShowTextInput] = useState(false);
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);

  // Obtener usuario autenticado
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabaseFrontend.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        setUserId(null);
      }
      setInitialLoading(false);
    };
    getUser();

    const { data: listener } = supabaseFrontend.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  const processBotResponse = async (action, userTextOverride = null) => {
    if (!userId) return;
    if (userTextOverride) {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'user', content: userTextOverride }]);
    }
    setIsLoading(true);
    try {
      // ✅ Usamos la URL dinámica aquí
      const response = await fetch(`${CHATBOT_API_URL}/chat-interno`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_sesion: userId, mensaje: action || userTextOverride || "" })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        type: data.tipo || 'text',
        content: data.respuesta_bot
      }]);

      setCurrentOptions(data.opciones || []);
      setCitaActiva(data.cita_activa || null);
      setShowTextInput(data.requires_text_input === true);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        content: "⚠️ No pude conectar con el servidor del chatbot. Por favor, intenta más tarde."
      }]);
      setShowTextInput(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      processBotResponse("inicio");
    }
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const userMessage = inputText.trim();
    setInputText('');
    await processBotResponse(userMessage, userMessage);
  };

  const handleOptionClick = (opt) => {
    if (isLoading) return;
    const action = opt.action || opt.label;
    processBotResponse(action, opt.label);
  };

  const EstiloBoton = "flex py-2 px-4 items-center gap-2 rounded-xl border border-[#0061A4] bg-white text-[#0061A4] text-sm font-semibold hover:bg-[#0061A4] hover:text-white transition-all shadow-sm";

  if (initialLoading) {
    return (
      <div className="flex flex-col bg-[#F5F3F3] min-w-full h-full items-center justify-center">
        <div className="animate-pulse text-[#0061A4] font-semibold">Cargando...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex flex-col bg-[#F5F3F3] min-w-full h-full items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md">
          <h2 className="text-xl font-bold text-[#1B1C1C] mb-4">Inicia sesión para continuar</h2>
          <p className="text-[#404752] mb-6">Necesitas estar autenticado para agendar citas médicas.</p>
          <button
            onClick={() => supabaseFrontend.auth.signInWithOAuth({ provider: 'google' })}
            className="bg-[#0061A4] text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#F5F3F3] min-w-full h-full relative font-inter">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0061A4] rounded-xl flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v4"/>
              <line x1="8" y1="16" x2="8" y2="16"/>
              <line x1="16" y1="16" x2="16" y2="16"/>
            </svg>
          </div>
          <div>
            <h2 className="text-[#1B1C1C] font-bold text-base">CentroVital AI</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-gray-500 text-[10px]">En línea</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 rounded-lg transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* ÁREA DE CHAT */}
      <div className="flex-1 overflow-y-auto w-full flex flex-col items-center p-4">
        <div className="w-full max-w-4xl flex flex-col gap-5 pb-4">
          {messages.length > 0 && (
            <div className="flex justify-center w-full">
              <div className="flex py-1 px-3 items-center rounded-xl bg-[#EFEDED]">
                <p className="text-[#404752] text-[11px] font-bold tracking-[0.05em]">HOY</p>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.sender === 'bot') {
              return (
                <div key={msg.id} className="flex flex-col gap-2 w-full items-start">
                  {messages.findIndex(m => m.id === msg.id) === 0 || messages[messages.findIndex(m => m.id === msg.id) - 1].sender !== 'bot' ? (
                    <div className="flex items-center gap-2 pl-2 mt-2">
                      <div className="flex justify-center items-center rounded-xl bg-[#D3E2ED] w-6 h-6 shrink-0">
                        <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
                          <path d="M1.75 7.58333C1.26389 7.58333 0.850694 7.41319 0.510417 7.07292C0.170139 6.73264 0 6.31944 0 5.83333C0 5.34722 0.170139 4.93403 0.510417 4.59375C0.850694 4.25347 1.26389 4.08333 1.75 4.08333V2.91667C1.75 2.59583 1.86424 2.32118 2.09271 2.09271C2.32118 1.86424 2.59583 1.75 2.91667 1.75H4.66667C4.66667 1.26389 4.83681 0.850694 5.17708 0.510417C5.51736 0.170139 5.93056 0 6.41667 0C6.90278 0 7.31597 0.170139 7.65625 0.510417C7.99653 0.850694 8.16667 1.26389 8.16667 1.75H9.91667C10.2375 1.75 10.5122 1.86424 10.7406 2.09271C10.9691 2.32118 11.0833 2.59583 11.0833 2.91667V4.08333C11.5694 4.08333 11.9826 4.25347 12.3229 4.59375C12.6632 4.93403 12.8333 5.34722 12.8333 5.83333C12.8333 6.31944 12.6632 6.73264 12.3229 7.07292C11.9826 7.41319 11.5694 7.58333 11.0833 7.58333V9.91667C11.0833 10.2375 10.9691 10.5122 10.7406 10.7406C10.5122 10.9691 10.2375 11.0833 9.91667 11.0833H2.91667C2.59583 11.0833 2.32118 10.9691 2.09271 10.7406C1.86424 10.5122 1.75 10.2375 1.75 9.91667V7.58333V7.58333" fill="#56656E" />
                        </svg>
                      </div>
                      <p className="text-[#404752] text-[11px] leading-[16.5px] uppercase font-semibold">ASISTENTE</p>
                    </div>
                  ) : null}
                  <div className="flex p-4 items-start rounded-2xl rounded-tl-sm bg-[#D3E2ED] shadow-sm max-w-[90%] md:max-w-[70%]">
                    <p className="text-[#56656E] text-base leading-6 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={msg.id} className="flex flex-col gap-1 w-full items-end mt-2">
                  {messages.findIndex(m => m.id === msg.id) === 0 || messages[messages.findIndex(m => m.id === msg.id) - 1].sender !== 'user' ? (
                    <p className="text-[#404752] text-[11px] leading-[16.5px] uppercase font-semibold pr-2">TÚ</p>
                  ) : null}
                  <div className="flex p-4 items-start rounded-2xl rounded-tr-sm bg-[#0061A4] shadow-sm max-w-[90%] md:max-w-[70%]">
                    <p className="text-white text-base leading-6 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            }
          })}

          {citaActiva && (
            <div className="flex flex-col p-4 gap-2 rounded-xl border border-[#0061A4] bg-[rgba(0,97,164,0.05)] mt-2 w-full max-w-[90%] md:max-w-[70%] shadow-sm">
              <p className="text-[#0061A4] text-[10px] font-bold tracking-wider">PRÓXIMA CITA</p>
              <p className="text-[#1B1C1C] text-base font-semibold">{citaActiva.doctor}</p>
              <p className="text-[#404752] text-sm">Fecha: {citaActiva.fecha} - {citaActiva.hora}</p>
              <p className="text-[#404752] text-sm">Estado: {citaActiva.estado === 'programada' ? 'Confirmada' : citaActiva.estado}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-[#0061A4] pl-2">
              <div className="animate-pulse">✍️</div>
              <span className="text-sm">Escribiendo...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* BOTONES DINÁMICOS */}
      {currentOptions.length > 0 && (
        <div className="flex overflow-x-auto gap-2 p-3 bg-white border-t border-[#BFC7D4] shrink-0">
          {currentOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(opt)}
              className={`${EstiloBoton} ${opt.color === 'red' ? 'border-[#BA1A1A] text-[#BA1A1A] hover:bg-[#BA1A1A] hover:text-white' : ''} whitespace-nowrap`}
              disabled={isLoading}
            >
              {opt.icon && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d={opt.icon} fill="currentColor" />
                </svg>
              )}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* INPUT DE TEXTO */}
      {showTextInput && (
        <div className="flex p-4 items-center bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)] border-t border-[#BFC7D4] w-full shrink-0">
          <form onSubmit={handleTextSubmit} className="flex w-full max-w-4xl mx-auto items-center gap-3">
            <button type="button" className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-gray-100 shrink-0 transition-colors text-gray-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
            </button>
            <div className="flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="w-full py-3 px-5 rounded-full border border-gray-200 bg-[#F5F3F3] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-gray-700"
                disabled={isLoading}
              />
            </div>
            <button type="submit" disabled={!inputText.trim() || isLoading} className="flex justify-center items-center rounded-full bg-[#0061A4] disabled:opacity-50 disabled:cursor-not-allowed w-12 h-12 shrink-0 hover:bg-blue-700 transition-colors shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}