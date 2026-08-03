import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Task, TodoStatus } from '../types/task';

type TaskCardProps = {
  task: Task;
  onDelete: (id: number) => Promise<void>;
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, status: TodoStatus) => Promise<void>;
};

const statusLabels = {
  Todo: 'To do',
  InProgress: 'In progress',
  Done: 'Done',
};

function formatDate(value: number | string | null | undefined) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    return 'No due date';
  }

  const date = new Date(normalized * 1000);
  if (Number.isNaN(date.getTime())) {
    return 'No due date';
  }

  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function TaskCard({ task, onDelete, onEdit, onStatusChange }: TaskCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<TodoStatus>(task.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const dialogTitleId = `delete-task-title-${task.id}`;
  const dialogDescriptionId = `delete-task-description-${task.id}`;

  useEffect(() => {
    setStatus(task.status);
  }, [task.status]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(nextStatus: TodoStatus) {
    setStatus(nextStatus);
    setUpdatingStatus(true);

    try {
      await onStatusChange(task, nextStatus);
    } catch {
      setStatus(task.status);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <>
      <tr>
        <td className="task-name-cell">
          <strong>{task.title}</strong>
          {task.description && <span className="task-description">{task.description}</span>}
        </td>
        <td>{task.category || <span className="table-muted">No category</span>}</td>
        <td>
          <label className="visually-hidden" htmlFor={`task-status-${task.id}`}>Status for {task.title}</label>
          <select
            id={`task-status-${task.id}`}
            className={`task-status-select status-${status}`}
            value={status}
            onChange={(event) => void handleStatusChange(event.target.value as TodoStatus)}
            disabled={updatingStatus}
            aria-label={`Status for ${task.title}`}
          >
            <option value="Todo">{statusLabels.Todo}</option>
            <option value="InProgress">{statusLabels.InProgress}</option>
            <option value="Done">{statusLabels.Done}</option>
          </select>
        </td>
        <td><span className={`badge badge-priority priority-${task.priority}`}>{task.priority}</span></td>
        <td>{task.dueDate != null ? formatDate(task.dueDate) : <span className="table-muted">No due date</span>}</td>
        <td className="task-actions-cell">
          <div className="task-actions">
            <button className="button button-secondary button-small" type="button" onClick={() => onEdit(task)}>Edit</button>
            <button className="button button-danger-quiet button-small" type="button" onClick={() => setConfirmingDelete(true)}>Delete</button>
          </div>
        </td>
      </tr>

      {confirmingDelete && createPortal(
        <div className="modal-backdrop" role="presentation" onClick={deleting ? undefined : () => setConfirmingDelete(false)}>
          <div
            className="modal-card delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescriptionId}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">Delete task</p>
            <h2 id={dialogTitleId}>Delete {task.title}?</h2>
            <p id={dialogDescriptionId}>This action will permanently remove the task.</p>
            <div className="modal-actions">
              <button className="button button-danger" type="button" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button className="button button-secondary" type="button" onClick={() => setConfirmingDelete(false)} disabled={deleting}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

export default TaskCard;
