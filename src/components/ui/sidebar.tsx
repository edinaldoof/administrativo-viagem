
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Menu, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogPortal
} from "@/components/ui/dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarContextProps {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};


const sidebarVariants = cva("flex h-full flex-col transition-all duration-300 ease-in-out", {
  variants: {
    collapsed: {
      true: "w-16",
      false: "w-64",
    },
  },
});

const SidebarProvider = ({
  children,
  initialCollapsed = false,
}: {
  children: React.ReactNode,
  initialCollapsed?: boolean,
}) => {
  const [isCollapsed, setCollapsed] = React.useState(initialCollapsed);

  const handleSetCollapsed = (collapsed: boolean) => {
    setCollapsed(collapsed);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, setCollapsed: handleSetCollapsed }}>
       <TooltipProvider delayDuration={0}>
        {children}
      </TooltipProvider>
    </SidebarContext.Provider>
  );
};


const Sidebar = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed } = useSidebar();
  return (
    <aside
      ref={ref}
      className={cn("hidden border-r bg-sidebar text-sidebar-foreground lg:flex", sidebarVariants({ collapsed: isCollapsed }), className)}
      {...props}
    />
  );
});
Sidebar.displayName = "Sidebar"

const MobileSidebar = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
            </DialogTrigger>
            <DialogPortal>
                 <DialogContent side="left" className="p-0 w-64 h-full" showCloseButton={false}>
                    <div className={cn("flex h-full flex-col bg-sidebar text-sidebar-foreground", className)} {...props}>
                        {children}
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
};
MobileSidebar.displayName = "MobileSidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-14 shrink-0 items-center border-b px-4",
        isCollapsed ? "justify-center" : "justify-between",
        className
      )}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "mt-auto flex shrink-0 items-center border-t p-4",
        isCollapsed && "justify-center",
        className
      )}
      {...props}
    />
  );
});
SidebarFooter.displayName = "SidebarFooter"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("space-y-2 p-2", className)}
    {...props}
  />
));
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>((props, ref) => (
  <li
    ref={ref}
    {...props}
  />
));
SidebarMenuItem.displayName = "SidebarMenuItem"


interface SidebarMenuButtonProps extends ButtonProps {
  isActive?: boolean;
  tooltip?: string;
  asChild?: boolean;
}

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left text-sm font-medium outline-none transition-colors",
  {
    variants: {
      isActive: {
        true: "bg-sidebar-primary text-sidebar-primary-foreground",
        false: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      },
    },
    defaultVariants: {
      isActive: false,
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, isActive, tooltip, children, ...props }, ref) => {
  const { isCollapsed } = useSidebar();

  const buttonContent = (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        sidebarMenuButtonVariants({ isActive }),
        isCollapsed && "justify-center",
        className
      )}
      {...props}
    >
      <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && child.type === 'span' && isCollapsed) {
            return null;
          }
          return child;
        })}
      </div>
    </Button>
  );

  if (isCollapsed && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent side="right">{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
});
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    const { isCollapsed, setCollapsed } = useSidebar();
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("hidden shrink-0 lg:flex", className)}
        onClick={() => setCollapsed(!isCollapsed)}
        {...props}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger"

export { 
    useSidebar,
    SidebarProvider,
    Sidebar,
    MobileSidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
};
