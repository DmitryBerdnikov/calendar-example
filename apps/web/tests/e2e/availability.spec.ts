import { expect, test } from "@playwright/test";

const sessionTokenStorageKey = "scheduling.sessionToken";

const mondayMorningRule = {
  id: "av_monday_morning",
  weekday: "monday",
  startTime: "09:00",
  endTime: "12:00",
  createdAt: "2026-07-01T09:00:00Z",
  updatedAt: "2026-07-01T09:00:00Z",
};

const tuesdayAfternoonRule = {
  id: "av_tuesday_afternoon",
  weekday: "tuesday",
  startTime: "13:00",
  endTime: "17:00",
  createdAt: "2026-07-05T12:00:00Z",
  updatedAt: "2026-07-05T12:00:00Z",
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((storageKey) => {
    window.localStorage.clear();
    window.localStorage.setItem(storageKey, "dev-token");
  }, sessionTokenStorageKey);
});

test("shows availability rules from the API", async ({ page }) => {
  await page.goto("/availability");

  await expect(page.getByRole("heading", { name: "Availability" })).toBeVisible();
  await expect(
    page.getByRole("row", { name: /Monday\s+09:00\s+12:00/ }),
  ).toBeVisible();
});

test("creates an availability rule and updates the list", async ({ page }) => {
  await page.route("http://localhost:4010/availability", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }

    expect(route.request().postDataJSON()).toEqual({
      weekday: "tuesday",
      startTime: "13:00",
      endTime: "17:00",
    });

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(tuesdayAfternoonRule),
    });
  });

  await page.goto("/availability");
  await page.getByRole("textbox", { name: "Weekday" }).click();
  await page.getByRole("option", { name: "Tuesday" }).click();
  await page.getByLabel("Start time").fill("13:00");
  await page.getByLabel("End time").fill("17:00");
  await page.getByRole("button", { name: "Create rule" }).click();

  await expect(page.getByText("Availability rule created")).toBeVisible();
  await expect(
    page.getByRole("row", { name: /Tuesday\s+13:00\s+17:00/ }),
  ).toBeVisible();
});

test("edits an availability rule and updates the list", async ({ page }) => {
  await page.route("http://localhost:4010/availability", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([mondayMorningRule]),
    });
  });

  await page.route(
    "http://localhost:4010/availability/av_monday_morning",
    async (route) => {
      if (route.request().method() !== "PATCH") {
        await route.fallback();
        return;
      }

      expect(route.request().postDataJSON()).toEqual({
        weekday: "monday",
        startTime: "10:00",
        endTime: "13:00",
      });

      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          ...mondayMorningRule,
          startTime: "10:00",
          endTime: "13:00",
          updatedAt: "2026-07-05T12:00:00Z",
        }),
      });
    },
  );

  await page.goto("/availability");
  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.getByRole("button", { name: "Save rule" })).toBeVisible();
  await page.getByLabel("Start time").fill("10:00");
  await page.getByLabel("End time").fill("13:00");
  await page.getByRole("button", { name: "Save rule" }).click();

  await expect(page.getByText("Availability rule updated")).toBeVisible();
  await expect(
    page.getByRole("row", { name: /Monday\s+10:00\s+13:00/ }),
  ).toBeVisible();
});

test("deletes an availability rule and updates the list", async ({ page }) => {
  await page.route("http://localhost:4010/availability", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([mondayMorningRule]),
    });
  });

  await page.route(
    "http://localhost:4010/availability/av_monday_morning",
    async (route) => {
      if (route.request().method() !== "DELETE") {
        await route.fallback();
        return;
      }

      await route.fulfill({ status: 204 });
    },
  );

  await page.goto("/availability");
  await expect(
    page.getByRole("row", { name: /Monday\s+09:00\s+12:00/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("dialog")).toContainText("Delete Monday 09:00-12:00?");
  await page.getByRole("button", { name: "Delete rule" }).click();

  await expect(page.getByText("Availability rule deleted")).toBeVisible();
  await expect(
    page.getByRole("row", { name: /Monday\s+09:00\s+12:00/ }),
  ).toBeHidden();
  await expect(page.getByText("No availability rules yet.")).toBeVisible();
});

test("validates availability rule form fields before submit", async ({ page }) => {
  await page.goto("/availability");

  await page.getByLabel("Start time").fill("9:00");
  await page.getByLabel("End time").fill("12:00");
  await page.getByRole("button", { name: "Create rule" }).click();
  await expect(page.getByText("Use HH:mm format")).toBeVisible();

  await page.getByLabel("Start time").fill("13:00");
  await page.getByLabel("End time").fill("13:00");
  await page.getByRole("button", { name: "Create rule" }).click();
  await expect(page.getByText("End time must be after start time")).toBeVisible();
});
