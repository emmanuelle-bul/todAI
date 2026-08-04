import { useMemo, useState } from 'react';
import type { Task } from '../types/task';
import TaskCard from './TaskCard';

type TaskListProps = {
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, status: Task['status']) => Promise<void>;
  tasks: Task[];
};

type SortColumn = 'status' | 'priority' | 'dueDate';
type SortDirection = 'asc' | 'desc';

const statusOrder: Record<Task['status'], number> = {
  Todo: 0,
  InProgress: 1,
  Done: 2,
};

const priorityOrder: Record<Task['priority'], number> = {
  Low: 0,
  Medium: 1,
  High: 2,
};

function TaskList({ loading, onDelete, onEdit, onStatusChange, tasks }: TaskListProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedTasks = useMemo(() => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    const copy = [...tasks];

    return copy.sort((a, b) => {
      if (sortColumn === 'status') {
        const byStatus = (statusOrder[a.status] - statusOrder[b.status]) * direction;
        if (byStatus !== 0) return byStatus;
      }

      if (sortColumn === 'priority') {
        const byPriority = (priorityOrder[a.priority] - priorityOrder[b.priority]) * direction;
        if (byPriority !== 0) return byPriority;
      }

      if (sortColumn === 'dueDate') {
        const aDate = a.dueDate ?? Number.POSITIVE_INFINITY;
        const bDate = b.dueDate ?? Number.POSITIVE_INFINITY;
        const byDueDate = (aDate - bDate) * direction;
        if (byDueDate !== 0) return byDueDate;
      }

      return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    });
  }, [tasks, sortColumn, sortDirection]);

  function toggleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortColumn(column);
    setSortDirection('asc');
  }

  function getAriaSort(column: SortColumn): 'none' | 'ascending' | 'descending' {
    if (sortColumn !== column) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  function getTriangle(column: SortColumn): string {
    if (sortColumn === column && sortDirection === 'desc') return '▼';
    return '▲';
  }

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
              <th scope="col" aria-sort={getAriaSort('status')}>
                <button className="sort-button" type="button" onClick={() => toggleSort('status')}>
                  <span>Status</span>
                  <span className={`triangle ${sortColumn === 'status' ? 'active' : ''}`} aria-hidden="true">{getTriangle('status')}</span>
                </button>
              </th>
              <th scope="col" aria-sort={getAriaSort('priority')}>
                <button className="sort-button" type="button" onClick={() => toggleSort('priority')}>
                  <span>Priority</span>
                  <span className={`triangle ${sortColumn === 'priority' ? 'active' : ''}`} aria-hidden="true">{getTriangle('priority')}</span>
                </button>
              </th>
              <th scope="col" aria-sort={getAriaSort('dueDate')}>
                <button className="sort-button" type="button" onClick={() => toggleSort('dueDate')}>
                  <span>Due date</span>
                  <span className={`triangle ${sortColumn === 'dueDate' ? 'active' : ''}`} aria-hidden="true">{getTriangle('dueDate')}</span>
                </button>
              </th>
              <th scope="col"><span className="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task) => <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TaskList;
