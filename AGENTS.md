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
- ES modules: `app.js` imports from `js/` modules
- Login uses user number (integer >= 1) as workspace key
- Data stored in localStorage per-project (schema v4)
- Export/Import via UI buttons for backup/restore

## Files
- `app.js`: Main entry point (~2.3k lines)
- `js/storage.js`: Data layer, localStorage, migrations (~320 lines)
- `js/tasks.js`: Task business logic (~14 lines)
- `js/notes.js`: Notes/tags business logic (~36 lines)
- `js/mindmaps.js`: Mind map business logic (~53 lines)
- `js/ui-tasks.js`: Task UI bindings (~47 lines)
- `js/ui-notes.js`: Notes UI bindings (~37 lines)
- `js/ui-mindmaps.js`: Mind map UI bindings (~59 lines)
- `js/ui-handlers.js`: Event handlers factory (~40 lines)
- `index.html`: Login + SPA UI
- `styles.css`: CSS styling
- `Dockerfile`: Nginx serving static files

## Task Editor Sections
- Colored left borders: Linked notes (purple), Checklist (teal), Comments (amber)
- Linked notes uses dropdown selector + pills display