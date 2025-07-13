
"use client"

import React, { createContext, useState, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useIsMobile } from "../../hooks/use-mobile.jsx";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./tooltip";

const SidebarContext = createContext(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [isOpen, setIsOpen] = useState(!isMobile);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
      setIsOpen(true);
    }
  }, [isMobile]);

  const value = {
    isCollapsed,
    isOpen,
    toggleSidebar,
    isMobile,
  };

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children }) => {
  const { isCollapsed, isOpen, toggleSidebar, isMobile } = useSidebar();

  const desktopSidebar = (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-[60px]" : "w-[250px]"
      )}
    >
      {children}
    </aside>
  );

  const mobileSidebar = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={toggleSidebar}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 z-50 flex h-full w-[250px] flex-col border-r bg-background lg:hidden"
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return isMobile ? mobileSidebar : desktopSidebar;
};

export const SidebarHeader = ({ children, className }) => {
  const { isCollapsed } = useSidebar();
  return (
    <div
      className={cn(
        "flex h-[57px] items-center border-b p-2",
        isCollapsed ? "justify-center" : "justify-start",
        className
      )}
    >
      {children}
    </div>
  );
};

export const SidebarContent = ({ children, className }) => {
  return (
    <div className={cn("flex-1 overflow-y-auto", className)}>{children}</div>
  );
};

export const SidebarFooter = ({ children, className }) => {
  const { isCollapsed } = useSidebar();
  return (
    <div
      className={cn(
        "mt-auto border-t p-2",
        isCollapsed ? "justify-center" : "justify-start",
        className
      )}
    >
      {children}
    </div>
  );
};

export const SidebarMenu = ({ children, className }) => {
  return <div className={cn("flex flex-col p-2", className)}>{children}</div>;
};

export const SidebarMenuItem = ({ children }) => {
  return <>{children}</>;
};

export const SidebarMenuButton = React.forwardRef(
  ({ children, icon: Icon, active, className, ...props }, ref) => {
    const { isCollapsed } = useSidebar();
    const buttonContent = (
      <Button
        ref={ref}
        variant={active ? "secondary" : "ghost"}
        className={cn(
          "flex w-full items-center justify-start gap-2",
          isCollapsed && "justify-center",
          className
        )}
        {...props}
      >
        {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
        {!isCollapsed && <span className="truncate">{children}</span>}
      </Button>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="right" align="center">
            <p>{children}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return buttonContent;
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarTrigger = ({ children, className }) => {
  const { toggleSidebar, isMobile } = useSidebar();
  if (!isMobile) return null;
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={toggleSidebar}
    >
      {children}
    </Button>
  );
};
