export type TodoStatus = 'Todo' | 'InProgress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  status: TodoStatus;
  priority: TaskPriority;
  dueDate: string | null; // ISO 8601 date string
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  category?: string | null;
  status?: TodoStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title: string;
  description?: string | null;
  category?: string | null;
  status: TodoStatus;
  priority: TaskPriority;
  dueDate?: string | null;
}
