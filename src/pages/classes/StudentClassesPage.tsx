import EmptyState from "#/components/common/EmptyState.tsx";
import Loading from "#/components/common/Loading.tsx";
import Badge from "#/components/ui/Badge.tsx";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import ErrorAlert from "#/components/ui/ErrorAlert.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { useAsyncData } from "#/hooks/useAsyncData.ts";
import { classService } from "#/services/class.ts";
import type { ClassItem } from "#/types/class.ts";
import { getEffectiveStatus } from "#/utils/class.ts";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentClassesPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const {
    data: classes,
    loading,
    error,
  } = useAsyncData<ClassItem[]>({
    fetcher: () => classService.getAll(),
    deps: [],
    fallbackError: "دریافت لیست کلاس‌ها با خطا مواجه شد.",
  });

  const myClasses = useMemo(() => {
    if (!classes || !currentUser) return [];
    return classes.filter((c) => c.studentIds?.includes(currentUser.id));
  }, [classes, currentUser]);

  const handleJoinClass = (classId: string) => {
    navigate(`/classes/join/${classId}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
        کلاس‌های من
      </h1>

      <Card title="کلاس‌های من">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorAlert message={error} />
        ) : myClasses.length === 0 ? (
          <EmptyState
            title="شما در هیچ کلاسی ثبت‌نام نکرده‌اید"
            description="کلاس‌های شما در اینجا نمایش داده خواهند شد."
          />
        ) : (
          <div className="space-y-3">
            {myClasses.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 truncate block">
                    {c.title || "(بدون عنوان)"}
                  </span>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
                    <span>
                      <span className="text-gray-500">ظرفیت: </span>
                      <Badge
                        variant={
                          (c.studentIds?.length ?? 0) >= (c.capacity ?? 0)
                            ? "red"
                            : (c.studentIds?.length ?? 0) >=
                                (c.capacity ?? 0) * 0.8
                              ? "yellow"
                              : "green"
                        }
                      >
                        {c.studentIds?.length ?? 0}/{c.capacity ?? 0}
                      </Badge>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-gray-500">وضعیت: </span>
                      <StatusChip status={getEffectiveStatus(c)} />
                    </span>
                  </div>
                </div>
                <Button
                  variant="success"
                  onClick={() => handleJoinClass(c.id)}
                  className="w-full sm:w-auto"
                >
                  شرکت در کلاس
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
