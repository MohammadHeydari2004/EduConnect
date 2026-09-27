import EmptyState from "#/components/common/EmptyState.tsx";
import Card from "#/components/ui/Card.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import type { User } from "#/types/user.ts";

interface ClassStudentsPanelProps {
  students: User[];
}

function ClassStudentsPanel({ students }: ClassStudentsPanelProps) {
  return (
    <Card title={`دانشجویان (${students.length})`}>
      {students.length === 0 ? (
        <EmptyState
          title="دانشجویی ثبت نشده"
          description="هنوز دانشجویی به این کلاس اضافه نشده است."
        />
      ) : (
        <Table
          getRowKey={(s) => s.id}
          columns={[
            {
              key: "name",
              title: "نام",
              render: (s) => (
                <span className="font-medium text-gray-800">{s.name}</span>
              ),
            },
            {
              key: "email",
              title: "ایمیل",
              render: (s) => (
                <span className="text-sm text-gray-600 break-all">
                  {s.email}
                </span>
              ),
            },
            {
              key: "status",
              title: "وضعیت",
              render: (s) => <StatusChip status={s.status} />,
            },
          ]}
          data={students}
          renderMobileCard={(s) => (
            <div className="space-y-2 text-right">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-800">
                  {s.name}
                </span>
                <StatusChip status={s.status} />
              </div>
              <div className="text-sm text-gray-600 break-all">{s.email}</div>
            </div>
          )}
        />
      )}
    </Card>
  );
}

export default ClassStudentsPanel;
