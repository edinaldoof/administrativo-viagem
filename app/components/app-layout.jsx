
"use client"
import React from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarMenuButton,
} from "./ui/sidebar";
import {
  Settings,
  Users,
  Home,
  FileUp,
  PanelLeft,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSidebar } from "./ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    href: "/",
    icon: Home,
    label: "Início",
  },
  {
    href: "/solicitacoes",
    icon: Users,
    label: "Minhas Solicitações",
  },
  {
    href: "/importar",
    icon: FileUp,
    label: "Criar Requisição",
  },
  {
    href: "/configuracoes",
    icon: Settings,
    label: "Configurações",
  },
];

export default function AppLayout({ children }) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "min-h-screen w-full bg-background text-foreground",
        "grid transition-[grid-template-columns] duration-300 ease-in-out",
        isCollapsed ? "grid-cols-[60px_1fr]" : "grid-cols-[250px_1fr]"
      )}
    >
      <Sidebar>
        <SidebarHeader>
          <div
            className={cn(
              "flex items-center gap-2",
              isCollapsed && "justify-center"
            )}
          >
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Fadex</span>
                <span className="text-xs text-muted-foreground">
                  Administrativo
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    icon={item.icon}
                    active={pathname === item.href}
                  >
                    {item.label}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenuButton icon={Settings}>Configurações</SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <SidebarTrigger>
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </SidebarTrigger>
          <h1 className="text-xl font-semibold ml-2">Viagens-Fadex</h1>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar..."
              className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[336px] h-9"
            />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
