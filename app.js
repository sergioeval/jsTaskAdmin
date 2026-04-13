const loginView = document.getElementById("view-login");
const appView = document.getElementById("view-app");

const loginForm = document.getElementById("loginForm");
const userNumberInput = document.getElementById("userNumber");

const currentUserEl = document.getElementById("currentUser");
const logoutBtn = document.getElementById("logoutBtn");

const newProjectBtn = document.getElementById("newProjectBtn");
const renameProjectBtn = document.getElementById("renameProjectBtn");
const deleteProjectBtn = document.getElementById("deleteProjectBtn");

const pageProjects = document.getElementById("page-projects");
const pageProject = document.getElementById("page-project");
const projectListEl = document.getElementById("projectList");
const backToProjectsBtn = document.getElementById("backToProjectsBtn");
const projectNameEl = document.getElementById("projectName");

const openBacklogBtn = document.getElementById("openBacklogBtn");
const openDoneBtn = document.getElementById("openDoneBtn");
const modalBacklog = document.getElementById("modalBacklog");
const modalDone = document.getElementById("modalDone");
const closeBacklogBtn = document.getElementById("closeBacklogBtn");
const closeDoneBtn = document.getElementById("closeDoneBtn");

const modalTask = document.getElementById("modalTask");
const closeTaskBtn = document.getElementById("closeTaskBtn");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");
const taskEditForm = document.getElementById("taskEditForm");
const taskEditTitle = document.getElementById("taskEditTitle");
const taskEditPriority = document.getElementById("taskEditPriority");
const taskEditStatus = document.getElementById("taskEditStatus");
const deleteTaskBtn = document.getElementById("deleteTaskBtn");
const checklistList = document.getElementById("checklistList");
const newChecklistText = document.getElementById("newChecklistText");
const addChecklistBtn = document.getElementById("addChecklistBtn");
const commentsList = document.getElementById("commentsList");
const newCommentText = document.getElementById("newCommentText");
const addCommentBtn = document.getElementById("addCommentBtn");

const taskForm = document.getElementById("taskForm");
const taskTitleInput = document.getElementById("taskTitle");
const taskPrioritySelect = document.getElementById("taskPriority");
const taskStatusSelect = document.getElementById("taskStatus");

const tabTasksBtn = document.getElementById("tabTasksBtn");
const tabNotesBtn = document.getElementById("tabNotesBtn");
const tabMindMapsBtn = document.getElementById("tabMindMapsBtn");
const tabTasks = document.getElementById("tabTasks");
const tabNotes = document.getElementById("tabNotes");
const tabMindMaps = document.getElementById("tabMindMaps");

const newNoteBtn = document.getElementById("newNoteBtn");
const modalNote = document.getElementById("modalNote");
const closeNoteBtn = document.getElementById("closeNoteBtn");
const deleteNoteBtn = document.getElementById("deleteNoteBtn");
const noteModalTitle = document.getElementById("noteModalTitle");
const notesTagFilter = document.getElementById("notesTagFilter");

const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteBody = document.getElementById("noteBody");
const noteTags = document.getElementById("noteTags");
const noteTagsPicker = document.getElementById("noteTagsPicker");
const noteCancelBtn = document.getElementById("noteCancelBtn");
const noteSaveBtn = document.getElementById("noteSaveBtn");
const notesList = document.getElementById("notesList");

const newMindMapBtn = document.getElementById("newMindMapBtn");
const mindMapSelect = document.getElementById("mindMapSelect");
const mindMapEditorSection = document.getElementById("mindMapEditorSection");
const mindMapNameInput = document.getElementById("mindMapNameInput");
const mindMapSaveNameBtn = document.getElementById("mindMapSaveNameBtn");
const mindMapDeleteMapBtn = document.getElementById("mindMapDeleteMapBtn");
const mindMapNodeLabelInput = document.getElementById("mindMapNodeLabelInput");
const mindMapApplyLabelBtn = document.getElementById("mindMapApplyLabelBtn");
const mindMapNodeDescInput = document.getElementById("mindMapNodeDescInput");
const mindMapApplyDescBtn = document.getElementById("mindMapApplyDescBtn");
const mindMapEdgeLabelInput = document.getElementById("mindMapEdgeLabelInput");
const mindMapApplyEdgeBtn = document.getElementById("mindMapApplyEdgeBtn");
const mindMapAddChildBtn = document.getElementById("mindMapAddChildBtn");
const mindMapDeleteNodeBtn = document.getElementById("mindMapDeleteNodeBtn");
const mindMapInner = document.getElementById("mindMapInner");
const mindMapWorld = document.getElementById("mindMapWorld");
const mindMapSvg = document.getElementById("mindMapSvg");
const mindMapNodesLayer = document.getElementById("mindMapNodesLayer");

const modalMindMapNode = document.getElementById("modalMindMapNode");
const mindMapQuickForm = document.getElementById("mindMapQuickForm");
const mindMapQuickLabelInput = document.getElementById("mindMapQuickLabel");
const mindMapQuickDescInput = document.getElementById("mindMapQuickDesc");
const mindMapQuickEdgeInput = document.getElementById("mindMapQuickEdge");
const mindMapQuickParentSelect = document.getElementById("mindMapQuickParent");
const closeMindMapQuickBtn = document.getElementById("closeMindMapQuickBtn");
const mindMapQuickCancelBtn = document.getElementById("mindMapQuickCancelBtn");
const mindMapParentSelect = document.getElementById("mindMapParentSelect");
const mindMapApplyParentBtn = document.getElementById("mindMapApplyParentBtn");

const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
const importBtn = document.getElementById("importBtn");

const counts = {
  backlog: document.getElementById("count-backlog"),
  todo: document.getElementById("count-todo"),
  in_progress: document.getElementById("count-in_progress"),
  blocked: document.getElementById("count-blocked"),
  done: document.getElementById("count-done"),
};

const columns = {
  backlog: document.getElementById("col-backlog"),
  todo: document.getElementById("col-todo"),
  in_progress: document.getElementById("col-in_progress"),
  blocked: document.getElementById("col-blocked"),
  done: document.getElementById("col-done"),
};

const toastEl = document.getElementById("toast");

function uuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function setView(isLoggedIn) {
  loginView.classList.toggle("hidden", isLoggedIn);
  appView.classList.toggle("hidden", !isLoggedIn);
}

function setPage(page) {
  pageProjects.classList.toggle("hidden", page !== "projects");
  pageProject.classList.toggle("hidden", page !== "project");
  document.body.classList.toggle("projectMode", page === "project");
}

function setModal(which, open) {
  const el = which === "backlog" ? modalBacklog : modalDone;
  el.classList.toggle("hidden", !open);
}

function setTaskModal(open) {
  modalTask.classList.toggle("hidden", !open);
}

function setNoteModal(open) {
  modalNote.classList.toggle("hidden", !open);
}

// localStorage stores strings only. Best practice here is to normalize the data:
// keep smaller records per key (projects list, each project, each project's tasks).
const STORAGE = {
  sessionKey: "session:userNumber",
  legacyWorkspaceKey: (u) => `workspace:user:${u}`, // previous single-blob format
  prefix: (u) => `u:${u}:`,
  schemaKey: (u) => `u:${u}:schema`,
  projectsIndexKey: (u) => `u:${u}:projects`,
  projectKey: (u, projectId) => `u:${u}:project:${projectId}`,
  projectTasksKey: (u, projectId) => `u:${u}:tasks:${projectId}`,
  projectNotesKey: (u, projectId) => `u:${u}:notes:${projectId}`,
  projectMindMapsKey: (u, projectId) => `u:${u}:mindmaps:${projectId}`,
};

function sanitizeUserNumber(raw) {
  const n = Number(String(raw || "").trim());
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  if (n < 1) return null;
  return String(n);
}

function nowIso() {
  return new Date().toISOString();
}

function clampPriority(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 5;
  const int = Math.round(n);
  if (int < 1) return 1;
  if (int > 10) return 10;
  return int;
}

function defaultProject(name = "Default") {
  return {
    id: uuid(),
    name,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    tasks: [],
  };
}

const STATUSES = ["backlog", "todo", "in_progress", "blocked", "done"];

function safeParseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getUserSchemaVersion(userNumber) {
  const v = localStorage.getItem(STORAGE.schemaKey(userNumber));
  return v ? Number(v) : null;
}

function setUserSchemaVersion(userNumber, v) {
  localStorage.setItem(STORAGE.schemaKey(userNumber), String(v));
}

function listProjectIds(userNumber) {
  const raw = localStorage.getItem(STORAGE.projectsIndexKey(userNumber));
  const parsed = safeParseJson(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function saveProjectIds(userNumber, ids) {
  localStorage.setItem(STORAGE.projectsIndexKey(userNumber), JSON.stringify(ids));
}

function loadProject(userNumber, projectId) {
  const raw = localStorage.getItem(STORAGE.projectKey(userNumber, projectId));
  const parsed = safeParseJson(raw);
  if (!parsed || typeof parsed !== "object") return null;
  return {
    id: String(parsed.id || projectId),
    name: String(parsed.name || "Proyecto"),
    createdAt: parsed.createdAt || nowIso(),
    updatedAt: parsed.updatedAt || nowIso(),
  };
}

function saveProject(userNumber, project) {
  localStorage.setItem(
    STORAGE.projectKey(userNumber, project.id),
    JSON.stringify({
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    })
  );
}

function loadProjectTasks(userNumber, projectId) {
  const raw = localStorage.getItem(STORAGE.projectTasksKey(userNumber, projectId));
  const parsed = safeParseJson(raw);
  const tasks = Array.isArray(parsed) ? parsed : [];
  return tasks
    .filter((t) => t && typeof t === "object")
    .map((t) => ({
      id: String(t.id || uuid()),
      title: String(t.title || "").trim() || "Sin título",
      status: STATUSES.includes(t.status) ? t.status : "backlog",
      priority: clampPriority(t.priority),
      checklist: Array.isArray(t.checklist)
        ? t.checklist
            .filter((c) => c && typeof c === "object")
            .map((c) => ({
              id: String(c.id || uuid()),
              text: String(c.text || "").trim(),
              done: Boolean(c.done),
              createdAt: c.createdAt || nowIso(),
              updatedAt: c.updatedAt || nowIso(),
            }))
            .filter((c) => c.text.length > 0)
        : [],
      comments: Array.isArray(t.comments)
        ? t.comments
            .filter((c) => c && typeof c === "object")
            .map((c) => ({
              id: String(c.id || uuid()),
              text: String(c.text || "").trim(),
              createdAt: c.createdAt || nowIso(),
              updatedAt: c.updatedAt || nowIso(),
            }))
            .filter((c) => c.text.length > 0)
        : [],
      createdAt: t.createdAt || nowIso(),
      updatedAt: t.updatedAt || nowIso(),
    }));
}

function saveProjectTasks(userNumber, projectId, tasks) {
  localStorage.setItem(STORAGE.projectTasksKey(userNumber, projectId), JSON.stringify(tasks));
}

function loadProjectNotes(userNumber, projectId) {
  const raw = localStorage.getItem(STORAGE.projectNotesKey(userNumber, projectId));
  const parsed = safeParseJson(raw);
  const notes = Array.isArray(parsed) ? parsed : [];
  return notes
    .filter((n) => n && typeof n === "object")
    .map((n) => ({
      id: String(n.id || uuid()),
      title: String(n.title || "").trim() || "Sin título",
      body: String(n.body || ""),
      tags: Array.isArray(n.tags)
        ? n.tags.map((t) => String(t || "").trim()).filter((t) => t.length > 0)
        : [],
      createdAt: n.createdAt || nowIso(),
      updatedAt: n.updatedAt || nowIso(),
    }));
}

function saveProjectNotes(userNumber, projectId, notes) {
  localStorage.setItem(STORAGE.projectNotesKey(userNumber, projectId), JSON.stringify(notes));
}

const MIND_NODE_W = 132;
const MIND_NODE_H = 52;
const WORKSPACE_SCHEMA_VERSION = 4;

function clampMindCoord(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(Math.max(0, Math.min(4000, n)));
}

function sanitizeMindMap(mm) {
  const id = String(mm?.id || uuid());
  const name = String(mm?.name || "Mapa").trim() || "Mapa";
  let nodes = Array.isArray(mm?.nodes) ? mm.nodes : [];
  nodes = nodes
    .filter((n) => n && typeof n === "object")
    .map((n) => {
      const parentId = n.parentId ? String(n.parentId) : null;
      const edgeLabel = parentId
        ? String(n.edgeLabel ?? n.linkLabel ?? "").trim().slice(0, 120)
        : "";
      const description = String(n.description ?? n.desc ?? "").trim().slice(0, 5000);
      return {
        id: String(n.id || uuid()),
        label: String(n.label || "").trim().slice(0, 200) || "Nodo",
        x: clampMindCoord(n.x),
        y: clampMindCoord(n.y),
        parentId,
        edgeLabel,
        description,
      };
    });
  const idSet = new Set(nodes.map((n) => n.id));
  for (const n of nodes) {
    if (n.parentId && !idSet.has(n.parentId)) n.parentId = null;
  }
  if (nodes.length === 0) {
    const rid = uuid();
    nodes.push({ id: rid, label: "Central", x: 480, y: 260, parentId: null });
  }
  if (!nodes.some((n) => n.parentId === null)) {
    nodes[0].parentId = null;
  }
  return {
    id,
    name,
    nodes,
    createdAt: mm?.createdAt || nowIso(),
    updatedAt: mm?.updatedAt || nowIso(),
  };
}

function defaultMindMap(name) {
  const rootId = uuid();
  return sanitizeMindMap({
    id: uuid(),
    name: String(name || "").trim() || "Mapa",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    nodes: [{ id: rootId, label: "Central", x: 480, y: 260, parentId: null }],
  });
}

function loadProjectMindMaps(userNumber, projectId) {
  const raw = localStorage.getItem(STORAGE.projectMindMapsKey(userNumber, projectId));
  const parsed = safeParseJson(raw);
  const maps = Array.isArray(parsed) ? parsed : [];
  return maps.filter((m) => m && typeof m === "object").map((m) => sanitizeMindMap(m));
}

function saveProjectMindMaps(userNumber, projectId, mindMaps) {
  localStorage.setItem(STORAGE.projectMindMapsKey(userNumber, projectId), JSON.stringify(mindMaps));
}

function ensureDefaultStorage(userNumber) {
  // Ensure schema and at least one project exist.
  const existingSchema = getUserSchemaVersion(userNumber);
  if (!existingSchema) setUserSchemaVersion(userNumber, WORKSPACE_SCHEMA_VERSION);
  else if (existingSchema < WORKSPACE_SCHEMA_VERSION) {
    setUserSchemaVersion(userNumber, WORKSPACE_SCHEMA_VERSION);
  }

  const ids = listProjectIds(userNumber);
  if (ids.length > 0) return;

  const p = defaultProject("Default");
  saveProjectIds(userNumber, [p.id]);
  saveProject(userNumber, p);
  saveProjectTasks(userNumber, p.id, []);
  saveProjectNotes(userNumber, p.id, []);
  saveProjectMindMaps(userNumber, p.id, []);
}

function buildWorkspaceSnapshot(userNumber) {
  ensureDefaultStorage(userNumber);
  const projectIds = listProjectIds(userNumber);
  const projects = [];
  for (const id of projectIds) {
    const p = loadProject(userNumber, id);
    if (!p) continue;
    const tasks = loadProjectTasks(userNumber, id);
    const notes = loadProjectNotes(userNumber, id);
    const mindMaps = loadProjectMindMaps(userNumber, id);
    projects.push({ ...p, tasks, notes, mindMaps });
  }
  if (projects.length === 0) {
    // repair if index exists but projects missing
    const p = defaultProject("Default");
    saveProjectIds(userNumber, [p.id]);
    saveProject(userNumber, p);
    saveProjectTasks(userNumber, p.id, []);
    saveProjectNotes(userNumber, p.id, []);
    saveProjectMindMaps(userNumber, p.id, []);
    return buildWorkspaceSnapshot(userNumber);
  }

  return {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    userNumber,
    createdAt: projects.reduce((min, p) => (p.createdAt < min ? p.createdAt : min), projects[0].createdAt),
    updatedAt: nowIso(),
    projects,
  };
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

function importWorkspaceSnapshot(userNumber, snapshot) {
  // Accept legacy formats and normalize into schemaVersion 4 storage (tasks, notes, mind maps per project).
  const ws = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) ? snapshot : null;
  if (!ws) throw new Error("JSON inválido");
  if (String(ws.userNumber) !== String(userNumber)) throw new Error("Ese JSON es de otro usuario");

  // Convert formats:
  // - v1: { items: [...] }
  // - v2: { projects: [{tasks:...}] }
  // - v3: same as v2 but normalized storage
  let projects = [];
  if (Array.isArray(ws.projects)) {
    projects = ws.projects;
  } else if (Array.isArray(ws.items)) {
    projects = [
      {
        ...defaultProject("Default"),
        tasks: ws.items.map((it) => ({
          id: it.id || uuid(),
          title: String(it.text || "").trim() || "Sin título",
          status: "backlog",
          createdAt: it.createdAt || nowIso(),
          updatedAt: nowIso(),
        })),
      },
    ];
  }

  if (projects.length === 0) projects = [defaultProject("Default")];

  // Validate and sanitize.
  const cleanProjects = projects
    .filter((p) => p && typeof p === "object")
    .map((p) => {
      const projectId = String(p.id || uuid());
      const name = String(p.name || "Proyecto").trim() || "Proyecto";
      const createdAt = p.createdAt || nowIso();
      const updatedAt = nowIso();
      const tasks = Array.isArray(p.tasks) ? p.tasks : [];
      const notes = Array.isArray(p.notes) ? p.notes : [];
      const mindMapsRaw = Array.isArray(p.mindMaps) ? p.mindMaps : [];
      const cleanTasks = tasks
        .filter((t) => t && typeof t === "object")
        .map((t) => ({
          id: String(t.id || uuid()),
          title: String(t.title || t.text || "").trim() || "Sin título",
          status: STATUSES.includes(t.status) ? t.status : "backlog",
          priority: clampPriority(t.priority),
          checklist: Array.isArray(t.checklist)
            ? t.checklist
                .filter((c) => c && typeof c === "object")
                .map((c) => ({
                  id: String(c.id || uuid()),
                  text: String(c.text || "").trim(),
                  done: Boolean(c.done),
                  createdAt: c.createdAt || nowIso(),
                  updatedAt: nowIso(),
                }))
                .filter((c) => c.text.length > 0)
            : [],
          comments: Array.isArray(t.comments)
            ? t.comments
                .filter((c) => c && typeof c === "object")
                .map((c) => ({
                  id: String(c.id || uuid()),
                  text: String(c.text || "").trim(),
                  createdAt: c.createdAt || nowIso(),
                  updatedAt: nowIso(),
                }))
                .filter((c) => c.text.length > 0)
            : [],
          createdAt: t.createdAt || nowIso(),
          updatedAt: nowIso(),
        }));

      const cleanNotes = notes
        .filter((n) => n && typeof n === "object")
        .map((n) => ({
          id: String(n.id || uuid()),
          title: String(n.title || "").trim() || "Sin título",
          body: String(n.body || ""),
          tags: Array.isArray(n.tags)
            ? n.tags.map((t) => String(t || "").trim()).filter((t) => t.length > 0)
            : [],
          createdAt: n.createdAt || nowIso(),
          updatedAt: nowIso(),
        }));

      const cleanMindMaps = mindMapsRaw
        .filter((m) => m && typeof m === "object")
        .map((m) => sanitizeMindMap(m));

      return {
        id: projectId,
        name,
        createdAt,
        updatedAt,
        tasks: cleanTasks,
        notes: cleanNotes,
        mindMaps: cleanMindMaps,
      };
    });

  clearUserStorage(userNumber);
  setUserSchemaVersion(userNumber, WORKSPACE_SCHEMA_VERSION);
  saveProjectIds(
    userNumber,
    cleanProjects.map((p) => p.id)
  );
  for (const p of cleanProjects) {
    saveProject(userNumber, p);
    saveProjectTasks(userNumber, p.id, p.tasks);
    saveProjectNotes(userNumber, p.id, p.notes || []);
    saveProjectMindMaps(userNumber, p.id, p.mindMaps || []);
  }
}

function migrateLegacyBlobIfPresent(userNumber) {
  // Previous approach stored a single JSON blob in STORAGE.legacyWorkspaceKey(userNumber)
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

let currentWorkspace = null;
let currentProjectId = null;
let currentUserNumber = null;
let currentProjectTab = "tasks";
let editingNoteId = null;
let currentNotesTag = "";

let editingMindMapId = null;
let mindMapWorkingCopy = null;
let mindMapSelectedNodeId = null;
let mindMapDrag = null;
let mindMapDragListenersAttached = false;
/** After creating a map, select it once `renderMindMaps` rebuilds the dropdown. */
let pendingMindMapSelectId = null;
/** Node id being edited in the double-click popup (if open). */
let mindMapQuickEditNodeId = null;

function attachMindMapDragListeners() {
  if (mindMapDragListenersAttached) return;
  document.addEventListener("mousemove", onMindMapMouseMove);
  document.addEventListener("mouseup", onMindMapMouseUp);
  mindMapDragListenersAttached = true;
}

function detachMindMapDragListeners() {
  if (!mindMapDragListenersAttached) return;
  document.removeEventListener("mousemove", onMindMapMouseMove);
  document.removeEventListener("mouseup", onMindMapMouseUp);
  mindMapDragListenersAttached = false;
  mindMapDrag = null;
}

function setMindMapEditorVisible(show) {
  if (mindMapEditorSection) mindMapEditorSection.classList.toggle("hidden", !show);
}

function setProjectTab(which) {
  if (which !== "mindmaps") detachMindMapDragListeners();

  if (which === "notes") currentProjectTab = "notes";
  else if (which === "mindmaps") currentProjectTab = "mindmaps";
  else currentProjectTab = "tasks";

  tabTasksBtn.classList.toggle("active", currentProjectTab === "tasks");
  tabNotesBtn.classList.toggle("active", currentProjectTab === "notes");
  tabMindMapsBtn.classList.toggle("active", currentProjectTab === "mindmaps");
  tabTasksBtn.setAttribute("aria-selected", String(currentProjectTab === "tasks"));
  tabNotesBtn.setAttribute("aria-selected", String(currentProjectTab === "notes"));
  tabMindMapsBtn.setAttribute("aria-selected", String(currentProjectTab === "mindmaps"));
  tabTasks.classList.toggle("hidden", currentProjectTab !== "tasks");
  tabNotes.classList.toggle("hidden", currentProjectTab !== "notes");
  tabMindMaps.classList.toggle("hidden", currentProjectTab !== "mindmaps");

  if (which === "mindmaps" && editingMindMapId && mindMapWorkingCopy) {
    attachMindMapDragListeners();
    renderMindMapCanvas();
  }
}

function normalizeTag(t) {
  return String(t || "").trim().toLowerCase();
}

function setNotesTagFilter(tag) {
  currentNotesTag = String(tag || "");
  if (notesTagFilter) notesTagFilter.value = currentNotesTag;
  if (currentWorkspace) renderNotes(currentWorkspace);
}

function setWorkspace(ws) {
  currentWorkspace = ws;
  if (!currentProjectId || !ws.projects.some((p) => p.id === currentProjectId)) {
    currentProjectId = ws.projects[0]?.id || null;
  }
  renderProjectsPage(ws);
  renderProjectPage(ws);
}

function getCurrentProject(ws) {
  return ws.projects.find((p) => p.id === currentProjectId) || ws.projects[0];
}

function countTasksByStatus(tasks) {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const t of tasks) counts[t.status] = (counts[t.status] || 0) + 1;
  return counts;
}

function renderProjectsPage(ws) {
  projectListEl.innerHTML = "";

  for (const p of ws.projects) {
    const card = document.createElement("div");
    card.className = "projectCard";

    const header = document.createElement("div");
    header.className = "projectCardHeader";

    const left = document.createElement("div");
    const name = document.createElement("p");
    name.className = "projectName";
    name.textContent = p.name;
    const meta = document.createElement("p");
    meta.className = "projectMeta";
    const c = countTasksByStatus(p.tasks);
    meta.textContent = `Backlog ${c.backlog} · Todo ${c.todo} · In-Progress ${c.in_progress} · Blocked ${c.blocked} · Done ${c.done}`;
    left.appendChild(name);
    left.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "projectActions";

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "btn";
    openBtn.textContent = "Entrar";
    openBtn.addEventListener("click", () => goProject(p.id));

    const renameBtn = document.createElement("button");
    renameBtn.type = "button";
    renameBtn.className = "btnSecondary";
    renameBtn.textContent = "Renombrar";
    renameBtn.addEventListener("click", () => renameProject(p.id));

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btnSecondary";
    delBtn.textContent = "Eliminar";
    delBtn.addEventListener("click", () => deleteProject(p.id));

    actions.appendChild(openBtn);
    actions.appendChild(renameBtn);
    actions.appendChild(delBtn);

    header.appendChild(left);
    header.appendChild(actions);
    card.appendChild(header);
    projectListEl.appendChild(card);
  }
}

function checklistProgress(task) {
  const items = Array.isArray(task?.checklist) ? task.checklist : [];
  const total = items.length;
  const done = items.reduce((acc, x) => acc + (x?.done ? 1 : 0), 0);
  return { done, total };
}

function taskCard(task) {
  const el = document.createElement("div");
  el.className = "task";
  el.draggable = true;
  el.dataset.taskId = task.id;
  const prio = clampPriority(task.priority);
  el.style.setProperty("--prio", String(prio));

  const title = document.createElement("p");
  title.className = "taskTitle";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "taskMeta";

  const small = document.createElement("p");
  small.className = "taskSmall";
  small.textContent = new Date(task.updatedAt || task.createdAt).toLocaleString();

  const actions = document.createElement("div");
  actions.className = "taskActions";

  const badge = document.createElement("span");
  badge.className = "priorityBadge";
  badge.textContent = String(prio);
  badge.title = `Prioridad ${prio} (1 = más importante)`;

  const { done, total } = checklistProgress(task);
  const checklistBadge =
    total > 0
      ? (() => {
          const b = document.createElement("span");
          b.className = "checklistBadge";
          b.textContent = `✓ ${done}/${total}`;
          b.title = "Progreso del checklist";
          return b;
        })()
      : null;

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "iconBtn";
  editBtn.textContent = "Editar";
  editBtn.addEventListener("click", () => openTaskEditor(task.id));

  actions.appendChild(badge);
  if (checklistBadge) actions.appendChild(checklistBadge);
  actions.appendChild(editBtn);

  meta.appendChild(small);
  meta.appendChild(actions);

  el.appendChild(title);
  el.appendChild(meta);

  el.addEventListener("dragstart", (e) => {
    e.dataTransfer?.setData("text/plain", task.id);
    e.dataTransfer?.setData("application/x-task-id", task.id);
    e.dataTransfer && (e.dataTransfer.effectAllowed = "move");
  });

  return el;
}

let editingTaskId = null;

function getEditingTask() {
  if (!currentWorkspace || !editingTaskId) return null;
  const p = getCurrentProject(currentWorkspace);
  return p?.tasks.find((x) => x.id === editingTaskId) || null;
}

function renderComments(task) {
  commentsList.innerHTML = "";

  const comments = Array.isArray(task.comments) ? task.comments : [];
  if (comments.length === 0) {
    const empty = document.createElement("p");
    empty.className = "taskSmall";
    empty.textContent = "Sin comentarios.";
    commentsList.appendChild(empty);
    return;
  }

  for (const c of comments) {
    const item = document.createElement("div");
    item.className = "commentItem";

    const text = document.createElement("p");
    text.className = "commentText";
    text.textContent = c.text;

    const meta = document.createElement("div");
    meta.className = "commentMeta";

    const small = document.createElement("p");
    small.className = "commentSmall";
    small.textContent = new Date(c.updatedAt || c.createdAt).toLocaleString();

    const actions = document.createElement("div");
    actions.className = "taskActions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "iconBtn";
    editBtn.textContent = "Editar";
    editBtn.addEventListener("click", () => {
      // Use the textarea editor so comments can be multiline.
      newCommentText.value = c.text;
      newCommentText.focus();
      // stash editing id on the element to avoid extra globals
      newCommentText.dataset.editingCommentId = c.id;
      addCommentBtn.textContent = "Guardar comentario";
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "iconBtn";
    delBtn.textContent = "Borrar";
    delBtn.addEventListener("click", () => {
      const ok = confirm("Borrar comentario?");
      if (!ok) return;

      updateProject((proj) => ({
        ...proj,
        updatedAt: nowIso(),
        tasks: proj.tasks.map((t) => {
          if (t.id !== editingTaskId) return t;
          const existing = Array.isArray(t.comments) ? t.comments : [];
          return { ...t, updatedAt: nowIso(), comments: existing.filter((x) => x.id !== c.id) };
        }),
      }));

      const refreshed = getEditingTask();
      if (refreshed) renderComments(refreshed);
      toast("Comentario borrado.");
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    meta.appendChild(small);
    meta.appendChild(actions);

    item.appendChild(text);
    item.appendChild(meta);
    commentsList.appendChild(item);
  }
}

function renderChecklist(task) {
  checklistList.innerHTML = "";
  const items = Array.isArray(task.checklist) ? task.checklist : [];

  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "taskSmall";
    empty.textContent = "Sin actividades.";
    checklistList.appendChild(empty);
    return;
  }

  for (const item of items) {
    const wrap = document.createElement("div");
    wrap.className = "checkItem";

    const row = document.createElement("div");
    row.className = "checkRow";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "checkBox";
    cb.checked = Boolean(item.done);
    cb.addEventListener("change", () => {
      updateProject((proj) => ({
        ...proj,
        updatedAt: nowIso(),
        tasks: proj.tasks.map((t) => {
          if (t.id !== editingTaskId) return t;
          const existing = Array.isArray(t.checklist) ? t.checklist : [];
          return {
            ...t,
            updatedAt: nowIso(),
            checklist: existing.map((x) =>
              x.id === item.id ? { ...x, done: cb.checked, updatedAt: nowIso() } : x
            ),
          };
        }),
      }));
      const refreshed = getEditingTask();
      if (refreshed) renderChecklist(refreshed);
      toast("Checklist actualizada.");
    });

    const text = document.createElement("p");
    text.className = `checkText${item.done ? " done" : ""}`;
    text.textContent = item.text;

    const actions = document.createElement("div");
    actions.className = "taskActions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "iconBtn";
    editBtn.textContent = "Editar";
    editBtn.addEventListener("click", () => {
      const next = prompt("Editar actividad:", item.text);
      const trimmed = String(next || "").trim();
      if (!trimmed) return;
      updateProject((proj) => ({
        ...proj,
        updatedAt: nowIso(),
        tasks: proj.tasks.map((t) => {
          if (t.id !== editingTaskId) return t;
          const existing = Array.isArray(t.checklist) ? t.checklist : [];
          return {
            ...t,
            updatedAt: nowIso(),
            checklist: existing.map((x) =>
              x.id === item.id ? { ...x, text: trimmed, updatedAt: nowIso() } : x
            ),
          };
        }),
      }));
      const refreshed = getEditingTask();
      if (refreshed) renderChecklist(refreshed);
      toast("Actividad actualizada.");
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "iconBtn";
    delBtn.textContent = "Borrar";
    delBtn.addEventListener("click", () => {
      const ok = confirm("Borrar actividad?");
      if (!ok) return;
      updateProject((proj) => ({
        ...proj,
        updatedAt: nowIso(),
        tasks: proj.tasks.map((t) => {
          if (t.id !== editingTaskId) return t;
          const existing = Array.isArray(t.checklist) ? t.checklist : [];
          return { ...t, updatedAt: nowIso(), checklist: existing.filter((x) => x.id !== item.id) };
        }),
      }));
      const refreshed = getEditingTask();
      if (refreshed) renderChecklist(refreshed);
      toast("Actividad borrada.");
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    row.appendChild(cb);
    row.appendChild(text);
    row.appendChild(actions);
    wrap.appendChild(row);
    checklistList.appendChild(wrap);
  }
}

function openTaskEditor(taskId) {
  if (!currentWorkspace) return;
  const p = getCurrentProject(currentWorkspace);
  const t = p?.tasks.find((x) => x.id === taskId);
  if (!t) return;

  editingTaskId = taskId;
  taskEditTitle.value = t.title;
  taskEditStatus.value = t.status;
  if (taskEditPriority) taskEditPriority.value = String(clampPriority(t.priority));
  newChecklistText.value = "";
  renderChecklist(t);
  newCommentText.value = "";
  renderComments(t);
  setTaskModal(true);
  taskEditTitle.focus();
}

function closeTaskEditor() {
  editingTaskId = null;
  taskEditTitle.value = "";
  taskEditStatus.value = "todo";
  if (taskEditPriority) taskEditPriority.value = "5";
  newChecklistText.value = "";
  checklistList.innerHTML = "";
  newCommentText.value = "";
  delete newCommentText.dataset.editingCommentId;
  addCommentBtn.textContent = "Agregar";
  commentsList.innerHTML = "";
  setTaskModal(false);
}

function renderBoard(ws) {
  const project = getCurrentProject(ws);
  if (!project) return;

  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, []]));
  for (const t of project.tasks) byStatus[t.status].push(t);

  function ts(task) {
    const v = Date.parse(task.updatedAt || task.createdAt || "");
    return Number.isFinite(v) ? v : 0;
  }

  const PRIORITY_GROUP_STATUSES = new Set(["todo", "in_progress", "blocked"]);

  for (const s of STATUSES) {
    if (PRIORITY_GROUP_STATUSES.has(s)) {
      byStatus[s].sort((a, b) => {
        const pa = clampPriority(a.priority);
        const pb = clampPriority(b.priority);
        if (pa !== pb) return pa - pb; // 1 (más importante) primero
        return ts(b) - ts(a);
      });
    } else {
      byStatus[s].sort((a, b) => ts(b) - ts(a));
    }
  }

  for (const s of STATUSES) {
    columns[s].innerHTML = "";
    counts[s].textContent = String(byStatus[s].length);

    if (PRIORITY_GROUP_STATUSES.has(s)) {
      let lastPrio = null;
      for (const t of byStatus[s]) {
        const prio = clampPriority(t.priority);
        if (lastPrio === null || prio !== lastPrio) {
          const divider = document.createElement("div");
          divider.className = "priorityDivider";
          divider.dataset.priority = String(prio);

          const label = document.createElement("span");
          label.className = "priorityDividerLabel";
          label.textContent = `Prioridad ${prio}`;
          divider.appendChild(label);

          columns[s].appendChild(divider);
          lastPrio = prio;
        }
        columns[s].appendChild(taskCard(t));
      }
      continue;
    }

    for (const t of byStatus[s]) columns[s].appendChild(taskCard(t));
  }
}

function renderProjectPage(ws) {
  const p = getCurrentProject(ws);
  projectNameEl.textContent = p?.name || "Proyecto";
  renderBoard(ws);
  renderNotes(ws);
  renderMindMaps(ws);
  setProjectTab(currentProjectTab);
}

function parseTags(raw) {
  const tags = String(raw || "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
  // unique, preserve order, case-insensitive uniqueness
  const seen = new Set();
  const out = [];
  for (const t of tags) {
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function listProjectTags(project) {
  const notes = Array.isArray(project?.notes) ? project.notes : [];
  const tagSet = new Map(); // normalized -> display
  for (const n of notes) {
    const tags = Array.isArray(n.tags) ? n.tags : [];
    for (const t of tags) {
      const norm = normalizeTag(t);
      const display = String(t || "").trim();
      if (!norm || !display) continue;
      if (!tagSet.has(norm)) tagSet.set(norm, display);
    }
  }
  return [...tagSet.entries()]
    .map(([norm, display]) => ({ norm, display }))
    .sort((a, b) => a.display.localeCompare(b.display));
}

function toggleTagInInput(tagDisplay) {
  const current = parseTags(noteTags?.value);
  const norm = normalizeTag(tagDisplay);
  const existsIdx = current.findIndex((t) => normalizeTag(t) === norm);
  if (existsIdx >= 0) current.splice(existsIdx, 1);
  else current.push(tagDisplay);
  if (noteTags) noteTags.value = current.join(", ");
}

function renderNoteTagsPicker(project) {
  if (!noteTagsPicker) return;
  const all = listProjectTags(project);
  noteTagsPicker.innerHTML = "";
  if (all.length === 0) return;

  const selected = new Set(parseTags(noteTags?.value).map((t) => normalizeTag(t)));

  for (const t of all) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `tag tagPick${selected.has(t.norm) ? " isSelected" : ""}`;
    btn.textContent = t.display;
    btn.title = selected.has(t.norm) ? "Quitar tag" : "Agregar tag";
    btn.addEventListener("click", () => {
      toggleTagInInput(t.display);
      renderNoteTagsPicker(project);
      noteTags?.focus();
    });
    noteTagsPicker.appendChild(btn);
  }
}

function resetNoteForm() {
  editingNoteId = null;
  noteTitle.value = "";
  noteBody.value = "";
  noteTags.value = "";
  if (noteTags) noteTags.oninput = null;
  if (noteTagsPicker) noteTagsPicker.innerHTML = "";
  noteSaveBtn.textContent = "Guardar";
  noteModalTitle.textContent = "Nueva nota";
  deleteNoteBtn.disabled = true;
}

function openNoteEditor(noteId) {
  if (!currentWorkspace) return;
  const p = getCurrentProject(currentWorkspace);
  const notes = Array.isArray(p.notes) ? p.notes : [];
  const n = noteId ? notes.find((x) => x.id === noteId) : null;

  if (n) {
    editingNoteId = n.id;
    noteTitle.value = n.title;
    noteBody.value = n.body || "";
    noteTags.value = Array.isArray(n.tags) ? n.tags.join(", ") : "";
    noteSaveBtn.textContent = "Guardar";
    noteModalTitle.textContent = "Editar nota";
    deleteNoteBtn.disabled = false;
  } else {
    resetNoteForm();
  }

  if (noteTags) {
    noteTags.oninput = () => renderNoteTagsPicker(p);
  }
  renderNoteTagsPicker(p);

  setProjectTab("notes");
  setNoteModal(true);
  noteTitle.focus();
}

function closeNoteEditor() {
  resetNoteForm();
  setNoteModal(false);
}

function renderNotes(ws) {
  if (!ws) return;
  const p = getCurrentProject(ws);
  if (!p) return;
  const notes = Array.isArray(p.notes) ? p.notes : [];
  notesList.innerHTML = "";

  // Build tag options (from all notes in this project).
  if (notesTagFilter) {
    const prev = currentNotesTag;
    const tagSet = new Map(); // normalized -> display
    for (const n of notes) {
      const tags = Array.isArray(n.tags) ? n.tags : [];
      for (const t of tags) {
        const norm = normalizeTag(t);
        const display = String(t || "").trim();
        if (!norm || !display) continue;
        if (!tagSet.has(norm)) tagSet.set(norm, display);
      }
    }
    const options = [{ value: "", label: "Todos" }];
    for (const [value, label] of [...tagSet.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
      options.push({ value, label });
    }
    notesTagFilter.innerHTML = "";
    for (const opt of options) {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.label;
      notesTagFilter.appendChild(o);
    }
    // keep selection if still valid, else reset to Todos
    notesTagFilter.value = options.some((o) => o.value === prev) ? prev : "";
    currentNotesTag = notesTagFilter.value;
  }

  const filtered =
    currentNotesTag && currentNotesTag.length > 0
      ? notes.filter((n) => {
          const tags = Array.isArray(n.tags) ? n.tags : [];
          return tags.some((t) => normalizeTag(t) === currentNotesTag);
        })
      : notes;

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = currentNotesTag ? "No hay notas con ese tag." : "Sin notas todavía.";
    notesList.appendChild(empty);
    return;
  }

  const sorted = [...filtered].sort((a, b) => {
    const ta = Date.parse(a.updatedAt || a.createdAt || "") || 0;
    const tb = Date.parse(b.updatedAt || b.createdAt || "") || 0;
    return tb - ta;
  });

  for (const n of sorted) {
    const card = document.createElement("div");
    card.className = "noteCard";

    const top = document.createElement("div");
    top.className = "row wrap";

    const left = document.createElement("div");
    left.className = "grow";
    const title = document.createElement("p");
    title.className = "noteTitle";
    title.textContent = n.title;
    const meta = document.createElement("p");
    meta.className = "taskSmall";
    meta.textContent = new Date(n.updatedAt || n.createdAt).toLocaleString();
    left.appendChild(title);
    left.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "taskActions";
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "iconBtn";
    editBtn.textContent = "Editar";
    editBtn.addEventListener("click", () => openNoteEditor(n.id));

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "iconBtn";
    delBtn.textContent = "Borrar";
    delBtn.addEventListener("click", () => {
      const ok = confirm("Borrar nota?");
      if (!ok) return;
      updateProjectWithNotes((proj) => ({
        ...proj,
        notes: (Array.isArray(proj.notes) ? proj.notes : []).filter((x) => x.id !== n.id),
      }));
      if (editingNoteId === n.id) closeNoteEditor();
      toast("Nota borrada.");
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    top.appendChild(left);
    top.appendChild(actions);

    const body = document.createElement("p");
    body.className = "noteBody";
    body.textContent = String(n.body || "");

    card.appendChild(top);
    if (String(n.body || "").trim().length > 0) card.appendChild(body);

    const tags = Array.isArray(n.tags) ? n.tags : [];
    if (tags.length > 0) {
      const tagRow = document.createElement("div");
      tagRow.className = "tagRow";
      for (const t of tags) {
        const chip = document.createElement("span");
        chip.className = "tag";
        chip.textContent = t;
        tagRow.appendChild(chip);
      }
      card.appendChild(tagRow);
    }

    notesList.appendChild(card);
  }
}

function mindMapDescendantIds(rootId, nodes) {
  const childrenByParent = new Map();
  for (const n of nodes) {
    if (!n.parentId) continue;
    if (!childrenByParent.has(n.parentId)) childrenByParent.set(n.parentId, []);
    childrenByParent.get(n.parentId).push(n.id);
  }
  const out = [];
  const stack = [...(childrenByParent.get(rootId) || [])];
  while (stack.length) {
    const id = stack.pop();
    out.push(id);
    const ch = childrenByParent.get(id) || [];
    for (const c of ch) stack.push(c);
  }
  return out;
}

/** Parent candidates: any node except self and own descendants (avoids cycles). */
function mindMapValidParentIds(nodeId, nodes) {
  const forbidden = new Set([nodeId, ...mindMapDescendantIds(nodeId, nodes)]);
  return nodes.map((n) => n.id).filter((id) => !forbidden.has(id));
}

function fillMindMapParentSelect(selectEl, node) {
  if (!selectEl || !mindMapWorkingCopy || !node) return;
  const { nodes } = mindMapWorkingCopy;
  selectEl.innerHTML = "";

  if (!node.parentId) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Raíz del mapa (sin padre)";
    selectEl.appendChild(opt);
    selectEl.value = "";
    selectEl.disabled = true;
    return;
  }

  selectEl.disabled = false;
  const validIds = mindMapValidParentIds(node.id, nodes);
  const sorted = [...validIds].sort((a, b) => {
    const la = String(nodes.find((x) => x.id === a)?.label || a);
    const lb = String(nodes.find((x) => x.id === b)?.label || b);
    return la.localeCompare(lb, "es");
  });

  for (const id of sorted) {
    const pn = nodes.find((x) => x.id === id);
    const o = document.createElement("option");
    o.value = id;
    o.textContent = pn?.label || id;
    if (id === node.parentId) o.selected = true;
    selectEl.appendChild(o);
  }

  if (node.parentId && sorted.includes(node.parentId)) {
    selectEl.value = node.parentId;
  } else if (sorted.length > 0) {
    selectEl.value = sorted[0];
  }
}

function persistMindMapWorkingCopy() {
  if (!currentUserNumber || !mindMapWorkingCopy) return;
  const saved = sanitizeMindMap({
    ...mindMapWorkingCopy,
    nodes: mindMapWorkingCopy.nodes.map((n) => ({ ...n })),
  });
  mindMapWorkingCopy = saved;
  updateProjectWithMindMaps((proj) => {
    const list = Array.isArray(proj.mindMaps) ? proj.mindMaps : [];
    return {
      ...proj,
      updatedAt: nowIso(),
      mindMaps: list.map((m) => (m.id === saved.id ? saved : m)),
    };
  });
}

function syncMindMapEdgeLabelField() {
  if (!mindMapEdgeLabelInput) return;
  const n = mindMapWorkingCopy?.nodes.find((x) => x.id === mindMapSelectedNodeId);
  if (!n || !n.parentId) {
    mindMapEdgeLabelInput.value = "";
    mindMapEdgeLabelInput.disabled = true;
    mindMapEdgeLabelInput.placeholder = "Solo nodos con padre (seleccioná un hijo)";
    return;
  }
  mindMapEdgeLabelInput.disabled = false;
  mindMapEdgeLabelInput.placeholder = "Texto en la conexión (padre → este nodo)…";
  mindMapEdgeLabelInput.value = String(n.edgeLabel || "");
}

function syncMindMapNodeDescField() {
  if (!mindMapNodeDescInput) return;
  const n = mindMapWorkingCopy?.nodes.find((x) => x.id === mindMapSelectedNodeId);
  mindMapNodeDescInput.value = n ? String(n.description || "") : "";
}

function syncMindMapParentField() {
  if (!mindMapParentSelect || !mindMapWorkingCopy) return;
  const n = mindMapSelectedNodeId
    ? mindMapWorkingCopy.nodes.find((x) => x.id === mindMapSelectedNodeId)
    : null;
  if (!n) {
    mindMapParentSelect.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "— Seleccioná un nodo —";
    mindMapParentSelect.appendChild(opt);
    mindMapParentSelect.disabled = true;
    return;
  }
  fillMindMapParentSelect(mindMapParentSelect, n);
}

function syncMindMapNodeLabelField() {
  if (!mindMapNodeLabelInput) return;
  const n = mindMapWorkingCopy?.nodes.find((x) => x.id === mindMapSelectedNodeId);
  mindMapNodeLabelInput.value = n ? n.label : "";
  syncMindMapNodeDescField();
  syncMindMapEdgeLabelField();
  syncMindMapParentField();
}

function setMindMapNodeQuickModal(open) {
  if (!modalMindMapNode) return;
  modalMindMapNode.classList.toggle("hidden", !open);
}

function syncMindMapQuickEdgeFieldForNode(node) {
  if (!mindMapQuickEdgeInput) return;
  if (!node?.parentId) {
    mindMapQuickEdgeInput.value = "";
    mindMapQuickEdgeInput.disabled = true;
    return;
  }
  mindMapQuickEdgeInput.disabled = false;
  mindMapQuickEdgeInput.value = String(node.edgeLabel || "");
}

function closeMindMapNodeQuickEdit() {
  mindMapQuickEditNodeId = null;
  if (mindMapQuickForm) mindMapQuickForm.reset();
  if (mindMapQuickEdgeInput) {
    mindMapQuickEdgeInput.value = "";
    mindMapQuickEdgeInput.disabled = true;
  }
  if (mindMapQuickParentSelect) {
    mindMapQuickParentSelect.innerHTML = "";
    mindMapQuickParentSelect.disabled = true;
  }
  setMindMapNodeQuickModal(false);
}

function openMindMapNodeQuickEdit(nodeId) {
  if (!mindMapWorkingCopy || !modalMindMapNode) return;
  const node = mindMapWorkingCopy.nodes.find((x) => x.id === nodeId);
  if (!node) return;
  mindMapQuickEditNodeId = nodeId;
  mindMapSelectedNodeId = nodeId;
  syncMindMapNodeLabelField();
  if (mindMapQuickLabelInput) mindMapQuickLabelInput.value = node.label;
  if (mindMapQuickDescInput) mindMapQuickDescInput.value = String(node.description || "");
  syncMindMapQuickEdgeFieldForNode(node);
  fillMindMapParentSelect(mindMapQuickParentSelect, node);
  setMindMapNodeQuickModal(true);
  queueMicrotask(() => mindMapQuickLabelInput?.focus());
}

function getMindMapParentForChild() {
  if (!mindMapWorkingCopy) return null;
  const { nodes } = mindMapWorkingCopy;
  if (mindMapSelectedNodeId) {
    const n = nodes.find((x) => x.id === mindMapSelectedNodeId);
    if (n) return n;
  }
  return nodes.find((x) => x.parentId === null) || nodes[0] || null;
}

/** Place each new sibling offset so nodes do not stack (was mistaken for "overwrite"). */
function mindMapNextChildPosition(parent) {
  if (!mindMapWorkingCopy) return { x: 0, y: 0 };
  const idx = mindMapWorkingCopy.nodes.filter((n) => n.parentId === parent.id).length;
  const gapX = 28;
  const gapY = MIND_NODE_H + 20;
  const row = Math.floor(idx / 5);
  const col = idx % 5;
  return {
    x: clampMindCoord(parent.x + col * gapX - 2 * gapX),
    y: clampMindCoord(parent.y + MIND_NODE_H + 24 + row * gapY),
  };
}

/** Size the canvas to fit all nodes; center view on root (initial) node. World coords unchanged. */
function computeMindMapViewLayout(nodes) {
  if (!nodes.length) {
    return { innerW: 400, innerH: 320, tx: 0, ty: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxR = -Infinity;
  let maxB = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxR = Math.max(maxR, n.x + MIND_NODE_W);
    maxB = Math.max(maxB, n.y + MIND_NODE_H);
  }
  const root = nodes.find((n) => n.parentId === null) || nodes[0];
  const rcx = root.x + MIND_NODE_W / 2;
  const rcy = root.y + MIND_NODE_H / 2;
  const halfW = Math.max(rcx - minX, maxR - rcx, MIND_NODE_W / 2);
  const halfH = Math.max(rcy - minY, maxB - rcy, MIND_NODE_H / 2);
  const margin = 48;
  const innerW = Math.max(280, Math.ceil(2 * halfW + 2 * margin));
  const innerH = Math.max(220, Math.ceil(2 * halfH + 2 * margin));
  const tx = innerW / 2 - rcx;
  const ty = innerH / 2 - rcy;
  return { innerW, innerH, tx, ty };
}

function renderMindMapCanvas() {
  if (!mindMapSvg || !mindMapNodesLayer || !mindMapWorkingCopy) return;
  const ns = "http://www.w3.org/2000/svg";
  const { nodes } = mindMapWorkingCopy;
  const { innerW, innerH, tx, ty } = computeMindMapViewLayout(nodes);
  if (mindMapInner) {
    mindMapInner.style.width = `${innerW}px`;
    mindMapInner.style.height = `${innerH}px`;
  }
  if (mindMapWorld) {
    mindMapWorld.style.transform = `translate(${tx}px, ${ty}px)`;
  }

  mindMapSvg.innerHTML = "";

  for (const n of nodes) {
    if (!n.parentId) continue;
    const p = nodes.find((x) => x.id === n.parentId);
    if (!p) continue;
    const x1 = p.x + MIND_NODE_W / 2;
    const y1 = p.y + MIND_NODE_H;
    const x2 = n.x + MIND_NODE_W / 2;
    const y2 = n.y;
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", String(x1));
    line.setAttribute("y1", String(y1));
    line.setAttribute("x2", String(x2));
    line.setAttribute("y2", String(y2));
    line.setAttribute("stroke", "rgba(255,255,255,0.22)");
    line.setAttribute("stroke-width", "2");
    mindMapSvg.appendChild(line);

    const edgeText = String(n.edgeLabel || "").trim();
    if (edgeText) {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const t = document.createElementNS(ns, "text");
      t.setAttribute("x", String(mx));
      t.setAttribute("y", String(my - 3));
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("dominant-baseline", "middle");
      t.setAttribute("fill", "#d7def6");
      t.setAttribute("font-size", "11");
      t.setAttribute("font-weight", "700");
      t.setAttribute("font-family", "ui-sans-serif, system-ui, sans-serif");
      t.setAttribute("stroke", "#0b1020");
      t.setAttribute("stroke-width", "5");
      t.setAttribute("paint-order", "stroke fill");
      const display = edgeText.length > 48 ? `${edgeText.slice(0, 46)}…` : edgeText;
      t.textContent = display;
      mindMapSvg.appendChild(t);
    }
  }

  mindMapNodesLayer.innerHTML = "";
  for (const n of nodes) {
    const div = document.createElement("div");
    div.className = `mindNode${mindMapSelectedNodeId === n.id ? " isSelected" : ""}`;
    div.style.left = `${n.x}px`;
    div.style.top = `${n.y}px`;
    div.textContent = n.label;
    div.dataset.nodeId = n.id;
    const desc = String(n.description || "").trim();
    if (desc) div.title = desc.length > 240 ? `${desc.slice(0, 238)}…` : desc;
    div.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      mindMapSelectedNodeId = n.id;
      syncMindMapNodeLabelField();
      mindMapDrag = {
        id: n.id,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        nodeStartX: n.x,
        nodeStartY: n.y,
      };
      renderMindMapCanvas();
    });
    div.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    div.addEventListener("dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation();
      mindMapDrag = null;
      openMindMapNodeQuickEdit(n.id);
      renderMindMapCanvas();
    });
    mindMapNodesLayer.appendChild(div);
  }
}

function onMindMapMouseMove(e) {
  if (!mindMapDrag || !mindMapWorkingCopy) return;
  const node = mindMapWorkingCopy.nodes.find((x) => x.id === mindMapDrag.id);
  if (!node) return;
  const dx = e.clientX - mindMapDrag.startMouseX;
  const dy = e.clientY - mindMapDrag.startMouseY;
  node.x = clampMindCoord(mindMapDrag.nodeStartX + dx);
  node.y = clampMindCoord(mindMapDrag.nodeStartY + dy);
  renderMindMapCanvas();
}

function onMindMapMouseUp() {
  if (mindMapDrag) {
    mindMapDrag = null;
    persistMindMapWorkingCopy();
  }
}

function loadMindMapForEditing(mapId) {
  if (!currentWorkspace || !currentUserNumber || !mapId) return;
  const p = getCurrentProject(currentWorkspace);
  const list = Array.isArray(p.mindMaps) ? p.mindMaps : [];
  const m = list.find((x) => x.id === mapId);
  if (!m) {
    unloadMindMapEditor();
    return;
  }

  detachMindMapDragListeners();
  editingMindMapId = mapId;
  mindMapWorkingCopy = sanitizeMindMap(JSON.parse(JSON.stringify(m)));
  mindMapSelectedNodeId =
    mindMapWorkingCopy.nodes.find((n) => n.parentId === null)?.id || mindMapWorkingCopy.nodes[0]?.id || null;
  if (mindMapNameInput) mindMapNameInput.value = mindMapWorkingCopy.name;
  syncMindMapNodeLabelField();
  setMindMapEditorVisible(true);
  renderMindMapCanvas();
  if (currentProjectTab === "mindmaps") attachMindMapDragListeners();
}

function unloadMindMapEditor() {
  closeMindMapNodeQuickEdit();
  detachMindMapDragListeners();
  editingMindMapId = null;
  mindMapWorkingCopy = null;
  mindMapSelectedNodeId = null;
  if (mindMapSvg) mindMapSvg.innerHTML = "";
  if (mindMapNodesLayer) mindMapNodesLayer.innerHTML = "";
  if (mindMapNameInput) mindMapNameInput.value = "";
  if (mindMapNodeLabelInput) mindMapNodeLabelInput.value = "";
  if (mindMapNodeDescInput) mindMapNodeDescInput.value = "";
  if (mindMapInner) {
    mindMapInner.style.width = "";
    mindMapInner.style.height = "";
  }
  if (mindMapWorld) mindMapWorld.style.transform = "";
  if (mindMapParentSelect) {
    mindMapParentSelect.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "— Seleccioná un nodo —";
    mindMapParentSelect.appendChild(opt);
    mindMapParentSelect.disabled = true;
  }
  syncMindMapEdgeLabelField();
  setMindMapEditorVisible(false);
}

function renderMindMaps(ws) {
  if (!mindMapSelect) return;
  if (!ws) return;
  const p = getCurrentProject(ws);
  if (!p) return;
  const maps = Array.isArray(p.mindMaps) ? p.mindMaps : [];
  const sorted = [...maps].sort((a, b) => a.name.localeCompare(b.name, "es"));

  const prevValue = mindMapSelect.value;
  const preferred =
    pendingMindMapSelectId ||
    (prevValue && maps.some((m) => m.id === prevValue) ? prevValue : "") ||
    (editingMindMapId && maps.some((m) => m.id === editingMindMapId) ? editingMindMapId : "") ||
    "";
  pendingMindMapSelectId = null;

  mindMapSelect.innerHTML = "";
  const optEmpty = document.createElement("option");
  optEmpty.value = "";
  optEmpty.textContent = maps.length ? "— Elegí un mapa —" : "Sin mapas (creá uno nuevo)";
  mindMapSelect.appendChild(optEmpty);

  for (const m of sorted) {
    const o = document.createElement("option");
    o.value = m.id;
    const nn = Array.isArray(m.nodes) ? m.nodes.length : 0;
    o.textContent = `${m.name} (${nn} nodos)`;
    mindMapSelect.appendChild(o);
  }

  const keep = preferred && maps.some((m) => m.id === preferred) ? preferred : "";

  mindMapSelect.value = keep || "";

  if (!keep) {
    unloadMindMapEditor();
    return;
  }

  if (editingMindMapId !== keep || !mindMapWorkingCopy) {
    loadMindMapForEditing(keep);
  } else {
    setMindMapEditorVisible(true);
    renderMindMapCanvas();
    if (currentProjectTab === "mindmaps") attachMindMapDragListeners();
  }
}

function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function login(userNumber) {
  localStorage.setItem(STORAGE.sessionKey, userNumber);
  currentUserNumber = userNumber;
  currentUserEl.textContent = userNumber;
  setView(true);
  migrateLegacyBlobIfPresent(userNumber);
  ensureDefaultStorage(userNumber);
  setWorkspace(buildWorkspaceSnapshot(userNumber));
  goProjects();
  toast("Welcome.");
}

function logout() {
  localStorage.removeItem(STORAGE.sessionKey);
  currentUserEl.textContent = "—";
  userNumberInput.value = "";
  taskTitleInput.value = "";
  projectListEl.innerHTML = "";
  importFile.value = "";
  importBtn.disabled = true;
  currentWorkspace = null;
  currentProjectId = null;
  currentUserNumber = null;
  currentProjectTab = "tasks";
  resetNoteForm();
  unloadMindMapEditor();
  setPage("projects");
  setView(false);
  toast("Sesión cerrada.");
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const userNumber = sanitizeUserNumber(userNumberInput.value);
  if (!userNumber) {
    toast("Número inválido.");
    return;
  }
  login(userNumber);
});

logoutBtn.addEventListener("click", () => logout());

newProjectBtn.addEventListener("click", () => {
  if (!currentWorkspace || !currentUserNumber) return;
  const name = prompt("Nombre del proyecto:");
  const trimmed = String(name || "").trim();
  if (!trimmed) return;

  const p = defaultProject(trimmed);
  const ids = listProjectIds(currentUserNumber);
  saveProjectIds(currentUserNumber, [...ids, p.id]);
  saveProject(currentUserNumber, p);
  saveProjectTasks(currentUserNumber, p.id, []);
  saveProjectNotes(currentUserNumber, p.id, []);
  saveProjectMindMaps(currentUserNumber, p.id, []);

  const next = buildWorkspaceSnapshot(currentUserNumber);
  currentProjectId = p.id;
  setWorkspace(next);
  goProject(p.id);
  toast("Proyecto creado.");
});

function renameProject(projectId) {
  if (!currentWorkspace || !currentUserNumber) return;
  const p = currentWorkspace.projects.find((x) => x.id === projectId);
  if (!p) return;
  const name = prompt("Nuevo nombre:", p.name);
  const trimmed = String(name || "").trim();
  if (!trimmed) return;

  saveProject(currentUserNumber, { ...p, name: trimmed, updatedAt: nowIso() });
  setWorkspace(buildWorkspaceSnapshot(currentUserNumber));
  toast("Renombrado.");
}

function deleteProject(projectId) {
  if (!currentWorkspace || !currentUserNumber) return;
  if (currentWorkspace.projects.length <= 1) {
    toast("Debe existir al menos 1 proyecto.");
    return;
  }
  const p = currentWorkspace.projects.find((x) => x.id === projectId);
  if (!p) return;
  const ok = confirm(`Eliminar proyecto "${p.name}"?`);
  if (!ok) return;

  const ids = listProjectIds(currentUserNumber).filter((id) => id !== projectId);
  saveProjectIds(currentUserNumber, ids);
  localStorage.removeItem(STORAGE.projectKey(currentUserNumber, projectId));
  localStorage.removeItem(STORAGE.projectTasksKey(currentUserNumber, projectId));
  localStorage.removeItem(STORAGE.projectNotesKey(currentUserNumber, projectId));
  localStorage.removeItem(STORAGE.projectMindMapsKey(currentUserNumber, projectId));

  const next = buildWorkspaceSnapshot(currentUserNumber);
  if (currentProjectId === projectId) currentProjectId = next.projects[0].id;
  setWorkspace(next);
  goProjects();
  toast("Proyecto eliminado.");
}

renameProjectBtn.addEventListener("click", () => {
  const p = currentWorkspace ? getCurrentProject(currentWorkspace) : null;
  if (!p) return;
  renameProject(p.id);
});

deleteProjectBtn.addEventListener("click", () => {
  const p = currentWorkspace ? getCurrentProject(currentWorkspace) : null;
  if (!p) return;
  deleteProject(p.id);
});

backToProjectsBtn.addEventListener("click", () => goProjects());

function updateProject(projectUpdater) {
  if (!currentWorkspace || !currentUserNumber) return;
  const p = getCurrentProject(currentWorkspace);
  if (!p) return;
  const updated = projectUpdater(p);
  // Persist project meta and tasks separately.
  saveProject(currentUserNumber, { ...updated, updatedAt: nowIso() });
  saveProjectTasks(currentUserNumber, updated.id, updated.tasks);
  // Notes are persisted separately (if present on the updated object).
  if (Array.isArray(updated.notes)) saveProjectNotes(currentUserNumber, updated.id, updated.notes);
  if (Array.isArray(updated.mindMaps)) saveProjectMindMaps(currentUserNumber, updated.id, updated.mindMaps);
  setWorkspace(buildWorkspaceSnapshot(currentUserNumber));
}

function updateProjectWithNotes(projectUpdater) {
  // Convenience wrapper for notes edits.
  if (!currentUserNumber) return;
  updateProject((p) => {
    const notes = Array.isArray(p.notes) ? p.notes : loadProjectNotes(currentUserNumber, p.id);
    return projectUpdater({ ...p, notes });
  });
}

function updateProjectWithMindMaps(projectUpdater) {
  if (!currentUserNumber) return;
  updateProject((p) => {
    const mindMaps = Array.isArray(p.mindMaps) ? p.mindMaps : loadProjectMindMaps(currentUserNumber, p.id);
    return projectUpdater({ ...p, mindMaps });
  });
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentWorkspace) return;
  const title = String(taskTitleInput.value || "").trim();
  if (!title) return;
  const status = STATUSES.includes(taskStatusSelect.value) ? taskStatusSelect.value : "backlog";
  const priority = clampPriority(taskPrioritySelect?.value);

  updateProject((p) => {
    const t = {
      id: uuid(),
      title,
      status,
      priority,
      checklist: [],
      comments: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    return { ...p, updatedAt: nowIso(), tasks: [t, ...p.tasks] };
  });

  taskTitleInput.value = "";
  if (taskPrioritySelect) taskPrioritySelect.value = "5";
  toast("Tarea creada.");
});

function editTask(taskId) {
  // Deprecated in UI (kept for compatibility). Use the modal editor instead.
  openTaskEditor(taskId);
}

function deleteTask(taskId) {
  if (!currentWorkspace) return;
  const ok = confirm("Borrar tarea?");
  if (!ok) return;
  updateProject((proj) => ({
    ...proj,
    updatedAt: nowIso(),
    tasks: proj.tasks.filter((x) => x.id !== taskId),
  }));
  toast("Borrada.");
}

function moveTask(taskId, toStatus) {
  if (!currentWorkspace) return;
  if (!STATUSES.includes(toStatus)) return;
  updateProject((proj) => ({
    ...proj,
    updatedAt: nowIso(),
    tasks: proj.tasks.map((x) =>
      x.id === taskId ? { ...x, status: toStatus, updatedAt: nowIso() } : x
    ),
  }));
}

for (const s of STATUSES) {
  const dz = columns[s];
  dz.addEventListener("dragover", (e) => {
    e.preventDefault();
    dz.classList.add("isOver");
    e.dataTransfer && (e.dataTransfer.dropEffect = "move");
  });
  dz.addEventListener("dragleave", () => dz.classList.remove("isOver"));
  dz.addEventListener("drop", (e) => {
    e.preventDefault();
    dz.classList.remove("isOver");
    const id =
      e.dataTransfer?.getData("application/x-task-id") || e.dataTransfer?.getData("text/plain");
    if (!id) return;
    moveTask(id, s);
    toast("Movida.");
  });
}

function goProjects() {
  setPage("projects");
  setModal("backlog", false);
  setModal("done", false);
  closeTaskEditor();
  unloadMindMapEditor();
}

function goProject(projectId) {
  if (!currentWorkspace) return;
  const exists = currentWorkspace.projects.some((p) => p.id === projectId);
  if (!exists) {
    goProjects();
    return;
  }
  if (currentProjectId !== projectId) unloadMindMapEditor();
  currentProjectId = projectId;
  setPage("project");
  renderProjectPage(currentWorkspace);
}

tabTasksBtn.addEventListener("click", () => setProjectTab("tasks"));
tabNotesBtn.addEventListener("click", () => setProjectTab("notes"));
tabMindMapsBtn.addEventListener("click", () => setProjectTab("mindmaps"));

notesTagFilter.addEventListener("change", () => setNotesTagFilter(notesTagFilter.value));

newNoteBtn.addEventListener("click", () => openNoteEditor(null));
closeNoteBtn.addEventListener("click", () => closeNoteEditor());
noteCancelBtn.addEventListener("click", () => closeNoteEditor());

modalNote.addEventListener("click", (e) => {
  if (e.target === modalNote) closeNoteEditor();
});

noteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentWorkspace || !currentUserNumber) return;
  const title = String(noteTitle.value || "").trim();
  if (!title) return;
  const body = String(noteBody.value || "");
  const tags = parseTags(noteTags.value);

  updateProjectWithNotes((proj) => {
    const existing = Array.isArray(proj.notes) ? proj.notes : [];
    const now = nowIso();
    if (editingNoteId) {
      return {
        ...proj,
        updatedAt: now,
        notes: existing.map((n) =>
          n.id === editingNoteId ? { ...n, title, body, tags, updatedAt: now } : n
        ),
      };
    }
    const note = { id: uuid(), title, body, tags, createdAt: now, updatedAt: now };
    return { ...proj, updatedAt: now, notes: [note, ...existing] };
  });

  toast(editingNoteId ? "Nota guardada." : "Nota creada.");
  closeNoteEditor();
});

deleteNoteBtn.addEventListener("click", () => {
  if (!editingNoteId) return;
  const ok = confirm("Borrar nota?");
  if (!ok) return;
  const id = editingNoteId;
  updateProjectWithNotes((proj) => ({
    ...proj,
    notes: (Array.isArray(proj.notes) ? proj.notes : []).filter((x) => x.id !== id),
  }));
  toast("Nota borrada.");
  closeNoteEditor();
});

openBacklogBtn.addEventListener("click", () => setModal("backlog", true));
openDoneBtn.addEventListener("click", () => setModal("done", true));
closeBacklogBtn.addEventListener("click", () => setModal("backlog", false));
closeDoneBtn.addEventListener("click", () => setModal("done", false));

closeTaskBtn.addEventListener("click", () => closeTaskEditor());
cancelTaskBtn.addEventListener("click", () => closeTaskEditor());

modalTask.addEventListener("click", (e) => {
  if (e.target === modalTask) closeTaskEditor();
});

taskEditForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentWorkspace || !editingTaskId) return;
  const title = String(taskEditTitle.value || "").trim();
  const status = STATUSES.includes(taskEditStatus.value) ? taskEditStatus.value : "backlog";
  const priority = clampPriority(taskEditPriority?.value);
  if (!title) return;

  updateProject((proj) => ({
    ...proj,
    updatedAt: nowIso(),
    tasks: proj.tasks.map((x) =>
      x.id === editingTaskId
        ? {
            ...x,
            title,
            status,
            priority,
            updatedAt: nowIso(),
            checklist: Array.isArray(x.checklist) ? x.checklist : [],
            comments: Array.isArray(x.comments) ? x.comments : [],
          }
        : x
    ),
  }));
  toast("Guardado.");
  closeTaskEditor();
});

addChecklistBtn.addEventListener("click", () => {
  if (!currentWorkspace || !editingTaskId) return;
  const text = String(newChecklistText.value || "").trim();
  if (!text) return;
  const item = { id: uuid(), text, done: false, createdAt: nowIso(), updatedAt: nowIso() };

  updateProject((proj) => ({
    ...proj,
    updatedAt: nowIso(),
    tasks: proj.tasks.map((t) => {
      if (t.id !== editingTaskId) return t;
      const existing = Array.isArray(t.checklist) ? t.checklist : [];
      return { ...t, updatedAt: nowIso(), checklist: [...existing, item] };
    }),
  }));

  newChecklistText.value = "";
  const refreshed = getEditingTask();
  if (refreshed) renderChecklist(refreshed);
  toast("Actividad agregada.");
});

addCommentBtn.addEventListener("click", () => {
  if (!currentWorkspace || !editingTaskId) return;
  const text = String(newCommentText.value || "").trim();
  if (!text) return;
  const editingCommentId = newCommentText.dataset.editingCommentId || null;

  updateProject((proj) => ({
    ...proj,
    updatedAt: nowIso(),
    tasks: proj.tasks.map((t) => {
      if (t.id !== editingTaskId) return t;
      const existing = Array.isArray(t.comments) ? t.comments : [];

      if (editingCommentId) {
        return {
          ...t,
          updatedAt: nowIso(),
          comments: existing.map((c) =>
            c.id === editingCommentId ? { ...c, text, updatedAt: nowIso() } : c
          ),
        };
      }

      const comment = { id: uuid(), text, createdAt: nowIso(), updatedAt: nowIso() };
      return { ...t, updatedAt: nowIso(), comments: [...existing, comment] };
    }),
  }));

  delete newCommentText.dataset.editingCommentId;
  addCommentBtn.textContent = "Agregar";
  newCommentText.value = "";
  const refreshed = getEditingTask();
  if (refreshed) renderComments(refreshed);
  toast(editingCommentId ? "Comentario guardado." : "Comentario agregado.");
});

deleteTaskBtn.addEventListener("click", () => {
  if (!editingTaskId) return;
  deleteTask(editingTaskId);
  closeTaskEditor();
});

modalBacklog.addEventListener("click", (e) => {
  if (e.target === modalBacklog) setModal("backlog", false);
});
modalDone.addEventListener("click", (e) => {
  if (e.target === modalDone) setModal("done", false);
});

window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (modalMindMapNode && !modalMindMapNode.classList.contains("hidden")) {
    closeMindMapNodeQuickEdit();
    return;
  }
  setModal("backlog", false);
  setModal("done", false);
  closeTaskEditor();
  closeNoteEditor();
});

newMindMapBtn.addEventListener("click", () => {
  if (!currentWorkspace || !currentUserNumber) return;
  const name = prompt("Nombre del mapa:");
  const trimmed = String(name || "").trim();
  if (!trimmed) return;
  const map = defaultMindMap(trimmed);
  pendingMindMapSelectId = map.id;
  updateProjectWithMindMaps((proj) => ({
    ...proj,
    updatedAt: nowIso(),
    mindMaps: [map, ...(Array.isArray(proj.mindMaps) ? proj.mindMaps : [])],
  }));
  toast("Mapa creado.");
});

if (mindMapSelect) {
  mindMapSelect.addEventListener("change", () => {
    const id = mindMapSelect.value;
    if (id) loadMindMapForEditing(id);
    else unloadMindMapEditor();
  });
}

mindMapSaveNameBtn.addEventListener("click", () => {
  if (!mindMapWorkingCopy || !mindMapNameInput) return;
  mindMapWorkingCopy.name = String(mindMapNameInput.value || "").trim().slice(0, 140) || "Mapa";
  persistMindMapWorkingCopy();
  toast("Nombre guardado.");
});

mindMapDeleteMapBtn.addEventListener("click", () => {
  const id = editingMindMapId;
  if (!id) return;
  const ok = confirm("Eliminar este mapa mental?");
  if (!ok) return;
  unloadMindMapEditor();
  updateProjectWithMindMaps((proj) => ({
    ...proj,
    mindMaps: (Array.isArray(proj.mindMaps) ? proj.mindMaps : []).filter((m) => m.id !== id),
  }));
  toast("Mapa eliminado.");
});

mindMapApplyLabelBtn.addEventListener("click", () => {
  if (!mindMapWorkingCopy || !mindMapSelectedNodeId) {
    toast("Seleccioná un nodo.");
    return;
  }
  const n = mindMapWorkingCopy.nodes.find((x) => x.id === mindMapSelectedNodeId);
  if (!n) return;
  n.label = String(mindMapNodeLabelInput?.value || "").trim().slice(0, 200) || "Nodo";
  renderMindMapCanvas();
  persistMindMapWorkingCopy();
});

mindMapApplyDescBtn?.addEventListener("click", () => {
  if (!mindMapWorkingCopy || !mindMapSelectedNodeId) {
    toast("Seleccioná un nodo.");
    return;
  }
  const n = mindMapWorkingCopy.nodes.find((x) => x.id === mindMapSelectedNodeId);
  if (!n) return;
  n.description = String(mindMapNodeDescInput?.value || "").trim().slice(0, 5000);
  renderMindMapCanvas();
  persistMindMapWorkingCopy();
  toast("Descripción guardada.");
});

mindMapApplyEdgeBtn.addEventListener("click", () => {
  if (!mindMapWorkingCopy || !mindMapSelectedNodeId) {
    toast("Seleccioná un nodo.");
    return;
  }
  const n = mindMapWorkingCopy.nodes.find((x) => x.id === mindMapSelectedNodeId);
  if (!n || !n.parentId) {
    toast("La conexión solo aplica a nodos hijos (con padre).");
    return;
  }
  n.edgeLabel = String(mindMapEdgeLabelInput?.value || "").trim().slice(0, 120);
  renderMindMapCanvas();
  persistMindMapWorkingCopy();
  toast("Conexión actualizada.");
});

mindMapAddChildBtn.addEventListener("click", () => {
  if (!mindMapWorkingCopy) return;
  const parent = getMindMapParentForChild();
  if (!parent) return;
  const pos = mindMapNextChildPosition(parent);
  const nid = uuid();
  mindMapWorkingCopy.nodes.push({
    id: nid,
    label: "Nuevo",
    x: pos.x,
    y: pos.y,
    parentId: parent.id,
    edgeLabel: "",
    description: "",
  });
  // Keep parent selected so several clicks add siblings under the same node (not only under the last child).
  mindMapSelectedNodeId = parent.id;
  syncMindMapNodeLabelField();
  renderMindMapCanvas();
  persistMindMapWorkingCopy();
  toast("Nodo agregado.");
});

mindMapDeleteNodeBtn.addEventListener("click", () => {
  if (!mindMapWorkingCopy || !mindMapSelectedNodeId) {
    toast("Seleccioná un nodo.");
    return;
  }
  if (mindMapWorkingCopy.nodes.length <= 1) {
    toast("No podés borrar el único nodo.");
    return;
  }
  const id = mindMapSelectedNodeId;
  const toRemove = new Set([id, ...mindMapDescendantIds(id, mindMapWorkingCopy.nodes)]);
  mindMapWorkingCopy.nodes = mindMapWorkingCopy.nodes.filter((n) => !toRemove.has(n.id));
  mindMapSelectedNodeId =
    mindMapWorkingCopy.nodes.find((n) => n.parentId === null)?.id || mindMapWorkingCopy.nodes[0]?.id || null;
  syncMindMapNodeLabelField();
  renderMindMapCanvas();
  persistMindMapWorkingCopy();
  toast("Nodo eliminado.");
});

mindMapInner.addEventListener("click", () => {
  if (!mindMapWorkingCopy) return;
  mindMapSelectedNodeId = null;
  syncMindMapNodeLabelField();
  renderMindMapCanvas();
});

if (modalMindMapNode) {
  modalMindMapNode.addEventListener("click", (e) => {
    if (e.target === modalMindMapNode) closeMindMapNodeQuickEdit();
  });
}

if (mindMapQuickForm) {
  mindMapQuickForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!mindMapWorkingCopy || !mindMapQuickEditNodeId) return;
    const n = mindMapWorkingCopy.nodes.find((x) => x.id === mindMapQuickEditNodeId);
    if (!n) {
      closeMindMapNodeQuickEdit();
      return;
    }
    n.label = String(mindMapQuickLabelInput?.value || "").trim().slice(0, 200) || "Nodo";
    n.description = String(mindMapQuickDescInput?.value || "").trim().slice(0, 5000);
    if (n.parentId) {
      const valid = mindMapValidParentIds(n.id, mindMapWorkingCopy.nodes);
      const newP = String(mindMapQuickParentSelect?.value || "");
      if (newP && valid.includes(newP)) n.parentId = newP;
      else if (newP && !valid.includes(newP)) toast("Padre inválido.");
      n.edgeLabel = String(mindMapQuickEdgeInput?.value || "").trim().slice(0, 120);
    }
    renderMindMapCanvas();
    persistMindMapWorkingCopy();
    syncMindMapNodeLabelField();
    closeMindMapNodeQuickEdit();
    toast("Nodo guardado.");
  });
}

closeMindMapQuickBtn?.addEventListener("click", () => closeMindMapNodeQuickEdit());
mindMapQuickCancelBtn?.addEventListener("click", () => closeMindMapNodeQuickEdit());

mindMapApplyParentBtn?.addEventListener("click", () => {
  if (!mindMapWorkingCopy || !mindMapSelectedNodeId) {
    toast("Seleccioná un nodo.");
    return;
  }
  const n = mindMapWorkingCopy.nodes.find((x) => x.id === mindMapSelectedNodeId);
  if (!n || !n.parentId) {
    toast("Solo los nodos hijos pueden cambiar de padre.");
    return;
  }
  const newP = String(mindMapParentSelect?.value || "");
  const valid = mindMapValidParentIds(n.id, mindMapWorkingCopy.nodes);
  if (!newP || !valid.includes(newP)) {
    toast("Elegí un padre válido.");
    return;
  }
  if (newP === n.parentId) {
    toast("Ya es el padre actual.");
    return;
  }
  n.parentId = newP;
  renderMindMapCanvas();
  persistMindMapWorkingCopy();
  syncMindMapNodeLabelField();
  toast("Padre actualizado.");
});

exportBtn.addEventListener("click", () => {
  if (!currentWorkspace || !currentUserNumber) return;
  const snapshot = buildWorkspaceSnapshot(currentUserNumber);
  downloadJson(`user-${snapshot.userNumber}-workspace.json`, snapshot);
  toast("Exportado.");
});

importFile.addEventListener("change", () => {
  importBtn.disabled = !importFile.files?.length;
});

importBtn.addEventListener("click", async () => {
  if (!currentWorkspace || !currentUserNumber) return;
  const file = importFile.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      toast("JSON inválido.");
      return;
    }

    importWorkspaceSnapshot(currentUserNumber, parsed);
    const next = buildWorkspaceSnapshot(currentUserNumber);
    currentProjectId = next.projects[0]?.id || null;
    setWorkspace(next);
    goProjects();
    toast("Importado.");
  } catch (err) {
    toast(err?.message ? `Error: ${err.message}` : "No se pudo importar.");
  }
});

(function bootstrap() {
  const existing = localStorage.getItem(STORAGE.sessionKey);
  if (!existing) {
    setView(false);
    return;
  }
  const userNumber = sanitizeUserNumber(existing);
  if (!userNumber) {
    setView(false);
    return;
  }
  login(userNumber);
})();
