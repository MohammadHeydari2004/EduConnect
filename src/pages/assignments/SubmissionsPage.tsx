import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import Input from "#/components/ui/Input.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Textarea from "#/components/ui/Textarea.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { assignmentService } from "#/services/assignment.ts";
import { classService } from "#/services/class.ts";
import { submissionService } from "#/services/submission.ts";
import { userService } from "#/services/user.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import type { User } from "#/types/user.ts";
import { formatDate } from "#/utils/formatDate.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function SubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [grading, setGrading] = useState<
    Record<ID, { grade: string; feedback: string }>
  >({});
  const [savingId, setSavingId] = useState<ID | null>(null);

  const assignmentId = id as ID;

  const userMap = useMemo(() => {
    const map = new Map<ID, User>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const classMap = useMemo(() => {
    const map = new Map<ID, ClassItem>();
    classes.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  const getUserName = useCallback(
    (userId: ID) => userMap.get(userId)?.name ?? "—",
    [userMap],
  );

  const getUserEmail = useCallback(
    (userId: ID) => userMap.get(userId)?.email ?? "—",
    [userMap],
  );

  const getClassName = useCallback(
    (classId: ID) => classMap.get(classId)?.title ?? "—",
    [classMap],
  );

  const gradedCount = useMemo(
    () => submissions.filter((s) => s.status === "graded").length,
    [submissions],
  );

  const isDeadlinePassed = useMemo(
    () => assignment && new Date() > new Date(assignment.deadline),
    [assignment],
  );

  useEffect(() => {
    if (!assignmentId || !currentUser) return;

    let ignore = false;

    Promise.all([
      assignmentService.getById(assignmentId),
      submissionService.getByAssignment(assignmentId),
      userService.getAll(),
      classService.getAll(),
    ])
      .then(([a, s, u, c]) => {
        if (!ignore) {
          const isAdmin = currentUser.role === "admin";
          const isTeacherOwner =
            currentUser.role === "teacher" && a.teacherId === currentUser.id;

          if (!isAdmin && !isTeacherOwner) {
            navigate("/assignments", { replace: true });
            return;
          }

          setAssignment(a);
          setSubmissions(s);
          setUsers(u);
          setClasses(c);

          const initialGrading: Record<
            ID,
            { grade: string; feedback: string }
          > = {};
          s.forEach((sub) => {
            initialGrading[sub.id] = {
              grade: sub.grade?.toString() ?? "",
              feedback: sub.feedback ?? "",
            };
          });
          setGrading(initialGrading);
        }
      })
      .catch(() => {
        if (!ignore) navigate("/assignments", { replace: true });
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [assignmentId, navigate, currentUser]);

  const handleGradeChange = (
    submissionId: ID,
    field: "grade" | "feedback",
    value: string,
  ) => {
    setGrading((prev) => {
      const current = prev[submissionId] || { grade: "", feedback: "" };
      return { ...prev, [submissionId]: { ...current, [field]: value } };
    });
  };

  const handleSaveGrade = async (submission: Submission) => {
    const data = grading[submission.id] || { grade: "", feedback: "" };
    const gradeNum = data.grade ? Number(data.grade) : null;

    if (
      gradeNum !== null &&
      (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 20)
    ) {
      addToast("نمره باید عددی بین 0 تا 20 باشد.", "error");
      return;
    }

    if (gradeNum === null) {
      addToast("لطفاً نمره را وارد کنید.", "error");
      return;
    }

    setSavingId(submission.id);

    try {
      await submissionService.update(submission.id, {
        grade: gradeNum,
        feedback: data.feedback || null,
        status: "graded",
      });

      addToast("نمره با موفقیت ذخیره شد.", "success");
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submission.id
            ? {
                ...s,
                grade: gradeNum,
                feedback: data.feedback || null,
                status: "graded",
              }
            : s,
        ),
      );
      setGrading((prev) => ({
        ...prev,
        [submission.id]: {
          grade: gradeNum?.toString() ?? "",
          feedback: data.feedback || "",
        },
      }));
    } catch {
      addToast("خطا در ثبت نمره.", "error");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate("/assignments")}>
            ← بازگشت
          </Button>
          <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
            پاسخ‌های تکلیف: {assignment?.title}
          </h1>
        </div>
        <div className="text-sm text-gray-600">
          تعداد پاسخ‌ها: <span className="font-bold">{submissions.length}</span>
        </div>
      </div>

      {assignment && (
        <Card title="اطلاعات تکلیف">
          <div className="grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <span className="text-gray-500">کلاس:</span>{" "}
              <span className="font-medium">
                {getClassName(assignment.classId)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">ددلاین:</span>{" "}
              <span
                className={`font-medium ${isDeadlinePassed ? "text-red-600" : ""}`}
              >
                {formatDate(assignment.deadline)}
                {isDeadlinePassed && (
                  <span className="mr-1 text-xs">(منقضی شده)</span>
                )}
              </span>
            </div>
            <div>
              <span className="text-gray-500">کل پاسخ‌ها:</span>{" "}
              <span className="font-medium">{submissions.length}</span>
            </div>
            <div>
              <span className="text-gray-500">تصحیح‌شده:</span>{" "}
              <span className="font-medium text-green-600">{gradedCount}</span>
            </div>
          </div>
          {assignment.description && (
            <div className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-700">
              <span className="font-medium">توضیحات:</span>{" "}
              {assignment.description}
            </div>
          )}
        </Card>
      )}

      {submissions.length === 0 ? (
        <EmptyState
          title="پاسخی ثبت نشده"
          description="دانشجویی تاکنون پاسخی ارسال نکرده است."
        />
      ) : (
        <div className="grid gap-4">
          {submissions.map((sub) => {
            const isLate =
              assignment &&
              new Date(sub.submittedAt) > new Date(assignment.deadline);
            const isCurrentlySaving = savingId === sub.id;
            const currentGrade = grading[sub.id]?.grade ?? "";
            const currentFeedback = grading[sub.id]?.feedback ?? "";

            return (
              <Card key={sub.id}>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {getUserName(sub.studentId)}
                        </span>
                        {sub.status === "graded" && (
                          <StatusChip status="graded" />
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {getUserEmail(sub.studentId)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {isLate && (
                        <span
                          className="inline-flex rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700"
                          title="این پاسخ پس از پایان مهلت ارسال شده است"
                        >
                          ارسال با تأخیر
                        </span>
                      )}
                      <span className="text-gray-500">
                        ارسال در: {formatDate(sub.submittedAt)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-sm font-medium text-gray-700">
                      پاسخ دانشجو:
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm break-all whitespace-pre-wrap text-gray-800">
                      {sub.content || (
                        <span className="text-gray-400">بدون محتوا</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <Input
                        label="نمره (0 تا 20)"
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={currentGrade}
                        onChange={(e) =>
                          handleGradeChange(sub.id, "grade", e.target.value)
                        }
                        placeholder="مثلاً: 18.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Textarea
                        label="بازخورد استاد (توضیحات نمره)"
                        value={currentFeedback}
                        onChange={(e) =>
                          handleGradeChange(sub.id, "feedback", e.target.value)
                        }
                        placeholder="توضیحات و نکات مربوط به پاسخ دانشجو را اینجا بنویسید..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="text-xs text-gray-500" aria-live="polite">
                      {sub.status === "graded" && sub.grade !== undefined
                        ? `آخرین نمره ثبت‌شده: ${sub.grade}/20`
                        : "هنوز نمره‌ای ثبت نشده است"}
                    </div>
                    <Button
                      onClick={() => handleSaveGrade(sub)}
                      disabled={isCurrentlySaving}
                    >
                      {isCurrentlySaving
                        ? "در حال ذخیره..."
                        : sub.status === "graded"
                          ? "به‌روزرسانی نمره"
                          : "ثبت نمره"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
