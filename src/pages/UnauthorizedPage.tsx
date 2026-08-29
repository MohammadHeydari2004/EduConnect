import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="mb-2 text-4xl font-bold text-red-600">۴۰۳</h1>
      <p className="mb-4 text-gray-600">شما دسترسی به این صفحه را ندارید.</p>
      <Link
        to="/"
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        بازگشت به داشبورد
      </Link>
    </div>
  );
}

export default UnauthorizedPage;
