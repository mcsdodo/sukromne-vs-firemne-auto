# Task Planning Conventions

## Folder Structure

```
_tasks/
├── CLAUDE.md          # This file — conventions
├── index.md           # Central dashboard of all tasks
├── TODOS.md           # Scratch pad (NOT committed)
├── _TECH_DEBT/        # Persistent tech debt items
├── _done/             # Completed tasks (archived)
│   ├── 00-name.md     # Older tasks: single file
│   └── 10-name/       # Newer tasks: folder with plan files
└── {NN}-{name}/       # Active task folders
    ├── 01-task.md     # Problem statement / requirements
    ├── 02-design.md   # Design decisions (optional)
    └── 03-plan.md     # Implementation plan
```

## Numbering

Task folders use two-digit sequential numbers: `{NN}-{descriptive-name}/`

**Finding the next number:** Check BOTH locations (completed tasks move to `_done/`):
```
Glob pattern: _tasks/[0-9][0-9]-*
Glob pattern: _tasks/_done/[0-9][0-9]-*
```
Extract the highest number across BOTH and increment by 1.

## File Naming Inside Task Folders

Use numbered prefixes for reading order:

| File | Purpose |
|------|---------|
| `01-task.md` | Problem statement, requirements, scope |
| `02-design.md` | Design exploration, approach decisions |
| `03-plan.md` | Step-by-step implementation plan |

Additional files (research, POC results, reviews) use higher numbers: `04-research.md`, `05-poc-results.md`, etc.

## Status Icons

| Icon | Meaning |
|------|---------|
| `📋` | Planning |
| `🟡` | In Progress |
| `✅` | Complete |
| `❌` | Blocked / On Hold |

## Workflow

1. Create task folder with `01-task.md` (or use `/task-plan` skill)
2. Add to `index.md` under Active Tasks
3. Design and plan (`02-design.md`, `03-plan.md`)
4. **Commit planning docs before coding** — preserves design rationale in git
5. Implement
6. On completion: move folder to `_done/`, update `index.md`

## Tech Debt

Items in `_TECH_DEBT/` track persistent issues that aren't urgent enough for a task folder.

- When a tech debt item gets prioritized, create a task folder and link: `**Source:** _TECH_DEBT/03-issue-name.md`
- When resolved, update the tech debt file status to `✅ Resolved` with the task/commit that fixed it

## CRITICAL

**Always update `index.md`** when:
- Creating a new task folder → add to Active Tasks
- Completing a task → move to Completed Tasks
- Adding tech debt → add to Tech Debt section
