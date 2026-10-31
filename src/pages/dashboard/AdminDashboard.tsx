import Card from "#/components/ui/Card.tsx";
import ChartLegend from "#/components/ui/ChartLegend.tsx";
import ChartTooltip, {
  defaultChartLabel,
  type ChartPayloadEntry,
} from "#/components/ui/ChartTooltip.tsx";
import StatCard from "#/components/ui/StatCard.tsx";
import StatusChip from "#/components/ui/StatusChip.tsx";
import Table from "#/components/ui/Table.tsx";
import type { DashboardData } from "#/types/dashboard.ts";
import type { ClassItem } from "#/types/class.ts";
import { CHART_COLORS } from "#/configs/constants";
import { getEffectiveStatus } from "#/utils/class.ts";
import { formatDate } from "#/utils/formatDate.ts";
import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RoleDataItem {
  name: string;
  value: number;
}

interface Props {
  data: DashboardData;
}

export default function AdminDashboard({ data }: Props) {
  const { users, classes, sessions, assignments } = data;
  const roleCounts = useMemo(() => {
    const counts = { admin: 0, teacher: 0, student: 0 };
    for (const u of users) {
      if (u.role in counts) counts[u.role as keyof typeof counts]++;
    }
    return counts;
  }, [users]);
  const roleData: RoleDataItem[] = useMemo(
    () => [
      { name: "مدیر", value: roleCounts.admin },
      { name: "استاد", value: roleCounts.teacher },
      { name: "دانشجو", value: roleCounts.student },
    ],
    [roleCounts],
  );
  const totalUsers = useMemo(
    () => roleCounts.admin + roleCounts.teacher + roleCounts.student,
    [roleCounts],
  );
  const recentClasses = useMemo(() => {
    return [...classes]
      .filter((c): c is ClassItem & { createdAt: string } => !!c.createdAt)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [classes]);
  const chartSummary = `توزیع کاربران: ${roleData.map((r) => `${r.name} ${r.value} نفر`).join("، ")}`;

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
          <div className="h-64" role="img" aria-label={chartSummary}>
            {totalUsers === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                هنوز کاربری ثبت نشده است.
              </div>
            ) : (
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
                        fill={CHART_COLORS[index % CHART_COLORS.length] as string}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <ChartTooltip>
                        {(first: ChartPayloadEntry) => {
                          const itemColor = first.color ?? "#333";
                          const value =
                            typeof first.value === "number" ? first.value : 0;
                          const percentage =
                            totalUsers > 0 ? (value / totalUsers) * 100 : 0;
                          return (
                            <p
                              style={{ color: itemColor }}
                              className="font-bold"
                            >
                              {`${first.name ?? ""}: ${percentage.toFixed(1)}% (${value} نفر)`}
                            </p>
                          );
                        }}
                      </ChartTooltip>
                    }
                    contentStyle={{ direction: "rtl", textAlign: "right" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    content={
                      <ChartLegend
                        resolveLabel={defaultChartLabel}
                      />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card title="آخرین کلاس‌های ثبت‌شده">
          {recentClasses.length === 0 ? (
            <p className="text-sm text-gray-500">کلاسی ثبت نشده است.</p>
          ) : (
            <Table<ClassItem & { createdAt: string }>
              getRowKey={(c) => c.id}
              columns={[
                {
                  key: "title",
                  title: "عنوان کلاس",
                  width: "40%",
                  render: (c) => c.title,
                },
                {
                  key: "capacity",
                  title: "ظرفیت",
                  width: "15%",
                  render: (c) => `${c.studentIds.length}/${c.capacity}`,
                },
                {
                  key: "status",
                  title: "وضعیت",
                  width: "25%",
                  render: (c) => (
                    <StatusChip status={getEffectiveStatus(c)} />
                  ),
                },
                {
                  key: "createdAt",
                  title: "تاریخ ثبت",
                  width: "20%",
                  render: (c) => formatDate(c.createdAt),
                },
              ]}
              data={recentClasses}
              renderMobileCard={(c) => (
                <div className="space-y-2 text-right">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-bold text-gray-800">
                      {c.title || "(بدون عنوان)"}
                    </span>
                    <StatusChip status={getEffectiveStatus(c)} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>
                      <span className="text-gray-500">ظرفیت:</span>{" "}
                      {c.studentIds.length}/{c.capacity}
                    </span>
                    <span>
                      <span className="text-gray-500">تاریخ:</span>{" "}
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                </div>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
