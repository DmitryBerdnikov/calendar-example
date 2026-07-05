# Scheduling

Scheduling is the context for configuring appointment types, publishing them to guests, and managing booked appointments.

## Language

**Organizer**:
A person who owns event types, availability, and bookings, and can manage them after signing in.
_Avoid_: Account, user, host

**Organizer Session**:
A time-limited authenticated access period for an organizer after successful sign-in.
_Avoid_: Login, token, cookie

**Guest**:
A person who books time with an organizer without signing in.
_Avoid_: Customer, attendee, visitor

**Event Type**:
A public booking option owned by an organizer, such as a named meeting type with a duration and booking rules.
_Avoid_: Calendar event, meeting template

**Event Type Slug**:
A globally unique public identifier for an event type in booking URLs.
_Avoid_: Per-organizer slug, URL alias

**Booking**:
A scheduled appointment created by a guest for an event type.
_Avoid_: Reservation, appointment, calendar event

**Cancellation**:
A state change that marks a booking as no longer active without deleting its record.
_Avoid_: Deletion, removal

**Availability**:
An organizer-owned weekly rule that defines when bookings may start.
_Avoid_: Schedule, working hours, calendar

**Slot**:
A candidate booking time derived from availability and an event type duration. A slot is valid only when the full booking fits inside availability and does not overlap an active booking.
_Avoid_: Time block, opening
