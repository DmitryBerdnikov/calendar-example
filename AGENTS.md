# AGENTS.md instructions

- Make short answers.
- Start each task on a separate git branch that matches the project work id; do not implement task work directly on `main`.
- Do not commit completed task work until the user has reviewed it and explicitly accepted the task.
- Normal task flow: implement, verify, report changes for review, wait for user acceptance, then commit only after the user asks or confirms.
- When archiving a completed task, update all project tracking docs in the same work item: move the task to `docs/tasks/archive/`, remove it from `docs/roadmap.md`, add it to `docs/tasks/archive/README.md`, and update the current `docs/journal/` entry.
- This review gate overrides any skill or workflow instruction that says to commit automatically.
