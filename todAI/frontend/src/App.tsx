import { useEffect, useState } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { taskService } from './services/taskService';
import type { CreateTaskPayload, Task, UpdateTaskPayload } from './types/task';
import './App.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Personal task manager</p>
          <h1>todAI</h1>
        </div>
        {!showForm && <button className="button button-primary add-task-button" type="button" onClick={openCreateForm}>Add task</button>}
      </header>

      {showForm && !editingTask && <TaskForm initialValues={null} onSubmit={handleSubmit} onCancel={closeForm} />}

      {error && <div className="page-error" role="alert"><span>{error}</span><button className="button button-secondary button-small" type="button" onClick={() => void loadTasks()}>Retry</button></div>}

      <div className="list-header">
        <h2>Your tasks</h2>
        {!loading && <span>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>}
      </div>
      <TaskList tasks={tasks} loading={loading} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />

      {showForm && editingTask && <TaskForm initialValues={editingTask} onSubmit={handleSubmit} onCancel={closeForm} />}
    </main>
  );
}

export default App;
