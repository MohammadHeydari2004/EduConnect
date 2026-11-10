import Badge from "#/components/ui/Badge.tsx";
import Button from "#/components/ui/Button.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { getRoleLabel, getRoleVariant } from "#/utils/userLabels.ts";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CloseIcon, MenuIcon } from "#/components/common/icons";

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutConfirmOpen(false);
    logout();
    navigate("/login");
  };
  const handleLogoutRequest = () => {
    setIsLogoutConfirmOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-2 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-expanded={isSidebarOpen}
            aria-controls="main-nav"
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
            className="min-w-0 truncate text-base font-bold text-blue-600 transition hover:text-blue-800 sm:text-xl"
          >
            EduConnect
          </Link>
        </div>

        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          {user ? (
            <>
              <Link
                to="/profile"
                aria-label={`پروفایل کاربر ${user.name}`}
                title={user.name}
                className="flex min-w-0 items-center gap-1.5 rounded-lg px-1 py-1 transition hover:opacity-80 sm:gap-2"
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700"
                >
                  {user.name.trim() ? user.name.trim().charAt(0) : "?"}
                </span>
                <span className="hidden max-w-32 truncate text-sm text-gray-600 min-[360px]:inline">
                  {user.name.split(" ")[0]}
                </span>
                <Badge
                  variant={getRoleVariant(user.role)}
                  size="sm"
                  className="hidden min-[420px]:inline-flex"
                >
                  {getRoleLabel(user.role)}
                </Badge>
              </Link>
              <Button
                variant="secondary"
                onClick={handleLogoutRequest}
                className="shrink-0 px-2 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
              >
                خروج
              </Button>
            </>
          ) : null}
        </div>
      </header>
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        title="خروج از حساب"
        message="آیا مطمئن هستید که می‌خواهید خارج شوید؟"
        confirmText="خروج"
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

export default Header;
