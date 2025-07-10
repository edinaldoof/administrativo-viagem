
"use client";

import React from 'react';
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from './logo';
import { Home, ListChecks, FileUp, PlusCircle, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { RequestForm } from './request-form';
import { useState } from 'react';
import { type TravelRequest } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { getRequests, saveRequests } from '@/lib/actions';
import Link from 'next/link';
import ChatWidget from './chat-widget';
import { ThemeToggle } from './theme-toggle';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { toast } = useToast();

    const handleFormSubmit = (data: TravelRequest) => {
        const currentRequests = getRequests();
        const updatedRequests = [...currentRequests, data];
        saveRequests(updatedRequests);
        toast({ title: "Sucesso", description: `Solicitação criada com sucesso.` });
        setIsFormOpen(false);
        router.push('/solicitacoes');
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center justify-between">
                        <div className="p-1">
                            <Logo />
                        </div>
                        <SidebarTrigger />
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={pathname === '/'}
                                asChild
                            >
                                <Link href="/">
                                  <Home />
                                  <span>Inicial</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={pathname.startsWith('/solicitacoes')}
                                asChild
                            >
                                <Link href="/solicitacoes">
                                  <ListChecks />
                                  <span>Solicitações</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={pathname.startsWith('/passageiros')}
                                asChild
                            >
                                <Link href="/passageiros">
                                  <Users />
                                  <span>Passageiros</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={pathname.startsWith('/importar')}
                                asChild
                            >
                                <Link href="/importar">
                                  <PlusCircle />
                                  <span>Criar Requisição</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <div className="flex flex-1 flex-col">
                 <header className="flex h-14 items-center justify-end gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                    <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-8 pt-6">
                 {children}
                </main>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">
                        Criar Nova Solicitação de Viagem
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto pr-6 -mr-6">
                    <RequestForm
                        key={'new'}
                        onSubmit={handleFormSubmit}
                        initialData={null}
                    />
                </div>
                </DialogContent>
            </Dialog>
            <ChatWidget />
        </div>
    );
}
