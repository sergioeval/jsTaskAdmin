# jsTasksAdmin
## Run
```bash
docker compose up --build
```
Open http://localhost:8080

## Test
```bash
node tests/linked_notes.test.js
```

## Architecture
- Login uses user number (integer >= 1) as workspace key
- Data stored in localStorage per-project (schema v4)
- Export/Import via UI buttons for backup/restore

## Files
- `app.js`: Single ~25k-line file with all logic
- `Dockerfile`: Nginx serving static files
- `index.html`: Login + SPA UI

## Task Editor Sections
- Colored left borders: Linked notes (purple), Checklist (teal), Comments (amber)
- Linked notes uses dropdown selector + pills display