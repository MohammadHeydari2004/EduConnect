import { navItems } from "#/configs/navigation.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useIsMobile } from "#/hooks/useMediaQuery.ts";
import { CloseIcon } from "#/components/common/icons";
import { forwardRef, useEffect, useMemo } from "react";
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
        if (event.key === "Escape") {
          onClose();
          return;
        }
        if (event.key !== "Tab") return;

        const aside = ref && typeof ref === "object" ? ref.current : null;
        if (!aside) return;

        const focusable = Array.from(
          aside.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, isMobile, onClose, ref]);

    useEffect(() => {
      if (!isDrawerClosed || !ref || typeof ref === "function") return;
      const aside = ref.current;
      if (!aside) return;
      if (aside.contains(document.activeElement)) {
        aside.blur();
      }
      aside.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ).forEach((el) => {
        el.setAttribute("tabindex", "-1");
      });
      return () => {
        aside.querySelectorAll<HTMLElement>("[tabindex='-1']").forEach((el) => {
          el.removeAttribute("tabindex");
        });
      };
    }, [isDrawerClosed, ref]);

    const filteredNavItems = useMemo(
      () => navItems.filter((item) =>
        user ? item.roles.includes(user.role) : false,
      ),
      [user],
    );

    return (
      <>
        {isOpen && (
          <div
            aria-hidden="true"
            className="fixed inset-0 z-10 bg-black/50 transition-opacity lg:hidden"
            onClick={onClose}
          />
        )}
        <aside
          ref={ref}
          aria-hidden={isDrawerClosed}
          inert={isDrawerClosed}
          className={`fixed right-0 max-w-fit transform border-l border-gray-200 bg-white p-4 transition-transform duration-300 ease-in-out lg:static lg:h-auto lg:translate-x-0 ${isMobile ? "top-0 z-60 h-full" : "top-16 z-10 h-full"} ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}
        >
          <div className="mb-3 flex justify-end lg:hidden">
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن منو"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <nav id="main-nav" aria-label="منوی اصلی" className="flex flex-col gap-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg border-s-4 px-4 py-2.5 text-sm font-medium transition-all ${isActive ? "border-blue-600 bg-blue-50 text-blue-700" : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`
                }
              >
                <span className="shrink-0"><Icon /></span>
                <span>{item.label}</span>
              </NavLink>
              );
            })}
          </nav>
        </aside>
      </>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
