import { expect, test } from "@playwright/test";

const sessionTokenStorageKey = "scheduling.sessionToken";

const confirmedBooking = {
  id: "bk_confirmed",
  eventTypeId: "evt_intro",
  eventTypeTitle: "Intro Call",
  guestName: "Maria Guest",
  guestEmail: "maria@example.com",
  startAt: "2026-07-06T07:00:00Z",
  endAt: "2026-07-06T07:30:00Z",
  status: "confirmed",
  cancelledAt: null,
  createdAt: "2026-07-05T12:00:00Z",
  updatedAt: "2026-07-05T12:00:00Z",
};

const cancelledBooking = {
  id: "bk_cancelled",
  eventTypeId: "evt_strategy",
  eventTypeTitle: "Strategy Session",
  guestName: "Alex Guest",
  guestEmail: "alex@example.com",
  startAt: "2026-07-07T10:00:00Z",
  endAt: "2026-07-07T11:00:00Z",
  status: "cancelled",
  cancelledAt: "2026-07-05T13:00:00Z",
  createdAt: "2026-07-05T12:00:00Z",
  updatedAt: "2026-07-05T13:00:00Z",
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((storageKey) => {
    window.localStorage.clear();
    window.localStorage.setItem(storageKey, "dev-token");
  }, sessionTokenStorageKey);
});

test("shows bookings and cancels a confirmed booking", async ({ page }) => {
  await page.route("http://localhost:4010/bookings", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([confirmedBooking, cancelledBooking]),
    });
  });

  await page.route(
    "http://localhost:4010/bookings/bk_confirmed/cancel",
    async (route) => {
      expect(route.request().method()).toBe("POST");

      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          ...confirmedBooking,
          status: "cancelled",
          cancelledAt: "2026-07-05T14:00:00Z",
          updatedAt: "2026-07-05T14:00:00Z",
        }),
      });
    },
  );

  await page.goto("/bookings");

  await expect(page.getByRole("heading", { name: "Bookings" })).toBeVisible();
  await expect(
    page.getByRole("row", {
      name: /Maria Guest\s+maria@example\.com\s+Intro Call\s+Jul 6, 2026, 10:00 AM - 10:30 AM\s+confirmed\s+Cancel/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("row", {
      name: /Alex Guest\s+alex@example\.com\s+Strategy Session\s+Jul 7, 2026, 1:00 PM - 2:00 PM\s+cancelled\s+Cancelled/,
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancelled" })).toBeDisabled();

  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Cancel Intro Call?");
  await page.getByRole("button", { name: "Cancel booking" }).click();

  await expect(page.getByText("Booking cancelled")).toBeVisible();
  await expect(
    page.getByRole("row", {
      name: /Maria Guest\s+maria@example\.com\s+Intro Call\s+Jul 6, 2026, 10:00 AM - 10:30 AM\s+cancelled\s+Cancelled/,
    }),
  ).toBeVisible();
});
