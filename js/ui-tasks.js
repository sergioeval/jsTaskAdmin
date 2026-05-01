export function bindTaskUI({
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
  onOpenBacklog,
  onOpenDone,
  onCloseBacklog,
  onCloseDone,
  onCloseTask,
  onSubmitTask,
  onAddChecklist,
  onAddComment,
  onDeleteTask,
}) {
  openBacklogBtn.addEventListener("click", onOpenBacklog);
  openDoneBtn.addEventListener("click", onOpenDone);
  closeBacklogBtn.addEventListener("click", onCloseBacklog);
  closeDoneBtn.addEventListener("click", onCloseDone);

  closeTaskBtn.addEventListener("click", onCloseTask);
  cancelTaskBtn.addEventListener("click", onCloseTask);
  modalTask.addEventListener("click", (e) => {
    if (e.target === modalTask) onCloseTask();
  });

  taskEditForm.addEventListener("submit", onSubmitTask);
  addChecklistBtn.addEventListener("click", onAddChecklist);
  addCommentBtn.addEventListener("click", onAddComment);
  deleteTaskBtn.addEventListener("click", onDeleteTask);

  modalBacklog.addEventListener("click", (e) => {
    if (e.target === modalBacklog) onCloseBacklog();
  });
  modalDone.addEventListener("click", (e) => {
    if (e.target === modalDone) onCloseDone();
  });
}
