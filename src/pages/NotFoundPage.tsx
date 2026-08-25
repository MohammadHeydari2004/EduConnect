import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="mb-2 text-5xl font-bold text-blue-600">404</h1>
      <p className="mb-4 text-gray-600">Page not found</p>
      <Link
        to="/"
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
