import { MIND_NODE_H, MIND_NODE_W } from "./storage.js";

export function mindMapDescendantIds(rootId, nodes) {
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

export function mindMapValidParentIds(nodeId, nodes) {
  const forbidden = new Set([nodeId, ...mindMapDescendantIds(nodeId, nodes)]);
  return nodes.map((n) => n.id).filter((id) => !forbidden.has(id));
}

export function computeMindMapViewLayout(nodes) {
  if (!nodes.length) return { innerW: 400, innerH: 320, tx: 0, ty: 0 };
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
  const margin = 48;
  const topPad = margin;
  const bottomPad = margin;
  const innerW = Math.max(280, Math.ceil(2 * halfW + 2 * margin));
  const tx = innerW / 2 - rcx;
  let ty = topPad + MIND_NODE_H / 2 - rcy;
  const topEdge = minY + ty;
  if (topEdge < 0) ty -= topEdge;
  const bottomEdge = maxB + ty;
  const innerH = Math.max(220, Math.ceil(bottomEdge + bottomPad));
  return { innerW, innerH, tx, ty };
}
