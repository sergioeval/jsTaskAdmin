export function bindNotesUI({
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
  onTabTasks,
  onTabNotes,
  onTabMindMaps,
  onTagFilterChange,
  onNewNote,
  onCloseNote,
  onSubmitNote,
  onDeleteNote,
}) {
  tabTasksBtn.addEventListener("click", onTabTasks);
  tabNotesBtn.addEventListener("click", onTabNotes);
  tabMindMapsBtn.addEventListener("click", onTabMindMaps);

  notesTagFilter.addEventListener("change", onTagFilterChange);

  newNoteBtn.addEventListener("click", onNewNote);
  closeNoteBtn.addEventListener("click", onCloseNote);
  noteCancelBtn.addEventListener("click", onCloseNote);

  modalNote.addEventListener("click", (e) => {
    if (e.target === modalNote) onCloseNote();
  });

  noteForm.addEventListener("submit", onSubmitNote);
  deleteNoteBtn.addEventListener("click", onDeleteNote);
}
