import StatusChip from "#/components/ui/StatusChip.tsx";
import type { User } from "#/types";
import { getRoleLabel } from "#/utils";
import type { ReactNode } from "react";

interface UserDetailsListProps {
  user: User;
}

function UserDetailsList({ user }: UserDetailsListProps) {
  const rows: Array<{ label: string; value: ReactNode }> = [
    { label: "نام و نام خانوادگی", value: user.name },
    { label: "آدرس ایمیل", value: user.email },
    { label: "نقش در سیستم", value: getRoleLabel(user.role) },
    {
      label: "وضعیت حساب",
      value: <StatusChip status={user.status} />,
    },
  ];

  return (
    <dl className="divide-y divide-gray-100">
      {rows.map((row) => (
        <div key={row.label} className="px-2 py-4 sm:flex sm:gap-4 sm:px-3">
          <dt className="text-sm leading-6 font-medium text-gray-900">
            {row.label}
          </dt>
          <dd className="mt-1 text-sm leading-6 break-all text-gray-700 sm:mt-0">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default UserDetailsList;