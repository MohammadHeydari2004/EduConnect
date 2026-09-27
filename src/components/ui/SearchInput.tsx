import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { label, className = "", id: propId, placeholder = "جستجو...", ...props },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId || generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            ref={ref}
            id={id}
            type="search"
            role="searchbox"
            aria-label={label || "جستجو"}
            placeholder={placeholder}
            className={`w-full rounded-lg border border-gray-300 bg-white py-2 pr-9 pl-3 text-sm text-gray-900 transition-colors outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
