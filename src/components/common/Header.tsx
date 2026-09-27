import Button from "#/components/ui/Button.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { getRoleLabel } from "#/utils/user.ts";
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? "بستن منو" : "باز کردن منو"}
        >
          <svg
            aria-hidden="true"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        <Link
          to="/"
          className="text-lg font-bold text-blue-600 transition hover:text-blue-800 sm:text-xl"
        >
          EduConnect
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {isAuthenticated && user ? (
          <>
            <Link
              to="/profile"
              className="flex items-center gap-2 transition hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 sm:hidden">
                {user.name.charAt(0)}
              </div>
              <div className="hidden text-sm text-gray-600 sm:block">
                {user.name} ({getRoleLabel(user.role)})
              </div>
            </Link>
            <Button variant="secondary" onClick={handleLogout}>
              خروج
            </Button>
          </>
        ) : (
          <div className="text-sm text-gray-500">مهمان</div>
        )}
      </div>
    </header>
  );
}

export default Header;
