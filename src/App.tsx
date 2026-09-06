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
import SubmissionsPage from "#/pages/assignments/SubmissionsPage.tsx";

function App() {
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

        {/* ✅ اصلاح مسیر: دریافت classId به جای id مبهم */}
        <Route
          path="classes/:classId/assignments"
          element={
            <RoleGuard allowedRoles={["admin", "teacher", "student"]}>
              <AssignmentsPage />
            </RoleGuard>
          }
        />

        <Route
          path="assignments/:id/submissions"
          element={
            <RoleGuard allowedRoles={["admin", "teacher"]}>
              <SubmissionsPage />
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
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
export default App;
