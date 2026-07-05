import createClient, { type Client } from "openapi-fetch";

import type { components, operations, paths } from "./generated/openapi";

export const DEFAULT_API_BASE_URL = "http://localhost:4010" as const;

export type ApiPaths = paths;
export type ApiComponents = components;
export type ApiOperations = operations;
export type ApiClient = Client<ApiPaths>;

export type Organizer = ApiComponents["schemas"]["Organizer"];
export type ErrorResponse = ApiComponents["schemas"]["ErrorResponse"];
export type LoginRequest = ApiComponents["schemas"]["LoginRequest"];
export type LoginResponse = ApiComponents["schemas"]["LoginResponse"];
export type EventType = ApiComponents["schemas"]["EventType"];
export type PublicEventType = ApiComponents["schemas"]["PublicEventType"];
export type AvailabilityRule = ApiComponents["schemas"]["AvailabilityRule"];
export type Booking = ApiComponents["schemas"]["Booking"];
export type PublicSlot = ApiComponents["schemas"]["PublicSlot"];
export type PublicBookingConfirmation =
  ApiComponents["schemas"]["PublicBookingConfirmation"];

export type CreateApiClientOptions = Parameters<typeof createClient<ApiPaths>>[0];

export function createApiClient(options: CreateApiClientOptions = {}): ApiClient {
  return createClient<ApiPaths>({
    baseUrl: DEFAULT_API_BASE_URL,
    ...options,
  });
}
