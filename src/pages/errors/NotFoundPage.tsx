import ErrorPage from "#/pages/errors/ErrorPage.tsx";
import { SearchOffIcon } from "#/components/common/icons.tsx";

function NotFoundPage() {
  return (
    <ErrorPage
      code="۴۰۴"
      title="صفحه مورد نظر یافت نشد"
      message="متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا ممکن است آدرس آن تغییر کرده باشد."
      colorVariant="blue"
      icon={<SearchOffIcon />}
    />
  );
}

export default NotFoundPage;
