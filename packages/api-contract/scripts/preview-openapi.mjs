import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import open from "open";

const require = createRequire(import.meta.url);
const swaggerUiDist = require("swagger-ui-dist");

const __dirname = dirname(fileURLToPath(import.meta.url));
const openapiPath = resolve(__dirname, "../generated/openapi.yaml");
const swaggerUiPath = swaggerUiDist.getAbsoluteFSPath();

const args = parseArgs(process.argv.slice(2));
const host = args.host ?? "127.0.0.1";
const port = args.port ?? 8000;

if (!existsSync(openapiPath)) {
  console.error(`OpenAPI file not found: ${openapiPath}`);
  process.exit(1);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    send(response, 200, "text/html; charset=utf-8", renderIndex());
    return;
  }

  if (url.pathname === "/openapi.yaml") {
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": "application/yaml; charset=utf-8",
    });
    createReadStream(openapiPath).pipe(response);
    return;
  }

  await sendSwaggerAsset(url.pathname, response);
});

server.listen(port, host, () => {
  const previewUrl = `http://${host}:${port}`;
  console.log(`Swagger UI: ${previewUrl}`);
  console.log(`OpenAPI: ${openapiPath}`);

  if (args.open) {
    open(previewUrl).catch((error) => {
      console.warn(`Failed to open browser: ${error.message}`);
    });
  }
});

function parseArgs(rawArgs) {
  const result = {
    open: true,
    host: undefined,
    port: undefined,
  };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg === "--no-open") {
      result.open = false;
      continue;
    }

    if (arg === "--host" || arg === "-h") {
      result.host = rawArgs[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--port" || arg === "-p") {
      result.port = Number(rawArgs[index + 1]);
      index += 1;
      continue;
    }
  }

  return result;
}

async function sendSwaggerAsset(pathname, response) {
  const assetPath = resolve(swaggerUiPath, pathname.slice(1));

  if (!assetPath.startsWith(`${swaggerUiPath}${sep}`)) {
    send(response, 403, "text/plain; charset=utf-8", "Forbidden");
    return;
  }

  try {
    const assetStat = await stat(assetPath);
    if (!assetStat.isFile()) {
      throw new Error("Not a file");
    }
  } catch {
    send(response, 404, "text/plain; charset=utf-8", "Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentType(assetPath),
  });
  createReadStream(assetPath).pipe(response);
}

function send(response, status, type, body) {
  response.writeHead(status, {
    "Content-Type": type,
  });
  response.end(body);
}

function contentType(filePath) {
  const types = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".map": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
  };

  return types[extname(filePath)] ?? "application/octet-stream";
}

function renderIndex() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Scheduling API</title>
    <link rel="stylesheet" href="/swagger-ui.css" />
    <style>
      body {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/swagger-ui-bundle.js"></script>
    <script src="/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/openapi.yaml",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          layout: "StandaloneLayout"
        });
      };
    </script>
  </body>
</html>`;
}
