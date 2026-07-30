import type { Task } from '../types/task';
import TaskCard from './TaskCard';

type TaskListProps = {
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onEdit: (task: Task) => void;
  tasks: Task[];
};

function TaskList({ loading, onDelete, onEdit, tasks }: TaskListProps) {
  if (loading) return <p className="task-list-message">Loading tasks...</p>;

  if (!tasks.length) {
    return <div className="empty-state"><h2>No tasks yet</h2><p>Create your first task to start tracking your work.</p></div>;
  }

  return (
    <section className="task-list" aria-label="Tasks">
      <div className="task-table-scroll">
        <table className="task-table">
          <thead>
            <tr>
              <th scope="col">Task</th>
              <th scope="col">Category</th>
              <th scope="col">Status</th>
              <th scope="col">Priority</th>
              <th scope="col">Due date</th>
              <th scope="col"><span className="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TaskList;
