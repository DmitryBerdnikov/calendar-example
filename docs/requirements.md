# Requirements

## Scope

Build a basic Cal.com-style scheduling app without subscription or billing features.

## Delivery Order

1. Define the API in TypeSpec.
2. Generate OpenAPI from TypeSpec.
3. Add Swagger UI for API inspection.
4. Run Prism from the generated OpenAPI.
5. Build the frontend against the Prism mock.
6. Defer backend implementation until the mocked frontend flow is working.

## Planning

- Maintain `docs/roadmap.md` and individual task documents under `docs/tasks/active/`.
- Follow the step workflow in `docs/workflow.md`.
- Record each completed step in `docs/journal/`.
- Each implementation step must be small, concrete, and independently verifiable.

## Project Conventions

- Commit messages must follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/), using the form `<type>[optional scope]: <description>`.
- File names must use `kebab-case` when the language, framework, or toolchain allows it.

## Verification

- Contract verification: generate OpenAPI from TypeSpec with `pnpm api:generate`.
- Frontend verification: TypeScript build.
- Frontend slice verification: Playwright smoke tests against Prism.
- Unit tests are optional before backend implementation.

## Repository Layout

- `packages/api-contract`: TypeSpec source and generated OpenAPI.
- `packages/api-client`: generated TypeScript client/types.
- `apps/docs`: Swagger UI for the generated OpenAPI.
- `apps/web`: React frontend.
- `apps/api`: Fastify backend.

## API Contract

- TypeSpec is the source of truth for the HTTP contract.
- TypeSpec covers the full MVP API before frontend implementation starts.
- OpenAPI is generated from TypeSpec.
- OpenAPI includes examples sufficient for Prism mock responses.
- Swagger UI is delivered as `apps/docs`, a Vite app that reads the generated OpenAPI from `packages/api-contract`.
- Prism is used as a stateless mock server from the generated OpenAPI.
- Frontend mutation flows call Prism and handle success/error, but Prism lists are example-based and are not expected to reflect prior mutations.
- Frontend TypeScript client/types are generated from OpenAPI.
- Backend validation may use local schemas but must conform to the generated OpenAPI contract.

### MVP Endpoints

- `POST /auth/login`
- `GET /auth/me`
- `GET /event-types`
- `POST /event-types`
- `GET /event-types/{id}`
- `PATCH /event-types/{id}`
- `DELETE /event-types/{id}`
- `POST /event-types/{id}/activate`
- `POST /event-types/{id}/deactivate`
- `GET /public/event-types/{slug}`
- `GET /public/event-types/{slug}/slots?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `POST /public/event-types/{slug}/bookings`
- `GET /availability`
- `POST /availability`
- `GET /availability/{id}`
- `PATCH /availability/{id}`
- `DELETE /availability/{id}`
- `GET /bookings`
- `POST /bookings/{id}/cancel`

## Backend

- Backend implementation is out of the current delivery scope.
- Runtime: Node.js.
- HTTP framework: Fastify.
- Validation: Zod.
- Database: SQLite via `better-sqlite3`.

## Frontend

- Required routes: `/login`, `/event-types`, `/event-types/new`, `/event-types/:id/edit`, `/event-types/:id/preview`, `/availability`, `/bookings`, and public `/book/:slug`.
- Frontend implementation order: app shell and login; event types list; create/edit event type; preview and public booking page; availability CRUD; bookings list/cancel.
- Frontend design should be as close as practical to Cal.com: restrained monochrome-first UI, clean spacing, table/list-heavy admin screens, simple forms, and a focused public booking flow. Do not copy Cal.com logos or brand assets.

## Auth

- Organizer sign-in is supported.
- Public self-registration is not supported.
- Guests do not sign in.
- `POST /auth/login` returns a session token.
- The frontend sends authenticated requests with `Authorization: Bearer <token>`.
- Refresh tokens and cookie-based auth are excluded from the MVP.

## Event Types

- Organizers can list, create, edit, delete, activate, deactivate, and preview event types.
- Event Type fields: `id`, `title`, `slug`, `description`, `durationMinutes`, `isActive`, `createdAt`, `updatedAt`.
- Excluded from MVP: location, price, buffers, booking limits, custom questions, reminders.
- Preview shows the public booking flow for an event type even when `isActive = false`.
- Guests can create bookings only for active event types.
- Deleting an event type with existing bookings is rejected with `409 Conflict`; organizers should deactivate it instead.

## Availability

- Organizers can list, create, edit, and delete availability rules.
- Availability is modeled as weekly rules, not one-off calendar dates.
- Availability fields: `id`, `weekday`, `startTime`, `endTime`, `createdAt`, `updatedAt`.
- `weekday` uses `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`.
- `startTime` and `endTime` use local `HH:mm` time without a date.
- Availability is interpreted in the organizer timezone, fixed to `Europe/Moscow` for the MVP.
- Deleting or editing availability affects future slot generation only; existing bookings remain unchanged.
- Availability rules for the same weekday must not overlap.
- Adjacent intervals, such as `09:00-12:00` and `12:00-17:00`, are allowed.
- All event types use the same organizer availability.
- Excluded from MVP: per-event-type availability, exceptions, holidays, time off, and per-date overrides.

## Bookings

- Organizers can list and cancel bookings.
- Booking list has no pagination and no filters in the MVP.
- Guests cannot cancel bookings in the MVP.
- Bookings store `startAt` and `endAt` as ISO UTC timestamps.
- Booking fields: `id`, `eventTypeId`, `eventTypeTitle`, `guestName`, `guestEmail`, `startAt`, `endAt`, `status`, `cancelledAt`, `createdAt`, `updatedAt`.
- Booking statuses are `confirmed` and `cancelled`.
- Cancelling a booking sets `status = cancelled` and `cancelledAt`; it does not delete the booking.
- Public slot lookup is exposed as `GET /public/event-types/{slug}/slots?from=YYYY-MM-DD&to=YYYY-MM-DD`.
- Slot starts are generated from availability rules using the event type `durationMinutes` as the step.
- Slots overlapping non-cancelled bookings are excluded.
- Excluded from MVP: guest cancellation links, notes, guest lists, rescheduling, meeting links.
