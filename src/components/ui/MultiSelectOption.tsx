import { CheckIcon } from "#/components/common/icons";

interface MultiSelectOption {
  id: string;
  label: string;
  subLabel?: string;
}

interface MultiSelectOptionProps {
  option: MultiSelectOption;
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
  id: string;
  role: "option";
  "aria-selected": boolean;
  tabIndex: -1;
  "data-active": string;
}

export function MultiSelectOptionComponent({
  option,
  isSelected,
  isActive,
  onClick,
  ...props
}: MultiSelectOptionProps) {
  return (
    <div
      {...props}
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-3 border-b border-gray-50 px-3 py-2.5 text-sm transition last:border-0 hover:bg-gray-50 ${
        isSelected ? "bg-blue-50/50" : ""
      } ${isActive ? "bg-blue-50" : ""}`}
    >
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
          isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white"
        }`}
      >
        {isSelected && <CheckIcon className="h-3 w-3" />}
      </span>
      <div className="flex-1 text-right">
        <div className="font-medium text-gray-800">{option.label}</div>
        {option.subLabel && (
          <div className="text-xs text-gray-500">{option.subLabel}</div>
        )}
      </div>
    </div>
  );
}