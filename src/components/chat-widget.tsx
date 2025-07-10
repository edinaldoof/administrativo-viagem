
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Loader2, Send, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { chat } from '@/ai/flows/chat-flow';
import { type Message } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Olá! Como posso te ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [position, setPosition] = useState<{x: number, y: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [didDrag, setDidDrag] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial position only on the client side
    setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen || !position) return;
    setIsDragging(true);
    setDidDrag(false); 
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !widgetRef.current || !position) return;

    // Se o movimento for maior que um pequeno threshold, considera-se arrasto.
    if (Math.abs(e.clientX - (position.x + dragStartPos.current.x)) > 3 || Math.abs(e.clientY - (position.y + dragStartPos.current.y)) > 3) {
      setDidDrag(true); 
    }

    let newX = e.clientX - dragStartPos.current.x;
    let newY = e.clientY - dragStartPos.current.y;

    const widgetRect = widgetRef.current.getBoundingClientRect();
    newX = Math.max(0, Math.min(newX, window.innerWidth - widgetRect.width));
    newY = Math.max(0, Math.min(newY, window.innerHeight - widgetRect.height));

    setPosition({ x: newX, y: newY });
  }, [isDragging, position]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleClick = () => {
    // Só abre se não tiver ocorrido um arrasto
    if (!didDrag) {
      setIsOpen(true);
    }
    // Reseta o estado de arrasto para o próximo clique
    setDidDrag(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

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
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  if (!position) {
    return null; // Render nothing until the position is set on the client
  }

  return (
    <div
      ref={widgetRef}
      className="fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
      }}
    >
      {!isOpen && (
        <Button
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          className={cn(
            "rounded-full w-16 h-16 bg-primary shadow-lg transition-transform will-change-transform",
            isDragging ? "cursor-grabbing scale-110" : "cursor-grab hover:scale-110"
          )}
        >
          <Bot className="w-8 h-8" />
        </Button>
      )}

      {isOpen && (
         <Card className={cn(
            "w-[380px] h-[600px] flex flex-col shadow-2xl absolute bottom-0 right-0",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=right]:slide-in-from-left-2"
          )}
          data-state={isOpen ? "open" : "closed"}
         >
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot size={20}/></AvatarFallback>
                </Avatar>
                Assistente de Viagens
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
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
                      <Avatar className="flex-shrink-0">
                        <AvatarFallback><Bot /></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                       <Avatar className="flex-shrink-0">
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3 justify-start">
                    <Avatar>
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
          <CardFooter className="p-4 border-t">
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
    </div>
  );
}
