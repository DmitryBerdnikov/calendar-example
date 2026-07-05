import { describe, expect, it } from "vitest";

import { createApiConfig } from "./config";

describe("createApiConfig", () => {
  it("uses local API defaults", () => {
    expect(createApiConfig({})).toEqual({
      host: "127.0.0.1",
      port: 4010,
      corsOrigins: ["http://127.0.0.1:5173", "http://localhost:5173"],
    });
  });
});
