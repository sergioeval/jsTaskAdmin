export const STORAGE = {
  sessionKey: "session:userNumber",
  legacyWorkspaceKey: (u) => `workspace:user:${u}`,
  prefix: (u) => `u:${u}:`,
  schemaKey: (u) => `u:${u}:schema`,
  projectsIndexKey: (u) => `u:${u}:projects`,
  projectKey: (u, projectId) => `u:${u}:project:${projectId}`,
  projectTasksKey: (u, projectId) => `u:${u}:tasks:${projectId}`,
  projectNotesKey: (u, projectId) => `u:${u}:notes:${projectId}`,
  projectMindMapsKey: (u, projectId) => `u:${u}:mindmaps:${projectId}`,
};

export const STATUSES = ["backlog", "todo", "in_progress", "blocked", "done"];
export const MIND_NODE_W = 132;
export const MIND_NODE_H = 52;
export const MIND_DRAG_THRESHOLD_PX = 6;
export const MIND_DRAG_THRESHOLD_SQ = MIND_DRAG_THRESHOLD_PX * MIND_DRAG_THRESHOLD_PX;
export const WORKSPACE_SCHEMA_VERSION = 4;

export function uuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function sanitizeUserNumber(raw) {
  const n = Number(String(raw || "").trim());
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  if (n < 1) return null;
  return String(n);
}

export function nowIso() {
  return new Date().toISOString();
}

export function clampPriority(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 5;
  const int = Math.round(n);
  if (int < 1) return 1;
  if (int > 10) return 10;
  return int;
}

export function defaultProject(name = "Default") {
  return { id: uuid(), name, createdAt: nowIso(), updatedAt: nowIso(), tasks: [] };
}

function safeParseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function sanitizeLinkedNoteIds(raw, notes = null) {
  const validNoteIds = Array.isArray(notes)
    ? new Set(notes.filter((n) => n && typeof n === "object").map((n) => String(n.id || "").trim()).filter(Boolean))
    : null;
  const seen = new Set();
  const ids = [];
  for (const item of Array.isArray(raw) ? raw : []) {
    const id = String(item || "").trim();
    if (!id || seen.has(id)) continue;
    if (validNoteIds && !validNoteIds.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

export function sanitizeLinkedMapIds(raw, maps = null) {
  const validMapIds = Array.isArray(maps)
    ? new Set(maps.filter((m) => m && typeof m === "object").map((m) => String(m.id || "").trim()).filter(Boolean))
    : null;
  const seen = new Set();
  const ids = [];
  for (const item of Array.isArray(raw) ? raw : []) {
    const id = String(item || "").trim();
    if (!id || seen.has(id)) continue;
    if (validMapIds && !validMapIds.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

function getUserSchemaVersion(userNumber) {
  const v = localStorage.getItem(STORAGE.schemaKey(userNumber));
  return v ? Number(v) : null;
}

function setUserSchemaVersion(userNumber, v) {
  localStorage.setItem(STORAGE.schemaKey(userNumber), String(v));
}

function listProjectIds(userNumber) {
  const parsed = safeParseJson(localStorage.getItem(STORAGE.projectsIndexKey(userNumber)));
  return Array.isArray(parsed) ? parsed : [];
}

function saveProjectIds(userNumber, ids) {
  localStorage.setItem(STORAGE.projectsIndexKey(userNumber), JSON.stringify(ids));
}

function loadProject(userNumber, projectId) {
  const parsed = safeParseJson(localStorage.getItem(STORAGE.projectKey(userNumber, projectId)));
  if (!parsed || typeof parsed !== "object") return null;
  return { id: String(parsed.id || projectId), name: String(parsed.name || "Project"), createdAt: parsed.createdAt || nowIso(), updatedAt: parsed.updatedAt || nowIso() };
}

function saveProjectMeta(userNumber, project) {
  localStorage.setItem(STORAGE.projectKey(userNumber, project.id), JSON.stringify({ id: project.id, name: project.name, createdAt: project.createdAt, updatedAt: project.updatedAt }));
}

function loadProjectTasks(userNumber, projectId) {
  const parsed = safeParseJson(localStorage.getItem(STORAGE.projectTasksKey(userNumber, projectId)));
  return (Array.isArray(parsed) ? parsed : []).filter((t) => t && typeof t === "object").map((t) => ({
    id: String(t.id || uuid()),
    title: String(t.title || "").trim() || "Untitled",
    status: STATUSES.includes(t.status) ? t.status : "backlog",
    priority: clampPriority(t.priority),
    linked_notes: sanitizeLinkedNoteIds(t.linked_notes),
    linked_maps: sanitizeLinkedMapIds(t.linked_maps),
    checklist: Array.isArray(t.checklist) ? t.checklist.filter((c) => c && typeof c === "object").map((c) => ({ id: String(c.id || uuid()), text: String(c.text || "").trim(), done: Boolean(c.done), createdAt: c.createdAt || nowIso(), updatedAt: c.updatedAt || nowIso() })).filter((c) => c.text.length > 0) : [],
    comments: Array.isArray(t.comments) ? t.comments.filter((c) => c && typeof c === "object").map((c) => ({ id: String(c.id || uuid()), text: String(c.text || "").trim(), createdAt: c.createdAt || nowIso(), updatedAt: c.updatedAt || nowIso() })).filter((c) => c.text.length > 0) : [],
    createdAt: t.createdAt || nowIso(),
    updatedAt: t.updatedAt || nowIso(),
  }));
}

function saveProjectTasks(userNumber, projectId, tasks) {
  localStorage.setItem(STORAGE.projectTasksKey(userNumber, projectId), JSON.stringify(tasks));
}

function loadProjectNotes(userNumber, projectId) {
  const parsed = safeParseJson(localStorage.getItem(STORAGE.projectNotesKey(userNumber, projectId)));
  return (Array.isArray(parsed) ? parsed : []).filter((n) => n && typeof n === "object").map((n) => ({
    id: String(n.id || uuid()),
    title: String(n.title || "").trim() || "Untitled",
    body: String(n.body || ""),
    tags: Array.isArray(n.tags) ? n.tags.map((t) => String(t || "").trim()).filter((t) => t.length > 0) : [],
    createdAt: n.createdAt || nowIso(),
    updatedAt: n.updatedAt || nowIso(),
  }));
}

function saveProjectNotes(userNumber, projectId, notes) {
  localStorage.setItem(STORAGE.projectNotesKey(userNumber, projectId), JSON.stringify(notes));
}

function clampMindCoord(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(Math.max(0, Math.min(4000, n)));
}

export function sanitizeMindMap(mm) {
  const id = String(mm?.id || uuid());
  const name = String(mm?.name || "Map").trim() || "Map";
  let nodes = Array.isArray(mm?.nodes) ? mm.nodes : [];
  nodes = nodes.filter((n) => n && typeof n === "object").map((n) => ({
    id: String(n.id || uuid()),
    label: String(n.label || "").trim().slice(0, 200) || "Node",
    x: clampMindCoord(n.x),
    y: clampMindCoord(n.y),
    parentId: n.parentId ? String(n.parentId) : null,
    edgeLabel: n.parentId ? String(n.edgeLabel ?? n.linkLabel ?? "").trim().slice(0, 120) : "",
    description: String(n.description ?? n.desc ?? "").trim().slice(0, 5000),
  }));
  const idSet = new Set(nodes.map((n) => n.id));
  for (const n of nodes) if (n.parentId && !idSet.has(n.parentId)) n.parentId = null;
  if (nodes.length === 0) nodes.push({ id: uuid(), label: "Central", x: 480, y: 260, parentId: null });
  if (!nodes.some((n) => n.parentId === null)) nodes[0].parentId = null;
  return { id, name, nodes, createdAt: mm?.createdAt || nowIso(), updatedAt: mm?.updatedAt || nowIso() };
}

export function defaultMindMap(name) {
  return sanitizeMindMap({ id: uuid(), name: String(name || "").trim() || "Map", createdAt: nowIso(), updatedAt: nowIso(), nodes: [{ id: uuid(), label: "Central", x: 480, y: 260, parentId: null }] });
}

function loadProjectMindMaps(userNumber, projectId) {
  const parsed = safeParseJson(localStorage.getItem(STORAGE.projectMindMapsKey(userNumber, projectId)));
  return (Array.isArray(parsed) ? parsed : []).filter((m) => m && typeof m === "object").map((m) => sanitizeMindMap(m));
}

function saveProjectMindMaps(userNumber, projectId, mindMaps) {
  localStorage.setItem(STORAGE.projectMindMapsKey(userNumber, projectId), JSON.stringify(mindMaps));
}

export function ensureDefaultStorage(userNumber) {
  const existingSchema = getUserSchemaVersion(userNumber);
  if (!existingSchema || existingSchema < WORKSPACE_SCHEMA_VERSION) setUserSchemaVersion(userNumber, WORKSPACE_SCHEMA_VERSION);
  const ids = listProjectIds(userNumber);
  if (ids.length > 0) return;
  const p = defaultProject("Default");
  saveProjectIds(userNumber, [p.id]);
  saveProjectMeta(userNumber, p);
  saveProjectTasks(userNumber, p.id, []);
  saveProjectNotes(userNumber, p.id, []);
  saveProjectMindMaps(userNumber, p.id, []);
}

export function buildWorkspaceSnapshot(userNumber) {
  ensureDefaultStorage(userNumber);
  const projects = [];
  for (const id of listProjectIds(userNumber)) {
    const p = loadProject(userNumber, id);
    if (!p) continue;
    projects.push({ ...p, tasks: loadProjectTasks(userNumber, id), notes: loadProjectNotes(userNumber, id), mindMaps: loadProjectMindMaps(userNumber, id) });
  }
  if (projects.length === 0) {
    const p = defaultProject("Default");
    saveProjectIds(userNumber, [p.id]);
    saveProjectMeta(userNumber, p);
    saveProjectTasks(userNumber, p.id, []);
    saveProjectNotes(userNumber, p.id, []);
    saveProjectMindMaps(userNumber, p.id, []);
    return buildWorkspaceSnapshot(userNumber);
  }
  return { schemaVersion: WORKSPACE_SCHEMA_VERSION, userNumber, createdAt: projects.reduce((min, p) => (p.createdAt < min ? p.createdAt : min), projects[0].createdAt), updatedAt: nowIso(), projects };
}

function clearUserStorage(userNumber) {
  const prefix = STORAGE.prefix(userNumber);
  const toDelete = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) toDelete.push(k);
  }
  for (const k of toDelete) localStorage.removeItem(k);
  localStorage.removeItem(STORAGE.legacyWorkspaceKey(userNumber));
}

export function importWorkspaceSnapshot(userNumber, snapshot) {
  const ws = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) ? snapshot : null;
  if (!ws) throw new Error("Invalid JSON");
  if (String(ws.userNumber) !== String(userNumber)) throw new Error("That JSON belongs to another user");

  let projects = [];
  if (Array.isArray(ws.projects)) projects = ws.projects;
  else if (Array.isArray(ws.items)) {
    projects = [{ ...defaultProject("Default"), tasks: ws.items.map((it) => ({ id: it.id || uuid(), title: String(it.text || "").trim() || "Untitled", status: "backlog", createdAt: it.createdAt || nowIso(), updatedAt: nowIso() })) }];
  }
  if (projects.length === 0) projects = [defaultProject("Default")];

  const cleanProjects = projects.filter((p) => p && typeof p === "object").map((p) => {
    const projectId = String(p.id || uuid());
    const notes = Array.isArray(p.notes) ? p.notes : [];
    const mindMapsRaw = Array.isArray(p.mindMaps) ? p.mindMaps : [];
    return {
      id: projectId,
      name: String(p.name || "Project").trim() || "Project",
      createdAt: p.createdAt || nowIso(),
      updatedAt: nowIso(),
      tasks: (Array.isArray(p.tasks) ? p.tasks : []).filter((t) => t && typeof t === "object").map((t) => ({
        id: String(t.id || uuid()),
        title: String(t.title || t.text || "").trim() || "Untitled",
        status: STATUSES.includes(t.status) ? t.status : "backlog",
        priority: clampPriority(t.priority),
        linked_notes: sanitizeLinkedNoteIds(t.linked_notes, notes),
        linked_maps: sanitizeLinkedMapIds(t.linked_maps, mindMapsRaw),
        checklist: Array.isArray(t.checklist) ? t.checklist.filter((c) => c && typeof c === "object").map((c) => ({ id: String(c.id || uuid()), text: String(c.text || "").trim(), done: Boolean(c.done), createdAt: c.createdAt || nowIso(), updatedAt: nowIso() })).filter((c) => c.text.length > 0) : [],
        comments: Array.isArray(t.comments) ? t.comments.filter((c) => c && typeof c === "object").map((c) => ({ id: String(c.id || uuid()), text: String(c.text || "").trim(), createdAt: c.createdAt || nowIso(), updatedAt: nowIso() })).filter((c) => c.text.length > 0) : [],
        createdAt: t.createdAt || nowIso(), updatedAt: nowIso(),
      })),
      notes: notes.filter((n) => n && typeof n === "object").map((n) => ({ id: String(n.id || uuid()), title: String(n.title || "").trim() || "Untitled", body: String(n.body || ""), tags: Array.isArray(n.tags) ? n.tags.map((t) => String(t || "").trim()).filter((t) => t.length > 0) : [], createdAt: n.createdAt || nowIso(), updatedAt: nowIso() })),
      mindMaps: mindMapsRaw.filter((m) => m && typeof m === "object").map((m) => sanitizeMindMap(m)),
    };
  });

  clearUserStorage(userNumber);
  setUserSchemaVersion(userNumber, WORKSPACE_SCHEMA_VERSION);
  saveProjectIds(userNumber, cleanProjects.map((p) => p.id));
  for (const p of cleanProjects) {
    saveProjectMeta(userNumber, p);
    saveProjectTasks(userNumber, p.id, p.tasks);
    saveProjectNotes(userNumber, p.id, p.notes || []);
    saveProjectMindMaps(userNumber, p.id, p.mindMaps || []);
  }
}

export function migrateLegacyBlobIfPresent(userNumber) {
  const raw = localStorage.getItem(STORAGE.legacyWorkspaceKey(userNumber));
  if (!raw) return;
  const parsed = safeParseJson(raw);
  if (!parsed || typeof parsed !== "object") {
    localStorage.removeItem(STORAGE.legacyWorkspaceKey(userNumber));
    return;
  }
  try {
    importWorkspaceSnapshot(userNumber, { ...parsed, userNumber });
  } finally {
    localStorage.removeItem(STORAGE.legacyWorkspaceKey(userNumber));
  }
}

export function saveProject(userNumberOrWorkspace, project = null) {
  if (project) {
    saveProjectMeta(userNumberOrWorkspace, project);
    saveProjectTasks(userNumberOrWorkspace, project.id, project.tasks || []);
    saveProjectNotes(userNumberOrWorkspace, project.id, project.notes || []);
    saveProjectMindMaps(userNumberOrWorkspace, project.id, project.mindMaps || []);
    return;
  }
  const workspace = userNumberOrWorkspace;
  for (const p of workspace.projects || []) {
    saveProjectMeta(workspace.userNumber, p);
    saveProjectTasks(workspace.userNumber, p.id, p.tasks || []);
    saveProjectNotes(workspace.userNumber, p.id, p.notes || []);
    saveProjectMindMaps(workspace.userNumber, p.id, p.mindMaps || []);
  }
  saveProjectIds(workspace.userNumber, (workspace.projects || []).map((p) => p.id));
}
