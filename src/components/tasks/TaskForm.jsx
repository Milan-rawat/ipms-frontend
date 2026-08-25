import { useState, useEffect } from 'react';
import { TASK_STATUSES, TASK_PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from '../../utils/constants';

function TaskForm({ initialData, members, onSubmit, onCancel, isLoading, error }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'todo',
        priority: initialData.priority || 'medium',
        assignee: initialData.assignee?._id || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.title.trim()) {
      setLocalError('Title is required');
      return;
    }
    if (formData.title.trim().length < 2) {
      setLocalError('Title must be at least 2 characters');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      assignee: formData.assignee || null,
    };

    onSubmit(payload);
  };

  const displayError = localError || error;
  const isEdit = Boolean(initialData);

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {displayError && <div className="auth-error" role="alert">{displayError}</div>}

      <div className="form-group">
        <label htmlFor="task-title">Title</label>
        <input id="task-title" name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Task title" disabled={isLoading} />
      </div>

      <div className="form-group">
        <label htmlFor="task-desc">Description (optional)</label>
        <textarea id="task-desc" name="description" value={formData.description} onChange={handleChange} placeholder="Task description" disabled={isLoading} rows={3} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="task-status">Status</label>
          <select id="task-status" name="status" value={formData.status} onChange={handleChange} disabled={isLoading}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="task-priority">Priority</label>
          <select id="task-priority" name="priority" value={formData.priority} onChange={handleChange} disabled={isLoading}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="task-assignee">Assignee</label>
        <select id="task-assignee" name="assignee" value={formData.assignee} onChange={handleChange} disabled={isLoading}>
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isLoading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Task')}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
