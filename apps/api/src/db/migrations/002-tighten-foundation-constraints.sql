CREATE UNIQUE INDEX event_types_slug_unique_idx ON event_types(slug);

CREATE TRIGGER availability_rules_validate_time_insert
BEFORE INSERT ON availability_rules
WHEN NOT (
  (
    NEW.start_time GLOB '[01][0-9]:[0-5][0-9]'
    OR NEW.start_time GLOB '2[0-3]:[0-5][0-9]'
  )
  AND (
    NEW.end_time GLOB '[01][0-9]:[0-5][0-9]'
    OR NEW.end_time GLOB '2[0-3]:[0-5][0-9]'
  )
)
BEGIN
  SELECT RAISE(ABORT, 'availability time must use HH:mm within 00:00-23:59');
END;

CREATE TRIGGER availability_rules_validate_time_update
BEFORE UPDATE OF start_time, end_time ON availability_rules
WHEN NOT (
  (
    NEW.start_time GLOB '[01][0-9]:[0-5][0-9]'
    OR NEW.start_time GLOB '2[0-3]:[0-5][0-9]'
  )
  AND (
    NEW.end_time GLOB '[01][0-9]:[0-5][0-9]'
    OR NEW.end_time GLOB '2[0-3]:[0-5][0-9]'
  )
)
BEGIN
  SELECT RAISE(ABORT, 'availability time must use HH:mm within 00:00-23:59');
END;
