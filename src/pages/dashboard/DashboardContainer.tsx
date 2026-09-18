import Loading from "#/components/common/Loading.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
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
import type { Announcement } from "#/types/announcement.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { ClassItem } from "#/types/class.ts";
import type { Session } from "#/types/session.ts";
import type { Submission } from "#/types/submission.ts";
import type { User } from "#/types/user.ts";
import { useEffect, useState } from "react";

export interface DashboardData {
  users: User[];
  classes: ClassItem[];
  sessions: Session[];
  assignments: Assignment[];
  submissions: Submission[];
  attendances: Attendance[];
  announcements: Announcement[];
}

const EMPTY_DATA: DashboardData = {
  users: [],
  classes: [],
  sessions: [],
  assignments: [],
  submissions: [],
  attendances: [],
  announcements: [],
};

function DashboardContainer() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let ignore = false;

    const fetchData = async () => {
      try {
        let result: DashboardData = { ...EMPTY_DATA };
        switch (user.role) {
          case "admin": {
            const [users, classes, sessions, assignments] = await Promise.all([
              userService.getAll(),
              classService.getAll(),
              sessionService.getAll(),
              assignmentService.getAll(),
            ]);
            result = { ...result, users, classes, sessions, assignments };
            break;
          }
          case "teacher": {
            const [classes, assignments, submissions, sessions, announcements] =
              await Promise.all([
                classService.getAll(),
                assignmentService.getAll(),
                submissionService.getAll(),
                sessionService.getAll(),
                announcementService.getAll(),
              ]);
            result = {
              ...result,
              classes,
              assignments,
              submissions,
              sessions,
              announcements,
            };
            break;
          }
          case "student": {
            const [
              classes,
              assignments,
              submissions,
              attendances,
              announcements,
            ] = await Promise.all([
              classService.getAll(),
              assignmentService.getAll(),
              submissionService.getAll(),
              attendanceService.getAll(),
              announcementService.getAll(),
            ]);
            result = {
              ...result,
              classes,
              assignments,
              submissions,
              attendances,
              announcements,
            };
            break;
          }
        }

        if (!ignore) setData(result);
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
  }, [user]);

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

export default DashboardContainer;
