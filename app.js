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
const taskEditStatus = document.getElementById("taskEditStatus");
const deleteTaskBtn = document.getElementById("deleteTaskBtn");
const commentsList = document.getElementById("commentsList");
const newCommentText = document.getElementById("newCommentText");
const addCommentBtn = document.getElementById("addCommentBtn");

const taskForm = document.getElementById("taskForm");
const taskTitleInput = document.getElementById("taskTitle");
const taskStatusSelect = document.getElementById("taskStatus");

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

function ensureDefaultStorage(userNumber) {
  // Ensure schema and at least one project exist.
  if (!getUserSchemaVersion(userNumber)) setUserSchemaVersion(userNumber, 3);

  const ids = listProjectIds(userNumber);
  if (ids.length > 0) return;

  const p = defaultProject("Default");
  saveProjectIds(userNumber, [p.id]);
  saveProject(userNumber, p);
  saveProjectTasks(userNumber, p.id, []);
}

function buildWorkspaceSnapshot(userNumber) {
  ensureDefaultStorage(userNumber);
  const projectIds = listProjectIds(userNumber);
  const projects = [];
  for (const id of projectIds) {
    const p = loadProject(userNumber, id);
    if (!p) continue;
    const tasks = loadProjectTasks(userNumber, id);
    projects.push({ ...p, tasks });
  }
  if (projects.length === 0) {
    // repair if index exists but projects missing
    const p = defaultProject("Default");
    saveProjectIds(userNumber, [p.id]);
    saveProject(userNumber, p);
    saveProjectTasks(userNumber, p.id, []);
    return buildWorkspaceSnapshot(userNumber);
  }

  return {
    schemaVersion: 3,
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
  // Accept legacy formats and normalize into schemaVersion 3 storage.
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
      const cleanTasks = tasks
        .filter((t) => t && typeof t === "object")
        .map((t) => ({
          id: String(t.id || uuid()),
          title: String(t.title || t.text || "").trim() || "Sin título",
          status: STATUSES.includes(t.status) ? t.status : "backlog",
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

      return { id: projectId, name, createdAt, updatedAt, tasks: cleanTasks };
    });

  clearUserStorage(userNumber);
  setUserSchemaVersion(userNumber, 3);
  saveProjectIds(
    userNumber,
    cleanProjects.map((p) => p.id)
  );
  for (const p of cleanProjects) {
    saveProject(userNumber, p);
    saveProjectTasks(userNumber, p.id, p.tasks);
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

function taskCard(task) {
  const el = document.createElement("div");
  el.className = "task";
  el.draggable = true;
  el.dataset.taskId = task.id;

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

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "iconBtn";
  editBtn.textContent = "Editar";
  editBtn.addEventListener("click", () => openTaskEditor(task.id));

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
      const next = prompt("Editar comentario:", c.text);
      const trimmed = String(next || "").trim();
      if (!trimmed) return;

      updateProject((proj) => ({
        ...proj,
        updatedAt: nowIso(),
        tasks: proj.tasks.map((t) => {
          if (t.id !== editingTaskId) return t;
          const existing = Array.isArray(t.comments) ? t.comments : [];
          return {
            ...t,
            updatedAt: nowIso(),
            comments: existing.map((x) =>
              x.id === c.id ? { ...x, text: trimmed, updatedAt: nowIso() } : x
            ),
          };
        }),
      }));

      const refreshed = getEditingTask();
      if (refreshed) renderComments(refreshed);
      toast("Comentario actualizado.");
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

function openTaskEditor(taskId) {
  if (!currentWorkspace) return;
  const p = getCurrentProject(currentWorkspace);
  const t = p?.tasks.find((x) => x.id === taskId);
  if (!t) return;

  editingTaskId = taskId;
  taskEditTitle.value = t.title;
  taskEditStatus.value = t.status;
  newCommentText.value = "";
  renderComments(t);
  setTaskModal(true);
  taskEditTitle.focus();
}

function closeTaskEditor() {
  editingTaskId = null;
  taskEditTitle.value = "";
  taskEditStatus.value = "todo";
  newCommentText.value = "";
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

  for (const s of STATUSES) {
    byStatus[s].sort((a, b) => ts(b) - ts(a));
  }

  for (const s of STATUSES) {
    columns[s].innerHTML = "";
    counts[s].textContent = String(byStatus[s].length);
    for (const t of byStatus[s]) columns[s].appendChild(taskCard(t));
  }
}

function renderProjectPage(ws) {
  const p = getCurrentProject(ws);
  projectNameEl.textContent = p?.name || "Proyecto";
  renderBoard(ws);
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
  setWorkspace(buildWorkspaceSnapshot(currentUserNumber));
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentWorkspace) return;
  const title = String(taskTitleInput.value || "").trim();
  if (!title) return;
  const status = STATUSES.includes(taskStatusSelect.value) ? taskStatusSelect.value : "backlog";

  updateProject((p) => {
    const t = {
      id: uuid(),
      title,
      status,
      comments: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    return { ...p, updatedAt: nowIso(), tasks: [t, ...p.tasks] };
  });

  taskTitleInput.value = "";
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
}

function goProject(projectId) {
  if (!currentWorkspace) return;
  const exists = currentWorkspace.projects.some((p) => p.id === projectId);
  if (!exists) {
    goProjects();
    return;
  }
  currentProjectId = projectId;
  setPage("project");
  renderProjectPage(currentWorkspace);
}

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
            updatedAt: nowIso(),
            comments: Array.isArray(x.comments) ? x.comments : [],
          }
        : x
    ),
  }));
  toast("Guardado.");
  closeTaskEditor();
});

addCommentBtn.addEventListener("click", () => {
  if (!currentWorkspace || !editingTaskId) return;
  const text = String(newCommentText.value || "").trim();
  if (!text) return;
  const comment = { id: uuid(), text, createdAt: nowIso(), updatedAt: nowIso() };

  updateProject((proj) => ({
    ...proj,
    updatedAt: nowIso(),
    tasks: proj.tasks.map((t) => {
      if (t.id !== editingTaskId) return t;
      const existing = Array.isArray(t.comments) ? t.comments : [];
      return { ...t, updatedAt: nowIso(), comments: [...existing, comment] };
    }),
  }));

  newCommentText.value = "";
  const refreshed = getEditingTask();
  if (refreshed) renderComments(refreshed);
  toast("Comentario agregado.");
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
  setModal("backlog", false);
  setModal("done", false);
  closeTaskEditor();
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
