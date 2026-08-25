import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import MainLayout from "#/layouts/MainLayout.tsx";
import DashboardPage from "#/pages/dashboard/DashboardPage.tsx";
import UsersPage from "#/pages/users/UsersPage.tsx";
import ClassesPage from "#/pages/classes/ClassesPage.tsx";
import ClassDetailsPage from "#/pages/classes/ClassDetailsPage.tsx";
import AttendancePage from "#/pages/attendance/AttendancePage.tsx";
import AnnouncementsPage from "#/pages/announcements/AnnouncementsPage.tsx";
import AssignmentsPage from "#/pages/assignments/AssignmentsPage.tsx";
import ProfilePage from "#/pages/profile/ProfilePage.tsx";
import LoginPage from "#/pages/auth/LoginPage.tsx";
import UnauthorizedPage from "#/pages/UnauthorizedPage.tsx";
import NotFoundPage from "#/pages/NotFoundPage.tsx";
import ProtectedRoute from "#/routes/ProtectedRoute.tsx";
import RoleGuard from "#/routes/RoleGuard.tsx";

function App() {
  return (
    <Routes>
      {/* مسیرهای عمومی */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Layout Route برای صفحات محافظت‌شده */}
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
            <RoleGuard allowedRoles={["admin"]}>
              <UsersPage />
            </RoleGuard>
          }
        />

        <Route
          path="classes"
          element={
            <RoleGuard allowedRoles={["admin", "teacher"]}>
              <ClassesPage />
            </RoleGuard>
          }
        />

        {/* ✅ مسیر جدید برای جزئیات کلاس */}
        <Route
          path="classes/:id"
          element={
            <RoleGuard allowedRoles={["admin", "teacher"]}>
              <ClassDetailsPage />
            </RoleGuard>
          }
        />

        <Route
          path="attendance"
          element={
            <RoleGuard allowedRoles={["admin", "teacher"]}>
              <AttendancePage />
            </RoleGuard>
          }
        />

        <Route
          path="announcements"
          element={
            <RoleGuard allowedRoles={["admin", "teacher", "student"]}>
              <AnnouncementsPage />
            </RoleGuard>
          }
        />

        <Route
          path="assignments"
          element={
            <RoleGuard allowedRoles={["admin", "teacher", "student"]}>
              <AssignmentsPage />
            </RoleGuard>
          }
        />

        <Route
          path="profile"
          element={
            <RoleGuard allowedRoles={["admin", "teacher", "student"]}>
              <ProfilePage />
            </RoleGuard>
          }
        />
      </Route>

      {/* ریدایرکت و صفحات خطا */}
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
