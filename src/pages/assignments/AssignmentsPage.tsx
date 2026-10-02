import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Badge from "#/components/ui/Badge.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ConfirmDialog from "#/components/ui/ConfirmDialog.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { isApiError } from "#/services/api/axiosInstance.ts";
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
import AssignmentForm from "./AssignmentForm";
import SubmissionForm from "./SubmissionForm";

export default function AssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

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

  const { classId: classIdParam } = useParams<{ classId?: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";
  const isStudent = currentUser?.role === "student";
  const classId = classIdParam ?? null;
  const isClassPage = !!classIdParam;

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

  const submissionMap = useMemo(() => {
    const map = new Map<ID, Submission>();
    if (currentUser) {
      submissions.forEach((s) => {
        if (s.studentId === currentUser.id) {
          map.set(s.assignmentId, s);
        }
      });
    }
    return map;
  }, [submissions, currentUser]);

  const gradingStatsMap = useMemo(() => {
    const map = new Map<ID, { graded: number; total: number }>();
    for (const assignment of assignments) {
      const relatedSubs = submissions.filter(
        (s) => s.assignmentId === assignment.id,
      );
      map.set(assignment.id, {
        graded: relatedSubs.filter((s) => s.status === "graded").length,
        total: relatedSubs.length,
      });
    }
    return map;
  }, [assignments, submissions]);

  const myClasses = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return classes;
    if (isTeacher) return classes.filter((c) => c.teacherId === currentUser.id);
    if (isStudent)
      return classes.filter((c) =>
        (c.studentIds || []).includes(currentUser.id),
      );
    return [];
  }, [classes, currentUser, isAdmin, isTeacher, isStudent]);

  const canManageAssignment = useCallback(
    (a: Assignment) => {
      if (isAdmin) return true;
      if (isTeacher) return a.teacherId === currentUser?.id;
      return false;
    },
    [isAdmin, isTeacher, currentUser],
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      const message = isApiError(err)
        ? err.userMessage
        : "خطا در بارگذاری داده‌ها";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!ignore) await fetchData();
    };
    load();
    return () => {
      ignore = true;
    };
  }, [fetchData]);

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const getSubmissionForUser = useCallback(
    (assignmentId: ID) => submissionMap.get(assignmentId),
    [submissionMap],
  );

  const getTeacherName = useCallback(
    (teacherId: ID) => userMap.get(teacherId)?.name ?? "—",
    [userMap],
  );

  const getClassName = useCallback(
    (cId: ID) => classMap.get(cId)?.title ?? "—",
    [classMap],
  );

  const handleViewSubmissions = (assignmentId: ID) =>
    navigate(`/assignments/${assignmentId}/submissions`);

  const handleOpenSubmissionForm = (assignment: Assignment) => {
    setSubmissionToEdit(getSubmissionForUser(assignment.id) || null);
    setSubmittingAssignment(assignment);
    setShowSubmissionForm(true);
  };

  const handleAssignmentFormClose = () => {
    setShowAssignmentForm(false);
    setEditingAssignment(null);
  };

  const handleSubmissionFormClose = () => {
    setShowSubmissionForm(false);
    setSubmissionToEdit(null);
    setSubmittingAssignment(null);
  };

  const handleAssignmentSuccess = (
    message: string,
    updatedAssignment: Assignment,
  ) => {
    handleAssignmentFormClose();
    setActionMessage(message);

    setAssignments((prev) => {
      const exists = prev.some((a) => a.id === updatedAssignment.id);
      return exists
        ? prev.map((a) =>
            a.id === updatedAssignment.id ? updatedAssignment : a,
          )
        : [...prev, updatedAssignment];
    });
  };

  // آپدیت موضعی ارسال‌ها به جای واکشی مجدد از سرور
  const handleSubmissionSuccess = (
    message: string,
    newSubmission: Submission,
  ) => {
    handleSubmissionFormClose();
    setActionMessage(message);

    setSubmissions((prev) => {
      const exists = prev.some((s) => s.id === newSubmission.id);
      return exists
        ? prev.map((s) => (s.id === newSubmission.id ? newSubmission : s))
        : [...prev, newSubmission];
    });
  };

  const handleDeleteAssignment = async () => {
    if (!deleteAssignmentTarget) return;
    try {
      await assignmentService.delete(deleteAssignmentTarget.id);
      setAssignments((prev) =>
        prev.filter((a) => a.id !== deleteAssignmentTarget.id),
      );
      setDeleteAssignmentTarget(null);
      setActionMessage("تکلیف با موفقیت حذف شد.");
    } catch (err) {
      const message = isApiError(err)
        ? err.userMessage
        : "حذف تکلیف با خطا مواجه شد.";
      setError(message);
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (isClassPage && classId && a.classId !== classId) return false;
      if (isStudent) {
        const cls = classMap.get(a.classId);
        if (!cls || !(cls.studentIds || []).includes(currentUser?.id ?? ""))
          return false;
      } else if (isTeacher) {
        const cls = classMap.get(a.classId);
        if (!cls || cls.teacherId !== currentUser?.id) return false;
      }
      return true;
    });
  }, [
    assignments,
    isClassPage,
    classId,
    isStudent,
    isTeacher,
    classMap,
    currentUser,
  ]);

  if (loading) return <Loading />;
  if (error)
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        role="alert"
      >
        {error}
      </div>
    );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          {isClassPage && classId
            ? `تکالیف کلاس: ${getClassName(classId)}`
            : "تکالیف"}
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
        <div
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          role="status"
          aria-live="polite"
        >
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
                render: (a) => {
                  const isExpired = new Date(a.deadline) < new Date();
                  return (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={
                          isExpired ? "font-semibold text-red-600" : ""
                        }
                      >
                        {formatDate(a.deadline)}
                      </span>
                      {isExpired && <Badge variant="red">منقضی شده</Badge>}
                    </span>
                  );
                },
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
                    const stats = gradingStatsMap.get(a.id) || {
                      graded: 0,
                      total: 0,
                    };
                    return (
                      <span className="text-sm text-gray-600">
                        {stats.graded}/{stats.total} نمره داده شده
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
                    <div className="flex flex-wrap justify-center gap-2">
                      {isStudent &&
                        (!sub ? (
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenSubmissionForm(a)}
                          >
                            ارسال پاسخ
                          </Button>
                        ) : !isGraded ? (
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenSubmissionForm(a)}
                          >
                            ویرایش پاسخ
                          </Button>
                        ) : (
                          <span className="py-2 text-xs text-gray-500">
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
            renderMobileCard={(a) => {
              const sub = getSubmissionForUser(a.id);
              const isGraded = sub?.status === "graded";
              const isExpired = new Date(a.deadline) < new Date();
              const stats = gradingStatsMap.get(a.id) || {
                graded: 0,
                total: 0,
              };
              return (
                <div className="space-y-2 text-right">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-base font-bold text-gray-800">
                      {a.title}
                    </span>
                    {isStudent &&
                      (sub ? (
                        <StatusChip status={sub.status} />
                      ) : (
                        <Badge variant="gray">ارسال نشده</Badge>
                      ))}
                    {!isStudent && canManageAssignment(a) && (
                      <span className="text-xs text-gray-500">
                        {stats.graded}/{stats.total} نمره
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-500">کلاس:</span>{" "}
                    {getClassName(a.classId)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-500">استاد:</span>{" "}
                    {getTeacherName(a.teacherId)}
                  </div>
                  {a.description && (
                    <p className="line-clamp-2 text-xs text-gray-500">
                      {a.description}
                    </p>
                  )}
                  <div
                    className={`inline-flex items-center gap-2 text-sm ${isExpired ? "font-semibold text-red-600" : "text-gray-700"}`}
                  >
                    <span className="text-gray-500">ددلاین:</span>{" "}
                    {formatDate(a.deadline)}
                    {isExpired && <Badge variant="red">منقضی شده</Badge>}
                  </div>
                  {isStudent && isGraded && sub?.grade !== undefined && (
                    <div className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-bold text-green-700">
                      نمره: {sub.grade}
                    </div>
                  )}
                </div>
              );
            }}
            renderMobileActions={(a) => {
              const sub = getSubmissionForUser(a.id);
              const isGraded = sub?.status === "graded";
              return (
                <>
                  {isStudent && (
                    <>
                      {!sub ? (
                        <button
                          onClick={() => handleOpenSubmissionForm(a)}
                          className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
                        >
                          ارسال پاسخ
                        </button>
                      ) : !isGraded ? (
                        <button
                          onClick={() => handleOpenSubmissionForm(a)}
                          className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
                        >
                          ویرایش پاسخ
                        </button>
                      ) : (
                        <div className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-400">
                          نمره نهایی شده ({sub.grade})
                        </div>
                      )}
                    </>
                  )}
                  {canManageAssignment(a) && (
                    <>
                      <button
                        onClick={() => {
                          setEditingAssignment(a);
                          setShowAssignmentForm(true);
                        }}
                        className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleViewSubmissions(a.id)}
                        className="w-full rounded-md px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
                      >
                        مشاهده پاسخ‌ها
                      </button>
                      <button
                        onClick={() => setDeleteAssignmentTarget(a)}
                        className="w-full rounded-md px-3 py-2 text-right text-sm text-red-600 hover:bg-red-50"
                      >
                        حذف
                      </button>
                    </>
                  )}
                </>
              );
            }}
          />
        </Card>
      )}

      {showAssignmentForm && (
        <AssignmentForm
          isOpen={true}
          initialData={editingAssignment}
          availableClasses={myClasses}
          teacherId={currentUser?.id ?? ""}
          isAdmin={isAdmin}
          onClose={handleAssignmentFormClose}
          onSuccess={handleAssignmentSuccess}
        />
      )}

      {showSubmissionForm && currentUser && submittingAssignment && (
        <SubmissionForm
          isOpen={true}
          key={`submission-form-${submittingAssignment.id}-${showSubmissionForm}`}
          assignmentId={
            submissionToEdit?.assignmentId ?? submittingAssignment.id
          }
          studentId={currentUser.id}
          existingSubmission={submissionToEdit}
          deadline={submittingAssignment.deadline}
          onClose={handleSubmissionFormClose}
          onSuccess={handleSubmissionSuccess}
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
