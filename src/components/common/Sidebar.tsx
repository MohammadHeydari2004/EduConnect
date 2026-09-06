import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "#/context/AuthContext.ts";
import type { UserRole } from "#/types/common.ts";

interface NavItem {
  label: string;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: "داشبورد", path: "/", roles: ["admin", "teacher", "student"] },
  { label: "کاربران", path: "/users", roles: ["admin"] },
  { label: "کلاس‌ها", path: "/classes", roles: ["admin", "teacher"] },
  { label: "حضور و غیاب", path: "/attendance", roles: ["admin", "teacher"] },
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

function Sidebar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg md:hidden"
        aria-label="منو"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
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

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-40 w-64 transform border-l border-gray-200 bg-white p-4 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-2 pt-4 md:pt-0">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
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
