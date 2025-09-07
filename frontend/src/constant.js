// ✅ FIXED: Added fallback with correct /v1 suffix for backend
// OLD: export const BASE_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_BACKEND_URL;
export const BASE_URL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api/v1";
