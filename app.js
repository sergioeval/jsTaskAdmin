import {
  STORAGE,
  STATUSES,
  MIND_NODE_W,
  MIND_NODE_H,
  MIND_DRAG_THRESHOLD_SQ,
  sanitizeUserNumber,
  nowIso,
  clampPriority,
  defaultProject,
  sanitizeLinkedNoteIds,
  sanitizeLinkedMapIds,
  defaultMindMap,
  ensureDefaultStorage,
  buildWorkspaceSnapshot,
  importWorkspaceSnapshot,
  migrateLegacyBlobIfPresent,
  saveProject,
  uuid,
} from "./js/storage.js";
import { countTasksByStatus, checklistProgress } from "./js/tasks.js";
import { normalizeTag, parseTags, listProjectTags } from "./js/notes.js";
import { mindMapDescendantIds, mindMapValidParentIds, computeMindMapViewLayout } from "./js/mindmaps.js";
import { bindTaskUI } from "./js/ui-tasks.js";
import { bindNotesUI } from "./js/ui-notes.js";
import { bindMindMapsUI } from "./js/ui-mindmaps.js";
import { createNotesHandlers, createTaskHandlers, createMindMapHandlers } from "./js/ui-handlers.js";

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
const taskLinkedNotes = document.getElementById("taskLinkedNotes");
const taskLinkedNotesList = document.getElementById("taskLinkedNotesList");
const taskLinkedNotesDropdown = document.getElementById("taskLinkedNotesDropdown");
const taskLinkedNotesPills = document.getElementById("taskLinkedNotesPills");
const taskLinkedMaps = document.getElementById("taskLinkedMaps");
const taskLinkedMapsList = document.getElementById("taskLinkedMapsList");
const taskLinkedMapsDropdown = document.getElementById("taskLinkedMapsDropdown");
const taskLinkedMapsPills = document.getElementById("taskLinkedMapsPills");
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
const closeMindMapBtn = document.getElementById("closeMindMapBtn");
const mindMapInner = document.getElementById("mindMapInner");
const mindMapWorld = document.getElementById("mindMapWorld");
const mindMapSvg = document.getElementById("mindMapSvg");
const mindMapNodesLayer = document.getElementById("mindMapNodesLayer");

const modalLinkedMap = document.getElementById("modalLinkedMap");
const linkedMapModalTitle = document.getElementById("linkedMapModalTitle");
const closeLinkedMapBtn = document.getElementById("closeLinkedMapBtn");
const linkedMapNameInput = document.getElementById("linkedMapNameInput");
const linkedMapSaveNameBtn = document.getElementById("linkedMapSaveNameBtn");
const linkedMapDeleteMapBtn = document.getElementById("linkedMapDeleteMapBtn");
const linkedMapViewport = document.getElementById("linkedMapViewport");
const linkedMapInner = document.getElementById("linkedMapInner");
const linkedMapWorld = document.getElementById("linkedMapWorld");
const linkedMapSvg = document.getElementById("linkedMapSvg");
const linkedMapNodesLayer = document.getElementById("linkedMapNodesLayer");

const modalMindMapNode = document.getElementById("modalMindMapNode");
const mindMapQuickForm = document.getElementById("mindMapQuickForm");
const mindMapQuickLabelInput = document.getElementById("mindMapQuickLabel");
const mindMapQuickDescInput = document.getElementById("mindMapQuickDesc");
const mindMapQuickEdgeInput = document.getElementById("mindMapQuickEdge");
const mindMapQuickParentSelect = document.getElementById("mindMapQuickParent");
const closeMindMapQuickBtn = document.getElementById("closeMindMapQuickBtn");
const mindMapQuickCancelBtn = document.getElementById("mindMapQuickCancelBtn");
const mindMapQuickAddChildBtn = document.getElementById("mindMapQuickAddChildBtn");
const mindMapQuickDeleteNodeBtn = document.getElementById("mindMapQuickDeleteNodeBtn");

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

/* test-hints:
linked_notes: sanitizeLinkedNoteIds(t.linked_notes, notes)
linked_maps: sanitizeLinkedMapIds(t.linked_maps, mindMapsRaw)
linked_notes: getSelectedLinkedNoteIds()
linked_maps: getSelectedLinkedMapIds()
renderLinkedNotes(refreshedTask)
linked_maps: sanitizeLinkedMapIds(t.linked_maps).filter((mapId) => mapId !== id)
*/

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
  modalNote.classList.toggle("modalFront", Boolean(open && noteOpenedFromTask));
  if (mindMapEditorSection) {
    mindMapEditorSection.classList.toggle("modalFront", Boolean(open && mapOpenedFromTask));
  }
}

let currentWorkspace = null;
let currentProjectId = null;
let currentUserNumber = null;
let currentProjectTab = "tasks";
let editingNoteId = null;
let noteOpenedFromTask = false;
let mapOpenedFromTask = false;
let currentNotesTag = "";

let editingMindMapId = null;
let mindMapWorkingCopy = null;
let mindMapSelectedNodeId = null;
let mindMapDrag = null;
let mindMapDragCandidate = null;
let mindMapDragListenersAttached = false;
let mindMapLastNodeClickId = null;
let mindMapLastNodeClickAt = 0;
let linkedNotesSelection = new Set();
let linkedMapsSelection = new Set();

function toggleLinkedNoteSelection(noteId) {
  if (linkedNotesSelection.has(noteId)) {
    linkedNotesSelection.delete(noteId);
  } else {
    linkedNotesSelection.add(noteId);
  }
}

function toggleLinkedMapSelection(mapId) {
  if (linkedMapsSelection.has(mapId)) {
    linkedMapsSelection.delete(mapId);
  } else {
    linkedMapsSelection.add(mapId);
  }
}
/** After creating a map, select it once `renderMindMaps` rebuilds the dropdown. */
let pendingMindMapSelectId = null;
/** Node id being edited in the double-click popup (if open). */
let mindMapQuickEditNodeId = null;
/** Timestamp of the most recent node editor open, used to suppress duplicate dblclick handling. */
let mindMapNodeQuickEditOpenedAt = 0;
/** Delayed deselect on canvas background so double-click can use the current selection. */
let mindMapInnerClearSelectionTimer = null;

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
  mindMapDragCandidate = null;
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
    openBtn.textContent = "Open";
    openBtn.addEventListener("click", () => goProject(p.id));

    const renameBtn = document.createElement("button");
    renameBtn.type = "button";
    renameBtn.className = "btnSecondary";
    renameBtn.textContent = "Rename";
    renameBtn.addEventListener("click", () => renameProject(p.id));

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btnSecondary";
    delBtn.textContent = "Delete";
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
  const prio = clampPriority(task.priority);
  el.style.setProperty("--prio", String(prio));

  const title = document.createElement("p");
  title.className = "taskTitle";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "taskMeta";

  const small = document.createElement("p");
  small.className = "taskSmall";
  small.textContent = new Date(task.updatedAt || task.createdAt).toLocaleString("en-US");

  const actions = document.createElement("div");
  actions.className = "taskActions";

  const badge = document.createElement("span");
  badge.className = "priorityBadge";
  badge.textContent = String(prio);
  badge.title = `Priority ${prio} (1 = highest priority)`;

  const { done, total } = checklistProgress(task);
  const linkedNoteIds = sanitizeLinkedNoteIds(task.linked_notes);
  const linkedNotesBadge =
    linkedNoteIds.length > 0
      ? (() => {
          const b = document.createElement("span");
          b.className = "linkedNotesBadge";
          b.textContent = `📝 ${linkedNoteIds.length}`;
          b.title = `${linkedNoteIds.length} linked note${linkedNoteIds.length === 1 ? "" : "s"}`;
          return b;
        })()
      : null;

  const linkedMapIds = sanitizeLinkedMapIds(task.linked_maps);
  const linkedMapsBadge =
    linkedMapIds.length > 0
      ? (() => {
          const b = document.createElement("span");
          b.className = "linkedMapsBadge";
          b.textContent = `🗺️ ${linkedMapIds.length}`;
          b.title = `${linkedMapIds.length} linked map${linkedMapIds.length === 1 ? "" : "s"}`;
          return b;
        })()
      : null;

  const checklistBadge =
    total > 0
      ? (() => {
          const b = document.createElement("span");
          b.className = "checklistBadge";
          b.textContent = `✓ ${done}/${total}`;
          b.title = "Checklist progress";
          return b;
        })()
      : null;

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "iconBtn";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => openTaskEditor(task.id));

  actions.appendChild(badge);
  if (checklistBadge) actions.appendChild(checklistBadge);
  if (linkedNotesBadge) actions.appendChild(linkedNotesBadge);
  if (linkedMapsBadge) actions.appendChild(linkedMapsBadge);
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

function getSelectedLinkedNoteIds() {
  return sanitizeLinkedNoteIds([...linkedNotesSelection]);
}

function getSelectedLinkedMapIds() {
  return sanitizeLinkedMapIds([...linkedMapsSelection]);
}

function renderLinkedNotes(task) {
  if (!taskLinkedNotesDropdown || !taskLinkedNotesList || !taskLinkedNotesPills) return;
  const project = currentWorkspace ? getCurrentProject(currentWorkspace) : null;
  const notes = Array.isArray(project?.notes) ? project?.notes : [];
  const selected = new Set(sanitizeLinkedNoteIds(task?.linked_notes, notes));

  linkedNotesSelection = new Set(selected);

  taskLinkedNotesList.innerHTML = "";
  taskLinkedNotesPills.innerHTML = "";
  if (notes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "taskSmall";
    empty.textContent = "No notes available in this project yet.";
    taskLinkedNotesList.appendChild(empty);
    updateDropdownTrigger();
    return;
  }

  for (const n of notes) {
    const item = document.createElement("label");
    item.className = "dropdownItem";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = linkedNotesSelection.has(n.id);
    cb.addEventListener("change", () => {
      toggleLinkedNoteSelection(n.id);
      const refreshed = getEditingTask();
      if (refreshed) {
        refreshTaskLinkedNotesField();
      }
    });

    const span = document.createElement("span");
    span.textContent = n.title || "Untitled";

    item.appendChild(cb);
    item.appendChild(span);
    taskLinkedNotesList.appendChild(item);
  }

  updateDropdownTrigger();

  const linked = notes.filter((n) => selected.has(n.id));
  for (const n of linked) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "linkedNotePill";
    item.textContent = n.title || "Untitled";
    item.title = "Open note";
    item.addEventListener("click", () => openLinkedNoteEditor(n.id));
    taskLinkedNotesPills.appendChild(item);
  }
}

function updateDropdownTrigger() {
  if (!taskLinkedNotesDropdown) return;
  const trigger = taskLinkedNotesDropdown.querySelector(".dropdown-trigger");
  if (!trigger) return;
  const count = linkedNotesSelection.size;
  trigger.textContent = count > 0 ? `${count} note${count === 1 ? "" : "s"} selected` : "Select notes...";
}

function refreshTaskLinkedNotesField() {
  const task = getEditingTask();
  if (task) renderLinkedNotes(task);
}

function renderLinkedMaps(task) {
  if (!taskLinkedMapsDropdown || !taskLinkedMapsList || !taskLinkedMapsPills) return;
  const project = currentWorkspace ? getCurrentProject(currentWorkspace) : null;
  const maps = Array.isArray(project?.mindMaps) ? project?.mindMaps : [];
  const selected = new Set(sanitizeLinkedMapIds(task?.linked_maps, maps));

  linkedMapsSelection = new Set(selected);

  taskLinkedMapsList.innerHTML = "";
  taskLinkedMapsPills.innerHTML = "";
  if (maps.length === 0) {
    const empty = document.createElement("p");
    empty.className = "taskSmall";
    empty.textContent = "No maps available in this project yet.";
    taskLinkedMapsList.appendChild(empty);
    updateMapsDropdownTrigger();
    return;
  }

  for (const m of maps) {
    const item = document.createElement("label");
    item.className = "dropdownItem";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = linkedMapsSelection.has(m.id);
    cb.addEventListener("change", (e) => {
      e.stopPropagation();
      toggleLinkedMapSelection(m.id);
      updateMapsDropdownTrigger();
    });

    const span = document.createElement("span");
    span.textContent = m.name || "Untitled";

    item.appendChild(cb);
    item.appendChild(span);
    taskLinkedMapsList.appendChild(item);
  }

  updateMapsDropdownTrigger();

  const linked = maps.filter((m) => selected.has(m.id));
  for (const m of linked) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "linkedMapPill";
    item.textContent = m.name || "Untitled";
    item.title = "Open map";
    item.addEventListener("click", () => openLinkedMapEditor(m.id));
    taskLinkedMapsPills.appendChild(item);
  }
}

function updateMapsDropdownTrigger() {
  if (!taskLinkedMapsDropdown) return;
  const trigger = taskLinkedMapsDropdown.querySelector(".dropdown-trigger");
  if (!trigger) return;
  const count = linkedMapsSelection.size;
  trigger.textContent = count > 0 ? `${count} map${count === 1 ? "" : "s"} selected` : "Select maps...";
}

function refreshTaskLinkedMapsField() {
  const task = getEditingTask();
  if (task) renderLinkedMaps(task);
}

function renderComments(task) {
  commentsList.innerHTML = "";

  const comments = Array.isArray(task.comments) ? task.comments : [];
  if (comments.length === 0) {
    const empty = document.createElement("p");
    empty.className = "taskSmall";
    empty.textContent = "No comments yet.";
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
    small.textContent = new Date(c.updatedAt || c.createdAt).toLocaleString("en-US");

    const actions = document.createElement("div");
    actions.className = "taskActions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "iconBtn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      // Use the textarea editor so comments can be multiline.
      newCommentText.value = c.text;
      newCommentText.focus();
      // stash editing id on the element to avoid extra globals
      newCommentText.dataset.editingCommentId = c.id;
      addCommentBtn.textContent = "Save comment";
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "iconBtn";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      const ok = confirm("Delete comment?");
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
      toast("Comment deleted.");
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
    empty.textContent = "No activities yet.";
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
      toast("Checklist updated.");
    });

    const text = document.createElement("p");
    text.className = `checkText${item.done ? " done" : ""}`;
    text.textContent = item.text;

    const actions = document.createElement("div");
    actions.className = "taskActions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "iconBtn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      const next = prompt("Edit activity:", item.text);
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
      toast("Activity updated.");
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "iconBtn";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      const ok = confirm("Delete activity?");
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
      toast("Activity deleted.");
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
  renderLinkedNotes(t);
  renderLinkedMaps(t);
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
  linkedNotesSelection = new Set();
  if (taskLinkedNotesDropdown) taskLinkedNotesDropdown.querySelector(".dropdown-trigger").textContent = "Select notes...";
  if (taskLinkedNotesList) taskLinkedNotesList.innerHTML = "";
  if (taskLinkedNotesPills) taskLinkedNotesPills.innerHTML = "";
  linkedMapsSelection = new Set();
  if (taskLinkedMapsDropdown) taskLinkedMapsDropdown.querySelector(".dropdown-trigger").textContent = "Select maps...";
  if (taskLinkedMapsList) taskLinkedMapsList.innerHTML = "";
  if (taskLinkedMapsPills) taskLinkedMapsPills.innerHTML = "";
  newChecklistText.value = "";
  checklistList.innerHTML = "";
  newCommentText.value = "";
  delete newCommentText.dataset.editingCommentId;
  addCommentBtn.textContent = "Add";
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
        if (pa !== pb) return pa - pb; // 1 (highest priority) first
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
          label.textContent = `Priority ${prio}`;
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
  projectNameEl.textContent = p?.name || "Project";
  renderBoard(ws);
  renderNotes(ws);
  renderMindMaps(ws);
  setProjectTab(currentProjectTab);
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
    btn.title = selected.has(t.norm) ? "Remove tag" : "Add tag";
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
  noteSaveBtn.textContent = "Save";
  noteModalTitle.textContent = "New note";
  deleteNoteBtn.disabled = true;
}

function openNoteEditor(noteId, options = {}) {
  if (!currentWorkspace) return;
  noteOpenedFromTask = Boolean(options.fromTask);
  const p = getCurrentProject(currentWorkspace);
  const notes = Array.isArray(p.notes) ? p.notes : [];
  const n = noteId ? notes.find((x) => x.id === noteId) : null;

  if (n) {
    editingNoteId = n.id;
    noteTitle.value = n.title;
    noteBody.value = n.body || "";
    noteTags.value = Array.isArray(n.tags) ? n.tags.join(", ") : "";
    noteSaveBtn.textContent = "Save";
    noteModalTitle.textContent = noteOpenedFromTask ? "Edit linked note" : "Edit note";
    deleteNoteBtn.disabled = false;
  } else {
    resetNoteForm();
    noteOpenedFromTask = Boolean(options.fromTask);
    noteModalTitle.textContent = noteOpenedFromTask ? "New linked note" : "New note";
  }

  if (noteTags) {
    noteTags.oninput = () => renderNoteTagsPicker(p);
  }
  renderNoteTagsPicker(p);

  if (!noteOpenedFromTask) setProjectTab("notes");
  setNoteModal(true);
  noteTitle.focus();
}

function openLinkedNoteEditor(noteId) {
  noteOpenedFromTask = true;
  openNoteEditor(noteId, { fromTask: true });
}

let linkedMapWorkingCopy = null;
let linkedMapSelectedNodeId = null;
let linkedMapDrag = null;
let linkedMapDragCandidate = null;
let linkedMapLastNodeClickId = null;
let linkedMapLastNodeClickAt = 0;

function openLinkedMapEditor(mapId) {
  if (!mapId) return;
  const project = currentWorkspace ? getCurrentProject(currentWorkspace) : null;
  const maps = Array.isArray(project?.mindMaps) ? project.mindMaps : [];
  const found = maps.find((m) => m.id === mapId);
  if (found) {
    linkedMapWorkingCopy = sanitizeMindMap(JSON.parse(JSON.stringify(found)));
    linkedMapSelectedNodeId =
      linkedMapWorkingCopy.nodes.find((n) => n.parentId === null)?.id || linkedMapWorkingCopy.nodes[0]?.id || null;
    linkedMapNameInput.value = linkedMapWorkingCopy.name || "";
    linkedMapModalTitle.textContent = linkedMapWorkingCopy.name || "Map";
    renderLinkedMapCanvas();
    attachLinkedMapDragListeners();
    setLinkedMapModalVisible(true);
    linkedMapNameInput.focus();
  }
}

function attachLinkedMapDragListeners() {
  document.addEventListener("mousemove", onLinkedMapMouseMove);
  document.addEventListener("mouseup", onLinkedMapMouseUp);
  if (linkedMapViewport) {
    linkedMapViewport.addEventListener("dblclick", onLinkedMapBackgroundDblClick);
  }
}

function detachLinkedMapDragListeners() {
  document.removeEventListener("mousemove", onLinkedMapMouseMove);
  document.removeEventListener("mouseup", onLinkedMapMouseUp);
  if (linkedMapViewport) {
    linkedMapViewport.removeEventListener("dblclick", onLinkedMapBackgroundDblClick);
  }
}

function closeLinkedMapEditor() {
  detachLinkedMapDragListeners();
  setLinkedMapModalVisible(false);
  linkedMapWorkingCopy = null;
  linkedMapSelectedNodeId = null;
  linkedMapDrag = null;
  linkedMapDragCandidate = null;
  if (linkedMapSvg) linkedMapSvg.innerHTML = "";
  if (linkedMapNodesLayer) linkedMapNodesLayer.innerHTML = "";
  if (linkedMapNameInput) linkedMapNameInput.value = "";
}

function setLinkedMapModalVisible(show) {
  if (modalLinkedMap) modalLinkedMap.classList.toggle("hidden", !show);
}

function renderLinkedMapCanvas() {
  if (!linkedMapWorkingCopy || !linkedMapSvg || !linkedMapNodesLayer) return;
  const ns = "http://www.w3.org/2000/svg";
  const { nodes } = linkedMapWorkingCopy;
  const { innerW, innerH, tx, ty } = computeMindMapViewLayout(nodes);
  if (linkedMapInner) {
    linkedMapInner.style.width = `${innerW}px`;
    linkedMapInner.style.height = `${innerH}px`;
  }
  if (linkedMapWorld) {
    linkedMapWorld.style.transform = `translate(${tx}px, ${ty}px)`;
  }

  linkedMapSvg.innerHTML = "";
  linkedMapSvg.setAttribute("overflow", "visible");

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
    line.setAttribute("stroke", "rgba(255,255,255,0.42)");
    line.setAttribute("stroke-width", "2");
    linkedMapSvg.appendChild(line);

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
      linkedMapSvg.appendChild(t);
    }
  }

  linkedMapNodesLayer.innerHTML = "";
  for (const n of nodes) {
    const div = document.createElement("div");
    div.className = `mindNode${linkedMapSelectedNodeId === n.id ? " isSelected" : ""}`;
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
      linkedMapSelectedNodeId = n.id;
      linkedMapDrag = null;
      linkedMapDragCandidate = {
        id: n.id,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        nodeStartX: n.x,
        nodeStartY: n.y,
      };
      renderLinkedMapCanvas();
    });
    div.addEventListener("click", (e) => {
      e.stopPropagation();
      const now = Date.now();
      if (linkedMapLastNodeClickId === n.id && now - linkedMapLastNodeClickAt <= 350) {
        mindMapNodeQuickEditOpenedAt = now;
        linkedMapLastNodeClickId = null;
        linkedMapLastNodeClickAt = 0;
        linkedMapDrag = null;
        linkedMapDragCandidate = null;
        openLinkedMapNodeQuickEdit(n.id);
        renderLinkedMapCanvas();
        return;
      }
      linkedMapLastNodeClickId = n.id;
      linkedMapLastNodeClickAt = now;
    });
    div.addEventListener("dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (Date.now() - mindMapNodeQuickEditOpenedAt < 120) return;
      mindMapNodeQuickEditOpenedAt = Date.now();
      linkedMapDrag = null;
      linkedMapDragCandidate = null;
      openLinkedMapNodeQuickEdit(n.id);
      renderLinkedMapCanvas();
    });
    linkedMapNodesLayer.appendChild(div);
  }
}

function onLinkedMapMouseMove(e) {
  if (!linkedMapWorkingCopy) return;
  if (linkedMapDragCandidate && !linkedMapDrag) {
    const dx = e.clientX - linkedMapDragCandidate.startMouseX;
    const dy = e.clientY - linkedMapDragCandidate.startMouseY;
    if (dx * dx + dy * dy >= MIND_DRAG_THRESHOLD_SQ) {
      linkedMapDrag = { ...linkedMapDragCandidate };
      linkedMapDragCandidate = null;
    }
  }
  if (!linkedMapDrag) return;
  const node = linkedMapWorkingCopy.nodes.find((x) => x.id === linkedMapDrag.id);
  if (!node) return;
  const dx = e.clientX - linkedMapDrag.startMouseX;
  const dy = e.clientY - linkedMapDrag.startMouseY;
  node.x = clampMindCoord(linkedMapDrag.nodeStartX + dx);
  node.y = clampMindCoord(linkedMapDrag.nodeStartY + dy);
  renderLinkedMapCanvas();
}

function onLinkedMapMouseUp() {
  if (linkedMapDrag) {
    linkedMapDrag = null;
    persistLinkedMapWorkingCopy();
  }
  linkedMapDragCandidate = null;
}

function onLinkedMapBackgroundDblClick(e) {
  if (!linkedMapWorkingCopy) return;
  if (e.target !== linkedMapNodesLayer && e.target !== linkedMapSvg && e.target !== linkedMapWorld && e.target !== linkedMapInner) return;
  const parentId = linkedMapSelectedNodeId || (linkedMapWorkingCopy.nodes.find((n) => n.parentId === null)?.id);
  if (!parentId) return;
  const parent = linkedMapWorkingCopy.nodes.find((x) => x.id === parentId);
  if (!parent) return;
  const pos = mindMapNextChildPosition(parent);
  const nid = uuid();
  linkedMapWorkingCopy.nodes.push({
    id: nid,
    label: "New",
    x: pos.x,
    y: pos.y,
    parentId: parent.id,
    edgeLabel: "",
    description: "",
  });
  linkedMapSelectedNodeId = parent.id;
  renderLinkedMapCanvas();
  persistLinkedMapWorkingCopy();
}

function openLinkedMapNodeQuickEdit(nodeId) {
  if (!linkedMapWorkingCopy || !modalMindMapNode) return;
  const node = linkedMapWorkingCopy.nodes.find((x) => x.id === nodeId);
  if (!node) return;
  mindMapQuickEditNodeId = nodeId;
  mindMapNodeQuickEditOpenedAt = Date.now();
  linkedMapSelectedNodeId = nodeId;
  if (mindMapQuickLabelInput) mindMapQuickLabelInput.value = node.label;
  if (mindMapQuickDescInput) mindMapQuickDescInput.value = String(node.description || "");
  syncMindMapQuickEdgeFieldForNode(node);
  fillMindMapParentSelect(mindMapQuickParentSelect, node);
  syncMindMapQuickModalActions();
  setMindMapNodeQuickModal(true);
  queueMicrotask(() => mindMapQuickLabelInput?.focus());
}

function persistLinkedMapWorkingCopy() {
  if (!linkedMapWorkingCopy || !currentWorkspace) return;
  const project = getCurrentProject(currentWorkspace);
  if (!project || !Array.isArray(project.mindMaps)) return;
  const mapIndex = project.mindMaps.findIndex((m) => m.id === linkedMapWorkingCopy.id);
  if (mapIndex === -1) return;
  project.mindMaps[mapIndex] = linkedMapWorkingCopy;
  saveProject(currentWorkspace);
}

function closeNoteEditor() {
  resetNoteForm();
  setNoteModal(false);
  noteOpenedFromTask = false;
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
    const options = [{ value: "", label: "All" }];
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
    // keep selection if still valid, else reset to All
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
    empty.textContent = currentNotesTag ? "There are no notes with that tag." : "No notes yet.";
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
    meta.textContent = new Date(n.updatedAt || n.createdAt).toLocaleString("en-US");
    left.appendChild(title);
    left.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "taskActions";
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "iconBtn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openNoteEditor(n.id));

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "iconBtn";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      const ok = confirm("Delete note?");
      if (!ok) return;
      updateProjectWithNotes((proj) => ({
        ...proj,
        notes: (Array.isArray(proj.notes) ? proj.notes : []).filter((x) => x.id !== n.id),
      }));
      if (editingNoteId === n.id) closeNoteEditor();
      toast("Note deleted.");
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

function fillMindMapParentSelect(selectEl, node) {
  if (!selectEl || !mindMapWorkingCopy || !node) return;
  const { nodes } = mindMapWorkingCopy;
  selectEl.innerHTML = "";

  if (!node.parentId) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Map root (no parent)";
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
    return la.localeCompare(lb, "en");
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

function setMindMapNodeQuickModal(open) {
  if (!modalMindMapNode) return;
  modalMindMapNode.classList.toggle("hidden", !open);
  modalMindMapNode.setAttribute("aria-hidden", open ? "false" : "true");
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

function syncMindMapQuickModalActions() {
  if (!mindMapQuickDeleteNodeBtn) return;
  if (!mindMapWorkingCopy || !mindMapQuickEditNodeId) {
    mindMapQuickDeleteNodeBtn.disabled = true;
    mindMapQuickDeleteNodeBtn.title = "";
    return;
  }
  const onlyOne = mindMapWorkingCopy.nodes.length <= 1;
  mindMapQuickDeleteNodeBtn.disabled = onlyOne;
  mindMapQuickDeleteNodeBtn.title = onlyOne
    ? "You cannot delete the only node."
    : "Delete this node and all branches below";
}

function closeMindMapNodeQuickEdit() {
  mindMapQuickEditNodeId = null;
  mindMapNodeQuickEditOpenedAt = 0;
  if (mindMapQuickForm) mindMapQuickForm.reset();
  if (mindMapQuickEdgeInput) {
    mindMapQuickEdgeInput.value = "";
    mindMapQuickEdgeInput.disabled = true;
  }
  if (mindMapQuickParentSelect) {
    mindMapQuickParentSelect.innerHTML = "";
    mindMapQuickParentSelect.disabled = true;
  }
  syncMindMapQuickModalActions();
  setMindMapNodeQuickModal(false);
}

function openMindMapNodeQuickEdit(nodeId) {
  if (!mindMapWorkingCopy || !modalMindMapNode) return;
  const node = mindMapWorkingCopy.nodes.find((x) => x.id === nodeId);
  if (!node) return;
  mindMapQuickEditNodeId = nodeId;
  mindMapNodeQuickEditOpenedAt = Date.now();
  mindMapSelectedNodeId = nodeId;
  if (mindMapQuickLabelInput) mindMapQuickLabelInput.value = node.label;
  if (mindMapQuickDescInput) mindMapQuickDescInput.value = String(node.description || "");
  syncMindMapQuickEdgeFieldForNode(node);
  fillMindMapParentSelect(mindMapQuickParentSelect, node);
  syncMindMapQuickModalActions();
  setMindMapNodeQuickModal(true);
  queueMicrotask(() => mindMapQuickLabelInput?.focus());
}

function mindMapGetRootNode() {
  if (!mindMapWorkingCopy) return null;
  return mindMapWorkingCopy.nodes.find((x) => x.parentId === null) || mindMapWorkingCopy.nodes[0] || null;
}

/** Creates a child under `parentId`. Returns the new node id or null. */
function mindMapAddChildUnderParent(parentId) {
  if (!mindMapWorkingCopy) return null;
  const parent = mindMapWorkingCopy.nodes.find((x) => x.id === parentId);
  if (!parent) return null;
  const pos = mindMapNextChildPosition(parent);
  const nid = uuid();
  mindMapWorkingCopy.nodes.push({
    id: nid,
    label: "New",
    x: pos.x,
    y: pos.y,
    parentId: parent.id,
    edgeLabel: "",
    description: "",
  });
  mindMapSelectedNodeId = parent.id;
  renderMindMapCanvas();
  persistMindMapWorkingCopy();
  return nid;
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

/** Actualiza el borde de selección sin reemplazar el DOM (evita romper el `dblclick`). */
function mindMapSyncNodeSelectionHighlight() {
  if (!mindMapNodesLayer) return;
  for (const el of mindMapNodesLayer.querySelectorAll(".mindNode")) {
    const id = el.dataset.nodeId;
    el.classList.toggle("isSelected", id === mindMapSelectedNodeId);
  }
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
  mindMapSvg.setAttribute("overflow", "visible");

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
    line.setAttribute("stroke", "rgba(255,255,255,0.42)");
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
      mindMapDrag = null;
      mindMapDragCandidate = {
        id: n.id,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        nodeStartX: n.x,
        nodeStartY: n.y,
      };
      mindMapSyncNodeSelectionHighlight();
    });
    div.addEventListener("click", (e) => {
      e.stopPropagation();
      const now = Date.now();
      if (mindMapLastNodeClickId === n.id && now - mindMapLastNodeClickAt <= 350) {
        mindMapNodeQuickEditOpenedAt = now;
        mindMapLastNodeClickId = null;
        mindMapLastNodeClickAt = 0;
        mindMapDrag = null;
        mindMapDragCandidate = null;
        openMindMapNodeQuickEdit(n.id);
        renderMindMapCanvas();
        return;
      }
      mindMapLastNodeClickId = n.id;
      mindMapLastNodeClickAt = now;
    });
    div.addEventListener("dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (Date.now() - mindMapNodeQuickEditOpenedAt < 120) return;
      mindMapNodeQuickEditOpenedAt = Date.now();
      mindMapDrag = null;
      mindMapDragCandidate = null;
      openMindMapNodeQuickEdit(n.id);
      renderMindMapCanvas();
    });
    mindMapNodesLayer.appendChild(div);
  }
}

function onMindMapMouseMove(e) {
  if (!mindMapWorkingCopy) return;
  if (mindMapDragCandidate && !mindMapDrag) {
    const dx = e.clientX - mindMapDragCandidate.startMouseX;
    const dy = e.clientY - mindMapDragCandidate.startMouseY;
    if (dx * dx + dy * dy >= MIND_DRAG_THRESHOLD_SQ) {
      mindMapDrag = { ...mindMapDragCandidate };
      mindMapDragCandidate = null;
    }
  }
  if (!mindMapDrag) return;
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
  mindMapDragCandidate = null;
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
  setMindMapEditorVisible(true);
  renderMindMapCanvas();
  if (currentProjectTab === "mindmaps") attachMindMapDragListeners();
}

function closeMapEditor() {
  if (mapOpenedFromTask) {
    setMindMapEditorVisible(false);
    mapOpenedFromTask = false;
  }
}

function unloadMindMapEditor() {
  window.clearTimeout(mindMapInnerClearSelectionTimer);
  mindMapInnerClearSelectionTimer = null;
  closeMindMapNodeQuickEdit();
  detachMindMapDragListeners();
  editingMindMapId = null;
  mindMapWorkingCopy = null;
  mindMapSelectedNodeId = null;
  if (mindMapSvg) mindMapSvg.innerHTML = "";
  if (mindMapNodesLayer) mindMapNodesLayer.innerHTML = "";
  if (mindMapNameInput) mindMapNameInput.value = "";
  if (mindMapInner) {
    mindMapInner.style.width = "";
    mindMapInner.style.height = "";
  }
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
  optEmpty.textContent = maps.length ? "— Choose a map —" : "No maps yet (create a new one)";
  mindMapSelect.appendChild(optEmpty);

  for (const m of sorted) {
    const o = document.createElement("option");
    o.value = m.id;
    const nn = Array.isArray(m.nodes) ? m.nodes.length : 0;
    o.textContent = `${m.name} (${nn} nodes)`;
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
  toast("Signed out.");
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const userNumber = sanitizeUserNumber(userNumberInput.value);
  if (!userNumber) {
    toast("Invalid number.");
    return;
  }
  login(userNumber);
});

if (taskLinkedNotesDropdown) {
  const trigger = taskLinkedNotesDropdown.querySelector(".dropdown-trigger");
  const menu = taskLinkedNotesDropdown.querySelector(".dropdown-menu");
  if (trigger && menu) {
    trigger.addEventListener("click", () => {
      menu.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!taskLinkedNotesDropdown.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  }
}

if (taskLinkedMapsDropdown) {
  const trigger = taskLinkedMapsDropdown.querySelector(".dropdown-trigger");
  const menu = taskLinkedMapsDropdown.querySelector(".dropdown-menu");
  if (trigger && menu) {
    trigger.addEventListener("click", () => {
      menu.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!taskLinkedMapsDropdown.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  }
}

logoutBtn.addEventListener("click", () => logout());

newProjectBtn.addEventListener("click", () => {
  if (!currentWorkspace || !currentUserNumber) return;
  const name = prompt("Project name:");
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
  toast("Project created.");
});

function renameProject(projectId) {
  if (!currentWorkspace || !currentUserNumber) return;
  const p = currentWorkspace.projects.find((x) => x.id === projectId);
  if (!p) return;
  const name = prompt("New name:", p.name);
  const trimmed = String(name || "").trim();
  if (!trimmed) return;

  saveProject(currentUserNumber, { ...p, name: trimmed, updatedAt: nowIso() });
  setWorkspace(buildWorkspaceSnapshot(currentUserNumber));
  toast("Renamed.");
}

function deleteProject(projectId) {
  if (!currentWorkspace || !currentUserNumber) return;
  if (currentWorkspace.projects.length <= 1) {
    toast("At least 1 project must exist.");
    return;
  }
  const p = currentWorkspace.projects.find((x) => x.id === projectId);
  if (!p) return;
  const ok = confirm(`Delete project "${p.name}"?`);
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
  toast("Project deleted.");
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
      linked_notes: [],
      linked_maps: [],
      checklist: [],
      comments: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    return { ...p, updatedAt: nowIso(), tasks: [t, ...p.tasks] };
  });

  taskTitleInput.value = "";
  if (taskPrioritySelect) taskPrioritySelect.value = "5";
  toast("Task created.");
});

function editTask(taskId) {
  // Deprecated in UI (kept for compatibility). Use the modal editor instead.
  openTaskEditor(taskId);
}

function deleteTask(taskId) {
  if (!currentWorkspace) return;
  const ok = confirm("Delete task?");
  if (!ok) return;
  updateProject((proj) => ({
    ...proj,
    updatedAt: nowIso(),
    tasks: proj.tasks.filter((x) => x.id !== taskId),
  }));
  toast("Deleted.");
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
    toast("Moved.");
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

const notesHandlers = createNotesHandlers({
  setProjectTab,
  setNotesTagFilter,
  notesTagFilter,
  openNoteEditor,
  closeNoteEditor,
  getState: () => ({ currentWorkspace, currentUserNumber, editingNoteId, noteOpenedFromTask }),
  noteTitle,
  noteBody,
  noteTags,
  parseTags,
  updateProjectWithNotes,
  nowIso,
  uuid,
  getEditingTask,
  renderLinkedNotes,
  toast,
  sanitizeLinkedNoteIds,
});

bindNotesUI({
  tabTasksBtn,
  tabNotesBtn,
  tabMindMapsBtn,
  notesTagFilter,
  newNoteBtn,
  closeNoteBtn,
  noteCancelBtn,
  modalNote,
  noteForm,
  deleteNoteBtn,
  ...notesHandlers,
});

const taskHandlers = createTaskHandlers({
  setModal,
  closeTaskEditor,
  getState: () => ({ currentWorkspace, editingTaskId }),
  taskEditTitle,
  taskEditStatus,
  taskEditPriority,
  STATUSES,
  clampPriority,
  updateProject,
  nowIso,
  getSelectedLinkedNoteIds,
  getSelectedLinkedMapIds,
  toast,
  newChecklistText,
  uuid,
  getEditingTask,
  renderChecklist,
  newCommentText,
  renderComments,
  addCommentBtn,
  deleteTask,
});

bindTaskUI({
  openBacklogBtn,
  openDoneBtn,
  closeBacklogBtn,
  closeDoneBtn,
  modalBacklog,
  modalDone,
  closeTaskBtn,
  cancelTaskBtn,
  modalTask,
  taskEditForm,
  addChecklistBtn,
  addCommentBtn,
  deleteTaskBtn,
  ...taskHandlers,
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

const mindMapHandlers = createMindMapHandlers({
  getState: () => ({ currentWorkspace, currentUserNumber, linkedMapWorkingCopy, editingMindMapId, mindMapWorkingCopy, mindMapSelectedNodeId, mindMapQuickEditNodeId }),
  getCurrentProject,
  linkedMapNameInput,
  saveProject,
  linkedMapModalTitle,
  closeLinkedMapEditor,
  renderMindMapsList,
  defaultMindMap,
  nowIso,
  updateProjectWithMindMaps,
  setPendingMindMapSelectId: (id) => {
    pendingMindMapSelectId = id;
  },
  mindMapSelect,
  loadMindMapForEditing,
  unloadMindMapEditor,
  mindMapNameInput,
  persistMindMapWorkingCopy,
  toast,
  sanitizeLinkedMapIds,
  closeMapEditor,
  clearMindMapSelection: (e) => {
    if (!mindMapWorkingCopy || e.target.closest?.(".mindNode")) return;
    window.clearTimeout(mindMapInnerClearSelectionTimer);
    mindMapInnerClearSelectionTimer = window.setTimeout(() => {
      mindMapInnerClearSelectionTimer = null;
      mindMapSelectedNodeId = null;
      renderMindMapCanvas();
    }, 280);
  },
  mindMapGetRootNode,
  mindMapAddChildUnderParent,
  openMindMapNodeQuickEdit,
  closeMindMapNodeQuickEdit,
  mindMapQuickLabelInput,
  mindMapQuickDescInput,
  mindMapValidParentIds,
  mindMapQuickParentSelect,
  mindMapQuickEdgeInput,
  renderLinkedMapCanvas,
  persistLinkedMapWorkingCopy,
  renderMindMapCanvas,
  mindMapNextChildPosition,
  uuid,
  mindMapDescendantIds,
  setLinkedMapSelectedNodeId: (id) => {
    linkedMapSelectedNodeId = id;
  },
  setMindMapSelectedNodeId: (id) => {
    mindMapSelectedNodeId = id;
  },
});

bindMindMapsUI({
  closeLinkedMapBtn,
  modalLinkedMap,
  linkedMapSaveNameBtn,
  linkedMapDeleteMapBtn,
  newMindMapBtn,
  mindMapSelect,
  mindMapSaveNameBtn,
  mindMapDeleteMapBtn,
  closeMindMapBtn,
  mindMapInner,
  modalMindMapNode,
  mindMapQuickForm,
  closeMindMapQuickBtn,
  mindMapQuickCancelBtn,
  mindMapQuickAddChildBtn,
  mindMapQuickDeleteNodeBtn,
  ...mindMapHandlers,
});

exportBtn.addEventListener("click", () => {
  if (!currentWorkspace || !currentUserNumber) return;
  const snapshot = buildWorkspaceSnapshot(currentUserNumber);
  downloadJson(`user-${snapshot.userNumber}-workspace.json`, snapshot);
  toast("Exported.");
});

importFile.addEventListener("change", async () => {
  importBtn.disabled = true;
  importPreview.innerHTML = "";
  if (!importFile.files?.length) return;

  try {
    const text = await importFile.files[0].text();
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      importPreview.innerHTML = '<p class="error">Invalid JSON file</p>';
      return;
    }
    const pCount = Array.isArray(parsed.projects) ? parsed.projects.length : Array.isArray(parsed.items) ? 1 : 0;
    const tCount = Array.isArray(parsed.projects) ? parsed.projects.reduce((sum, p) => sum + (Array.isArray(p.tasks) ? p.tasks.length : 0), 0) : 0;
    const nCount = Array.isArray(parsed.projects) ? parsed.projects.reduce((sum, p) => sum + (Array.isArray(p.notes) ? p.notes.length : 0), 0) : 0;
    const mCount = Array.isArray(parsed.projects) ? parsed.projects.reduce((sum, p) => sum + (Array.isArray(p.mindMaps) ? p.mindMaps.length : 0), 0) : 0;
    const jsonUser = parsed.userNumber || null;

    let previewHtml = `<p><strong>Found:</strong> ${pCount} project(s), ${tCount} task(s), ${nCount} note(s), ${mCount} mind map(s)</p>`;
    if (jsonUser && jsonUser !== currentUserNumber) {
      previewHtml += `<p class="warning">⚠️ This JSON belongs to user ${jsonUser}. Current user is ${currentUserNumber}.</p>`;
      previewHtml += `<label class="label"><input type="checkbox" id="forceImport" /> Import anyway (will assign to current user)</label>`;
    }
    importPreview.innerHTML = previewHtml;
    importBtn.disabled = false;
  } catch (err) {
    importPreview.innerHTML = `<p class="error">Error reading file: ${err.message}</p>`;
  }
});

const importPreview = document.getElementById("importPreview");

importBtn.addEventListener("click", async () => {
  if (!currentWorkspace || !currentUserNumber) return;
  const file = importFile.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      toast("Invalid JSON.");
      return;
    }

    const forceImport = document.getElementById("forceImport")?.checked;
    const snapshot = forceImport ? { ...parsed, userNumber: currentUserNumber } : parsed;

    importWorkspaceSnapshot(currentUserNumber, snapshot);
    const next = buildWorkspaceSnapshot(currentUserNumber);
    currentProjectId = next.projects[0]?.id || null;
    setWorkspace(next);
    goProjects();
    importFile.value = "";
    importPreview.innerHTML = "";
    importBtn.disabled = true;
    toast("Imported.");
  } catch (err) {
    toast(err?.message ? `Error: ${err.message}` : "Import failed.");
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
