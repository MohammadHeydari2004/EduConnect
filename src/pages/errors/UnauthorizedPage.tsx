import ErrorPage from "#/pages/errors/ErrorPage.tsx";
import { LockIcon } from "#/components/common/icons";

function UnauthorizedPage() {
  return (
    <ErrorPage
      code="۴۰۳"
      title="دسترسی غیرمجاز"
      message="متأسفانه شما مجوز لازم برای مشاهده این صفحه را ندارید. لطفاً با مدیر سیستم تماس بگیرید یا به صفحه اصلی بازگردید."
      colorVariant="red"
      icon={<LockIcon />}
    />
  );
}

export default UnauthorizedPage;
