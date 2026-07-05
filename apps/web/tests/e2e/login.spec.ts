import { expect, test } from "@playwright/test";

const email = "organizer@example.com";
const password = "correct-horse-battery-staple";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
});

test("requires credentials before submitting login", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("Enter a valid email address")).toBeVisible();
  await expect(page.getByText("Enter your password")).toBeVisible();
});

test("signs in and lands on event types by default", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/event-types$/);
  await expect(page.getByRole("heading", { name: "Event Types" })).toBeVisible();
  await expect(page.getByText("Alex Organizer")).toBeVisible();
});

test("returns to the protected route that required login", async ({ page }) => {
  await page.goto("/availability");

  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/availability$/);
  await expect(page.getByRole("heading", { name: "Availability" })).toBeVisible();
});

test("clears an invalid session when organizer lookup is unauthorized", async ({ page }) => {
  await page.route("**/auth/me", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ code: "unauthenticated", message: "Unauthorized" }),
    });
  });
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("scheduling.sessionToken", "stale-token");
  });

  await page.goto("/event-types");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.evaluate(() => window.localStorage.getItem("scheduling.sessionToken")),
  ).resolves.toBeNull();
});

test("signs out locally", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.getByRole("button", { name: "Sign out" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.evaluate(() => window.localStorage.getItem("scheduling.sessionToken")),
  ).resolves.toBeNull();
});
