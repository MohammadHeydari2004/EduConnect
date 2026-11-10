import Loader from "#/components/common/Loading.tsx";
import MainLayout from "#/layouts/MainLayout.tsx";
import ProtectedRoute from "#/routes/ProtectedRoute.tsx";
import RoleGuard from "#/routes/RoleGuard.tsx";
import { lazy, Suspense } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import {
  ADMIN_ROLES,
  TEACHER_AND_ABOVE_ROLES,
  STUDENT_ROLES,
} from "#/configs/constants";

const DashboardPage = lazy(() => import("#/pages/dashboard/DashboardContainer.tsx"));
const LoginPage = lazy(() => import("#/pages/auth/LoginPage.tsx"));
const ProfilePage = lazy(() => import("#/pages/profile/ProfilePage.tsx"));
const UsersPage = lazy(() => import("#/pages/users/UsersPage.tsx"));
const ClassesPage = lazy(() => import("#/pages/classes/ClassesPage.tsx"));
const StudentClassesPage = lazy(() => import("#/pages/classes/StudentClassesPage.tsx"));
const ClassDetailsPage = lazy(() => import("#/pages/classes/ClassDetailsPage.tsx"));
const AttendancePage = lazy(() => import("#/pages/attendance/AttendancePage.tsx"));
const AnnouncementsPage = lazy(() => import("#/pages/announcements/AnnouncementsPage.tsx"));
const TeacherAssignmentsPage = lazy(() => import("#/pages/assignments/TeacherAssignmentsPage.tsx"));
const StudentAssignmentsPage = lazy(() => import("#/pages/assignments/StudentAssignmentsPage.tsx"));
const SubmissionsPage = lazy(() => import("#/pages/assignments/SubmissionsPage.tsx"));
const NotFoundPage = lazy(() => import("#/pages/errors/NotFoundPage.tsx"));
const UnauthorizedPage = lazy(() => import("#/pages/errors/UnauthorizedPage.tsx"));

function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
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
              <RoleGuard allowedRoles={STUDENT_ROLES}>
                <StudentClassesPage />
              </RoleGuard>
            }
          />

          <Route
            path="classes/:id"
            element={
              <RoleGuard allowedRoles={[...TEACHER_AND_ABOVE_ROLES, ...STUDENT_ROLES]}>
                <ClassDetailsPage />
              </RoleGuard>
            }
          />

          <Route path="attendance" element={<AttendancePage />} />

          <Route path="announcements" element={<AnnouncementsPage />} />

          <Route
            path="assignments/:classId?"
            element={
              <RoleGuard allowedRoles={TEACHER_AND_ABOVE_ROLES}>
                <TeacherAssignmentsPage />
              </RoleGuard>
            }
          />

          <Route
            path="my-assignments/:classId?"
            element={
              <RoleGuard allowedRoles={STUDENT_ROLES}>
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

          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
