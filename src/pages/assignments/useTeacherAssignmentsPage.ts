import {
  assignmentFilterConfigs,
  initialAssignmentFilters,
  TOAST_MESSAGES,
} from "#/configs/constants";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useAssignmentsPageData } from "#/hooks/useAssignmentsPageData";
import { useCrudPage } from "#/hooks/useCrudPage.ts";
import { useToast } from "#/hooks/useToast.ts";
import { assignmentService } from "#/services/assignment.ts";
import type {
  Assignment,
  AssignmentFilters,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from "#/types/assignment.ts";
import type { ID } from "#/types/common.ts";
import {
  getClassNameFromMap,
  getUserNameFromMap,
} from "#/utils/nameHelpers.ts";
import { isAdmin, isTeacher } from "#/utils/roleUtils.ts";
import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function useTeacherAssignmentsPage() {
  const { classId: classIdParam } = useParams<{ classId?: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const { classes, userMap, classMap, gradingStatsMap } =
    useAssignmentsPageData();

  const isAdminUser = isAdmin(currentUser);
  const isTeacherUser = isTeacher(currentUser);
  const classId = classIdParam ?? null;
  const isClassPage = !!classIdParam;

  const myClasses = useMemo(() => {
    if (!currentUser) return [];
    if (isAdminUser) return classes;
    if (isTeacherUser)
      return classes.filter((c) => c.teacherId === currentUser.id);
    return [];
  }, [classes, currentUser, isAdminUser, isTeacherUser]);

  const getTeacherName = (userId: ID) => getUserNameFromMap(userMap, userId);
  const getClassName = (classId: ID) => getClassNameFromMap(classMap, classId);

  const extraPredicate = useCallback(
    (assignment: Assignment) => {
      if (isClassPage && classId && assignment.classId !== classId)
        return false;
      if (isTeacherUser) {
        const cls = classMap.get(assignment.classId);
        if (!cls || cls.teacherId !== currentUser?.id) return false;
      }
      return true;
    },
    [isClassPage, classId, isTeacherUser, classMap, currentUser],
  );

  const crud = useCrudPage<
    Assignment,
    CreateAssignmentPayload,
    UpdateAssignmentPayload,
    AssignmentFilters
  >({
    service: {
      getAll: assignmentService.getAll,
      getById: assignmentService.getById,
      create: assignmentService.create,
      update: assignmentService.update,
      delete: assignmentService.delete,
    },
    initialFilters: initialAssignmentFilters,
    filterConfigs: assignmentFilterConfigs,
    extraPredicate,
    fallbackError: TOAST_MESSAGES.FETCH_ERROR,
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
    crud.actions.modal.close();
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
    assignmentsLoading: crud.state.loading,
    assignmentModal: crud.actions.modal,
    isDeleting: crud.actions.isDeleting,
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
