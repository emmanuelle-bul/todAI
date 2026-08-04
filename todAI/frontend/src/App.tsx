import { useEffect, useMemo, useState } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { taskService } from './services/taskService';
import type { CreateTaskPayload, Task, UpdateTaskPayload } from './types/task';
import './App.css';

type TaskFilter = 'all' | 'today' | 'upcoming' | 'completed';

type StatusKey = 'Todo' | 'InProgress' | 'Done';

const statusMeta: Record<StatusKey, { label: string; className: string }> = {
  Todo: { label: 'To do', className: 'status-color-todo' },
  InProgress: { label: 'In progress', className: 'status-color-progress' },
  Done: { label: 'Done', className: 'status-color-done' },
};

function getTodayUnixRange(): { start: number; end: number } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  return {
    start: Math.floor(startDate.getTime() / 1000),
    end: Math.floor(endDate.getTime() / 1000),
  };
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      setTasks(await taskService.getAll());
    } catch {
      setError('Unable to load tasks. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  function closeForm() {
    setShowForm(false);
    setEditingTask(null);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setShowForm(true);
  }

  async function handleSubmit(payload: CreateTaskPayload | UpdateTaskPayload) {
    if (editingTask) {
      await taskService.update(editingTask.id, payload as UpdateTaskPayload);
    } else {
      await taskService.create(payload);
    }
    closeForm();
    await loadTasks();
  }

  async function handleDelete(id: number) {
    try {
      await taskService.remove(id);
      await loadTasks();
    } catch {
      setError('Unable to delete the task. Please try again.');
    }
  }

  function openCreateForm() {
    setEditingTask(null);
    setShowForm(true);
  }

  async function handleStatusChange(task: Task, status: Task['status']) {
    try {
      setError(null);
      await taskService.update(task.id, {
        title: task.title,
        description: task.description,
        category: task.category,
        status,
        priority: task.priority,
        dueDate: task.dueDate,
      });
      await loadTasks();
    } catch {
      setError('Unable to update the task status. Please try again.');
    }
  }

  const filteredTasks = useMemo(() => {
    if (activeFilter === 'all') return tasks;

    const { start, end } = getTodayUnixRange();

    if (activeFilter === 'today') {
      return tasks.filter((task) => task.dueDate != null && task.dueDate >= start && task.dueDate <= end);
    }

    if (activeFilter === 'upcoming') {
      return tasks.filter((task) => task.dueDate == null || task.dueDate > end);
    }

    return tasks.filter((task) => task.status === 'Done');
  }, [activeFilter, tasks]);

  const statusStats = useMemo(() => {
    const counts: Record<StatusKey, number> = {
      Todo: 0,
      InProgress: 0,
      Done: 0,
    };

    for (const task of filteredTasks) {
      counts[task.status] += 1;
    }

    const total = filteredTasks.length;
    const getPercent = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100));

    const todoPercent = getPercent(counts.Todo);
    const inProgressPercent = getPercent(counts.InProgress);
    const donePercent = total === 0 ? 0 : Math.max(0, 100 - todoPercent - inProgressPercent);

    return {
      total,
      counts,
      percentages: {
        Todo: todoPercent,
        InProgress: inProgressPercent,
        Done: donePercent,
      },
    };
  }, [filteredTasks]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Personal task manager</p>
          <h1>todAI</h1>
        </div>
        {!showForm && (
          <div className="header-actions" role="group" aria-label="Task filters and actions">
            <button
              className={`button button-secondary button-filter ${activeFilter === 'today' ? 'button-filter-active' : ''}`}
              type="button"
              onClick={() => setActiveFilter('today')}
            >
              Today
            </button>
            <button
              className={`button button-secondary button-filter ${activeFilter === 'upcoming' ? 'button-filter-active' : ''}`}
              type="button"
              onClick={() => setActiveFilter('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`button button-secondary button-filter ${activeFilter === 'all' ? 'button-filter-active' : ''}`}
              type="button"
              onClick={() => setActiveFilter('all')}
            >
              All Tasks
            </button>
            <button
              className={`button button-secondary button-filter ${activeFilter === 'completed' ? 'button-filter-active' : ''}`}
              type="button"
              onClick={() => setActiveFilter('completed')}
            >
              Completed
            </button>
            <button className="button button-primary add-task-button" type="button" onClick={openCreateForm}>Add task</button>
          </div>
        )}
      </header>

      {showForm && !editingTask && <TaskForm initialValues={null} onSubmit={handleSubmit} onCancel={closeForm} />}

      {error && <div className="page-error" role="alert"><span>{error}</span><button className="button button-secondary button-small" type="button" onClick={() => void loadTasks()}>Retry</button></div>}

      <div className="list-header">
        <h2>Your tasks</h2>
        {!loading && <span>{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}</span>}
      </div>

      <div className="tasks-layout">
        <div className="tasks-table-area">
          <TaskList tasks={filteredTasks} loading={loading} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
        </div>

        <aside className="stats-panel" aria-label="Task status statistics">
          <div
            className="status-donut"
            aria-hidden="true"
            style={{
              '--todo-end': `${statusStats.percentages.Todo}%`,
              '--in-progress-end': `${statusStats.percentages.Todo + statusStats.percentages.InProgress}%`,
            } as React.CSSProperties}
          >
            <div className="status-donut-center" />
          </div>

          <ul className="status-breakdown" aria-label="Task counts by status">
            {(['Todo', 'InProgress', 'Done'] as const).map((status) => (
              <li key={status} className="status-item">
                <div className="status-item-head">
                  <span className="status-label">
                    <span className={`status-dot ${statusMeta[status].className}`} aria-hidden="true" />
                    {statusMeta[status].label}
                  </span>
                  <span className="status-values">{statusStats.counts[status]} ({statusStats.percentages[status]}%)</span>
                </div>
                <div className="status-track" aria-hidden="true">
                  <span
                    className={`status-fill ${statusMeta[status].className}`}
                    style={{ width: `${statusStats.percentages[status]}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {showForm && editingTask && <TaskForm initialValues={editingTask} onSubmit={handleSubmit} onCancel={closeForm} />}
    </main>
  );
}

export default App;
