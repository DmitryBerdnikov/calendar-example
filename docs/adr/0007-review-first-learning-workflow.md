# Review-first learning workflow

This project uses a review-first workflow for learning-oriented work items. AI work is reviewed by the human before it is committed, and any requested fix or change returns to human review before commit, journal finalization, or task archiving.

Each work item is captured as one final Conventional Commit only after the human explicitly says the work is ready, for example by saying `готово`. This keeps history aligned with reviewed learning steps rather than intermediate AI iterations.

Completed task files are archived with dated filenames using `YYYY-MM-DD-task-slug.md`, for example `2026-07-05-workspace-scaffold.md`. This keeps archive order visible in the filesystem while preserving the task slug.
