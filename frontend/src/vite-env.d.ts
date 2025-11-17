// FIX: Removed reference to vite/client to resolve type definition error.

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
