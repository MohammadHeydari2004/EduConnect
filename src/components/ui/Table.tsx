import EmptyState from "#/components/common/EmptyState.tsx";
import ActionsMenu from "#/components/ui/ActionsMenu.tsx";
import type { ReactNode } from "react";

interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (item: T, index: number) => string | number;
  getRowLabel?: (item: T, index: number) => string;
  renderMobileCard?: (item: T) => ReactNode;
  renderMobileActions?: (item: T) => ReactNode;
}

function Table<T>({
  columns,
  data,
  getRowKey,
  getRowLabel,
  renderMobileCard,
  renderMobileActions,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="داده‌ای برای نمایش وجود ندارد"
        description="هیچ رکوردی در این جدول یافت نشد."
      />
    );
  }

  const cellValue = (column: TableColumn<T>, item: T): ReactNode =>
    column.render
      ? column.render(item)
      : String((item as Record<string, unknown>)[String(column.key)] ?? "");

  const mobileCard =
    renderMobileCard ??
    ((item: T) => (
      <div className="space-y-2 text-right">
        {columns
          .filter((column) => column.key !== "actions")
          .map((column) => (
            <div key={String(column.key)} className="text-sm">
              <div className="text-xs text-gray-500">{column.title}</div>
              <div className="text-gray-800">{cellValue(column, item)}</div>
            </div>
          ))}
      </div>
    ));

  const fixedLayout = columns.some((column) => column.width);

  const tableContent = (
    <table
      className={`${fixedLayout ? "table-fixed w-full" : "min-w-full"} text-sm`}
    >
      <colgroup>
        {columns.map((column) => (
          <col
            key={String(column.key)}
            style={column.width ? { width: column.width } : undefined}
          />
        ))}
      </colgroup>
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column) => (
            <th
              key={String(column.key)}
              scope="col"
              className={`px-2 py-2 text-xs font-semibold text-center text-gray-700 sm:px-4 sm:text-sm ${
                fixedLayout ? "overflow-hidden" : "whitespace-nowrap"
              }`}
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={getRowKey(item, index)}
            className="border-t border-gray-200 transition-colors hover:bg-gray-50"
          >
            {columns.map((column) => (
              <td
                key={String(column.key)}
                className={`px-3 py-3 text-center text-gray-600 ${fixedLayout ? "overflow-hidden" : ""}`}
              >
                {cellValue(column, item)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white md:block">
        {tableContent}
      </div>

      <div className="space-y-3 md:hidden">
        {data.map((item, index) => (
          <div
            key={getRowKey(item, index)}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            {mobileCard(item)}
            {renderMobileActions && (
              <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
                <ActionsMenu
                  label={getRowLabel ? getRowLabel(item, index) : undefined}
                >
                  {renderMobileActions(item)}
                </ActionsMenu>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default Table;
