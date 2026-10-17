import StatusChip from "#/components/ui/StatusChip.tsx";
import type { User } from "#/types/user.ts";
import { getRoleLabel, getStatusLabel } from "#/utils/user.ts";

interface UserDetailsListProps {
  user: User;
  /** Extra top padding for the first row (used when a header block sits above). */
  dense?: boolean;
}

/**
 * Shared read-only key/value list of a user's core fields.
 * Used by both the profile page and the user-details modal so a single
 * change to a displayed field is reflected everywhere.
 */
function UserDetailsList({ user, dense }: UserDetailsListProps) {
  const py = dense ? "py-3" : "py-4";
  const rows: Array<{ label: string; value: React.ReactNode; mono?: boolean }> =
    [
      { label: "نام و نام خانوادگی", value: user.name },
      { label: "آدرس ایمیل", value: user.email },
      { label: "نقش در سیستم", value: getRoleLabel(user.role) },
      {
        label: "وضعیت حساب",
        value: (
          <>
            <StatusChip status={user.status} />
            <span className="sr-only">
              وضعیت: {getStatusLabel(user.status)}
            </span>
          </>
        ),
      },
    ];

  return (
    <dl className="divide-y divide-gray-100">
      {rows.map((row) => (
        <div key={row.label} className={`px-2 ${py} sm:flex sm:gap-4 sm:px-0`}>
          <dt className="text-sm leading-6 font-medium text-gray-900">
            {row.label}
            <span> : </span>
          </dt>
          <dd
            className={`mt-1 text-sm leading-6 break-all text-gray-700 sm:col-span-2 sm:mt-0 ${
              row.mono ? "rounded bg-gray-50 p-2 font-mono" : ""
            }`}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default UserDetailsList;
