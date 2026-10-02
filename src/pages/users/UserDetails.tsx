import Card from "#/components/ui/Card.tsx";
import Modal from "#/components/ui/Modal.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import type { User } from "#/types/user.ts";
import { getRoleLabel, getStatusLabel } from "#/utils/user.ts";

interface UserDetailsProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

function UserDetails({ isOpen, user, onClose }: UserDetailsProps) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} title="جزئیات کاربر" onClose={onClose}>
      <Card noPadding>
        <div className="flex items-center gap-4 border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
            <p className="text-sm break-all text-gray-500">{user.email}</p>
          </div>
        </div>
        <dl className="divide-y divide-gray-100">
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">شناسه کاربری</dt>
            <dd className="mt-1 rounded bg-gray-50 p-2 font-mono text-sm break-all text-gray-900 sm:col-span-2 sm:mt-0">
              {user.id}
            </dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">
              نام و نام خانوادگی
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {user.name}
            </dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">آدرس ایمیل</dt>
            <dd className="mt-1 text-sm break-all text-gray-900 sm:col-span-2 sm:mt-0">
              {user.email}
            </dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">نقش در سیستم</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {getRoleLabel(user.role)}
            </dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">وضعیت حساب</dt>
            <dd className="mt-1 flex items-center gap-2 sm:col-span-2 sm:mt-0">
              <StatusChip status={user.status} />
              <span className="sr-only">
                وضعیت: {getStatusLabel(user.status)}
              </span>
            </dd>
          </div>
        </dl>
      </Card>
    </Modal>
  );
}

export default UserDetails;
