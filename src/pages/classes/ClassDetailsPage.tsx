import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { classService } from "#/services/class.ts";
import { sessionService } from "#/services/session.ts";
import { userService } from "#/services/user.ts";
import type { ClassItem } from "#/types/class.ts";
import type { Session } from "#/types/session.ts";
import type { User } from "#/types/user.ts";
import { formatDate } from "#/utils/formatDate.ts";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SessionForm from "./SessionForm";

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const axiosErr = err as { code?: string; message?: string };
    if (axiosErr.code === "ERR_NETWORK")
      return "سرور در دسترس نیست. لطفاً json-server را بررسی کنید.";
    if (axiosErr.code === "ECONNABORTED")
      return "زمان درخواست به پایان رسید. لطفاً دوباره تلاش کنید.";
  }
  return "دریافت اطلاعات کلاس با خطا مواجه شد.";
}

export default function ClassDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const classId = id;
  const isInvalidId = !classId;

  const [classItem, setClassItem] = useState<ClassItem | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(!isInvalidId);
  const [error, setError] = useState(
    isInvalidId ? "شناسه کلاس نامعتبر است." : "",
  );
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [prevClassId, setPrevClassId] = useState(classId);

  if (classId !== prevClassId) {
    setPrevClassId(classId);
    if (!isInvalidId) {
      setLoading(true);
      setError("");
      setClassItem(null);
      setUsers([]);
      setSessions([]);
    }
  }

  const isAdmin = currentUser?.role === "admin";
  const isTeacherOfThisClass =
    currentUser?.role === "teacher" &&
    classItem !== null &&
    classItem.teacherId === currentUser.id;
  const canManage = isAdmin || isTeacherOfThisClass;

  useEffect(() => {
    if (isInvalidId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const [c, u, s] = await Promise.all([
          classService.getById(classId!),
          userService.getAll(),
          sessionService.getAll(),
        ]);
        if (!cancelled) {
          setError("");
          setClassItem(c);
          setUsers(u);
          setSessions(s.filter((x) => x.classId === classId));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [classId, isInvalidId, refreshTrigger]);

  useEffect(() => {
    if (
      !loading &&
      classItem &&
      currentUser?.role === "teacher" &&
      classItem.teacherId !== currentUser.id
    ) {
      navigate("/unauthorized", { replace: true });
    }
  }, [loading, classItem, currentUser, navigate]);
  const students = useMemo(() => {
    if (!classItem) return [];
    const studentIdSet = new Set(classItem.studentIds || []);
    return users.filter((u) => studentIdSet.has(u.id));
  }, [users, classItem]);

  const teacher = useMemo(() => {
    if (!classItem || classItem.teacherId === null) return null;
    return users.find((u) => u.id === classItem.teacherId) ?? null;
  }, [users, classItem]);

  if (isInvalidId)
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => navigate("/classes")}>
          → بازگشت به لیست کلاس‌ها
        </Button>
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          شناسه کلاس نامعتبر است.
        </div>
      </div>
    );

  if (loading) return <Loading />;

  if (error)
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => navigate("/classes")}>
          → بازگشت به لیست کلاس‌ها
        </Button>
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      </div>
    );

  if (!classItem)
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => navigate("/classes")}>
          → بازگشت به لیست کلاس‌ها
        </Button>
        <EmptyState
          title="کلاس پیدا نشد"
          description="کلاس موردنظر وجود ندارد."
        />
      </div>
    );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/classes")}
            className="w-full sm:w-auto"
          >
            → بازگشت
          </Button>
          <h1 className="text-lg font-bold text-gray-800 sm:text-2xl">
            {classItem.title || "(بدون عنوان)"}
          </h1>
          <StatusChip status={classItem.status || "inactive"} />
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate(`/classes/${classId}/assignments`)}
          className="w-full sm:w-auto"
        >
          مشاهده تکالیف کلاس
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="اطلاعات کلاس">
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-semibold">عنوان:</span>{" "}
              {classItem.title || "—"}
            </p>
            {classItem.description && (
              <p>
                <span className="font-semibold">توضیحات:</span>{" "}
                {classItem.description}
              </p>
            )}
            <p>
              <span className="font-semibold">استاد:</span>{" "}
              {teacher?.name ?? "—"}
            </p>
            <p>
              <span className="font-semibold">ظرفیت:</span>{" "}
              {(classItem.studentIds || []).length} / {classItem.capacity || 0}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">وضعیت:</span>
              <StatusChip status={classItem.status || "inactive"} />
            </p>
          </div>
        </Card>
        <Card title={`دانشجویان (${students.length})`}>
          {students.length === 0 ? (
            <EmptyState
              title="دانشجویی ثبت نشده"
              description="هنوز دانشجویی به این کلاس اضافه نشده است."
            />
          ) : (
            <Table
              getRowKey={(s) => s.id}
              columns={[
                {
                  key: "name",
                  title: "نام",
                  render: (s) => (
                    <span className="font-medium text-gray-800">{s.name}</span>
                  ),
                },
                {
                  key: "email",
                  title: "ایمیل",
                  render: (s) => (
                    <span className="text-sm text-gray-600 break-all">
                      {s.email}
                    </span>
                  ),
                },
                {
                  key: "status",
                  title: "وضعیت",
                  render: (s) => <StatusChip status={s.status} />,
                },
              ]}
              data={students}
              renderMobileCard={(s) => (
                <div className="space-y-2 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-800">
                      {s.name}
                    </span>
                    <StatusChip status={s.status} />
                  </div>
                  <div className="text-sm text-gray-600 break-all">
                    {s.email}
                  </div>
                </div>
              )}
            />
          )}
        </Card>
      </div>

      <Card title={`جلسات (${sessions.length})`}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            لیست جلسات برگزار شده و برنامه‌ریزی شده
          </p>
          {canManage && classItem.status !== "inactive" && (
            <Button
              onClick={() => setShowSessionForm(true)}
              className="w-full sm:w-auto"
            >
              افزودن جلسه
            </Button>
          )}
        </div>
        {sessions.length === 0 ? (
          <EmptyState
            title="جلسه‌ای ثبت نشده"
            description="هنوز جلسه‌ای برای این کلاس تعریف نشده است."
          />
        ) : (
          <div className="space-y-2">
            {[...sessions]
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-800">{s.title}</div>
                    {s.description && (
                      <div className="mt-1 text-xs text-gray-500">
                        {s.description}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm text-gray-600">
                      {formatDate(s.date)}
                    </div>
                    {canManage && classItem.status !== "inactive" && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          navigate(
                            `/attendance?classId=${classId}&sessionId=${s.id}`,
                          )
                        }
                      >
                        حضور و غیاب
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {showSessionForm && (
        <SessionForm
          key={`session-form-${classId}-${showSessionForm}`}
          classId={classId!}
          onClose={() => setShowSessionForm(false)}
          onSuccess={(message) => {
            addToast(message, "success");
            setShowSessionForm(false);
            setRefreshTrigger((prev) => prev + 1);
          }}
          onError={(message) => {
            addToast(message, "error");
          }}
        />
      )}
    </div>
  );
}
