import Badge from "#/components/ui/Badge.tsx";
import Card from "#/components/ui/Card.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import UserDetailsList from "#/components/ui/UserDetailsList.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import type { UserRole } from "#/types/common.ts";
import { getRoleLabel } from "#/utils/user.ts";

function getRoleVariant(role: UserRole): "blue" | "green" | "gray" {
  switch (role) {
    case "admin":
      return "blue";
    case "teacher":
      return "green";
    default:
      return "gray";
  }
}

function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">پروفایل</h1>
      <Card>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700 shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-right">
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <p className="mt-1 text-sm break-all text-gray-500">{user.email}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge variant={getRoleVariant(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
              <StatusChip status={user.status} />
            </div>
          </div>
        </div>
      </Card>
      <Card title="اطلاعات تکمیلی حساب کاربری">
        <UserDetailsList user={user} />
      </Card>
    </div>
  );
}

export default ProfilePage;
