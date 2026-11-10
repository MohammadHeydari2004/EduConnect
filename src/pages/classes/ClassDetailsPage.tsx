import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { showErrorToastWithInfo } from "#/hooks/useToastHelpers.ts";
import ClassSessionsPanel from "#/pages/classes/ClassSessionsPanel.tsx";
import ClassStudentsPanel from "#/pages/classes/ClassStudentsPanel.tsx";
import ClassCapacityBadge from "#/components/common/ClassCapacityBadge.tsx";
import SessionForm from "#/pages/classes/SessionForm.tsx";
import { classService } from "#/services/class.ts";
import { sessionService } from "#/services/session.ts";
import { userService } from "#/services/user.ts";
import type { ClassItem } from "#/types/class.ts";
import type { Session } from "#/types/session.ts";
import type { User } from "#/types/user.ts";
import { getEffectiveStatus } from "#/utils/class.ts";
import { classifyError } from "#/services/error.ts";
import { getStatusLabel } from "#/utils/userLabels.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function getClassRoles(
  currentUser: User | undefined | null,
  classItem: ClassItem | null,
): { isAdmin: boolean; isTeacherOfThisClass: boolean; isStudentInThisClass: boolean; canManageSessions: boolean } {
  const isAdmin = currentUser?.role === "admin";
  const isTeacherOfThisClass =
    currentUser?.role === "teacher" &&
    classItem !== null &&
    classItem.teacherId === currentUser.id;
  const isStudentInThisClass =
    currentUser?.role === "student" &&
    classItem !== null &&
    (classItem.studentIds || []).includes(currentUser.id);
  return {
    isAdmin,
    isTeacherOfThisClass,
    isStudentInThisClass,
    canManageSessions: isAdmin || isTeacherOfThisClass,
  };
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

  const { isTeacherOfThisClass, isStudentInThisClass, canManageSessions } = useMemo(
    () => getClassRoles(currentUser, classItem),
    [currentUser, classItem],
  );

  useEffect(() => {
    if (isInvalidId) return;

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
          sessionService.getByClass(classId!),
        ]);
        if (!cancelled) {
          
          if (
            currentUser?.role === "teacher" &&
            c.teacherId !== currentUser.id
          ) {
            navigate("/unauthorized", { replace: true });
            return;
          }
          setError("");
          setClassItem(c);
          setUsers(u);
          setSessions(s);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          const info = classifyError(err);
          showErrorToastWithInfo(addToast, info, "دریافت اطلاعات کلاس با خطا مواجه شد.");
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [classId, isInvalidId, currentUser, navigate]);

  const refreshSessions = useCallback(async () => {
    if (!classId) return;
    try {
      const currentSessions = await sessionService.getByClass(classId);
      setSessions(currentSessions);
    } catch (err) {
      const info = classifyError(err);
      showErrorToastWithInfo(addToast, info, "به‌روزرسانی لیست جلسات ناموفق بود.");
    }
  }, [classId, addToast]);

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
        <ErrorAlert message="شناسه کلاس نامعتبر است." />
      </div>
    );

  if (loading) return <Loading />;

  if (error)
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => navigate("/classes")}>
          → بازگشت به لیست کلاس‌ها
        </Button>
        <ErrorAlert message={error} />
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

  const classStatus = getEffectiveStatus(classItem);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(currentUser?.role === "student" ? "/my-classes" : "/classes")}
            className="w-full sm:w-auto"
          >
            → بازگشت
          </Button>
          <h1 className="text-lg font-bold text-gray-800 sm:text-2xl max-sm:mt-2.5">
            {classItem.title || "(بدون عنوان)"}
          </h1>
          <StatusChip status={classStatus} />
          <span className="sr-only">
            وضعیت کلاس: {getStatusLabel(classStatus)}
          </span>
        </div>
        {isTeacherOfThisClass && (
          <Button
            variant="secondary"
            onClick={() => navigate(`/assignments/${classId}`)}
            className="w-full sm:w-auto"
          >
            مشاهده تکالیف کلاس
          </Button>
        )}
        {isStudentInThisClass && (
          <Button
            variant="secondary"
            onClick={() => navigate(`/my-assignments/${classId}`)}
            className="w-full sm:w-auto"
          >
            مشاهده تکالیف کلاس
          </Button>
        )}
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
              <ClassCapacityBadge classItem={classItem} />
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
        canManage={canManageSessions}
        onAddSession={() => setShowSessionForm(true)}
        onSessionsChanged={refreshSessions}
      />

      {showSessionForm && (
        <SessionForm
          key={`session-form-${classId}`}
          classId={classId!}
          onClose={() => setShowSessionForm(false)}
          onSuccess={(message) => {
            addToast(message, "success");
            setShowSessionForm(false);
            void refreshSessions();
          }}
          onError={(message) => {
            addToast(message, "error");
          }}
        />
      )}
    </div>
  );
}
