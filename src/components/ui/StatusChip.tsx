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
  const statusMap: Record<string, { label: string; className: string }> = {
    active: { label: "فعال", className: "bg-green-100 text-green-700" },
    inactive: { label: "غیرفعال", className: "bg-gray-100 text-gray-700" },
    present: { label: "حاضر", className: "bg-green-100 text-green-700" },
    absent: { label: "غایب", className: "bg-red-100 text-red-700" },
    late: { label: "با تأخیر", className: "bg-yellow-100 text-yellow-700" },
    submitted: { label: "ارسال شده", className: "bg-blue-100 text-blue-700" },
    graded: {
      label: "نمره داده شده",
      className: "bg-green-100 text-green-700",
    },
    pending: { label: "در انتظار", className: "bg-gray-100 text-gray-700" },
  };

  const { label, className } = statusMap[status] || {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

export default StatusChip;
