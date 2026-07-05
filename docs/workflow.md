# Workflow

This project is developed as a learning story. Tasks define what to build; journal entries capture what happened in a chat: human prompts, human decisions, AI work, verification, and outcome.

## Work Item Model

- One journal entry is one work item.
- Branch names match the journal work id exactly, for example `2-workspace-scaffold`.
- One journal entry may cover one or more tasks from `docs/tasks/active/`.
- Each work item starts in a new chat.
- A task is archived only after review, when the human says that the task is done.
- Task files in `docs/tasks/active/` and `docs/tasks/archive/` must not include `Status`, `Roadmap`, or `Depends on` metadata fields.

## New Chat Protocol

Start each work item chat with the related active task files and this workflow. The agent must:

- read the related tasks, `docs/requirements.md`, `docs/roadmap.md`, and this workflow;
- create or switch to the branch named after the journal work id from current `main`;
- implement only the related tasks;
- run the related task verification;
- report the changed files, verification evidence, and any known caveats;
- wait for human review before committing, filling journal entries, or archiving completed tasks.

## Review And Archive Protocol

After the human reviews the work, they either request fixes or say the task is done.

If the human requests any fix or change, the agent must:

- make only the requested fixes;
- rerun the related verification;
- report the updated changed files, verification evidence, and any known caveats;
- wait for human review again before committing, filling journal entries, or archiving completed tasks.

After the human writes that the task or tasks are done, the agent must:

- fill `Фактический результат` in each completed task;
- move completed tasks from `docs/tasks/active/` to `docs/tasks/archive/`;
- name archived task files as `YYYY-MM-DD-task-slug.md`, for example `2026-07-05-workspace-scaffold.md`;
- remove completed task rows from `docs/roadmap.md`;
- add completed task links to `docs/tasks/archive/README.md`;
- create or update the chat journal entry with prompts, decisions, AI work, verification evidence, result, and final commit information when relevant;
- make one final Conventional Commit with a meaningful body;
- merge the work item branch into `main`;
- start the next work item from updated `main`.

## Commit Protocol

- Use Conventional Commits 1.0.0.
- Use one final commit per work item.
- The commit subject must be concise and useful in history.
- The commit body must capture the important notes for the step: goal, key choices, and verification.

## Journal Protocol

- Journal files live in `docs/journal/`.
- Journal work ids use `N-chat-slug`, for example `1-chat-planning-workflow`.
- Journal file names add `.md` to the work id, for example `1-chat-planning-workflow.md`.
- Branch names match journal work ids exactly, for example `2-workspace-scaffold`.
- A journal entry is about the current chat, not about a task file.
- Journal entries record key human prompts verbatim, human decisions, AI actions, verification, and result.
- Journal entries also include a short narrative summary of what happened and the key moments, so the project history is readable as a learning story.
- A journal entry may link a related branch or task, but tasks do not link back to journal entries.
- `README.md` and `_template.md` are reserved journal files that do not use kebab-case because they are not chat entries.
- Keep verification evidence compact: commands and short outcomes, not full logs.
