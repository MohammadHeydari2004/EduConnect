import { navItems } from "#/configs/navigation.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useIsMobile } from "#/hooks/useMediaQuery.ts";
import { forwardRef, useEffect } from "react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ isOpen, onClose }, ref) => {
    const { user } = useAuth();
    const isMobile = useIsMobile();

    const isDrawerClosed = !isOpen && isMobile;

    useEffect(() => {
      if (!isOpen || !isMobile) return;
      const handleKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, isMobile, onClose]);

    const filteredNavItems = navItems.filter((item) =>
      user ? item.roles.includes(user.role) : false,
    );

    return (
      <>
        {isOpen && (
          <div
            aria-hidden="true"
            className="fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden"
            onClick={onClose}
          />
        )}
        <aside
          ref={ref}
          aria-hidden={isDrawerClosed}
          className={`fixed right-0 max-w-fit transform border-l border-gray-200 bg-white p-4 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:h-auto lg:translate-x-0 ${isMobile ? "top-0 z-50 h-[calc(100vh)]" : "top-16 z-30 h-full"} ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}
        >
          <nav aria-label="منوی اصلی" className="flex flex-col gap-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${isActive ? "border-s-4 border-blue-600 bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`
                }
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
      </>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
