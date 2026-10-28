import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import { assignmentService } from "#/services/assignment.ts";
import { classService } from "#/services/class.ts";
import { submissionService } from "#/services/submission.ts";
import { userService } from "#/services/user.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import type { User } from "#/types/user.ts";
import { getErrorMessage } from "#/utils/error.ts";
import { logger } from "#/utils/logger.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MAX_ASSIGNMENT_GRADE } from "#/configs/constants";

interface UseSubmissionsPageReturn {
  assignment: Assignment | null;
  submissions: Submission[];
  userMap: Map<ID, User>;
  classMap: Map<ID, ClassItem>;
  loading: boolean;
  error: string | null;
  gradedCount: number;
  isDeadlinePassed: boolean;
  getUserName: (userId: ID) => string;
  getUserEmail: (userId: ID) => string;
  getClassName: (classId: ID) => string;
  grading: Record<ID, { grade: string; feedback: string }>;
  savingId: ID | null;
  handleGradeChange: (
    submissionId: ID,
    field: "grade" | "feedback",
    value: string,
  ) => void;
  handleSaveGrade: (submission: Submission) => Promise<void>;
}

export function useSubmissionsPage(): UseSubmissionsPageReturn {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [grading, setGrading] = useState<
    Record<ID, { grade: string; feedback: string }>
  >({});
  const [savingId, setSavingId] = useState<ID | null>(null);

  const assignmentId = id as ID;

  const userMap = useMapById(users);
  const classMap = useMapById(classes);

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
    () => assignment ? new Date() > new Date(assignment.deadline) : false,
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
      .catch((err) => {
        if (ignore) return;
        const message = getErrorMessage(err, "خطا در بارگذاری پاسخ‌ها.");
        logger.error("Failed to load submissions", { error: message });
        addToast(message, "error");
        navigate("/assignments", { replace: true });
        setError(message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [assignmentId, navigate, currentUser, addToast]);

  const handleGradeChange = useCallback((
    submissionId: ID,
    field: "grade" | "feedback",
    value: string,
  ) => {
    setGrading((prev) => {
      const current = prev[submissionId] || { grade: "", feedback: "" };
      return { ...prev, [submissionId]: { ...current, [field]: value } };
    });
  }, []);

  const handleSaveGrade = useCallback(async (submission: Submission) => {
    const data = grading[submission.id] || { grade: "", feedback: "" };
    const gradeNum = data.grade ? Number(data.grade) : null;

    if (
      gradeNum !== null &&
      (isNaN(gradeNum) || gradeNum < 0 || gradeNum > MAX_ASSIGNMENT_GRADE)
    ) {
      addToast(`نمره باید عددی بین 0 تا ${MAX_ASSIGNMENT_GRADE} باشد.`, "error");
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
    } catch (err) {
      addToast(getErrorMessage(err, "خطا در ثبت نمره."), "error");
    } finally {
      setSavingId(null);
    }
  }, [grading, addToast]);

  return {
    assignment,
    submissions,
    userMap,
    classMap,
    loading,
    error,
    gradedCount,
    isDeadlinePassed,
    getUserName,
    getUserEmail,
    getClassName,
    grading,
    savingId,
    handleGradeChange,
    handleSaveGrade,
  };
}