import { useEffect, useState } from 'react';
import axios from 'axios';
import type { CreateTaskPayload, Task, TaskPriority, TodoStatus, UpdateTaskPayload } from '../types/task';

type TaskFormProps = {
  initialValues?: Task | null;
  onCancel: () => void;
  onSubmit: (payload: CreateTaskPayload | UpdateTaskPayload) => Promise<void>;
};

type FormValues = {
  title: string;
  description: string;
  category: string;
  status: TodoStatus;
  priority: TaskPriority;
  dueDate: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const emptyValues: FormValues = {
  title: '',
  description: '',
  category: '',
  status: 'Todo',
  priority: 'Medium',
  dueDate: '',
};

function toDateInputValue(unixSeconds: number): string {
  const normalized = Number(unixSeconds);
  if (!Number.isFinite(normalized)) return '';

  const date = new Date(normalized * 1000);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toUnixSeconds(value: string): number | null {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  if ([year, month, day].some((part) => !Number.isFinite(part))) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Math.floor(date.getTime() / 1000);
}

function toFormValues(task?: Task | null): FormValues {
  if (!task) return emptyValues;

  return {
    title: task.title,
    description: task.description ?? '',
    category: task.category ?? '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate != null ? toDateInputValue(task.dueDate) : '',
  };
}

function TaskForm({ initialValues, onCancel, onSubmit }: TaskFormProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(initialValues));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues(toFormValues(initialValues));
    setErrors({});
  }, [initialValues]);

  function updateValue<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    const title = values.title.trim();

    if (!title) nextErrors.title = 'Title is required.';
    else if (title.length > 200) nextErrors.title = 'Title must be 200 characters or fewer.';

    if (values.description.length > 2000) {
      nextErrors.description = 'Description must be 2,000 characters or fewer.';
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim() || null,
        category: values.category.trim() || null,
        status: values.status,
        priority: values.priority,
        dueDate: toUnixSeconds(values.dueDate),
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const validationErrors = error.response.data?.errors as Record<string, string[]> | undefined;
        const serverErrors: FormErrors = {};
        for (const [field, messages] of Object.entries(validationErrors ?? {})) {
          const formField = field.charAt(0).toLowerCase() + field.slice(1) as keyof FormValues;
          if (formField in values) serverErrors[formField] = messages[0];
        }
        setErrors(Object.keys(serverErrors).length ? serverErrors : { title: 'Please review the form and try again.' });
      } else {
        setErrors({ title: 'Unable to save the task. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isEditing = Boolean(initialValues);

  return (
    <section className="task-form-panel" aria-labelledby="task-form-heading">
      <div className="form-heading">
        <div>
          <p className="eyebrow">{isEditing ? 'Update task' : 'New task'}</p>
          <h2 id="task-form-heading">{isEditing ? 'Edit task' : 'Create a task'}</h2>
        </div>
      </div>
      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <label className="field field-wide">
          <span>Title</span>
          <input
            value={values.title}
            onChange={(event) => updateValue('title', event.target.value)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'title-error' : undefined}
            maxLength={200}
            required
            autoFocus
          />
          {errors.title && <small id="title-error" className="field-error">{errors.title}</small>}
        </label>

        <label className="field field-wide">
          <span>Description <em>Optional</em></span>
          <textarea
            value={values.description}
            onChange={(event) => updateValue('description', event.target.value)}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'description-error' : undefined}
            maxLength={2000}
            rows={4}
          />
          {errors.description && <small id="description-error" className="field-error">{errors.description}</small>}
        </label>

        <label className="field">
          <span>Category <em>Optional</em></span>
          <input value={values.category} onChange={(event) => updateValue('category', event.target.value)} />
        </label>

        <label className="field">
          <span>Due date <em>Optional</em></span>
          <input type="date" value={values.dueDate} onChange={(event) => updateValue('dueDate', event.target.value)} />
        </label>

        <label className="field">
          <span>Status</span>
          <select value={values.status} onChange={(event) => updateValue('status', event.target.value as TodoStatus)}>
            <option value="Todo">To do</option>
            <option value="InProgress">In progress</option>
            <option value="Done">Done</option>
          </select>
        </label>

        <label className="field">
          <span>Priority</span>
          <select value={values.priority} onChange={(event) => updateValue('priority', event.target.value as TaskPriority)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        <div className="form-actions field-wide">
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create task'}
          </button>
          <button className="button button-secondary" type="button" onClick={onCancel} disabled={submitting}>Cancel</button>
        </div>
      </form>
    </section>
  );
}

export default TaskForm;
