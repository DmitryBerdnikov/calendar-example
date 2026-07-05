# Local availability and UTC bookings

Availability rules use local `HH:mm` times in the organizer timezone, fixed to `Europe/Moscow` for the MVP, while bookings store `startAt` and `endAt` as UTC timestamps. This keeps weekly availability easy to edit while giving persisted bookings an unambiguous point in time.
