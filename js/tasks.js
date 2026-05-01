import { STATUSES } from "./storage.js";

export function countTasksByStatus(tasks) {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const t of tasks) counts[t.status] = (counts[t.status] || 0) + 1;
  return counts;
}

export function checklistProgress(task) {
  const items = Array.isArray(task?.checklist) ? task.checklist : [];
  const total = items.length;
  const done = items.reduce((acc, x) => acc + (x?.done ? 1 : 0), 0);
  return { done, total };
}
