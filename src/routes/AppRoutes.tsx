import MainLayout from "#/layouts/MainLayout.tsx";
import ProtectedRoute from "#/routes/ProtectedRoute.tsx";
import RoleGuard from "#/routes/RoleGuard.tsx";
import { Outlet, Route, Routes } from "react-router-dom";
import {
  ALL_ROLES,
  ADMIN_ROLES,
  TEACHER_AND_ABOVE_ROLES,
} from "#/configs/constants";
import DashboardPage from "#/pages/dashboard/DashboardContainer.tsx";
import LoginPage from "#/pages/auth/LoginPage.tsx";
import ProfilePage from "#/pages/profile/ProfilePage.tsx";
import UsersPage from "#/pages/users/UsersPage.tsx";
import ClassesPage from "#/pages/classes/ClassesPage.tsx";
import StudentClassesPage from "#/pages/classes/StudentClassesPage.tsx";
import ClassDetailsPage from "#/pages/classes/ClassDetailsPage.tsx";
import JoinClassPlaceholderPage from "#/pages/classes/JoinClassPlaceholderPage.tsx";
import AttendancePage from "#/pages/attendance/AttendancePage.tsx";
import AnnouncementsPage from "#/pages/announcements/AnnouncementsPage.tsx";
import TeacherAssignmentsPage from "#/pages/assignments/TeacherAssignmentsPage.tsx";
import StudentAssignmentsPage from "#/pages/assignments/StudentAssignmentsPage.tsx";
import SubmissionsPage from "#/pages/assignments/SubmissionsPage.tsx";
import NotFoundPage from "#/pages/errors/NotFoundPage.tsx";
import UnauthorizedPage from "#/pages/errors/UnauthorizedPage.tsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout>
              <Outlet />
            </MainLayout>
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />

        <Route
          path="users"
          element={
            <RoleGuard allowedRoles={ADMIN_ROLES}>
              <UsersPage />
            </RoleGuard>
          }
        />

        <Route
          path="classes"
          element={
            <RoleGuard allowedRoles={TEACHER_AND_ABOVE_ROLES}>
              <ClassesPage />
            </RoleGuard>
          }
        />

        <Route
          path="my-classes"
          element={
            <RoleGuard allowedRoles={["student"]}>
              <StudentClassesPage />
            </RoleGuard>
          }
        />

        <Route
          path="classes/:id"
          element={
            <RoleGuard allowedRoles={TEACHER_AND_ABOVE_ROLES}>
              <ClassDetailsPage />
            </RoleGuard>
          }
        />

        <Route
          path="classes/join/:classId"
          element={
            <RoleGuard allowedRoles={["student"]}>
              <JoinClassPlaceholderPage />
            </RoleGuard>
          }
        />

        <Route
          path="attendance"
          element={
            <RoleGuard allowedRoles={ALL_ROLES}>
              <AttendancePage />
            </RoleGuard>
          }
        />

        <Route
          path="announcements"
          element={
            <RoleGuard allowedRoles={ALL_ROLES}>
              <AnnouncementsPage />
            </RoleGuard>
          }
        />

        <Route
          path="assignments/:classId?"
          element={
            <RoleGuard allowedRoles={["teacher", "admin"]}>
              <TeacherAssignmentsPage />
            </RoleGuard>
          }
        />

        <Route
          path="my-assignments/:classId?"
          element={
            <RoleGuard allowedRoles={["student"]}>
              <StudentAssignmentsPage />
            </RoleGuard>
          }
        />

        <Route
          path="assignments/:id/submissions"
          element={
            <RoleGuard allowedRoles={TEACHER_AND_ABOVE_ROLES}>
              <SubmissionsPage />
            </RoleGuard>
          }
        />

        <Route
          path="profile"
          element={
            <RoleGuard allowedRoles={ALL_ROLES}>
              <ProfilePage />
            </RoleGuard>
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
