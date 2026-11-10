import ActionsMenu from "#/components/ui/ActionsMenu.tsx";
import type { ReactNode } from "react";

interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (item: T) => ReactNode;
  width?: string;
  hideOnMobile?: boolean;
  isRowHeader?: boolean;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (item: T, index: number) => string | number;
  getRowLabel?: (item: T, index: number) => string;
  renderMobileCard?: (item: T) => ReactNode;
  renderMobileActions?: (item: T) => ReactNode;
  caption?: string;
  align?: "start" | "center" | "end";
}

function cellValue<T>(column: TableColumn<T>, item: T): ReactNode {
  return column.render
    ? column.render(item)
    : String((item as Record<string, unknown>)[String(column.key)] ?? "");
}

function DefaultMobileCard<T>({
  columns,
  item,
}: {
  columns: TableColumn<T>[];
  item: T;
}) {
  return (
    <div className="space-y-2 rtl:text-right ltr:text-left">
      {columns
        .filter((column) => !(column.hideOnMobile ?? false))
        .map((column) => (
          <div key={String(column.key)} className="text-sm">
            <div className="text-xs text-gray-500">{column.title}</div>
            <div className="text-gray-800 break-words">{cellValue(column, item)}</div>
          </div>
        ))}
    </div>
  );
}

function Table<T>({
  columns,
  data,
  getRowKey,
  getRowLabel,
  renderMobileCard,
  renderMobileActions,
  caption,
  align = "center",
}: TableProps<T>) {
  const fixedLayout = columns.some((column) => column.width);
  const alignClass = align === "center" ? "text-center" : align === "end" ? "text-end" : "text-start";
  const rowHeaderIndex = columns.findIndex((c) => c.isRowHeader) ?? -1;

  const tableContent = (
    <table
      className={`${fixedLayout ? "table-fixed w-full" : "min-w-full"} text-sm`}
    >
      {caption && <caption className="sr-only">{caption}</caption>}
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
              className={`px-2 py-2 text-xs font-semibold ${alignClass} text-gray-700 sm:px-4 sm:text-sm ${
                fixedLayout ? "overflow-hidden" : "whitespace-nowrap"
              }`}
            >
              <span className={fixedLayout ? "block truncate" : undefined}>
                {column.title}
              </span>
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
            {columns.map((column, colIdx) => {
              const isFirst = colIdx === (rowHeaderIndex >= 0 ? rowHeaderIndex : 0);
              const content = fixedLayout ? (
                <span className="block" title={typeof getRowLabel === "function" && isFirst ? getRowLabel(item, index) : undefined}>
                  {cellValue(column, item)}
                </span>
              ) : (
                cellValue(column, item)
              );
              const cellClassName = `px-3 py-3 ${alignClass} text-gray-600 break-words`;
              if (isFirst && rowHeaderIndex >= 0) {
                return (
                  <th key={String(column.key)} scope="row" className={cellClassName}>
                    {content}
                  </th>
                );
              }
              return (
                <td key={String(column.key)} className={cellClassName}>
                  {content}
                </td>
              );
            })}
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
        {data.map((item, index) => {
          const actions = renderMobileActions ? renderMobileActions(item) : null;
          return (
            <div
              key={getRowKey(item, index)}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              {renderMobileCard ? renderMobileCard(item) : <DefaultMobileCard columns={columns} item={item} />}
              {actions && (
                <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
                  <ActionsMenu
                    label={getRowLabel ? getRowLabel(item, index) : undefined}
                  >
                    {actions}
                  </ActionsMenu>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Table;
