import { useAuth } from "#/contexts/AuthContext.ts";
import type { UserRole } from "#/types/common.ts";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface NavItem {
  label: string;
  path: string;
  roles: UserRole[];
  icon: ReactNode;
}

const icons = {
  dashboard: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  users: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  classes: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),
  attendance: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  ),
  announcements: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
      />
    </svg>
  ),
  assignments: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  profile: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
};

const navItems: NavItem[] = [
  {
    label: "داشبورد",
    path: "/",
    roles: ["admin", "teacher", "student"],
    icon: icons.dashboard,
  },
  { label: "کاربران", path: "/users", roles: ["admin"], icon: icons.users },
  {
    label: "کلاس‌ها",
    path: "/classes",
    roles: ["admin", "teacher"],
    icon: icons.classes,
  },
  {
    label: "حضور و غیاب",
    path: "/attendance",
    roles: ["admin", "teacher", "student"],
    icon: icons.attendance,
  },
  {
    label: "اطلاعیه‌ها",
    path: "/announcements",
    roles: ["admin", "teacher", "student"],
    icon: icons.announcements,
  },
  {
    label: "تکالیف",
    path: "/assignments",
    roles: ["admin", "teacher", "student"],
    icon: icons.assignments,
  },
  {
    label: "پروفایل",
    path: "/profile",
    roles: ["admin", "teacher", "student"],
    icon: icons.profile,
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
          aria-hidden="true"
          className="fixed inset-0 z-20 bg-black/50 transition-opacity md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-16 right-0 z-30 h-[calc(100vh-64px)] w-64 transform border-l border-gray-200 bg-white p-4 transition-transform duration-300 ease-in-out md:static md:z-auto md:h-auto md:translate-x-0 ${isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}
      >
        <nav aria-label="منوی اصلی" className="flex flex-col gap-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${isActive ? "border-s-4 border-blue-600 bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
