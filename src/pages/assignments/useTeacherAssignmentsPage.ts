import { useAuth } from "#/contexts/AuthContext.ts";
import { useToast } from "#/hooks/useToast.ts";
import { type FilterConfig, createStringContainsFilter, createExactMatchFilter, createDateStatusFilter } from "#/hooks/useFilter.ts";
import { useAssignmentsPageData } from "#/pages/assignments/useAssignmentsPageData.ts";
import { useCrudPage } from "#/hooks/useCrudPage.ts";
import { assignmentService } from "#/services/assignment.ts";
import type { Assignment, CreateAssignmentPayload, UpdateAssignmentPayload } from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import { TOAST_MESSAGES } from "#/configs/constants";
import { isAdmin, isTeacher } from "#/utils/roleUtils.ts";
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
  } = useAssignmentsPageData();

  const isAdminUser = isAdmin(currentUser);
  const isTeacherUser = isTeacher(currentUser);
  const classId = classIdParam ?? null;
  const isClassPage = !!classIdParam;

  const canManageAssignment = useCallback(
    (a: Assignment) => {
      if (!currentUser) return false;
      if (isAdminUser) return true;
      if (isTeacherUser) return a.teacherId === currentUser.id;
      return false;
    },
    [isAdminUser, isTeacherUser, currentUser?.id],
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
    if (isAdminUser) return classes;
    if (isTeacherUser) return classes.filter((c) => c.teacherId === currentUser.id);
    return [];
  }, [classes, currentUser, isAdminUser, isTeacherUser]);

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
      if (isTeacherUser) {
        const cls = classMap.get(assignment.classId);
        if (!cls || cls.teacherId !== currentUser?.id) return false;
      }
      return true;
    },
    [isClassPage, classId, isTeacherUser, classMap, currentUser],
  );

  const crud = useCrudPage<Assignment, CreateAssignmentPayload, UpdateAssignmentPayload, AssignmentFilters>({
    service: {
      getAll: () => assignmentService.getAll(),
      getById: (id: ID) => assignmentService.getById(id),
      create: (data: CreateAssignmentPayload) => assignmentService.create(data),
      update: (id: ID, data: UpdateAssignmentPayload) => assignmentService.update(id, data),
      delete: (id: ID) => assignmentService.delete(id),
    },
    initialFilters,
    filterConfigs,
    extraPredicate,
    fallbackError: TOAST_MESSAGES.FETCH_ERROR,
    canManage: canManageAssignment,
    onCreateSuccess: () => {
      addToast(TOAST_MESSAGES.ASSIGNMENT_CREATE_SUCCESS, "success");
    },
    onUpdateSuccess: () => {
      addToast(TOAST_MESSAGES.ASSIGNMENT_UPDATE_SUCCESS, "success");
    },
    onDeleteSuccess: () => {
      addToast(TOAST_MESSAGES.ASSIGNMENT_DELETE_SUCCESS, "success");
    },
  });

  const handleViewSubmissions = (assignmentId: ID) =>
    navigate(`/assignments/${assignmentId}/submissions`);

  const handleAssignmentFormClose = () => {
    crud.actions.createModal.close();
  };

  const handleAssignmentSuccess = () => {
    handleAssignmentFormClose();
    crud.state.refresh();
  };

  return {
    currentUser,
    isAdmin: isAdminUser,
    isTeacher: isTeacherUser,
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
