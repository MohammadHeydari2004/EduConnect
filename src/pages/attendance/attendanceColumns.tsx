import type { TableColumn } from "#/components/ui/Table";
import type { User } from "#/types";

export function studentNameEmailColumns(
  nameWidth: string,
  emailWidth: string,
): TableColumn<User>[] {
  return [
    {
      key: "name",
      title: "نام",
      width: nameWidth,
      render: (student) => (
        <span className="font-medium text-gray-800">{student.name}</span>
      ),
    },
    {
      key: "email",
      title: "ایمیل",
      width: emailWidth,
      render: (student) => (
        <span className="text-sm text-gray-600 break-all">{student.email}</span>
      ),
    },
  ];
}