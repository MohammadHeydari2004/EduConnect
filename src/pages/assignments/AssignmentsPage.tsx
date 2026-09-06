import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import { useAuth } from "#/context/AuthContext.ts";
import { assignmentService } from "#/services/modules/assignmentService.ts";
import { classService } from "#/services/modules/classService.ts";
import { submissionService } from "#/services/modules/submissionService.ts";
import { userService } from "#/services/modules/userService.ts";
import { formatDate } from "#/utils/formatDate.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ClassItem } from "#/types/class.ts";
import type { Submission } from "#/types/submission.ts";
import type { User } from "#/types/user.ts";
import AssignmentForm from "./AssignmentForm";
import SubmissionForm from "./SubmissionForm";

type PageState = {
  loading: boolean;
  error: string;
  assignments: Assignment[];
  submissions: Submission[];
  users: User[];
  classes: ClassItem[];
};

const initialState: PageState = {
  loading: true,
  error: "",
  assignments: [],
  submissions: [],
  users: [],
  classes: [],
};

export default function AssignmentsPage() {
  const { classId: classIdParam } = useParams<{ classId?: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [state, setState] = useState<PageState>(initialState);
  const [actionMessage, setActionMessage] = useState("");
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null,
  );
  const [deleteAssignmentTarget, setDeleteAssignmentTarget] =
    useState<Assignment | null>(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionToEdit, setSubmissionToEdit] = useState<Submission | null>(
    null,
  );
  const [submittingAssignment, setSubmittingAssignment] =
    useState<Assignment | null>(null);

  const classId = classIdParam ? Number(classIdParam) : null;
  const isClassPage = !!classIdParam;
  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";
  const isStudent = currentUser?.role === "student";

  const { loading, error, assignments, submissions, users, classes } = state;

  const myClasses = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return classes;
    if (isTeacher)
      return classes.filter(
        (c) => String(c.teacherId) === String(currentUser.id),
      );
    if (isStudent)
      return classes.filter((c) =>
        (c.studentIds || []).map(String).includes(String(currentUser.id)),
      );
    return [];
  }, [classes, currentUser, isAdmin, isTeacher, isStudent]);

  const canManageAssignment = (a: Assignment) => {
    if (isAdmin) return true;
    if (isTeacher) return String(a.teacherId) === String(currentUser?.id);
    return false;
  };

  const fetchData = async () => {
    const [usersData, submissionsData, classesData, assignmentsData] =
      await Promise.all([
        userService.getAll(),
        submissionService.getAll(),
        classService.getAll(),
        assignmentService.getAll(),
      ]);
    return { usersData, submissionsData, classesData, assignmentsData };
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await fetchData();
        if (!ignore) {
          setState({
            loading: false,
            error: "",
            users: data.usersData,
            submissions: data.submissionsData,
            classes: data.classesData,
            assignments: data.assignmentsData,
          });
        }
      } catch (err) {
        if (!ignore)
          setState((prev) => ({
            ...prev,
            loading: false,
            error: `خطا در بارگذاری داده‌ها: ${err}`,
          }));
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const getSubmissionForUser = (assignmentId: number | string) =>
    submissions.find(
      (s) =>
        String(s.assignmentId) === String(assignmentId) &&
        String(s.studentId) === String(currentUser?.id),
    );

  const getTeacherName = (teacherId: number | string) =>
    users.find((u) => String(u.id) === String(teacherId))?.name ?? "—";
  const getClassName = (cId: number | string) =>
    classes.find((c) => String(c.id) === String(cId))?.title ?? "—";

  const handleViewSubmissions = (assignmentId: number | string) =>
    navigate(`/assignments/${assignmentId}/submissions`);

  // const handleSubmit = (assignment: Assignment) => {
  //   const existing = getSubmissionForUser(assignment.id);
  //   setSubmissionToEdit(existing || null);
  //   setShowSubmissionForm(true);
  // };
  const handleSubmit = (assignment: Assignment) => {
    setSubmissionToEdit(getSubmissionForUser(assignment.id) || null);
    setSubmittingAssignment(assignment);
    setShowSubmissionForm(true);
  };

  const handleSuccess = (message?: string) => {
    setShowAssignmentForm(false);
    setShowSubmissionForm(false);
    setEditingAssignment(null);
    setSubmissionToEdit(null);
    if (message) {
      setActionMessage(message);
      setTimeout(() => setActionMessage(""), 3000);
    }
    setState((prev) => ({ ...prev, loading: true }));
    fetchData()
      .then((data) =>
        setState({
          loading: false,
          error: "",
          users: data.usersData,
          submissions: data.submissionsData,
          classes: data.classesData,
          assignments: data.assignmentsData,
        }),
      )
      .catch(() =>
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "خطا در به‌روزرسانی داده‌ها.",
        })),
      );
  };

  const handleDeleteAssignment = async () => {
    if (!deleteAssignmentTarget) return;
    try {
      await assignmentService.delete(deleteAssignmentTarget.id);
      setDeleteAssignmentTarget(null);
      handleSuccess("تکلیف با موفقیت حذف شد.");
    } catch {
      setState((prev) => ({ ...prev, error: "حذف تکلیف با خطا مواجه شد." }));
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  const filteredAssignments = assignments.filter((a) => {
    if (isClassPage && classId && String(a.classId) !== String(classId))
      return false;

    if (isStudent) {
      const cls = classes.find((c) => String(c.id) === String(a.classId));
      if (
        !cls ||
        !(cls.studentIds || []).map(String).includes(String(currentUser?.id))
      )
        return false;
    } else if (isTeacher) {
      const cls = classes.find((c) => String(c.id) === String(a.classId));
      if (!cls || String(cls.teacherId) !== String(currentUser?.id))
        return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          {isClassPage ? `تکالیف کلاس: ${getClassName(classId!)}` : "تکالیف"}
        </h1>
        {(isAdmin || isTeacher) && (
          <Button
            onClick={() => {
              setEditingAssignment(null);
              setShowAssignmentForm(true);
            }}
          >
            ایجاد تکلیف جدید
          </Button>
        )}
      </div>

      {actionMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionMessage}
        </div>
      )}

      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="تکلیفی وجود ندارد"
          description="تکلیفی برای نمایش موجود نیست."
        />
      ) : (
        <Card>
          <div className="-mx-5 overflow-x-auto sm:mx-0">
            <Table
              getRowKey={(a) => a.id}
              columns={[
                { key: "title", title: "عنوان", render: (a) => a.title },
                {
                  key: "className",
                  title: "کلاس",
                  render: (a) => getClassName(a.classId),
                },
                {
                  key: "description",
                  title: "توضیحات",
                  render: (a) => a.description,
                },
                {
                  key: "deadline",
                  title: "ددلاین",
                  render: (a) => formatDate(a.deadline),
                },
                {
                  key: "teacher",
                  title: "استاد",
                  render: (a) => getTeacherName(a.teacherId),
                },
                {
                  key: "status",
                  title: "وضعیت",
                  render: (a) => {
                    if (isStudent) {
                      const sub = getSubmissionForUser(a.id);
                      return sub ? (
                        <StatusChip status={sub.status} />
                      ) : (
                        <span className="text-gray-500">ارسال نشده</span>
                      );
                    }
                    if ((isAdmin || isTeacher) && canManageAssignment(a)) {
                      const subs = submissions.filter(
                        (s) => String(s.assignmentId) === String(a.id),
                      );
                      return (
                        <span className="text-sm text-gray-600">
                          {subs.filter((s) => s.status === "graded").length}/
                          {subs.length} نمره داده شده
                        </span>
                      );
                    }
                    return <span className="text-gray-500">—</span>;
                  },
                },
                {
                  key: "actions",
                  title: "عملیات",
                  render: (a) => {
                    const sub = getSubmissionForUser(a.id);
                    const isGraded = sub?.status === "graded";
                    return (
                      <div className="flex flex-wrap gap-2">
                        {isStudent &&
                          (!sub ? (
                            <Button
                              variant="secondary"
                              onClick={() => handleSubmit(a)}
                            >
                              ارسال پاسخ
                            </Button>
                          ) : !isGraded ? (
                            <Button
                              variant="secondary"
                              onClick={() => handleSubmit(a)}
                            >
                              ویرایش پاسخ
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-500 py-2">
                              نمره نهایی شده
                            </span>
                          ))}
                        {canManageAssignment(a) && (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setEditingAssignment(a);
                                setShowAssignmentForm(true);
                              }}
                            >
                              ویرایش
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => setDeleteAssignmentTarget(a)}
                            >
                              حذف
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => handleViewSubmissions(a.id)}
                            >
                              پاسخ‌ها
                            </Button>
                          </>
                        )}
                      </div>
                    );
                  },
                },
              ]}
              data={filteredAssignments}
            />
          </div>
        </Card>
      )}

      {showAssignmentForm && (
        <AssignmentForm
          isOpen={true}
          initialData={editingAssignment}
          availableClasses={myClasses}
          teacherId={Number(currentUser?.id)}
          isAdmin={isAdmin}
          onClose={() => setShowAssignmentForm(false)}
          onSuccess={() => handleSuccess("تکلیف با موفقیت ذخیره شد.")}
        />
      )}

      {showSubmissionForm && currentUser && (
        <SubmissionForm
          isOpen={true}
          // assignmentId={
          //   submissionToEdit?.assignmentId ?? editingAssignment?.id ?? 0
          // }
          assignmentId={
            submissionToEdit?.assignmentId ?? submittingAssignment?.id ?? 0
          }
          studentId={Number(currentUser.id)}
          existingSubmission={submissionToEdit}
          onClose={() => setShowSubmissionForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteAssignmentTarget}
        title="حذف تکلیف"
        message={`آیا از حذف تکلیف "${deleteAssignmentTarget?.title}" مطمئن هستید؟`}
        onClose={() => setDeleteAssignmentTarget(null)}
        onConfirm={handleDeleteAssignment}
      />
    </div>
  );
}
