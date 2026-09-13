import { useNavigate } from "react-router-dom";
import Button from "#/components/ui/Button.tsx";
import { useAuth } from "#/context/AuthContext.ts";

function Header() {
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
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div>
        <h1 className="text-lg font-bold text-blue-600 sm:text-xl">
          EduConnect
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {isAuthenticated && user ? (
          <>
            <div className="hidden text-sm text-gray-600 sm:block">
              {user.name} ({getRoleLabel(user.role)})
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
