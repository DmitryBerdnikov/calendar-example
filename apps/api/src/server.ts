import cors from "@fastify/cors";
import Fastify, { type FastifyServerOptions } from "fastify";

import {
  createAuthService,
  extractBearerToken,
  loginRequestSchema,
  type AuthDependencies,
  type ErrorResponse,
  type LoginResponse,
  type OrganizerResponse,
} from "./auth";
import { createApiConfig, type ApiConfig } from "./config";
import { openDatabase, type DatabaseConnection } from "./db/database";
import { registerEventTypeRoutes } from "./event-types";

type HealthResponse = {
  status: "ok";
};

type ServerDependencies = Partial<AuthDependencies> & {
  db?: DatabaseConnection;
};

export async function createServer(
  config: ApiConfig = createApiConfig(),
  options: FastifyServerOptions = {},
  dependencies: ServerDependencies = {},
) {
  const server = Fastify(options);
  const db = dependencies.db ?? openDatabase(config.databasePath);
  const authService = createAuthService({
    db,
    now: dependencies.now,
    generateSessionToken: dependencies.generateSessionToken,
  });

  if (!dependencies.db) {
    server.addHook("onClose", async () => {
      db.close();
    });
  }

  await server.register(cors, {
    origin: config.corsOrigins,
  });

  server.get<{ Reply: HealthResponse }>("/health", async () => {
    return { status: "ok" };
  });

  server.post<{
    Body: unknown;
    Reply: LoginResponse | ErrorResponse;
  }>("/auth/login", async (request, reply) => {
    const parsedBody = loginRequestSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({
        code: "invalid_request",
        message: "Request body is invalid.",
        details: parsedBody.error.flatten(),
      });
    }

    const loginResponse = authService.login(
      parsedBody.data.email,
      parsedBody.data.password,
    );

    if (!loginResponse) {
      return reply.code(401).send({
        code: "unauthenticated",
        message: "Invalid email or password.",
      });
    }

    return loginResponse;
  });

  server.get<{
    Reply: OrganizerResponse | ErrorResponse;
  }>("/auth/me", async (request, reply) => {
    const token = extractBearerToken(request.headers.authorization);

    if (!token) {
      return reply.code(401).send({
        code: "unauthenticated",
        message: "Missing bearer token.",
      });
    }

    const organizer = authService.getOrganizerForBearerToken(token);

    if (!organizer) {
      return reply.code(401).send({
        code: "unauthenticated",
        message: "Invalid or expired bearer token.",
      });
    }

    return organizer;
  });

  registerEventTypeRoutes(server, {
    db,
    authService,
    now: dependencies.now,
  });

  return server;
}
