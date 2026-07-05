CREATE TABLE organizers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  email TEXT NOT NULL UNIQUE CHECK (length(trim(email)) > 0),
  timezone TEXT NOT NULL CHECK (timezone = 'Europe/Moscow'),
  password_hash TEXT NOT NULL CHECK (length(password_hash) > 0),
  password_salt TEXT NOT NULL CHECK (length(password_salt) > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  organizer_id TEXT NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX sessions_organizer_id_idx ON sessions(organizer_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE event_types (
  id TEXT PRIMARY KEY,
  organizer_id TEXT NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  slug TEXT NOT NULL CHECK (
    slug <> ''
    AND slug NOT GLOB '*[^a-z0-9-]*'
    AND slug NOT LIKE '-%'
    AND slug NOT LIKE '%-'
    AND slug NOT LIKE '%--%'
  ),
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  is_active INTEGER NOT NULL CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (organizer_id, slug)
);

CREATE INDEX event_types_organizer_id_idx ON event_types(organizer_id);
CREATE INDEX event_types_slug_idx ON event_types(slug);

CREATE TABLE availability_rules (
  id TEXT PRIMARY KEY,
  organizer_id TEXT NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  weekday TEXT NOT NULL CHECK (
    weekday IN (
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    )
  ),
  start_time TEXT NOT NULL CHECK (start_time GLOB '[0-2][0-9]:[0-5][0-9]'),
  end_time TEXT NOT NULL CHECK (end_time GLOB '[0-2][0-9]:[0-5][0-9]'),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (start_time < end_time)
);

CREATE INDEX availability_rules_organizer_weekday_idx
  ON availability_rules(organizer_id, weekday);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  organizer_id TEXT NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  event_type_id TEXT NOT NULL REFERENCES event_types(id) ON DELETE RESTRICT,
  event_type_title TEXT NOT NULL CHECK (length(trim(event_type_title)) > 0),
  guest_name TEXT NOT NULL CHECK (length(trim(guest_name)) > 0),
  guest_email TEXT NOT NULL CHECK (length(trim(guest_email)) > 0),
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled')),
  cancelled_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (start_at < end_at),
  CHECK (
    (status = 'confirmed' AND cancelled_at IS NULL)
    OR (status = 'cancelled' AND cancelled_at IS NOT NULL)
  )
);

CREATE INDEX bookings_organizer_id_idx ON bookings(organizer_id);
CREATE INDEX bookings_event_type_id_idx ON bookings(event_type_id);
CREATE INDEX bookings_start_at_idx ON bookings(start_at);

CREATE UNIQUE INDEX bookings_confirmed_slot_idx
  ON bookings(event_type_id, start_at)
  WHERE status = 'confirmed';
