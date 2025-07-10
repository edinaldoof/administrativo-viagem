
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Loader2, Send, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { chat } from '@/ai/flows/chat-flow';
import { type Message } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Olá! Sou seu assistente de IA. Posso te ajudar a consultar solicitações de viagem, tirar dúvidas sobre o sistema e muito mais. Como posso ajudar?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat(newMessages);
      setMessages([...newMessages, response]);
    } catch (error) {
      console.error('Error with chat bot:', error);
      const errorMessage: Message = {
        role: 'model',
        content: 'Desculpe, ocorreu um erro ao me comunicar com a IA.',
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isOpen]);


  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
         <Card 
          className={cn(
            "w-[380px] h-[600px] flex flex-col shadow-2xl origin-bottom-right",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-2 data-[state=closed]:slide-out-to-right-2 data-[state=open]:slide-in-from-bottom-2 data-[state=open]:slide-in-from-right-2"
          )}
          data-state={isOpen ? "open" : "closed"}
         >
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/50">
            <div className='flex items-center gap-3'>
              <Avatar className="h-9 w-9 bg-primary/20 text-primary border border-primary/30">
                  <AvatarFallback><Bot size={22}/></AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="font-headline text-lg">Assistente Fadex</CardTitle>
                <CardDescription className="text-xs">Potencializado por IA</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Fechar</span>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
              <div className="space-y-6 p-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'model' && (
                      <Avatar className="flex-shrink-0 bg-primary/20 text-primary border border-primary/20">
                        <AvatarFallback><Bot /></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 shadow-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border'
                      }`}
                    >
                      <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                       <Avatar className="flex-shrink-0 border">
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3 justify-start">
                    <Avatar className="bg-primary/20 text-primary">
                      <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-lg rounded-lg px-4 py-2 bg-muted flex items-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t bg-muted/50">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte algo..."
                disabled={isLoading}
                autoComplete="off"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      <Button
          onClick={() => setIsOpen(prev => !prev)}
          className="rounded-full w-16 h-16 bg-primary shadow-lg hover:shadow-2xl hover:scale-110 transform transition-all duration-300 ease-in-out mt-4"
          aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
        >
          {isOpen ? <X className="w-7 h-7" /> : <Bot className="w-8 h-8" />}
        </Button>
    </div>
  );
}
