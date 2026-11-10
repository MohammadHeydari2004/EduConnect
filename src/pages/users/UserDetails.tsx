import Card from "#/components/ui/Card.tsx";
import Modal from "#/components/ui/Modal.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import type { User } from "#/types/user.ts";
import { getRoleLabel, getStatusLabel } from "#/utils/userLabels.ts";

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
        <dl className="divide-y divide-gray-100 py-3">
          <div className="px-3 py-3 sm:flex sm:gap-4">
            <dt className="text-sm font-medium text-gray-900">نقش در سیستم</dt>
            <dd className="mt-1 text-sm text-gray-700 sm:mt-0">{getRoleLabel(user.role)}</dd>
          </div>
          <div className="px-3 py-3 sm:flex sm:gap-4">
            <dt className="text-sm font-medium text-gray-900">وضعیت حساب</dt>
            <dd className="mt-1 text-sm text-gray-700 sm:mt-0">
              <StatusChip status={user.status} />
              <span className="sr-only">وضعیت: {getStatusLabel(user.status)}</span>
            </dd>
          </div>
        </dl>
      </Card>
    </Modal>
  );
}

export default UserDetails;