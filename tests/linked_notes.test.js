const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

assert.match(html, /id="taskLinkedNotes"/, "task edit modal should include a linked notes selector");
assert.match(html, /id="taskLinkedNotesList"/, "task edit modal should show currently linked notes");
assert.match(app, /const taskLinkedNotes\s*=\s*document\.getElementById\("taskLinkedNotes"\)/, "app should bind the linked notes selector");
assert.match(app, /function getSelectedLinkedNoteIds\(/, "app should collect multiple selected note ids from the selector");
assert.match(app, /linked_notes:\s*sanitizeLinkedNoteIds\(t\.linked_notes, notes\)/, "import normalization should preserve valid linked_notes ids");
assert.match(app, /linked_notes:\s*getSelectedLinkedNoteIds\(\)/, "task save should persist selected linked note ids");
assert.match(app, /renderLinkedNotes\(t\)/, "opening a task should render linked notes choices");
assert.match(app, /linkedNotesBadge/, "task cards should show a linked notes count badge");

console.log("linked_notes feature checks passed");
