import type {
  ErrorResponse,
  LoginRequest,
  LoginResponse,
  Organizer,
} from "@scheduling/api-client";

import { apiClient } from "../api/client";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly body: ErrorResponse | undefined;

  constructor(status: number, body: ErrorResponse | undefined) {
    super(body?.message ?? "Request failed");
    this.name = "ApiRequestError";
    this.status = status;
    this.body = body;
  }
}

function throwIfError(status: number, error: ErrorResponse | undefined): never {
  throw new ApiRequestError(status, error);
}

export async function loginOrganizer(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const { data, error, response } = await apiClient.POST("/auth/login", {
    body: credentials,
  });

  if (!data) {
    throwIfError(response.status, error);
  }

  return data;
}

export async function getCurrentOrganizer(token: string): Promise<Organizer> {
  const { data, error, response } = await apiClient.GET("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!data) {
    throwIfError(response.status, error);
  }

  return data;
}
