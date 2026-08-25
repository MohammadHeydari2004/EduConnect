import type { ReactNode } from "react";

import Header from "#/components/common/Header.tsx";
import Sidebar from "#/components/common/Sidebar.tsx";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar />

        {/* ✅ ریسپانسیو: padding کمتر در موبایل */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
