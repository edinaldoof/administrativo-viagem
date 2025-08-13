import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
// Supondo que você crie um serviço de IA separado para o chat
import { getChatbotResponse } from '../ai/chatbotService'; 

const HelpChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Olá! Como posso ajudar você a usar o sistema Fadex Viagens?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Envia todo o histórico para a IA ter contexto
      const botResponse = await getChatbotResponse([...messages, userMessage]);
      setMessages(prev => [...prev, { from: 'bot', text: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { from: 'bot', text: 'Desculpe, não consegui responder agora.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Ícone flutuante */}
      <button 
        onClick={toggleChat} 
        className="fixed bottom-6 right-6 bg-blue-600 dark:bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform transform hover:scale-110 z-50"
        aria-label="Abrir chat de ajuda"
      >
        <MessageSquare size={24} />
      </button>

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl flex flex-col z-50 animate-fade-in-up">
          <header className="bg-blue-600 dark:bg-slate-700 text-white p-3 flex justify-between items-center rounded-t-lg">
            <h3 className="font-bold">Assistente Fadex</h3>
            <button onClick={toggleChat} className="p-1 rounded-full hover:bg-white/20 dark:hover:bg-slate-600">
              <X size={20} />
            </button>
          </header>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-3 p-2 rounded-lg max-w-[85%] text-sm ${
                msg.from === 'bot' 
                ? 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200' 
                : 'bg-blue-500 text-white ml-auto'
              }`}>
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="p-2 text-gray-500 dark:text-gray-400 text-sm">Digitando...</div>}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-slate-700 flex gap-2">
            <input
              type="text"   
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte algo..."
              className="flex-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-full px-4 py-2 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={isLoading}
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed" disabled={isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default HelpChatbot;
