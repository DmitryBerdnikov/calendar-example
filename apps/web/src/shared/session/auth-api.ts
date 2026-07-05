import type {
  LoginRequest,
  LoginResponse,
  Organizer,
} from "@scheduling/api-client";

import { apiClient } from "../api/client";
import { throwApiRequestError } from "../api/request-error";

export async function loginOrganizer(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const { data, error, response } = await apiClient.POST("/auth/login", {
    body: credentials,
  });

  if (!data) {
    throwApiRequestError(response.status, error);
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
    throwApiRequestError(response.status, error);
  }

  return data;
}
