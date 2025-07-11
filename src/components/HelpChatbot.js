import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
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
      <button onClick={toggleChat} className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-50">
        <MessageSquare size={24} />
      </button>

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 animate-fade-in-up">
          <header className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <h3 className="font-bold">Assistente Fadex</h3>
            <button onClick={toggleChat}><X size={20} /></button>
          </header>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-3 p-2 rounded-lg max-w-xs ${
                msg.from === 'bot' 
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-blue-500 text-white ml-auto'
              }`}>
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="p-2 text-gray-500">Digitando...</div>}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
            <input
              type="text"   
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte algo..."
              className="flex-1 border rounded-full px-4 py-2"
              disabled={isLoading}
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-full" disabled={isLoading}>
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default HelpChatbot; 