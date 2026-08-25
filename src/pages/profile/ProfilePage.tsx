import { useEffect, useState } from "react";
import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Card from "#/components/ui/Card.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import { useAuth } from "#/context/AuthContext.ts";
import { attendanceService } from "#/services/modules/attendanceService.ts";
import { classService } from "#/services/modules/classService.ts";
import { sessionService } from "#/services/modules/sessionService.ts";
import type { Attendance } from "#/types/attendance.ts";
import type { ClassItem } from "#/types/class.ts";
import type { Session } from "#/types/session.ts";

function ProfilePage() {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  // ✅ اصلاح: استفاده از string برای جلوگیری از مشکل مقایسه string/number
  const [fetchedUserId, setFetchedUserId] = useState<string | null>(null);

  // ✅ اصلاح: مقایسه string با string
  const loading =
    user?.role === "student" && fetchedUserId !== String(user?.id);

  useEffect(() => {
    if (!user || user.role !== "student") return;
    let ignore = false;

    Promise.all([
      attendanceService.getByStudent(user.id),
      sessionService.getAll(),
      classService.getAll(),
    ])
      .then(([a, s, c]) => {
        if (!ignore) {
          setAttendances(a);
          setSessions(s);
          setClasses(c);
          setFetchedUserId(String(user.id));
        }
      })
      .catch(() => {
        if (!ignore) setFetchedUserId(String(user.id));
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  if (!user) return null;

  const stats =
    user.role === "student"
      ? attendanceService.calculateStudentStats(attendances)
      : null;

  const sessionDetails =
    user.role === "student"
      ? attendances.map((a) => {
          const session = sessions.find(
            (s) => String(s.id) === String(a.sessionId),
          );
          const cls = classes.find((c) => String(c.id) === String(a.classId));
          return {
            ...a,
            sessionTitle: session?.title || "—",
            sessionDate: session?.date || "—",
            classTitle: cls?.title || "—",
          };
        })
      : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">Profile</h1>
      <Card title="User Information">
        <div className="space-y-3 text-sm text-gray-700 sm:text-base">
          <p className="flex flex-col gap-1 sm:flex-row sm:gap-2">
            <span className="font-semibold">Name:</span>
            <span>{user.name}</span>
          </p>
          <p className="flex flex-col gap-1 break-all sm:flex-row sm:gap-2">
            <span className="font-semibold">Email:</span>
            <span>{user.email}</span>
          </p>
          <p className="flex flex-col gap-1 sm:flex-row sm:gap-2">
            <span className="font-semibold">Role:</span>
            <span className="capitalize">{user.role}</span>
          </p>
          <p className="flex flex-col gap-1 sm:flex-row sm:gap-2">
            <span className="font-semibold">Status:</span>
            <span className="capitalize">{user.status}</span>
          </p>
        </div>
      </Card>

      {user.role === "student" && (
        <>
          {loading ? (
            <Loading />
          ) : stats ? (
            <>
              <Card title="آمار حضور و غیاب">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-lg bg-gray-50 p-3 text-center">
                    <div className="text-xs text-gray-500">
                      کل جلسات ثبت‌شده
                    </div>
                    <div className="mt-1 text-xl font-bold text-gray-800">
                      {stats.total}
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3 text-center">
                    <div className="text-xs text-gray-500">حاضر</div>
                    <div className="mt-1 text-xl font-bold text-green-700">
                      {stats.present}
                    </div>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-3 text-center">
                    <div className="text-xs text-gray-500">با تأخیر</div>
                    <div className="mt-1 text-xl font-bold text-yellow-700">
                      {stats.late}
                    </div>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3 text-center">
                    <div className="text-xs text-gray-500">غایب</div>
                    <div className="mt-1 text-xl font-bold text-red-700">
                      {stats.absent}
                    </div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3 text-center">
                    <div className="text-xs text-gray-500">درصد حضور</div>
                    <div className="mt-1 text-xl font-bold text-blue-700">
                      {stats.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{
                        width: `${Math.min(stats.percentage, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {stats.attended} جلسه از {stats.total} جلسه (present + late
                    به‌عنوان «حاضر» محاسبه می‌شود).
                  </p>
                </div>
              </Card>

              <Card title="جزئیات جلسات">
                {sessionDetails.length === 0 ? (
                  <EmptyState
                    title="هنوز جلسه‌ای ثبت نشده"
                    description="هیچ رکورد حضور و غیابی برای شما ثبت نشده است."
                  />
                ) : (
                  <div className="-mx-5 overflow-x-auto sm:mx-0">
                    <Table
                      getRowKey={(item) => item.id}
                      columns={[
                        {
                          key: "classTitle",
                          title: "کلاس",
                          render: (item) => item.classTitle,
                        },
                        {
                          key: "sessionTitle",
                          title: "جلسه",
                          render: (item) => item.sessionTitle,
                        },
                        {
                          key: "sessionDate",
                          title: "تاریخ",
                          render: (item) => item.sessionDate,
                        },
                        {
                          key: "status",
                          title: "وضعیت",
                          render: (item) => <StatusChip status={item.status} />,
                        },
                      ]}
                      data={sessionDetails}
                    />
                  </div>
                )}
              </Card>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

export default ProfilePage;
