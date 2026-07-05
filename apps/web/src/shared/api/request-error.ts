import type { ErrorResponse } from "@scheduling/api-client";

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

export function throwApiRequestError(
  status: number,
  error: ErrorResponse | undefined,
): never {
  throw new ApiRequestError(status, error);
}
