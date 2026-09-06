import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import { useAuth } from "#/context/AuthContext.ts";
import { classService } from "#/services/modules/classService.ts";
import { sessionService } from "#/services/modules/sessionService.ts";
import { userService } from "#/services/modules/userService.ts";
import type { ClassItem } from "#/types/class.ts";
import type { Session } from "#/types/session.ts";
import type { User } from "#/types/user.ts";
import SessionForm from "./SessionForm";

export default function ClassDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const classId = Number(id);
  const isInvalidId = Number.isNaN(classId);

  const [classItem, setClassItem] = useState<ClassItem | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(!isInvalidId);
  const [error, setError] = useState(
    isInvalidId ? "شناسه کلاس نامعتبر است." : "",
  );
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const isAdmin = currentUser?.role === "admin";
  const isTeacherOfThisClass =
    currentUser?.role === "teacher" &&
    classItem !== null &&
    String(classItem.teacherId) === String(currentUser.id);
  const canManage = isAdmin || isTeacherOfThisClass;

  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === "object" && "code" in err) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr.code === "ERR_NETWORK") {
        return "سرور در دسترس نیست. لطفاً json-server را بررسی کنید.";
      }
      if (axiosErr.code === "ECONNABORTED") {
        return "زمان درخواست به پایان رسید. لطفاً دوباره تلاش کنید.";
      }
    }
    return "دریافت اطلاعات کلاس با خطا مواجه شد.";
  };

  const fetchData = async () => {
    try {
      setError("");
      const [c, u, s] = await Promise.all([
        classService.getById(classId),
        userService.getAll(),
        sessionService.getAll(),
      ]);
      setClassItem(c);
      setUsers(u);
      setSessions(s.filter((x) => String(x.classId) === String(classId)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    if (isInvalidId) return;
    let ignore = false;
    Promise.all([
      classService.getById(classId),
      userService.getAll(),
      sessionService.getAll(),
    ])
      .then(([c, u, s]) => {
        if (!ignore) {
          setClassItem(c);
          setUsers(u);
          setSessions(s.filter((x) => String(x.classId) === String(classId)));
        }
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [classId, isInvalidId]);

  useEffect(() => {
    if (
      !loading &&
      classItem &&
      currentUser?.role === "teacher" &&
      String(classItem.teacherId) !== String(currentUser.id)
    ) {
      navigate("/unauthorized", { replace: true });
    }
  }, [loading, classItem, currentUser, navigate]);

  const students = useMemo(() => {
    if (!classItem) return [];
    return users.filter((u) =>
      (classItem.studentIds || []).map(String).includes(String(u.id)),
    );
  }, [users, classItem]);

  const teacher = useMemo(() => {
    if (!classItem || classItem.teacherId === null) return null;
    return (
      users.find((u) => String(u.id) === String(classItem.teacherId)) ?? null
    );
  }, [users, classItem]);

  if (isInvalidId) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => navigate("/classes")}>
          ← بازگشت به لیست کلاس‌ها
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          شناسه کلاس نامعتبر است.
        </div>
      </div>
    );
  }

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => navigate("/classes")}>
          ← بازگشت به لیست کلاس‌ها
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!classItem) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => navigate("/classes")}>
          ← بازگشت به لیست کلاس‌ها
        </Button>
        <EmptyState
          title="کلاس پیدا نشد"
          description="کلاس موردنظر وجود ندارد."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/classes")}
            className="w-full sm:w-auto"
          >
            ← بازگشت
          </Button>
          <h1 className="text-lg font-bold text-gray-800 sm:text-2xl">
            {classItem.title || "(بدون عنوان)"}
          </h1>
          <StatusChip status={classItem.status || "inactive"} />
        </div>

        {/* ✅ اضافه شد: دکمه مشاهده تکالیف کلاس برای بهبود جریان داده */}
        <Button
          variant="secondary"
          onClick={() => navigate(`/classes/${classId}/assignments`)}
          className="w-full sm:w-auto"
        >
          مشاهده تکالیف کلاس
        </Button>
      </div>

      {actionSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

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
            <ul className="space-y-2">
              {students.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-xs text-gray-500">{s.email}</span>
                </li>
              ))}
            </ul>
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
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
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
                    <div className="text-sm text-gray-600">{s.date}</div>
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
          classId={classId}
          onClose={() => setShowSessionForm(false)}
          onSuccess={async (message) => {
            setActionSuccess(message);
            setShowSessionForm(false);
            await fetchData();
          }}
          onError={(message) => {
            setActionError(message);
          }}
        />
      )}
    </div>
  );
}
