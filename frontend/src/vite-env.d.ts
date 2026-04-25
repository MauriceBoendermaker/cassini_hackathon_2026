/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPTILER_API_KEY?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_COPERNICUS_API_URL?: string;
  readonly VITE_COPERNICUS_API_KEY?: string;
  readonly VITE_GALILEO_API_URL?: string;
  readonly VITE_GALILEO_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
