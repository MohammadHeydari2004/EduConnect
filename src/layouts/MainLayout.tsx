import Header from "#/components/common/Header.tsx";
import Sidebar from "#/components/common/Sidebar.tsx";
import { useLockBodyScroll } from "#/hooks/useLockBodyScroll.ts";
import { useIsMobile } from "#/hooks/useMediaQuery.ts";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
  const prevSidebarRef = useRef(false);

  useLockBodyScroll(isMobile && isSidebarOpen);

  useEffect(() => {
    setIsSidebarOpen(false);
    mainContentRef.current?.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    if (isMobile && isSidebarOpen && sidebarRef.current) {
      const firstFocusable = sidebarRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    } else if (
      prevSidebarRef.current &&
      !isSidebarOpen &&
      mainContentRef.current
    ) {
      mainContentRef.current.focus({ preventScroll: true });
    }
    prevSidebarRef.current = isSidebarOpen;
  }, [isSidebarOpen, isMobile]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:font-medium"
      >
        رفتن به محتوای اصلی
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
