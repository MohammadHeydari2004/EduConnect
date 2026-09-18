import Button from "#/components/ui/Button.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useNavigate } from "react-router-dom";

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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "مدیر";
      case "teacher":
        return "استاد";
      case "student":
        return "دانشجو";
      default:
        return role;
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="منو"
        >
          <svg
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
        <h1 className="text-lg font-bold text-blue-600 sm:text-xl">
          EduConnect
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {isAuthenticated && user ? (
          <>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 sm:hidden">
                {user.name.charAt(0)}
              </div>
              <div className="hidden text-sm text-gray-600 sm:block">
                {user.name} ({getRoleLabel(user.role)})
              </div>
            </div>
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
