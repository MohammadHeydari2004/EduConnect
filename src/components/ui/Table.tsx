import { useEffect, useRef, useState, type ReactNode } from "react";

interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey?: (item: T, index: number) => string | number;
  renderMobileCard?: (item: T) => ReactNode;
  renderMobileActions?: (item: T) => ReactNode;
}

function ActionsMenu({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
        aria-label="عملیات"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-1 flex min-w-40 flex-col gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
}

function Table<T>({
  columns,
  data,
  getRowKey,
  renderMobileCard,
  renderMobileActions,
}: TableProps<T>) {
  const tableContent = (
    <table className="min-w-full text-center text-sm">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column) => (
            <th
              key={String(column.key)}
              className="px-3 py-3 text-xs font-semibold whitespace-nowrap text-gray-700 sm:px-4 sm:text-sm"
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
                className="m-auto px-3 py-3 text-gray-600 sm:px-4"
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
  );

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white md:block">
        {tableContent}
      </div>
      {renderMobileCard && (
        <div className="space-y-3 md:hidden">
          {data.map((item, index) => (
            <div
              key={getRowKey ? getRowKey(item, index) : index}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              {renderMobileCard(item)}
              {renderMobileActions && (
                <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
                  <ActionsMenu>{renderMobileActions(item)}</ActionsMenu>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {!renderMobileCard && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white md:hidden">
          {tableContent}
        </div>
      )}
    </>
  );
}

export default Table;
