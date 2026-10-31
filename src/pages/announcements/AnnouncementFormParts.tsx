import Select from "#/components/ui/Select.tsx";
import { DEFAULT_TARGET_ROLES } from "#/configs/constants";
import type { TargetAudience } from "#/types/announcement.ts";
import type { UserRole } from "#/types/common.ts";
import { getRoleLabel } from "#/utils/user.ts";

interface GlobalAnnouncementRolesProps {
  targetRoles: UserRole[];
  onToggle: (role: UserRole) => void;
}

export function GlobalAnnouncementRoles({
  targetRoles,
  onToggle,
}: GlobalAnnouncementRolesProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-gray-700">
        قابل مشاهده برای (نقش‌ها):
      </legend>
      <div className="flex flex-wrap gap-3">
        {DEFAULT_TARGET_ROLES.map((role) => (
          <label
            key={role}
            className="flex cursor-pointer items-center gap-2"
          >
            <input
              type="checkbox"
              checked={targetRoles.includes(role)}
              onChange={() => onToggle(role)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {getRoleLabel(role)}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface ClassAnnouncementAudienceProps {
  targetAudience: TargetAudience;
  onChange: (value: TargetAudience) => void;
  error?: string | undefined;
}

export function ClassAnnouncementAudience({
  targetAudience,
  onChange,
  error,
}: ClassAnnouncementAudienceProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        مخاطبان در کلاس:
      </label>
      <Select
        value={targetAudience}
        onChange={(e) => onChange(e.target.value as TargetAudience)}
        options={[
          { label: "دانشجویان کلاس", value: "students" },
          { label: "استاد کلاس", value: "teacher" },
          { label: "دانشجویان و استاد کلاس", value: "both" },
        ]}
        error={error}
      />
    </div>
  );
}
