import Loading from "#/components/common/Loading.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import AdminDashboard from "#/pages/dashboard/AdminDashboard.tsx";
import StudentDashboard from "#/pages/dashboard/StudentDashboard.tsx";
import TeacherDashboard from "#/pages/dashboard/TeacherDashboard.tsx";
import { useDashboardData } from "#/hooks/dashboardData.ts";

export default function DashboardContainer() {
  const { user } = useAuth();

  const { data, loading, error } = useDashboardData(user);

  if (!user) return <Loading />;
  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 max-sm:mt-2.5">
        خوش آمدید، {user.name}
      </h1>
      {user.role === "admin" && <AdminDashboard data={data} />}
      {user.role === "teacher" && (
        <TeacherDashboard data={data} currentUserId={user.id} />
      )}
      {user.role === "student" && (
        <StudentDashboard data={data} currentUser={user} />
      )}
    </div>
  );
}
