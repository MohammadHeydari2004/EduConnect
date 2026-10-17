import Badge from "#/components/ui/Badge.tsx";
import Button from "#/components/ui/Button.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { getRoleLabel, getRoleVariant } from "#/utils/user.ts";
import { Link, useNavigate } from "react-router-dom";
import { CloseIcon, MenuIcon } from "#/components/common/icons.tsx";

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
          {isSidebarOpen ? (
            <CloseIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </button>
        <Link
          to="/"
          className="text-lg font-bold text-blue-600 transition hover:text-blue-800 sm:text-xl"
        >
          EduConnect
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {user ? (
          <>
            <Link
              to="/profile"
              aria-label="پروفایل"
              className="flex items-center gap-2 transition hover:opacity-80"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 sm:hidden"
                aria-hidden="true"
              >
                {user.name.charAt(0)}
              </div>
              <div className="hidden items-center gap-2 text-sm text-gray-600 sm:flex">
                {user.name}
                <Badge variant={getRoleVariant(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </Link>
            <Button variant="secondary" onClick={handleLogout}>
              خروج
            </Button>
          </>
        ) : null}
      </div>
    </header>
  );
}

export default Header;
