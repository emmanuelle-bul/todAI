import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskCard from './TaskCard';
import type { Task } from '../types/task';

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: 'Sample task',
    description: 'Example description',
    category: 'Work',
    status: 'Todo',
    priority: 'Medium',
    dueDate: null,
    createdAt: 1_700_000_000,
    updatedAt: 1_700_000_100,
    ...overrides,
  };
}

describe('TaskCard', () => {
  it('shows a fallback label when dueDate is empty', () => {
    render(<TaskCard task={createTask({ dueDate: null })} onEdit={async () => {}} onDelete={async () => {}} onStatusChange={async () => {}} />);

    expect(screen.getByText('No due date')).toBeInTheDocument();
  });

  it('renders a formatted date for a valid unix timestamp', () => {
    render(<TaskCard task={createTask({ dueDate: 1_700_000_000 })} onEdit={async () => {}} onDelete={async () => {}} onStatusChange={async () => {}} />);

    expect(screen.getByText(/2023|2024/)).toBeInTheDocument();
  });

  it('shows a fallback label for invalid numeric values', () => {
    render(<TaskCard task={createTask({ dueDate: Number.NaN })} onEdit={async () => {}} onDelete={async () => {}} onStatusChange={async () => {}} />);

    expect(screen.getByText('No due date')).toBeInTheDocument();
  });
});
