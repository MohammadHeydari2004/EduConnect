import type { InputHTMLAttributes } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

function SearchInput({ label, className = "", ...props }: SearchInputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        type="text"
        placeholder="Search..."
        className={`rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 ${className}`}
        {...props}
      />
    </div>
  );
}

export default SearchInput;
