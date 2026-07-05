import { createApiConfig } from "./config";
import { createServer } from "./server";

const config = createApiConfig();
const server = await createServer(config, {
  logger: true,
});

try {
  await server.listen({
    host: config.host,
    port: config.port,
  });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
