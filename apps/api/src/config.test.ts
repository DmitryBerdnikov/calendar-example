import { describe, expect, it } from "vitest";

import { createApiConfig } from "./config";

describe("createApiConfig", () => {
  it("uses local API defaults", () => {
    const config = createApiConfig({});

    expect(config).toEqual({
      host: "127.0.0.1",
      port: 4010,
      corsOrigins: ["http://127.0.0.1:5173", "http://localhost:5173"],
      databasePath: expect.stringMatching(/apps\/api\/data\/dev\.sqlite$/),
    });
  });

  it("allows the database path to be configured", () => {
    expect(
      createApiConfig({
        API_DATABASE_PATH: "/tmp/scheduling-test.sqlite",
      }).databasePath,
    ).toBe("/tmp/scheduling-test.sqlite");
  });

  it("uses Render PORT when API_PORT is not configured", () => {
    expect(
      createApiConfig({
        PORT: "10000",
      }).port,
    ).toBe(10000);
  });

  it("prefers API_PORT over PORT", () => {
    expect(
      createApiConfig({
        API_PORT: "4010",
        PORT: "10000",
      }).port,
    ).toBe(4010);
  });
});
