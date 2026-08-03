export type TodoStatus = 'Todo' | 'InProgress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  status: TodoStatus;
  priority: TaskPriority;
  dueDate: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  category?: string | null;
  status?: TodoStatus;
  priority?: TaskPriority;
  dueDate?: number | null;
}

export interface UpdateTaskPayload {
  title: string;
  description?: string | null;
  category?: string | null;
  status: TodoStatus;
  priority: TaskPriority;
  dueDate?: number | null;
}
