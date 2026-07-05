# Journal

This directory contains chat-based learning records for the project.

Each entry captures what happened in one chat: prompts from the human, decisions made by the human, AI work, verification, and result. Journal entries are independent from task files; a task may be related, but it does not own a journal entry.

Use `_template.md` for new entries. Real entries use `N-chat-slug.md`, where `N-chat-slug` is the work id:

```text
1-chat-planning-workflow.md
2-chat-workspace-and-contract.md
```

The branch for a journal entry uses the same value as the work id, without `.md`:

```text
2-chat-workspace-and-contract
```

## Entry Rules

- Record important user prompts verbatim.
- Separate human decisions from AI actions.
- Record commands and short verification outcomes.
- Link related tasks and the matching branch when useful.
- Add commit information when the chat produced or closed a commit.
