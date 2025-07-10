
"use client";

import React from 'react';
import { Sidebar, SidebarContent, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from './logo';
import { Home, ListChecks, FileUp, Bot, PlusCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { RequestForm } from './request-form';
import { useState } from 'react';
import { type TravelRequest } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { getRequests, saveRequests } from '@/lib/actions';
import { v4 as uuidv4 } from "uuid";
import Link from 'next/link';

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
                                onClick={() => setIsFormOpen(true)}
                            >
                                <PlusCircle />
                                <span>Nova Solicitação</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={pathname.startsWith('/importar')}
                                asChild
                            >
                                <Link href="/importar">
                                  <FileUp />
                                  <span>Importar com IA</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={pathname.startsWith('/assistente')}
                                asChild
                            >
                                <Link href="/assistente">
                                  <Bot />
                                  <span>Assistente</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <SidebarInset className="flex-1">
                {children}
            </SidebarInset>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
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
        </div>
    );
}
