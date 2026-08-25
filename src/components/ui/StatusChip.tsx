interface StatusChipProps {
  status:
    | "active"
    | "inactive"
    | "present"
    | "absent"
    | "late"
    | "submitted"
    | "graded"
    | "pending";
}

function StatusChip({ status }: StatusChipProps) {
  const statusMap: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-700",
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-yellow-100 text-yellow-700",
    submitted: "bg-blue-100 text-blue-700",
    graded: "bg-green-100 text-green-700",
    pending: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusMap[status]}`}
    >
      {status}
    </span>
  );
}

export default StatusChip;
