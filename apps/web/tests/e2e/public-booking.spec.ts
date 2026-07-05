import { expect, test } from "@playwright/test";

const sessionTokenStorageKey = "scheduling.sessionToken";

const publicEventType = {
  id: "evt_30m_intro",
  title: "Intro Call",
  slug: "intro-call",
  description: "A short introductory call.",
  durationMinutes: 30,
  isActive: true,
};

const inactivePublicEventType = {
  ...publicEventType,
  isActive: false,
};

test("guest can select a slot and submit a public booking", async ({ page }) => {
  await page.route(
    "http://localhost:4010/public/event-types/intro-call/bookings",
    async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        startAt: "2026-07-06T07:00:00Z",
        guestName: "Maria Guest",
        guestEmail: "maria@example.com",
      });

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "bk_1",
          eventTypeTitle: "Intro Call",
          guestName: "Maria Guest",
          guestEmail: "maria@example.com",
          startAt: "2026-07-06T07:00:00Z",
          endAt: "2026-07-06T07:30:00Z",
          status: "confirmed",
        }),
      });
    },
  );

  await page.goto("/book/intro-call");

  await expect(page.getByRole("heading", { name: "Intro Call" })).toBeVisible();
  await page.getByRole("button", { name: "10:00 AM - 10:30 AM" }).click();
  await page.getByLabel("Name").fill("Maria Guest");
  await page.getByLabel("Email").fill("maria@example.com");
  await page.getByRole("button", { name: "Confirm booking" }).click();

  await expect(
    page.getByRole("heading", { name: "Booking confirmed" }),
  ).toBeVisible();
  await expect(page.getByText("maria@example.com")).toBeVisible();
  await expect(page.getByText("confirmed", { exact: true })).toBeVisible();
});

test("admin preview renders booking UI without creating bookings", async ({
  page,
}) => {
  let bookingRequests = 0;

  await page.addInitScript((storageKey) => {
    window.localStorage.clear();
    window.localStorage.setItem(storageKey, "dev-token");
  }, sessionTokenStorageKey);

  await page.route(
    "http://localhost:4010/public/event-types/intro-call/bookings",
    async (route) => {
      bookingRequests += 1;
      await route.fallback();
    },
  );

  await page.goto("/event-types/evt_30m_intro/preview");

  await expect(
    page.getByRole("heading", { name: "Event Type Preview" }),
  ).toBeVisible();
  await expect(page.getByText("Preview mode")).toBeVisible();
  await page.getByRole("button", { name: "10:00 AM - 10:30 AM" }).click();
  await page.getByLabel("Name").fill("Maria Guest");
  await page.getByLabel("Email").fill("maria@example.com");
  await expect(
    page.getByRole("button", { name: "Preview only" }),
  ).toBeDisabled();
  expect(bookingRequests).toBe(0);
});

test("inactive public event types are unavailable for guests", async ({
  page,
}) => {
  await page.route(
    "http://localhost:4010/public/event-types/intro-call",
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(inactivePublicEventType),
      });
    },
  );

  await page.goto("/book/intro-call");

  await expect(
    page.getByText("This event type is unavailable"),
  ).toBeVisible();
  await expect(page.getByLabel("Name")).toBeDisabled();
  await expect(page.getByLabel("Email")).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Confirm booking" }),
  ).toBeDisabled();
});
