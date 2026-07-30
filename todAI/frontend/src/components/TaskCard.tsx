import { useState } from 'react';
import type { Task } from '../types/task';

type TaskCardProps = {
  task: Task;
  onDelete: (id: number) => Promise<void>;
  onEdit: (task: Task) => void;
};

const statusLabels = {
  Todo: 'To do',
  InProgress: 'In progress',
  Done: 'Done',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function TaskCard({ task, onDelete, onEdit }: TaskCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <tr>
      <td className="task-name-cell">
        <strong>{task.title}</strong>
        {task.description && <span className="task-description">{task.description}</span>}
      </td>
      <td>{task.category || <span className="table-muted">No category</span>}</td>
      <td><span className={`badge badge-status status-${task.status}`}>{statusLabels[task.status]}</span></td>
      <td><span className={`badge badge-priority priority-${task.priority}`}>{task.priority}</span></td>
      <td>{task.dueDate ? formatDate(task.dueDate) : <span className="table-muted">No due date</span>}</td>
      <td className="task-actions-cell">
        <div className="task-actions">
          {confirmingDelete ? (
            <div className="delete-confirmation" role="group" aria-label={`Delete ${task.title}`}>
              <span>Delete this task?</span>
              <button className="button button-danger button-small" type="button" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button className="button button-secondary button-small" type="button" onClick={() => setConfirmingDelete(false)} disabled={deleting}>Cancel</button>
            </div>
          ) : (
            <>
              <button className="button button-secondary button-small" type="button" onClick={() => onEdit(task)}>Edit</button>
              <button className="button button-danger-quiet button-small" type="button" onClick={() => setConfirmingDelete(true)}>Delete</button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default TaskCard;
