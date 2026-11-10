import Loading from "#/components/common/Loading.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import StudentAttendanceView from "#/pages/attendance/StudentAttendanceView.tsx";
import TeacherAttendanceForm from "#/pages/attendance/TeacherAttendanceForm.tsx";
import AdminAttendanceReport from "#/pages/attendance/AdminAttendanceReport.tsx";
import { useAttendancePage } from "#/pages/attendance/useAttendancePage";
import { useMapById } from "#/hooks/useMapById.ts";
import type { Session } from "#/types/session.ts";

export default function AttendancePage() {
  const {
    currentUser,
    isAdmin,
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
    attendances,
    sessions,
    classMap,
  } = useAttendancePage();

  const sessionMap = useMapById<Session>(sessions);

  if (!currentUser) return null;

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl max-sm:mt-2.5">
        حضور و غیاب
      </h1>
      {isStudent ? (
        <StudentAttendanceView
          attendances={attendances}
          sessionMap={sessionMap}
          classMap={classMap}
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
      ) : (
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
      )}
    </div>
  );
}