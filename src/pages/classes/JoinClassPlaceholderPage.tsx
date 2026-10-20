import { useParams } from "react-router-dom";
import Button from "#/components/ui/Button.tsx";
import Card from "#/components/ui/Card.tsx";
import { useNavigate } from "react-router-dom";
import { ConstructionIcon } from "#/components/common/icons";

export default function JoinClassPlaceholderPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
        ثبت‌نام در کلاس
      </h1>

      <Card title="این بخش در حال توسعه است">
        <div className="text-center py-8">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <ConstructionIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            قابلیت ثبت‌نام در کلاس
          </h3>
          <p className="mb-4 max-w-sm mx-auto text-sm text-gray-500">
            این بخش در حال توسعه است و به زودی در دسترس خواهد بود. کلاس مورد نظر:
            <span className="font-medium text-gray-700"> {classId}</span>
          </p>
          <Button variant="secondary" onClick={() => navigate("/student-classes")}>
            بازگشت به کلاس‌های من
          </Button>
        </div>
      </Card>
    </div>
  );
}