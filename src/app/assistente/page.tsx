'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Loader2, Send, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { chat, Message } from '@/ai/flows/chat-flow';
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

  return (
    <>
      <div className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-300",
        isOpen ? "pointer-events-none opacity-0 scale-95" : "pointer-events-auto opacity-100 scale-100"
      )}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-primary shadow-lg hover:scale-110 transition-transform"
        >
          <Bot className="w-8 h-8" />
        </Button>
      </div>

      <div className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-300",
        !isOpen ? "pointer-events-none opacity-0 scale-95" : "pointer-events-auto opacity-100 scale-100"
      )}>
        <Card className="w-[380px] h-[600px] flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
                <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot size={20}/></AvatarFallback>
                </Avatar>
                Assistente de Viagens
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
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
                      <Avatar>
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
                      <p className="text-sm">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <Avatar>
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
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
