/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_ENV?: "development" | "production" | "test";
  readonly VITE_STORAGE_PREFIX?: string;

  // متغیرهای محیطی دیگر را در اینجا اضافه کنید
  // مثال:
  // readonly VITE_FEATURE_FLAG_X?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
