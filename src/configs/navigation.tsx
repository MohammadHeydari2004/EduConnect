import {
  AnnouncementsIcon,
  AssignmentsIcon,
  AttendanceIcon,
  ClassesIcon,
  DashboardIcon,
  ProfileIcon,
  StudentClassesIcon,
  UsersIcon,
} from "#/components/common/icons";
import {
  ADMIN_ROLES,
  ALL_ROLES,
  STUDENT_ROLES,
  TEACHER_AND_ABOVE_ROLES,
} from "#/configs/constants";
import type { UserRole } from "#/types/common.ts";
import type { ComponentType } from "react";

export interface NavItem {
  label: string;
  path: string;
  roles: UserRole[];
  icon: ComponentType<{ className?: string }>;
}

export const navItems: NavItem[] = [
  {
    label: "داشبورد",
    path: "/",
    roles: ALL_ROLES,
    icon: DashboardIcon,
  },
  {
    label: "کاربران",
    path: "/users",
    roles: ADMIN_ROLES,
    icon: UsersIcon,
  },
  {
    label: "کلاس‌های من",
    path: "/my-classes",
    roles: STUDENT_ROLES,
    icon: StudentClassesIcon,
  },
  {
    label: "کلاس‌ها",
    path: "/classes",
    roles: TEACHER_AND_ABOVE_ROLES,
    icon: ClassesIcon,
  },
  {
    label: "حضور و غیاب",
    path: "/attendance",
    roles: ALL_ROLES,
    icon: AttendanceIcon,
  },
  {
    label: "اطلاعیه‌ها",
    path: "/announcements",
    roles: ALL_ROLES,
    icon: AnnouncementsIcon,
  },
  {
    label: "تکالیف",
    path: "/assignments",
    roles: TEACHER_AND_ABOVE_ROLES,
    icon: AssignmentsIcon,
  },
  {
    label: "تکالیف من",
    path: "/my-assignments",
    roles: STUDENT_ROLES,
    icon: AssignmentsIcon,
  },
  {
    label: "پروفایل",
    path: "/profile",
    roles: ALL_ROLES,
    icon: ProfileIcon,
  },
];
