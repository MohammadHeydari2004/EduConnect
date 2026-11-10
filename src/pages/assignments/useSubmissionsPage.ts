import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { showErrorToastWithInfo } from "#/hooks/useToastHelpers.ts";
import { useMapById } from "#/hooks/useMapById.ts";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { assignmentService } from "#/services/assignment.ts";
import { classService } from "#/services/class.ts";
import { submissionService } from "#/services/submission.ts";
import { userService } from "#/services/user.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ClassItem } from "#/types/class.ts";
import type { ID } from "#/types/common.ts";
import type { Submission } from "#/types/submission.ts";
import type { User } from "#/types/user.ts";
import { classifyError } from "#/services/error.ts";
import { getUserNameFromMap, getClassNameFromMap, getUserEmailFromMap } from "#/utils/nameHelpers.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MAX_ASSIGNMENT_GRADE } from "#/configs/constants";

interface SubmissionsPageData {
  assignment: Assignment;
  submissions: Submission[];
  users: User[];
  classes: ClassItem[];
}

export interface StudentSubmissionStatus {
  student: User;
  submission: Submission | null;
  isLate: boolean;
  isMissing: boolean;
  isAutoGraded: boolean;
  canGrade: boolean;
}

interface UseSubmissionsPageReturn {
  assignment: Assignment | null;
  studentStatuses: StudentSubmissionStatus[];
  userMap: Map<ID, User>;
  classMap: Map<ID, ClassItem>;
  loading: boolean;
  error: string;
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
  handleSaveGrade: (studentStatus: StudentSubmissionStatus) => Promise<void>;
  handleReturnSubmission: (submission: Submission) => Promise<void>;
  refresh: () => void;
}

async function fetchSubmissionsPageData(assignmentId: ID, signal?: AbortSignal): Promise<SubmissionsPageData> {
  const [assignment, submissions, users, classes] = await Promise.all([
    assignmentService.getById(assignmentId),
    submissionService.getByAssignment(assignmentId, signal),
    userService.getAll(undefined, signal),
    classService.getAll(undefined, signal),
  ]);
  return { assignment, submissions, users, classes };
}

export function useSubmissionsPage(): UseSubmissionsPageReturn {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const assignmentId = id as ID;

  useEffect(() => {
    if (!id) navigate("/assignments", { replace: true });
  }, [id, navigate]);

  const [grading, setGrading] = useState<
    Record<ID, { grade: string; feedback: string }>
  >({});
  const [savingId, setSavingId] = useState<ID | null>(null);

  const { data, loading, error, refresh } = useAsyncData<SubmissionsPageData>({
    fetcher: (signal) => id ? fetchSubmissionsPageData(assignmentId, signal) : Promise.reject(new Error("Missing assignment id")),
    deps: [assignmentId],
    fallbackError: "خطا در بارگذاری پاسخ‌ها.",
  });

  const assignment = data?.assignment ?? null;
  const submissions = data?.submissions ?? [];
  const users = data?.users ?? [];
  const classes = data?.classes ?? [];

  const userMap = useMapById(users);
  const classMap = useMapById(classes);

  const getUserName = (userId: ID) => getUserNameFromMap(userMap, userId);
  const getUserEmail = (userId: ID) => getUserEmailFromMap(userMap, userId);
  const getClassName = (classId: ID) => getClassNameFromMap(classMap, classId);

  const isDeadlinePassed = useMemo(
    () => assignment ? new Date() > new Date(assignment.deadline) : false,
    [assignment],
  );

  const studentStatuses = useMemo((): StudentSubmissionStatus[] => {
    if (!assignment) return [];

    const classItem = classMap.get(assignment.classId);
    if (!classItem) return [];

    const studentIds = classItem.studentIds || [];
    const submissionsByStudent = new Map(submissions.map((s) => [s.studentId, s]));

    return studentIds
      .filter((studentId) => userMap.has(studentId))
      .map((studentId) => {
        const student = userMap.get(studentId);
        if (!student) return null;

        const submission = submissionsByStudent.get(studentId) ?? null;
        const hasContent = submission && submission.content && submission.content.trim().length > 0;
        const effectiveSubmission = hasContent ? submission : null;

        const isLate = effectiveSubmission
          ? new Date(effectiveSubmission.submittedAt) > new Date(assignment.deadline)
          : false;
        const isMissing = !effectiveSubmission && isDeadlinePassed;
        const isAutoGraded = isMissing;
        const canGrade = Boolean(effectiveSubmission && !isAutoGraded && effectiveSubmission.status !== "graded");

        return {
          student,
          submission: effectiveSubmission,
          isLate,
          isMissing,
          isAutoGraded,
          canGrade,
        };
      })
      .filter((status): status is StudentSubmissionStatus => status !== null);
  }, [assignment, submissions, classMap, userMap, isDeadlinePassed]);

  const gradedCount = useMemo(
    () => studentStatuses.filter((s) => s.submission?.status === "graded" || s.isAutoGraded).length,
    [studentStatuses],
  );

  useEffect(() => {
    if (!assignmentId || !currentUser || !data) return;

    const currentAssignment = data.assignment;
    const currentSubmissions = data.submissions;

    const isAdmin = currentUser.role === "admin";
    const isTeacherOwner =
      currentUser.role === "teacher" && currentAssignment.teacherId === currentUser.id;

    if (!isAdmin && !isTeacherOwner) {
      navigate("/assignments", { replace: true });
      return;
    }

    const initialGrading: Record<
      ID,
      { grade: string; feedback: string }
    > = {};
    currentSubmissions.forEach((sub) => {
      initialGrading[sub.id] = {
        grade: sub.grade?.toString() ?? "",
        feedback: sub.feedback ?? "",
      };
    });
    setGrading(initialGrading);
  }, [assignmentId, currentUser, data, navigate]);

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

  const parseGrade = useCallback(
    (gradeValue: string): { gradeNum: number | null; error: string | null } => {
      if (gradeValue === "" || gradeValue === undefined) {
        return { gradeNum: null, error: "لطفاً نمره را وارد کنید." };
      }
      const gradeNum = Number(gradeValue);
      if (
        isNaN(gradeNum) ||
        gradeNum < 0 ||
        gradeNum > MAX_ASSIGNMENT_GRADE
      ) {
        return {
          gradeNum: null,
          error: `نمره باید عددی بین 0 تا ${MAX_ASSIGNMENT_GRADE} باشد.`,
        };
      }
      return { gradeNum, error: null };
    },
    [MAX_ASSIGNMENT_GRADE],
  );

  const handleSaveMissing = useCallback(
    async (student: User) => {
      setSavingId(student.id);
      try {
        await submissionService.create({
          assignmentId,
          studentId: student.id,
          content: "",
          grade: 0,
          feedback: "تکلیف در مهلت ارسال نشده است.",
          status: "graded",
        });
        addToast("نمره ۰ به صورت خودکار ثبت شد.", "success");
        refresh();
      } catch (err) {
        const info = classifyError(err);
        showErrorToastWithInfo(addToast, info, "خطا در ثبت نمره.");
      } finally {
        setSavingId(null);
      }
    },
    [assignmentId, addToast, refresh],
  );

  const handleSaveExisting = useCallback(
    async (
      submission: Submission,
      gradeData: { grade: string; feedback: string },
      student: User,
    ) => {
      const { gradeNum, error } = parseGrade(gradeData.grade);
      if (error) {
        addToast(error, "error");
        return;
      }

      setSavingId(student.id);
      try {
        await submissionService.update(submission.id, {
          grade: gradeNum,
          feedback: gradeData.feedback || null,
          status: "graded",
        });
        addToast("نمره با موفقیت ذخیره شد.", "success");
        refresh();
        setGrading((prev) => ({
          ...prev,
          [submission.id]: {
            grade: gradeNum?.toString() ?? "",
            feedback: gradeData.feedback || "",
          },
        }));
      } catch (err) {
        const info = classifyError(err);
        showErrorToastWithInfo(addToast, info, "خطا در ثبت نمره.");
      } finally {
        setSavingId(null);
      }
    },
    [addToast, refresh, parseGrade],
  );

  const handleSaveGrade = useCallback(
    async (studentStatus: StudentSubmissionStatus) => {
      const { submission, student, isMissing } = studentStatus;

      if (isMissing && !submission) {
        await handleSaveMissing(student);
        return;
      }

      if (!submission) return;

      const gradeData = grading[submission.id] || {
        grade: "",
        feedback: "",
      };
      await handleSaveExisting(submission, gradeData, student);
    },
    [grading, handleSaveMissing, handleSaveExisting],
  );

  const handleReturnSubmission = useCallback(
    async (submission: Submission) => {
      setSavingId(submission.id);
      try {
        await submissionService.update(submission.id, {
          status: "returned",
          updatedAt: new Date().toISOString(),
        });
        addToast("پاسخ دانشجو برای اصلاح برگردانده شد.", "success");
        refresh();
      } catch (err) {
        const info = classifyError(err);
        showErrorToastWithInfo(addToast, info, "خطا در برگرداندن پاسخ.");
      } finally {
        setSavingId(null);
      }
    },
    [addToast, refresh]
  );

  return {
    assignment,
    studentStatuses,
    userMap,
    classMap,
    loading,
    error: error || "",
    gradedCount,
    isDeadlinePassed,
    getUserName,
    getUserEmail,
    getClassName,
    grading,
    savingId,
    handleGradeChange,
    handleSaveGrade,
    handleReturnSubmission,
    refresh,
  };
}
