import * as React from "react";
import { NavLink, type NavLinkProps } from "react-router-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { Menu as MenuIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// --- Context ---
interface SidebarContextProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  setIsMobileOpen: (isOpen: boolean) => void;
}
const SidebarContext = React.createContext<SidebarContextProps | null>(null);
export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
// --- Provider ---
const SIDEBAR_COOKIE_NAME = "sidebar-collapsed";
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof document === "undefined") {
      return false;
    }
    const storedValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
      ?.split('=')[1];
    return storedValue === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${newState}; path=/; max-age=31536000`;
      return newState;
    });
  };
  const value = {
    isCollapsed: isMobile ? false : isCollapsed,
    toggleCollapse,
    isMobileOpen,
    setIsMobileOpen,
  };
  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
};
// --- Components ---
const Root = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const { isMobileOpen, setIsMobileOpen, isCollapsed } = useSidebar();
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
          <aside className="flex h-full flex-col">{children}</aside>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72",
        className
      )}
    >
      {children}
    </aside>
  );
};
const Header = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const { isCollapsed } = useSidebar();
  return (
    <div
      className={cn(
        "flex h-16 items-center border-b border-sidebar-border",
        isCollapsed ? "justify-center" : "px-6",
        className
      )}
    >
      {children}
    </div>
  );
};
const Content = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}>{children}</div>
);
const Footer = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const { isCollapsed } = useSidebar();
  return (
    <div
      className={cn(
        "mt-auto border-t border-sidebar-border",
        isCollapsed ? "p-2" : "p-4",
        className
      )}
    >
      {children}
    </div>
  );
};
const Menu = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const { isCollapsed } = useSidebar();
  return (
    <nav className={cn("flex flex-col", isCollapsed ? "p-2" : "p-4", className)}>
      <ul className="flex flex-col gap-1">{children}</ul>
    </nav>
  );
};
const menuItemVariants = cva(
  "flex items-center justify-start rounded-lg text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  {
    variants: {
      isCollapsed: {
        true: "h-10 w-10 justify-center",
        false: "h-10 px-4 py-2",
      },
      },
    },
    defaultVariants: {
      isCollapsed: false,
    },
  }
);
interface MenuItemProps extends NavLinkProps {
  tooltip?: string;
  children: React.ReactNode;
}
const MenuItem = React.forwardRef<HTMLLIElement, MenuItemProps>(
  ({ className, tooltip, children, ...props }, ref) => {
    const { isCollapsed } = useSidebar();
    const link = (
      <NavLink
        {...props}
        className={({ isActive }) =>
          cn(
            menuItemVariants({ isCollapsed }),
            isActive && "bg-sidebar-active text-sidebar-active-foreground font-semibold hover:bg-sidebar-active/90 hover:text-sidebar-active-foreground",
            className
          )
        }
      >
        {children}
      </NavLink>
    );
    return (
      <li ref={ref}>
        {isCollapsed && tooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right" align="center">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          link
        )}
      </li>
    );
  }
);
MenuItem.displayName = "MenuItem";
const MenuButton = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useSidebar();
  let icon: React.ReactNode = null;
  const text: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && !icon) {
      icon = child;
    } else {
      text.push(child);
    }
  });
  return (
    <>
      {icon}
      {!isCollapsed && <span className="ml-3 truncate">{text}</span>}
    </>
  );
};
const Trigger = ({ className, ...props }: React.ComponentProps<typeof Button>) => {
  const { isMobileOpen, setIsMobileOpen, toggleCollapse } = useSidebar();
  const isMobile = useIsMobile();
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={() => (isMobile ? setIsMobileOpen(!isMobileOpen) : toggleCollapse())}
      {...props}
    >
      <MenuIcon className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};
const MainContent = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const { isCollapsed } = useSidebar();
  const isMobile = useIsMobile();
  return (
    <main
      className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        !isMobile && (isCollapsed ? "ml-16" : "ml-72"),
        className
      )}
    >
      {children}
    </main>
  );
};
export const Sidebar = {
  Root,
  Header,
  Content,
  Footer,
  Menu,
  MenuItem,
  MenuButton,
  Trigger,
  MainContent,
};