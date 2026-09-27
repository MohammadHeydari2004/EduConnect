import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
        <svg
          className="h-12 w-12 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      <h1 className="mb-2 text-6xl font-bold text-gray-800 sm:text-7xl">۴۰۳</h1>

      <h2 className="mb-4 text-xl font-semibold text-gray-700 sm:text-2xl">
        دسترسی غیرمجاز
      </h2>

      <p className="mb-8 max-w-md text-gray-500">
        متأسفانه شما مجوز لازم برای مشاهده این صفحه را ندارید. لطفاً با مدیر
        سیستم تماس بگیرید یا به صفحه اصلی بازگردید.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          بازگشت به صفحه اصلی
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-6 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none"
        >
          بازگشت به صفحه قبل
        </button>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
