

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_STORAGE_PREFIX?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
