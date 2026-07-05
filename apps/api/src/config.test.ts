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
});
