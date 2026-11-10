import Input from "#/components/ui/Input.tsx";
import { forwardRef, type InputHTMLAttributes } from "react";
import { SearchIcon } from "#/components/common/icons";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | undefined;
  error?: string | undefined;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { label, error, className = "", placeholder = "جستجو...", ...props },
    ref,
  ) => {
    return (
      <Input
        ref={ref}
        label={label}
        error={error}
        type="search"
        aria-label={label ? undefined : "جستجو"}
        placeholder={placeholder}
        suffix={<SearchIcon className="h-4 w-4 text-gray-400" />}
        className={`pr-9 pl-3 ${className}`}
        {...props}
      />
    );
  },
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
