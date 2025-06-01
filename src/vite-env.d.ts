/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_BACKEND_API_URL: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
