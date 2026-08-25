import type { ReactNode } from "react";

interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey?: (item: T, index: number) => string | number;
}

function Table<T>({ columns, data, getRowKey }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-gray-700 sm:px-4 sm:text-sm"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={getRowKey ? getRowKey(item, index) : index}
              className="border-t border-gray-200"
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-3 py-3 text-gray-600 sm:px-4"
                >
                  {column.render
                    ? column.render(item)
                    : String(
                        (item as Record<string, unknown>)[String(column.key)] ??
                          "",
                      )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
