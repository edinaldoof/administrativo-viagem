
"use client";

import React from 'react';
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarTrigger, SidebarFooter, MobileSidebar } from '@/components/ui/sidebar';
import { Logo } from './logo';
import { Home, ListChecks, PlusCircle, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ChatWidget from './chat-widget';
import { ThemeToggle } from './theme-toggle';

function NavLinks() {
    const pathname = usePathname();
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    isActive={pathname === '/'}
                    asChild
                    tooltip="Painel de Controle"
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
                    tooltip="Solicitações"
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
                    tooltip="Passageiros"
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
                    tooltip="Criar Requisição"
                >
                    <Link href="/importar">
                        <PlusCircle />
                        <span>Criar Requisição</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    
    return (
        <div className="flex min-h-screen">
            <Sidebar>
                <SidebarHeader>
                    <Logo />
                    <SidebarTrigger />
                </SidebarHeader>
                <SidebarContent>
                   <NavLinks />
                </SidebarContent>
                <SidebarFooter>
                    <ThemeToggle />
                </SidebarFooter>
            </Sidebar>

            <div className="flex flex-1 flex-col">
                 <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 lg:justify-end">
                    <MobileSidebar>
                         <SidebarHeader>
                            <Logo />
                         </SidebarHeader>
                         <SidebarContent>
                            <NavLinks />
                         </SidebarContent>
                         <SidebarFooter>
                            <ThemeToggle />
                         </SidebarFooter>
                    </MobileSidebar>
                    {/* Placeholder for future header content */}
                </header>
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
            <ChatWidget />
        </div>
    );
}
