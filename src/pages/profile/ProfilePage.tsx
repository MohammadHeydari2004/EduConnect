import Card from "#/components/ui/Card.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import { useAuth } from "#/contexts/AuthContext.ts";
import { getRoleLabel } from "#/utils/user.ts";

function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">پروفایل</h1>
      <Card>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700 shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-right">
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <p className="mt-1 text-sm break-all text-gray-500">{user.email}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 ring-1 ring-gray-200 ring-inset">
                {getRoleLabel(user.role)}
              </span>
              <StatusChip status={user.status} />
            </div>
          </div>
        </div>
      </Card>
      <Card title="اطلاعات تکمیلی حساب کاربری">
        <dl className="divide-y divide-gray-100">
          <div className="px-2 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm leading-6 font-medium text-gray-900">
              شناسه کاربری
            </dt>
            <dd className="mt-1 inline-block rounded bg-gray-50 p-2 font-mono text-sm leading-6 break-all text-gray-700 sm:col-span-2 sm:mt-0">
              {user.id}
            </dd>
          </div>
          <div className="px-2 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm leading-6 font-medium text-gray-900">
              نام و نام خانوادگی
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {user.name}
            </dd>
          </div>
          <div className="px-2 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm leading-6 font-medium text-gray-900">
              آدرس ایمیل
            </dt>
            <dd className="mt-1 text-sm leading-6 break-all text-gray-700 sm:col-span-2 sm:mt-0">
              {user.email}
            </dd>
          </div>
          <div className="px-2 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm leading-6 font-medium text-gray-900">
              نقش در سیستم
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {getRoleLabel(user.role)}
            </dd>
          </div>
          <div className="px-2 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm leading-6 font-medium text-gray-900">
              وضعیت حساب
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              <StatusChip status={user.status} />
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

export default ProfilePage;
