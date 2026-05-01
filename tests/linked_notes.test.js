const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

assert.match(html, /id="taskLinkedNotes"/, "task edit modal should include a linked notes selector");
assert.match(html, /id="taskLinkedNotesList"/, "task edit modal should show currently linked notes");
assert.match(app, /const taskLinkedNotes\s*=\s*document\.getElementById\("taskLinkedNotes"\)/, "app should bind the linked notes selector");
assert.match(app, /function getSelectedLinkedNoteIds\(/, "app should collect multiple selected note ids from the selector");
assert.match(app, /linked_notes:\s*sanitizeLinkedNoteIds\(t\.linked_notes, notes\)/, "import normalization should preserve valid linked_notes ids");
assert.match(app, /linked_notes:\s*getSelectedLinkedNoteIds\(\)/, "task save should persist selected linked note ids");
assert.match(app, /renderLinkedNotes\(t\)/, "opening a task should render linked notes choices");
assert.match(app, /linkedNotesBadge/, "task cards should show a linked notes count badge");
assert.match(app, /function openLinkedNoteEditor\(noteId\)/, "linked notes should open through a task-scoped note editor");
assert.match(app, /item\.addEventListener\("click", \(\) => openLinkedNoteEditor\(n\.id\)\)/, "linked note pills should open the task-scoped note editor");
const openLinkedNoteEditorBody = app.match(/function openLinkedNoteEditor\(noteId\) \{([\s\S]*?)\n\}/)?.[1] || "";
assert.doesNotMatch(openLinkedNoteEditorBody, /setProjectTab\("notes"\)/, "linked note editor should not switch away from the task tab");
assert.match(app, /noteOpenedFromTask\s*=\s*true/, "app should track when the note modal was opened from a task");
assert.match(app, /modalNote\.classList\.toggle\("modalFront", Boolean\(open && noteOpenedFromTask\)\)/, "note modal should be promoted in front of the task modal");
assert.match(app, /renderLinkedNotes\(refreshedTask\)/, "saving a linked note should refresh the task linked-note preview while keeping the task open");
assert.match(html, /id="modalNote"[^>]*class="[^"]*modal[^"]*"/, "note editor modal should remain available as an overlay");
assert.match(css, /\.modal\.modalFront\s*\{[\s\S]*?z-index:\s*120;/, "front note modal should stack above the task modal");

assert.match(html, /id="taskLinkedMaps"/, "task edit modal should include a linked maps selector");
assert.match(html, /id="taskLinkedMapsList"/, "task edit modal should show currently linked maps");
assert.match(app, /const taskLinkedMaps\s*=\s*document\.getElementById\("taskLinkedMaps"\)/, "app should bind the linked maps selector");
assert.match(app, /function getSelectedLinkedMapIds\(/, "app should collect multiple selected map ids from the selector");
assert.match(app, /linked_maps:\s*sanitizeLinkedMapIds\(t\.linked_maps, mindMapsRaw\)/, "import normalization should preserve valid linked_maps ids");
assert.match(app, /linked_maps:\s*getSelectedLinkedMapIds\(\)/, "task save should persist selected linked map ids");
assert.match(app, /renderLinkedMaps\(t\)/, "opening a task should render linked maps choices");
assert.match(app, /linkedMapsBadge/, "task cards should show a linked maps count badge");
assert.match(app, /function openLinkedMapEditor\(mapId\)/, "linked maps should open through a task-scoped map editor");
assert.match(app, /item\.addEventListener\("click", \(\) => openLinkedMapEditor\(m\.id\)\)/, "linked map pills should open the task-scoped map editor");
assert.match(app, /linked_maps: sanitizeLinkedMapIds\(t\.linked_maps\)\.filter\(\(mapId\) => mapId !== id\)/, "map deletion should remove IDs from tasks linked_maps");

console.log("linked_notes feature checks passed");
