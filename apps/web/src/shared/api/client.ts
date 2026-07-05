import { DEFAULT_API_BASE_URL, createApiClient } from "@scheduling/api-client";

export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const apiClient = createApiClient({
  baseUrl: apiBaseUrl,
});
