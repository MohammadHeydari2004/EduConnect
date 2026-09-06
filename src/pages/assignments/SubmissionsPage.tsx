import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import Input from "#/components/ui/Input.tsx";
import { useAuth } from "#/context/AuthContext.ts";
import { assignmentService } from "#/services/modules/assignmentService.ts";
import { submissionService } from "#/services/modules/submissionService.ts";
import { userService } from "#/services/modules/userService.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { Submission } from "#/types/submission.ts";
import type { User } from "#/types/user.ts";

export default function SubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<
    Record<string, { grade: string; feedback: string }>
  >({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const assignmentId = id as string;

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
            currentUser?.role === "teacher" &&
            String(a.teacherId) === String(currentUser?.id);

          // ✅ اصلاح دسترسی: ادمین هم باید بتواند نمرات را ببیند
          if (!isAdmin && !isTeacherOwner) {
            navigate("/assignments", { replace: true });
            return;
          }

          setAssignment(a);
          setSubmissions(s);
          setUsers(u);
          const initialGrading: Record<
            string,
            { grade: string; feedback: string }
          > = {};
          s.forEach((sub) => {
            initialGrading[String(sub.id)] = {
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

  const getUserName = (userId: number | string) =>
    users.find((u) => String(u.id) === String(userId))?.name ?? "—";
  const handleGradeChange = (
    submissionId: string,
    field: "grade" | "feedback",
    value: string,
  ) => {
    setGrading((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], [field]: value },
    }));
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSaveGrade = async (submission: Submission) => {
    const data = grading[String(submission.id)];
    const gradeNum = data.grade ? Number(data.grade) : null;
    if (
      gradeNum !== null &&
      (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 20)
    ) {
      setErrorMessage("نمره باید عددی بین 0 تا 20 باشد.");
      return;
    }
    try {
      await submissionService.update(submission.id, {
        grade: gradeNum,
        feedback: data.feedback || null,
        status: "graded",
      });
      // setSuccessMessage("نمره با موفقیت ذخیره شد. در حال بازگشت...");
      // setErrorMessage("");
      // setTimeout(() => navigate("/assignments"), 1500);

      setSuccessMessage("نمره با موفقیت ذخیره شد.");
      setErrorMessage("");
      // بدون navigate خودکار
    } catch {
      setErrorMessage("خطا در ثبت نمره.");
      setSuccessMessage("");
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
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {submissions.length === 0 ? (
        <EmptyState
          title="پاسخی ثبت نشده"
          description="دانشجویی تاکنون پاسخی ارسال نکرده است."
        />
      ) : (
        <div className="grid gap-4">
          {submissions.map((sub) => (
            <Card key={sub.id}>
              <div className="flex flex-col gap-3">
                <div>
                  <span className="font-semibold">دانشجو:</span>{" "}
                  {getUserName(sub.studentId)}
                </div>
                <div>
                  <span className="font-semibold">پاسخ:</span> {sub.content}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="نمره (0-20)"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={grading[String(sub.id)]?.grade ?? ""}
                    onChange={(e) =>
                      handleGradeChange(String(sub.id), "grade", e.target.value)
                    }
                  />
                  <Input
                    label="بازخورد"
                    value={grading[String(sub.id)]?.feedback ?? ""}
                    onChange={(e) =>
                      handleGradeChange(
                        String(sub.id),
                        "feedback",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSaveGrade(sub)}>ثبت نمره</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
