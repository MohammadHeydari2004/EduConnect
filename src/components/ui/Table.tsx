import EmptyState from "#/components/common/EmptyState.tsx";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (item: T) => ReactNode;
  align?: "right" | "center" | "left";
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey?: (item: T, index: number) => string | number;
  renderMobileCard?: (item: T) => ReactNode;
  renderMobileActions?: (item: T) => ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

function ActionsMenu({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right,
        });
      }
    };

    updatePosition();
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
        aria-label="عملیات"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-50 flex min-w-40 flex-col gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
            style={{ top: `${coords.top}px`, right: `${coords.right}px` }}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}

function Table<T>({
  columns,
  data,
  getRowKey,
  renderMobileCard,
  renderMobileActions,
  emptyTitle = "داده‌ای برای نمایش وجود ندارد",
  emptyDescription = "هیچ رکوردی در این جدول یافت نشد.",
}: TableProps<T>) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const getAlignClass = (align?: "right" | "center" | "left") => {
    if (align === "center") return "text-center";
    if (align === "left") return "text-left";
    return "text-right";
  };

  const tableContent = (
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column) => (
            <th
              key={String(column.key)}
              scope="col"
              className={`px-3 py-3 text-xs font-semibold whitespace-nowrap text-gray-700 sm:px-4 sm:text-sm ${getAlignClass(column.align)}`}
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
            className="border-t border-gray-200 transition-colors hover:bg-gray-50"
          >
            {columns.map((column) => (
              <td
                key={String(column.key)}
                className={`px-3 py-3 text-gray-600 sm:px-4 ${getAlignClass(column.align)}`}
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
