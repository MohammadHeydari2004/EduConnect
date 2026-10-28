import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import StudentAttendanceView from "#/pages/attendance/StudentAttendanceView.tsx";
import TeacherAttendanceForm from "#/pages/attendance/TeacherAttendanceForm.tsx";
import AdminAttendanceReport from "#/pages/attendance/AdminAttendanceReport.tsx";
import { useAttendancePage } from "#/pages/attendance/useAttendancePage";

export default function AttendancePage() {
  const {
    currentUser,
    isAdmin,
    isTeacher,
    isStudent,
    loading,
    error,
    selectedClassId,
    selectedSessionId,
    availableClasses,
    availableSessions,
    classStudents,
    sessionAttendances,
    draftAttendanceMap,
    isSaving,
    handleClassChange,
    handleSessionChange,
    handleStatusChange,
    handleMarkAllPresent,
    handleMarkAllAbsent,
    handleSave,
  } = useAttendancePage();

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} />;
  if (!currentUser) return <EmptyState title="دسترسی محدود" description="شما دسترسی به این بخش ندارید." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
        حضور و غیاب
      </h1>
      {isStudent ? (
        <StudentAttendanceView
          attendances={[]}
          sessionMap={new Map()}
          classMap={new Map()}
          currentUser={currentUser}
        />
      ) : isAdmin ? (
        <AdminAttendanceReport
          classes={availableClasses}
          sessions={availableSessions}
          classStudents={classStudents}
          selectedClassId={selectedClassId}
          selectedSessionId={selectedSessionId}
          attendances={sessionAttendances}
          onClassChange={handleClassChange}
          onSessionChange={handleSessionChange}
        />
      ) : isTeacher ? (
        <TeacherAttendanceForm
          data={{
            classes: availableClasses,
            sessions: availableSessions,
            classStudents,
            selectedClassId,
            selectedSessionId,
            draftAttendanceMap,
            isSaving,
          }}
          handlers={{
            onClassChange: handleClassChange,
            onSessionChange: handleSessionChange,
            onStatusChange: handleStatusChange,
            onMarkAllPresent: handleMarkAllPresent,
            onMarkAllAbsent: handleMarkAllAbsent,
            onSave: handleSave,
          }}
        />
      ) : (
        <EmptyState
          title="دسترسی محدود"
          description="شما دسترسی به این بخش ندارید."
        />
      )}
    </div>
  );
}