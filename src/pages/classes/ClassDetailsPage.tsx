import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { isApiError } from "#/services/api/axiosInstance.ts";
import { classService } from "#/services/class.ts";
import { sessionService } from "#/services/session.ts";
import { userService } from "#/services/user.ts";
import type { ClassItem } from "#/types/class.ts";
import type { Session } from "#/types/session.ts";
import type { User } from "#/types/user.ts";
import { getStatusLabel } from "#/utils/user.ts";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClassSessionsPanel from "./ClassSessionsPanel";
import ClassStudentsPanel from "./ClassStudentsPanel";
import SessionForm from "./SessionForm";

function getErrorMessage(err: unknown): string {
  if (isApiError(err)) return err.userMessage;
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

  const isAdmin = currentUser?.role === "admin";
  const isTeacherOfThisClass =
    currentUser?.role === "teacher" &&
    classItem !== null &&
    classItem.teacherId === currentUser.id;
  const canManage = isAdmin || isTeacherOfThisClass;

  // الگوی صحیح: ریست حالت‌ها و واکشی داده‌ها در useEffect با وابستگی [classId]
  useEffect(() => {
    if (isInvalidId) return;

    // ریست کامل حالت‌ها برای کلاس جدید (جایگزین الگوی مخرب prevClassId)
    setLoading(true);
    setError("");
    setClassItem(null);
    setUsers([]);
    setSessions([]);
    setShowSessionForm(false);

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
  }, [classId, isInvalidId]);

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

  const classStatus = classItem.status || "inactive";

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
          <StatusChip status={classStatus} />
          <span className="sr-only">
            وضعیت کلاس: {getStatusLabel(classStatus)}
          </span>
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
              <StatusChip status={classStatus} />
              <span className="text-gray-600">
                ({getStatusLabel(classStatus)})
              </span>
            </p>
          </div>
        </Card>

        <ClassStudentsPanel students={students} />
      </div>

      <ClassSessionsPanel
        sessions={sessions}
        classItem={classItem}
        classId={classId!}
        canManage={canManage}
        onAddSession={() => setShowSessionForm(true)}
      />

      {showSessionForm && (
        <SessionForm
          key={`session-form-${classId}`}
          classId={classId!}
          onClose={() => setShowSessionForm(false)}
          onSuccess={(message, newSession) => {
            addToast(message, "success");
            setShowSessionForm(false);
            // الحاق مستقیم داده جدید به حالت فعلی (جایگزین الگوی مخرب refreshTrigger)
            setSessions((prev) => [...prev, newSession]);
          }}
          onError={(message) => {
            addToast(message, "error");
          }}
        />
      )}
    </div>
  );
}
