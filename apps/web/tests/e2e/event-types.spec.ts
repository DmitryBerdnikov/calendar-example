import { expect, test } from "@playwright/test";

const sessionTokenStorageKey = "scheduling.sessionToken";

const inactiveEventType = {
  id: "evt_60m_strategy",
  title: "Strategy Session",
  slug: "strategy-session",
  description: "A longer planning call.",
  durationMinutes: 60,
  isActive: false,
  createdAt: "2026-07-01T09:00:00Z",
  updatedAt: "2026-07-03T12:00:00Z",
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((storageKey) => {
    window.localStorage.clear();
    window.localStorage.setItem(storageKey, "dev-token");
  }, sessionTokenStorageKey);
});

test("shows event types and handles the main actions", async ({ page }) => {
  await page.goto("/event-types");

  await expect(page.getByRole("heading", { name: "Event Types" })).toBeVisible();
  await expect(page.getByText("Intro Call")).toBeVisible();
  await expect(page.getByText("intro-call")).toBeVisible();
  await expect(page.getByText("30 min")).toBeVisible();
  await expect(page.getByText("Active")).toBeVisible();
  await expect(page.getByRole("link", { name: "Preview" })).toHaveAttribute(
    "href",
    "/event-types/evt_30m_intro/preview",
  );
  await expect(page.getByRole("link", { name: "Edit" })).toHaveAttribute(
    "href",
    "/event-types/evt_30m_intro/edit",
  );

  await page.getByRole("button", { name: "Deactivate" }).click();
  await expect(page.getByText("Action succeeded")).toBeVisible();
  await expect(
    page.getByText("Intro Call deactivate request succeeded."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("dialog")).toContainText("Delete Intro Call?");
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete event type" }).click();
  await expect(
    page.getByText("Intro Call delete request succeeded."),
  ).toBeVisible();
});

test("shows activate action for inactive event types", async ({ page }) => {
  await page.route("http://localhost:4010/event-types", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([inactiveEventType]),
    });
  });

  await page.goto("/event-types");

  await expect(page.getByText("Strategy Session")).toBeVisible();
  await expect(page.getByText("Inactive")).toBeVisible();
  await expect(page.getByRole("button", { name: "Activate" })).toBeVisible();
});

test("shows a mutation error without changing local list state", async ({
  page,
}) => {
  await page.route(
    "http://localhost:4010/event-types/evt_30m_intro/deactivate",
    async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ code: "mock_error", message: "Mock failure" }),
      });
    },
  );

  await page.goto("/event-types");
  await page.getByRole("button", { name: "Deactivate" }).click();

  await expect(page.getByText("Action failed")).toBeVisible();
  await expect(page.getByText("Mock failure")).toBeVisible();
  await expect(page.getByText("Intro Call")).toBeVisible();
});
