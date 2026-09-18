import { useEffect, useState } from "react";
import { useAuth } from "#/context/AuthContext.ts";
import Loading from "#/components/common/Loading.tsx";
import AdminDashboard from "#/pages/dashboard/AdminDashboard.tsx";
import TeacherDashboard from "#/pages/dashboard/TeacherDashboard.tsx";
import StudentDashboard from "#/pages/dashboard/StudentDashboard.tsx";

import { userService } from "#/services/modules/userService.ts";
import { classService } from "#/services/modules/classService.ts";
import { sessionService } from "#/services/modules/sessionService.ts";
import { assignmentService } from "#/services/modules/assignmentService.ts";
import { submissionService } from "#/services/modules/submissionService.ts";
import { attendanceService } from "#/services/modules/attendanceService.ts";
import { announcementService } from "#/services/modules/announcementService.ts";

import type { User } from "#/types/user.ts";
import type { ClassItem } from "#/types/class.ts";
import type { Session } from "#/types/session.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { Submission } from "#/types/submission.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { Announcement } from "#/types/announcement.ts";

export interface DashboardData {
  users: User[];
  classes: ClassItem[];
  sessions: Session[];
  assignments: Assignment[];
  submissions: Submission[];
  attendances: Attendance[];
  announcements: Announcement[];
}

function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        const [
          users,
          classes,
          sessions,
          assignments,
          submissions,
          attendances,
          announcements,
        ] = await Promise.all([
          userService.getAll(),
          classService.getAll(),
          sessionService.getAll(),
          assignmentService.getAll(),
          submissionService.getAll(),
          attendanceService.getAll(),
          announcementService.getAll(),
        ]);

        if (!ignore) {
          setData({
            users,
            classes,
            sessions,
            assignments,
            submissions,
            attendances,
            announcements,
          });
        }
      } catch (err) {
        if (!ignore) {
          console.log(err);
          setError("خطا در بارگذاری اطلاعات داشبورد.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!data || !user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        خوش آمدید، {user.name}
      </h1>

      {user.role === "admin" && (
        <AdminDashboard data={data} currentUser={user} />
      )}
      {user.role === "teacher" && (
        <TeacherDashboard data={data} currentUser={user} />
      )}
      {user.role === "student" && (
        <StudentDashboard data={data} currentUser={user} />
      )}
    </div>
  );
}

export default DashboardPage;
