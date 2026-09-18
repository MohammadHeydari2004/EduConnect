import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import Input from "#/components/ui/Input.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts"; // ✅ اصلاح شد
import { assignmentService } from "#/services/assignment.ts";
import { submissionService } from "#/services/submission.ts";
import { userService } from "#/services/user.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import type { User } from "#/types/user.ts";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function SubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<
    Record<ID, { grade: string; feedback: string }>
  >({});
  const assignmentId = id as ID;

  useEffect(() => {
    let ignore = false;
    Promise.all([
      assignmentService.getById(assignmentId),
      submissionService.getByAssignment(assignmentId),
      userService.getAll(),
    ])
      .then(([a, s, u]) => {
        if (!ignore) {
          const isAdmin = currentUser?.role === "admin";
          const isTeacherOwner =
            currentUser?.role === "teacher" && a.teacherId === currentUser?.id;
          if (!isAdmin && !isTeacherOwner) {
            navigate("/assignments", { replace: true });
            return;
          }
          setAssignment(a);
          setSubmissions(s);
          setUsers(u);
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
        if (!ignore) navigate("/assignments");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [assignmentId, navigate, currentUser]);

  const getUserName = (userId: ID) =>
    users.find((u) => u.id === userId)?.name ?? "—";

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
    try {
      await submissionService.update(submission.id, {
        grade: gradeNum,
        feedback: data.feedback || null,
        status: "graded",
      });
      addToast("نمره با موفقیت ذخیره شد.", "success");
    } catch {
      addToast("خطا در ثبت نمره.", "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Button variant="secondary" onClick={() => navigate("/assignments")}>
        ← بازگشت به تکالیف
      </Button>
      <h1 className="text-xl font-bold text-gray-800">
        پاسخ‌های تکلیف: {assignment?.title}
      </h1>
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
            return (
              <Card key={sub.id}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">دانشجو:</span>{" "}
                      {getUserName(sub.studentId)}
                    </div>
                    {isLate && (
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        ارسال با تأخیر
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">پاسخ:</span> {sub.content}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label="نمره (0-20)"
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={grading[sub.id]?.grade ?? ""}
                      onChange={(e) =>
                        handleGradeChange(sub.id, "grade", e.target.value)
                      }
                    />
                    <Input
                      label="بازخورد"
                      value={grading[sub.id]?.feedback ?? ""}
                      onChange={(e) =>
                        handleGradeChange(sub.id, "feedback", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveGrade(sub)}>
                      ثبت نمره
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
