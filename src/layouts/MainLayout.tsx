import Header from "#/components/common/Header.tsx";
import Sidebar from "#/components/common/Sidebar.tsx";
import { useIsMobile } from "#/hooks/useMediaQuery.ts";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const mainContentRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsSidebarOpen(false);
    mainContentRef.current?.scrollTo({ top: 0 });
    mainContentRef.current?.focus();
  }, [location.pathname]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isMobile && isSidebarOpen && sidebarRef.current) {
      const firstFocusable = sidebarRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    } else if (!isSidebarOpen && mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, [isSidebarOpen, isMobile]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
      >
        پرش به محتوای اصلی
      </a>

      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          ref={sidebarRef}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main
          ref={mainContentRef}
          id="main-content"
          className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto outline-none"
          tabIndex={-1}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
