import axios from 'axios';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task';

const BASE = '/api/tasks';

export const taskService = {
  getAll: (): Promise<Task[]> =>
    axios.get<Task[]>(BASE).then((r) => r.data),

  getById: (id: number): Promise<Task> =>
    axios.get<Task>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreateTaskPayload): Promise<Task> =>
    axios.post<Task>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateTaskPayload): Promise<Task> =>
    axios.put<Task>(`${BASE}/${id}`, payload).then((r) => r.data),

  remove: (id: number): Promise<void> =>
    axios.delete(`${BASE}/${id}`).then(() => undefined),
};
