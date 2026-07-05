import "@typespec/http";
import "@typespec/openapi";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{ title: "Scheduling API" })
@info(#{ version: "0.1.0" })
@server("http://localhost:4010", "Local Prism mock")
@useAuth(BearerAuth)
namespace Scheduling;

enum ErrorCode {
  invalid_request,
  unauthenticated,
  forbidden,
  not_found,
  conflict,
}

enum Weekday {
  monday,
  tuesday,
  wednesday,
  thursday,
  friday,
  saturday,
  sunday,
}

enum BookingStatus {
  confirmed,
  cancelled,
}

@format("date")
scalar LocalDate extends string;

@pattern("^([01][0-9]|2[0-3]):[0-5][0-9]$")
scalar LocalTime extends string;

@pattern("^[a-z0-9]+(?:-[a-z0-9]+)*$")
scalar Slug extends string;

@format("email")
scalar Email extends string;

@minValue(1)
scalar PositiveInt extends int32;

@extension("example", #{
  code: "invalid_request",
  message: "Request body is invalid.",
  details: #{
    field: "slug",
    issue: "Must use lowercase letters, numbers, and hyphens.",
  },
})
model ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

@extension("example", #{
  id: "usr_1",
  name: "Alex Organizer",
  email: "organizer@example.com",
  timezone: "Europe/Moscow",
})
model User {
  id: string;
  name: string;
  email: Email;
  timezone: "Europe/Moscow";
}

@extension("example", #{
  email: "organizer@example.com",
  password: "correct-horse-battery-staple",
})
model LoginRequest {
  email: Email;
  password: string;
}

@extension("example", #{
  token: "mock-session-token",
  user: #{
    id: "usr_1",
    name: "Alex Organizer",
    email: "organizer@example.com",
    timezone: "Europe/Moscow",
  },
})
model LoginResponse {
  token: string;
  user: User;
}

@extension("example", #{
  id: "evt_30m_intro",
  title: "Intro Call",
  slug: "intro-call",
  description: "A short introductory call.",
  durationMinutes: 30,
  isActive: true,
  createdAt: "2026-07-01T09:00:00Z",
  updatedAt: "2026-07-03T12:00:00Z",
})
model EventType {
  id: string;
  title: string;
  slug: Slug;
  description: string;
  durationMinutes: PositiveInt;
  isActive: boolean;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

@extension("example", #{
  title: "Intro Call",
  slug: "intro-call",
  description: "A short introductory call.",
  durationMinutes: 30,
  isActive: true,
})
model EventTypeCreate {
  title: string;
  slug: Slug;
  description: string;
  durationMinutes: PositiveInt;
  isActive: boolean;
}

@extension("example", #{
  title: "Discovery Call",
  durationMinutes: 45,
  isActive: true,
})
model EventTypeUpdate {
  title?: string;
  slug?: Slug;
  description?: string;
  durationMinutes?: PositiveInt;
  isActive?: boolean;
}

@extension("example", #{
  id: "evt_30m_intro",
  title: "Intro Call",
  slug: "intro-call",
  description: "A short introductory call.",
  durationMinutes: 30,
  isActive: true,
})
model PublicEventType {
  id: string;
  title: string;
  slug: Slug;
  description: string;
  durationMinutes: PositiveInt;
  isActive: boolean;
}

@extension("example", #{
  id: "av_monday_morning",
  weekday: "monday",
  startTime: "09:00",
  endTime: "12:00",
  createdAt: "2026-07-01T09:00:00Z",
  updatedAt: "2026-07-01T09:00:00Z",
})
model AvailabilityRule {
  id: string;
  weekday: Weekday;
  startTime: LocalTime;
  endTime: LocalTime;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

@extension("example", #{
  weekday: "monday",
  startTime: "09:00",
  endTime: "12:00",
})
model AvailabilityRuleCreate {
  weekday: Weekday;
  startTime: LocalTime;
  endTime: LocalTime;
}

@extension("example", #{
  startTime: "10:00",
  endTime: "13:00",
})
model AvailabilityRuleUpdate {
  weekday?: Weekday;
  startTime?: LocalTime;
  endTime?: LocalTime;
}

@extension("example", #{
  id: "bk_1",
  eventTypeId: "evt_30m_intro",
  eventTypeTitle: "Intro Call",
  guestName: "Maria Guest",
  guestEmail: "maria@example.com",
  startAt: "2026-07-06T07:00:00Z",
  endAt: "2026-07-06T07:30:00Z",
  status: "confirmed",
  cancelledAt: null,
  createdAt: "2026-07-05T12:00:00Z",
  updatedAt: "2026-07-05T12:00:00Z",
})
model Booking {
  id: string;
  eventTypeId: string;
  eventTypeTitle: string;
  guestName: string;
  guestEmail: Email;
  startAt: utcDateTime;
  endAt: utcDateTime;
  status: BookingStatus;
  cancelledAt: utcDateTime | null;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

@extension("example", #{
  startAt: "2026-07-06T07:00:00Z",
  endAt: "2026-07-06T07:30:00Z",
})
model PublicSlot {
  startAt: utcDateTime;
  endAt: utcDateTime;
}

@extension("example", #{
  startAt: "2026-07-06T07:00:00Z",
  guestName: "Maria Guest",
  guestEmail: "maria@example.com",
})
model PublicBookingCreate {
  startAt: utcDateTime;
  guestName: string;
  guestEmail: Email;
}

@extension("example", #{
  id: "bk_1",
  eventTypeTitle: "Intro Call",
  guestName: "Maria Guest",
  guestEmail: "maria@example.com",
  startAt: "2026-07-06T07:00:00Z",
  endAt: "2026-07-06T07:30:00Z",
  status: "confirmed",
})
model PublicBookingConfirmation {
  id: string;
  eventTypeTitle: string;
  guestName: string;
  guestEmail: Email;
  startAt: utcDateTime;
  endAt: utcDateTime;
  status: BookingStatus;
}

model CreatedEventType {
  @statusCode statusCode: 201;
  @body body: EventType;
}

model CreatedAvailabilityRule {
  @statusCode statusCode: 201;
  @body body: AvailabilityRule;
}

model CreatedPublicBooking {
  @statusCode statusCode: 201;
  @body body: PublicBookingConfirmation;
}

model NoContent {
  @statusCode statusCode: 204;
}

model BadRequest {
  @statusCode statusCode: 400;
  @body body: ErrorResponse;
}

model Unauthorized {
  @statusCode statusCode: 401;
  @body body: ErrorResponse;
}

model NotFound {
  @statusCode statusCode: 404;
  @body body: ErrorResponse;
}

model Conflict {
  @statusCode statusCode: 409;
  @body body: ErrorResponse;
}

@tag("Auth")
@route("/auth")
namespace Auth {
  @post
  @route("/login")
  @useAuth(NoAuth)
  op login(@body body: LoginRequest): LoginResponse | BadRequest | Unauthorized;

  @get
  @route("/me")
  op me(): User | Unauthorized;
}

@tag("Event Types")
@route("/event-types")
namespace EventTypes {
  @get
  op list(): EventType[] | Unauthorized;

  @post
  op create(@body body: EventTypeCreate): CreatedEventType | BadRequest | Unauthorized | Conflict;

  @get
  @route("/{id}")
  op get(@path id: string): EventType | Unauthorized | NotFound;

  @patch
  @route("/{id}")
  op update(@path id: string, @body body: EventTypeUpdate): EventType | BadRequest | Unauthorized | NotFound | Conflict;

  @delete
  @route("/{id}")
  op delete(@path id: string): NoContent | Unauthorized | NotFound | Conflict;

  @post
  @route("/{id}/activate")
  op activate(@path id: string): EventType | Unauthorized | NotFound;

  @post
  @route("/{id}/deactivate")
  op deactivate(@path id: string): EventType | Unauthorized | NotFound;
}

@tag("Public Booking")
@route("/public/event-types")
namespace PublicBooking {
  @get
  @route("/{slug}")
  @useAuth(NoAuth)
  op getEventType(@path slug: Slug): PublicEventType | NotFound;

  @get
  @route("/{slug}/slots")
  @useAuth(NoAuth)
  op listSlots(
    @path slug: Slug,
    @query from: LocalDate,
    @query to: LocalDate,
  ): PublicSlot[] | BadRequest | NotFound;

  @post
  @route("/{slug}/bookings")
  @useAuth(NoAuth)
  op createBooking(
    @path slug: Slug,
    @body body: PublicBookingCreate,
  ): CreatedPublicBooking | BadRequest | NotFound | Conflict;
}

@tag("Availability")
@route("/availability")
namespace Availability {
  @get
  op list(): AvailabilityRule[] | Unauthorized;

  @post
  op create(@body body: AvailabilityRuleCreate): CreatedAvailabilityRule | BadRequest | Unauthorized | Conflict;

  @get
  @route("/{id}")
  op get(@path id: string): AvailabilityRule | Unauthorized | NotFound;

  @patch
  @route("/{id}")
  op update(@path id: string, @body body: AvailabilityRuleUpdate): AvailabilityRule | BadRequest | Unauthorized | NotFound | Conflict;

  @delete
  @route("/{id}")
  op delete(@path id: string): NoContent | Unauthorized | NotFound;
}

@tag("Bookings")
@route("/bookings")
namespace Bookings {
  @get
  op list(): Booking[] | Unauthorized;

  @post
  @route("/{id}/cancel")
  op cancel(@path id: string): Booking | Unauthorized | NotFound;
}
