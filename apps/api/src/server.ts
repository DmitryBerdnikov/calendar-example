import cors from "@fastify/cors";
import Fastify, { type FastifyServerOptions } from "fastify";

import { createApiConfig, type ApiConfig } from "./config";

type HealthResponse = {
  status: "ok";
};

export async function createServer(
  config: ApiConfig = createApiConfig(),
  options: FastifyServerOptions = {},
) {
  const server = Fastify(options);

  await server.register(cors, {
    origin: config.corsOrigins,
  });

  server.get<{ Reply: HealthResponse }>("/health", async () => {
    return { status: "ok" };
  });

  return server;
}
