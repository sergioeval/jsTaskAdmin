export function bindMindMapsUI({
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
  onCloseLinkedMap,
  onSaveLinkedMapName,
  onDeleteLinkedMap,
  onNewMindMap,
  onMindMapSelect,
  onSaveMindMapName,
  onDeleteMindMap,
  onCloseMindMap,
  onMindMapInnerClick,
  onMindMapInnerDblClick,
  onCloseNodeQuick,
  onSubmitNodeQuick,
  onAddChildQuick,
  onDeleteNodeQuick,
}) {
  closeLinkedMapBtn.addEventListener("click", onCloseLinkedMap);
  modalLinkedMap.addEventListener("click", (e) => {
    if (e.target === modalLinkedMap) onCloseLinkedMap();
  });
  linkedMapSaveNameBtn.addEventListener("click", onSaveLinkedMapName);
  linkedMapDeleteMapBtn.addEventListener("click", onDeleteLinkedMap);

  newMindMapBtn.addEventListener("click", onNewMindMap);
  if (mindMapSelect) mindMapSelect.addEventListener("change", onMindMapSelect);
  mindMapSaveNameBtn.addEventListener("click", onSaveMindMapName);
  mindMapDeleteMapBtn.addEventListener("click", onDeleteMindMap);
  closeMindMapBtn.addEventListener("click", onCloseMindMap);

  mindMapInner.addEventListener("click", onMindMapInnerClick);
  mindMapInner.addEventListener("dblclick", onMindMapInnerDblClick);

  if (modalMindMapNode) {
    modalMindMapNode.addEventListener("click", (e) => {
      if (e.target === modalMindMapNode) onCloseNodeQuick();
    });
  }
  if (mindMapQuickForm) mindMapQuickForm.addEventListener("submit", onSubmitNodeQuick);
  closeMindMapQuickBtn?.addEventListener("click", onCloseNodeQuick);
  mindMapQuickCancelBtn?.addEventListener("click", onCloseNodeQuick);
  mindMapQuickAddChildBtn?.addEventListener("click", onAddChildQuick);
  mindMapQuickDeleteNodeBtn?.addEventListener("click", onDeleteNodeQuick);
}
