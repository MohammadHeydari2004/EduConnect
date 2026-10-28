import Loading from "#/components/common/Loading.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import AdminDashboard from "#/pages/dashboard/AdminDashboard.tsx";
import StudentDashboard from "#/pages/dashboard/StudentDashboard.tsx";
import TeacherDashboard from "#/pages/dashboard/TeacherDashboard.tsx";
import { announcementService } from "#/services/announcement.ts";
import { assignmentService } from "#/services/assignment.ts";
import { attendanceService } from "#/services/attendance.ts";
import { classService } from "#/services/class.ts";
import { sessionService } from "#/services/session.ts";
import { submissionService } from "#/services/submission.ts";
import { userService } from "#/services/user.ts";
import type { DashboardData } from "#/types/dashboard.ts";
import { EMPTY_DASHBOARD_DATA } from "#/types/dashboard.ts";

async function fetchAdminData(): Promise<DashboardData> {
  const [users, classes, sessions, assignments] = await Promise.all([
    userService.getAll(),
    classService.getAll(),
    sessionService.getAll(),
    assignmentService.getAll(),
  ]);
  return { ...EMPTY_DASHBOARD_DATA, users, classes, sessions, assignments };
}

async function fetchTeacherData(): Promise<DashboardData> {
  const [classes, assignments, submissions, sessions, announcements] =
    await Promise.all([
      classService.getAll(),
      assignmentService.getAll(),
      submissionService.getAll(),
      sessionService.getAll(),
      announcementService.getAll(),
    ]);
  return {
    ...EMPTY_DASHBOARD_DATA,
    classes,
    assignments,
    submissions,
    sessions,
    announcements,
  };
}

async function fetchStudentData(): Promise<DashboardData> {
  const [classes, assignments, submissions, attendances, announcements] =
    await Promise.all([
      classService.getAll(),
      assignmentService.getAll(),
      submissionService.getAll(),
      attendanceService.getAll(),
      announcementService.getAll(),
    ]);
  return {
    ...EMPTY_DASHBOARD_DATA,
    classes,
    assignments,
    submissions,
    attendances,
    announcements,
  };
}

function DashboardContainer() {
  const { user } = useAuth();

  const { data, loading, error } = useAsyncData<DashboardData>({
    fetcher: () => {
      if (user?.role === "admin") return fetchAdminData();
      if (user?.role === "teacher") return fetchTeacherData();
      return fetchStudentData();
    },
    deps: [user?.id, user?.role],
    fallbackError: "خطا در بارگذاری داده‌های داشبورد.",
  });

  if (loading) return <Loading />;

  if (error)
    return <ErrorAlert message={error} />;

  if (!data || !user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        خوش آمدید، {user.name}
      </h1>
      {user.role === "admin" && <AdminDashboard data={data} />}
      {user.role === "teacher" && (
        <TeacherDashboard data={data} currentUser={user} />
      )}
      {user.role === "student" && (
        <StudentDashboard data={data} currentUser={user} />
      )}
    </div>
  );
}

export default DashboardContainer;