import Card from "#/components/ui/Card.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";

function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "مدیر";
      case "teacher":
        return "استاد";
      case "student":
        return "دانشجو";
      default:
        return role;
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "فعال";
      case "inactive":
        return "غیرفعال";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">پروفایل</h1>
      <Card title="اطلاعات کاربری">
        <div className="space-y-3 text-sm text-gray-700 sm:text-base">
          <p className="flex flex-col gap-1 sm:flex-row sm:gap-2">
            <span className="font-semibold">نام:</span>
            <span>{user.name}</span>
          </p>
          <p className="flex flex-col gap-1 break-all sm:flex-row sm:gap-2">
            <span className="font-semibold">ایمیل:</span>
            <span>{user.email}</span>
          </p>
          <p className="flex flex-col gap-1 sm:flex-row sm:gap-2">
            <span className="font-semibold">نقش:</span>
            <span>{getRoleLabel(user.role)}</span>
          </p>
          <p className="flex flex-col gap-1 sm:flex-row sm:gap-2">
            <span className="font-semibold">وضعیت:</span>
            <span>{getStatusLabel(user.status)}</span>
          </p>
        </div>
      </Card>
    </div>
  );
}
export default ProfilePage;
