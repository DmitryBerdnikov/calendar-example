import { z } from "zod";

const defaultCorsOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
] as const;

const envSchema = z.object({
  API_HOST: z.string().min(1).default("127.0.0.1"),
  API_PORT: z.coerce.number().int().positive().default(4010),
  API_CORS_ORIGINS: z.string().optional(),
});

export type ApiConfig = {
  host: string;
  port: number;
  corsOrigins: string[];
};

export function createApiConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const parsedEnv = envSchema.parse(env);

  return {
    host: parsedEnv.API_HOST,
    port: parsedEnv.API_PORT,
    corsOrigins: parseCorsOrigins(parsedEnv.API_CORS_ORIGINS),
  };
}

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) {
    return [...defaultCorsOrigins];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
