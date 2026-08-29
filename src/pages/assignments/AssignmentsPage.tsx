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

export default function AssignmentsPage() {
  const { id: classIdParam } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const classId = classIdParam ? Number(classIdParam) : null;
  const isClassPage = !!classIdParam;

  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";
  const isStudent = currentUser?.role === "student";

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

  const canViewAssignment = () => true;

  const canManageAssignment = (a: Assignment) => {
    if (isTeacher) return String(a.teacherId) === String(currentUser?.id);
    return false;
  };

  const fetchData = async () => {
    try {
      setError("");
      const [usersData, submissionsData, classesData, assignmentsData] =
        await Promise.all([
          userService.getAll(),
          submissionService.getAll(),
          classService.getAll(),
          assignmentService.getAll(),
        ]);
      setUsers(usersData);
      setSubmissions(submissionsData);
      setClasses(classesData);
      setAssignments(assignmentsData);
    } catch {
      setError("خطا در بارگذاری داده‌ها.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError("");

    Promise.all([
      userService.getAll(),
      submissionService.getAll(),
      classService.getAll(),
      assignmentService.getAll(),
    ])
      .then(([usersData, submissionsData, classesData, assignmentsData]) => {
        if (!ignore) {
          setUsers(usersData);
          setSubmissions(submissionsData);
          setClasses(classesData);
          setAssignments(assignmentsData);
        }
      })
      .catch(() => {
        if (!ignore) setError("خطا در بارگذاری داده‌ها.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSubmissionForUser = (assignmentId: number | string) => {
    return submissions.find(
      (s) =>
        String(s.assignmentId) === String(assignmentId) &&
        String(s.studentId) === String(currentUser?.id),
    );
  };

  const getTeacherName = (teacherId: number | string) => {
    return users.find((u) => String(u.id) === String(teacherId))?.name ?? "—";
  };

  const getClassName = (cId: number | string) => {
    return classes.find((c) => String(c.id) === String(cId))?.title ?? "—";
  };

  const handleViewSubmissions = (assignmentId: number | string) => {
    navigate(`/assignments/${assignmentId}/submissions`);
  };

  const handleSubmit = (assignment: Assignment) => {
    const existing = getSubmissionForUser(assignment.id);
    setSubmissionToEdit(existing || null);
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
    fetchData();
  };

  const handleDeleteAssignment = async () => {
    if (!deleteAssignmentTarget) return;
    try {
      await assignmentService.delete(deleteAssignmentTarget.id);
      setDeleteAssignmentTarget(null);
      handleSuccess("تکلیف با موفقیت حذف شد.");
    } catch {
      setError("حذف تکلیف با خطا مواجه شد.");
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  const filteredAssignments = assignments.filter((a) => {
    if (!canViewAssignment()) return false;
    if (isClassPage && classId && String(a.classId) !== String(classId))
      return false;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          {isClassPage
            ? `تکالیف کلاس: ${classes.find((c) => String(c.id) === String(classId))?.title}`
            : "تکالیف"}
        </h1>
        {isTeacher && (
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
                      const submission = getSubmissionForUser(a.id);
                      if (submission)
                        return <StatusChip status={submission.status} />;
                      return <span className="text-gray-500">ارسال نشده</span>;
                    }
                    if (isTeacher && canManageAssignment(a)) {
                      const assignmentSubmissions = submissions.filter(
                        (s) => String(s.assignmentId) === String(a.id),
                      );
                      const gradedCount = assignmentSubmissions.filter(
                        (s) => s.status === "graded",
                      ).length;
                      return (
                        <span className="text-sm text-gray-600">
                          {gradedCount}/{assignmentSubmissions.length} نمره داده
                          شده
                        </span>
                      );
                    }
                    return <span className="text-gray-500">—</span>;
                  },
                },
                {
                  key: "grade",
                  title: "نمره و بازخورد",
                  render: (a) => {
                    if (isStudent) {
                      const submission = getSubmissionForUser(a.id);
                      if (submission && submission.status === "graded") {
                        return (
                          <div className="text-sm">
                            <div className="font-bold text-green-700">
                              {submission.grade}/20
                            </div>
                            {submission.feedback && (
                              <div
                                className="text-xs text-gray-500 mt-1 max-w-xs truncate"
                                title={submission.feedback}
                              >
                                {submission.feedback}
                              </div>
                            )}
                          </div>
                        );
                      }
                      if (submission && submission.status === "submitted") {
                        return (
                          <span className="text-yellow-600 text-xs">
                            در انتظار نمره
                          </span>
                        );
                      }
                      return <span className="text-gray-500">—</span>;
                    }
                    if (isTeacher && canManageAssignment(a)) {
                      const assignmentSubmissions = submissions.filter(
                        (s) => String(s.assignmentId) === String(a.id),
                      );
                      if (assignmentSubmissions.length === 0)
                        return (
                          <span className="text-gray-500">پاسخی نیست</span>
                        );
                      const gradedSubs = assignmentSubmissions.filter(
                        (s) => s.status === "graded" && s.grade !== null,
                      );
                      if (gradedSubs.length === 0)
                        return (
                          <span className="text-yellow-600 text-xs">
                            نمره‌ای ثبت نشده
                          </span>
                        );
                      const avgGrade =
                        gradedSubs.reduce((sum, s) => sum + (s.grade ?? 0), 0) /
                        gradedSubs.length;
                      return (
                        <div className="text-sm">
                          <div className="font-bold text-blue-700">
                            میانگین: {avgGrade.toFixed(1)}/20
                          </div>
                          <div className="text-xs text-gray-500">
                            از {gradedSubs.length} پاسخ
                          </div>
                        </div>
                      );
                    }
                    return <span className="text-gray-500">—</span>;
                  },
                },
                {
                  key: "actions",
                  title: "عملیات",
                  render: (a) => {
                    const submission = getSubmissionForUser(a.id);
                    const isGraded = submission?.status === "graded";
                    return (
                      <div className="flex flex-wrap gap-2">
                        {isStudent && (
                          <>
                            {!submission && (
                              <Button
                                variant="secondary"
                                onClick={() => handleSubmit(a)}
                              >
                                ارسال پاسخ
                              </Button>
                            )}
                            {submission && !isGraded && (
                              <Button
                                variant="secondary"
                                onClick={() => handleSubmit(a)}
                              >
                                ویرایش پاسخ
                              </Button>
                            )}
                            {isGraded && (
                              <span className="text-xs text-gray-500 py-2">
                                نمره نهایی شده
                              </span>
                            )}
                          </>
                        )}
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
          assignmentId={
            submissionToEdit?.assignmentId ?? editingAssignment?.id ?? 0
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
