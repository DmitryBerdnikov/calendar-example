# Backend Plan Tracking

## О чем

Зафиксировать backend work items после mocked MVP verification.

## Зачем

Backend implementation должен идти маленькими reviewable шагами, каждый на отдельной ветке с понятной проверкой.

## Изменения

- Добавить active task files для backend implementation chain.
- Добавить backend rows в `docs/roadmap.md`.
- Уточнить backend scope и правила slot generation в требованиях.
- Уточнить доменный термин `Slot` в `CONTEXT.md`.

## Верификация

- Выполнить `git diff --check`.
- Проверить, что task files не содержат `Status`, `Roadmap` или `Depends on`.

## Результат

Ожидаемый результат:
- Backend work разбит на маленькие active tasks, готовые к отдельным веткам и review.

Фактический результат:
- Backend work разбит на 9 следующих active tasks: app scaffold, SQLite foundation, auth, event types, availability, public slots, public bookings, admin bookings and backend E2E cutover.
- `docs/roadmap.md` получил Backend section со ссылками на active backend tasks.
- `docs/requirements.md` уточняет backend start, default bind address and slot generation rules.
- `CONTEXT.md` получил доменный термин `Slot`.
- `git diff --check`: успешно.
- `rg "^(Status|Roadmap|Depends on):" docs/tasks/active`: совпадений нет.
