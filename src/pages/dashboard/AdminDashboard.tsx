import Card from "#/components/ui/Card.tsx";
import StatCard from "#/components/ui/StatCard.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import type { User } from "#/types/user.ts";
import { formatDate } from "#/utils/formatDate.ts";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DashboardData } from "./DashboardContainer";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6b7280"];

interface Props {
  data: DashboardData;
  currentUser: User;
}

export default function AdminDashboard({ data }: Props) {
  const { users, classes, sessions, assignments } = data;

  const roleData = [
    { name: "مدیر", value: users.filter((u) => u.role === "admin").length },
    { name: "استاد", value: users.filter((u) => u.role === "teacher").length },
    { name: "دانشجو", value: users.filter((u) => u.role === "student").length },
  ];

  const totalUsers = roleData.reduce((sum, item) => sum + item.value, 0);

  const recentClasses = [...classes]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="کل کاربران"
          value={users.length}
          color="text-blue-600"
        />
        <StatCard
          title="کل کلاس‌ها"
          value={classes.length}
          color="text-green-600"
        />
        <StatCard
          title="کل جلسات"
          value={sessions.length}
          color="text-yellow-600"
        />
        <StatCard
          title="کل تکالیف"
          value={assignments.length}
          color="text-purple-600"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="توزیع نقش‌های کاربران">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="40%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ direction: "rtl", textAlign: "right" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0];
                      if (data) {
                        const itemColor = data.color ?? "#333";
                        const value = data.value ?? 0;
                        // محاسبه درصد
                        const percentage =
                          totalUsers > 0
                            ? (Number(value) / totalUsers) * 100
                            : 0;

                        return (
                          <div className="rounded-lg border border-gray-200 bg-white p-2 text-sm shadow-xs">
                            <p
                              style={{ color: itemColor }}
                              className="font-bold"
                            >
                              {`${data.name ?? ""}: ${percentage.toFixed(1)}%`}
                            </p>
                          </div>
                        );
                      }
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  content={({ payload }) => {
                    if (payload) {
                      return (
                        <ul className="mt-2 flex justify-center gap-4">
                          {payload.map((entry, index) => {
                            const entryValue = String(entry.value ?? "");
                            const entryColor = entry.color ?? "#8884d8";

                            return (
                              <li
                                key={`item-${index}`}
                                className="flex items-center gap-1 text-sm"
                              >
                                <span style={{ color: entryColor }}>●</span>
                                <span>{entryValue}</span>
                              </li>
                            );
                          })}
                        </ul>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="آخرین کلاس‌های ثبت‌شده">
          {recentClasses.length === 0 ? (
            <p className="text-sm text-gray-500">کلاسی ثبت نشده است.</p>
          ) : (
            <Table
              getRowKey={(c) => c.id}
              columns={[
                { key: "title", title: "عنوان کلاس", render: (c) => c.title },
                {
                  key: "capacity",
                  title: "ظرفیت",
                  render: (c) => `${(c.studentIds || []).length}/${c.capacity}`,
                },
                {
                  key: "status",
                  title: "وضعیت",
                  render: (c) => <StatusChip status={c.status || "inactive"} />,
                },
                {
                  key: "createdAt",
                  title: "تاریخ ثبت",
                  render: (c) => formatDate(c.createdAt || ""),
                },
              ]}
              data={recentClasses}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
