export function normalizeTag(t) {
  return String(t || "").trim().toLowerCase();
}

export function parseTags(raw) {
  const tags = String(raw || "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
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

export function listProjectTags(project) {
  const notes = Array.isArray(project?.notes) ? project.notes : [];
  const tagSet = new Map();
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
