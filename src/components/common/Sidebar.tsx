import { useAuth } from "#/contexts/AuthContext.ts";
import type { UserRole } from "#/types/common.ts";
import { NavLink } from "react-router-dom";

interface NavItem {
  label: string;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: "داشبورد", path: "/", roles: ["admin", "teacher", "student"] },
  { label: "کاربران", path: "/users", roles: ["admin"] },
  { label: "کلاس‌ها", path: "/classes", roles: ["admin", "teacher"] },
  {
    label: "حضور و غیاب",
    path: "/attendance",
    roles: ["admin", "teacher", "student"],
  },
  {
    label: "اطلاعیه‌ها",
    path: "/announcements",
    roles: ["admin", "teacher", "student"],
  },
  {
    label: "تکالیف",
    path: "/assignments",
    roles: ["admin", "teacher", "student"],
  },
  {
    label: "پروفایل",
    path: "/profile",
    roles: ["admin", "teacher", "student"],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  const filteredNavItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 transition-opacity md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed right-0 top-16 z-30 h-[calc(100vh-64px)] w-64 transform border-l border-gray-200 bg-white p-4 transition-transform duration-300 ease-in-out md:static md:z-auto md:h-auto md:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <nav className="flex flex-col gap-2">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
