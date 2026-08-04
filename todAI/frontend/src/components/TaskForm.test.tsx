import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskForm from './TaskForm';

describe('TaskForm', () => {
  it('renders an empty due date input when no value is provided', () => {
    render(<TaskForm onCancel={() => {}} onSubmit={async () => {}} />);

    const input = screen.getByLabelText(/Due date/i) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('preserves an empty due date for tasks without a date', () => {
    render(
      <TaskForm
        initialValues={{
          id: 1,
          title: 'Task',
          description: null,
          category: null,
          status: 'Todo',
          priority: 'Medium',
          dueDate: null,
          createdAt: 1_700_000_000,
          updatedAt: 1_700_000_100,
        }}
        onCancel={() => {}}
        onSubmit={async () => {}}
      />
    );

    const input = screen.getByLabelText(/Due date/i) as HTMLInputElement;
    expect(input.value).toBe('');
  });
});
