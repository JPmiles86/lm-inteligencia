/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_IMAGE_UPLOAD_URL: string
  readonly VITE_IMAGE_BASE_URL: string
  readonly VITE_DEBUG: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_DEFAULT_TENANT_ID: string
  readonly VITE_BASE_DOMAIN: string
  readonly VITE_DEVELOPMENT_DOMAIN: string
  readonly VITE_ENABLE_AI_FEATURES: string
  readonly VITE_ENABLE_IMAGE_GENERATION: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_CACHE_DURATION: string
  readonly VITE_MAX_UPLOAD_SIZE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}