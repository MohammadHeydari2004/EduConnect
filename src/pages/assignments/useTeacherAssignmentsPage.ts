import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { type FilterConfig, createStringContainsFilter, createExactMatchFilter, createDateStatusFilter } from "#/hooks/useFilter.ts";
import { useAssignmentsPageData } from "#/pages/assignments/useAssignmentsPageData.ts";
import { useCrudPage } from "#/hooks/useCrudPage.ts";
import { assignmentService } from "#/services/assignment.ts";
import type { Assignment } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import { useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface AssignmentFilters {
  search: string;
  classId: string;
  status: "" | "active" | "expired";
  [key: string]: string;
}

const initialFilters: AssignmentFilters = {
  search: "",
  classId: "",
  status: "",
};

export function useTeacherAssignmentsPage() {
  const { classId: classIdParam } = useParams<{ classId?: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const {
    classes,
    userMap,
    classMap,
    gradingStatsMap,
    refreshAssignments,
  } = useAssignmentsPageData();

  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";
  const classId = classIdParam ?? null;
  const isClassPage = !!classIdParam;

  const canManageAssignment = useCallback(
    (a: Assignment) => {
      if (isAdmin) return true;
      if (isTeacher) return a.teacherId === currentUser?.id;
      return false;
    },
    [isAdmin, isTeacher, currentUser?.id],
  );

  const getTeacherName = useCallback(
    (teacherId: ID) => userMap.get(teacherId)?.name ?? "—",
    [userMap],
  );

  const getClassName = useCallback(
    (cId: ID) => classMap.get(cId)?.title ?? "—",
    [classMap],
  );

  const myClasses = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return classes;
    if (isTeacher) return classes.filter((c) => c.teacherId === currentUser.id);
    return [];
  }, [classes, currentUser, isAdmin, isTeacher]);

  const filterConfigs = useMemo<FilterConfig<Assignment>[]>(
    () => [
      createStringContainsFilter<Assignment>("search", (assignment) => assignment.title),
      createExactMatchFilter<Assignment>("classId", (assignment) => assignment.classId),
      createDateStatusFilter<Assignment>("status", (assignment) => assignment.deadline),
    ],
    [],
  );

  const extraPredicate = useCallback(
    (assignment: Assignment) => {
      if (isClassPage && classId && assignment.classId !== classId) return false;
      if (isTeacher) {
        const cls = classMap.get(assignment.classId);
        if (!cls || cls.teacherId !== currentUser?.id) return false;
      }
      return true;
    },
    [isClassPage, classId, isTeacher, classMap, currentUser],
  );

  const crud = useCrudPage<Assignment, Partial<Assignment>, Partial<Assignment>, AssignmentFilters>({
    service: {
      getAll: () => assignmentService.getAll(),
      getById: (id: ID) => assignmentService.getById(id),
      create: (data: Partial<Assignment>) => assignmentService.create(data as any),
      update: (id: ID, data: Partial<Assignment>) => assignmentService.update(id, data as any),
      delete: (id: ID) => assignmentService.delete(id),
    },
    initialFilters,
    filterConfigs,
    extraPredicate,
    fallbackError: "دریافت لیست تکالیف با خطا مواجه شد.",
    canManage: canManageAssignment,
    onCreateSuccess: () => {
      addToast("تکلیف با موفقیت ایجاد شد.", "success");
    },
    onUpdateSuccess: () => {
      addToast("تکلیف با موفقیت ویرایش شد.", "success");
    },
    onDeleteSuccess: () => {
      addToast("تکلیف با موفقیت حذف شد.", "success");
    },
  });

  const handleViewSubmissions = (assignmentId: ID) =>
    navigate(`/assignments/${assignmentId}/submissions`);

  const handleAssignmentFormClose = () => {
    crud.actions.createModal.close();
  };

  const handleAssignmentSuccess = () => {
    handleAssignmentFormClose();
    refreshAssignments();
  };

  return {
    currentUser,
    isAdmin,
    isTeacher,
    isClassPage,
    classId,
    myClasses,
    userMap,
    classMap,
    gradingStatsMap,
    filters: crud.state.filters,
    setFilters: crud.state.setFilters,
    resetFilters: crud.state.resetFilters,
    filteredAssignments: crud.state.filteredData,
    assignmentModal: crud.actions.createModal,
    isDeleting: crud.actions.isDeleting,
    canManageAssignment,
    handleOpenCreate: crud.actions.handleOpenCreate,
    handleOpenEdit: crud.actions.handleOpenEdit,
    handleOpenDelete: crud.actions.handleOpenDelete,
    handleDelete: crud.actions.handleDelete,
    handleViewSubmissions,
    getTeacherName,
    getClassName,
    handleAssignmentFormClose,
    handleAssignmentSuccess,
  };
}