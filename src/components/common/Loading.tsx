import Spinner from "#/components/ui/Spinner.tsx";

function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-10"
    >
      <Spinner size="md" className="text-blue-600" />
      <p className="mt-3 text-sm font-medium text-gray-600">
        در حال بارگذاری...
      </p>
    </div>
  );
}

export default Loading;
