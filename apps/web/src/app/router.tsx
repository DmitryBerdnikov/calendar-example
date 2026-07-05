import type { ReactElement } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";

import { AdminShell } from "./admin-shell";
import { ProtectedRoute } from "./protected-route";
import { AvailabilityPage } from "../pages/availability-page";
import { BookingsPage } from "../pages/bookings-page";
import { EventTypeEditPage } from "../pages/event-type-edit-page";
import { EventTypeNewPage } from "../pages/event-type-new-page";
import { EventTypePreviewPage } from "../pages/event-type-preview-page";
import { EventTypesPage } from "../pages/event-types-page";
import { LoginPage } from "../pages/login-page";
import { NotFoundPage } from "../pages/not-found-page";
import { PublicBookingPage } from "../pages/public-booking-page";

function protectedPage(page: ReactElement) {
  return (
    <ProtectedRoute>
      <AdminShell>{page}</AdminShell>
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: protectedPage(<Navigate to="/event-types" replace />),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/event-types",
    element: protectedPage(<EventTypesPage />),
  },
  {
    path: "/event-types/new",
    element: protectedPage(<EventTypeNewPage />),
  },
  {
    path: "/event-types/:id/edit",
    element: protectedPage(<EventTypeEditPage />),
  },
  {
    path: "/event-types/:id/preview",
    element: protectedPage(<EventTypePreviewPage />),
  },
  {
    path: "/availability",
    element: protectedPage(<AvailabilityPage />),
  },
  {
    path: "/bookings",
    element: protectedPage(<BookingsPage />),
  },
  {
    path: "/book/:slug",
    element: <PublicBookingPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
