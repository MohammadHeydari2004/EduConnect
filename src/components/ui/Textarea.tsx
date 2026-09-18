import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

function Textarea({ label, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea
        className={`rounded-lg border border-gray-300 px-3 py-2 text-sm outline-hidden focus:border-blue-500 ${className}`}
        {...props}
      />
    </div>
  );
}

export default Textarea;
