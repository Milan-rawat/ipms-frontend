import { useState } from 'react';

function CreateProjectForm({ onSubmit, onCancel, isLoading }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (name.trim().length > 100) {
      setError('Name must be at most 100 characters');
      return;
    }

    onSubmit({ name: name.trim(), description: description.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <div className="auth-error" role="alert">{error}</div>}
      <div className="form-group">
        <label htmlFor="project-name">Project Name</label>
        <input id="project-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Project" disabled={isLoading} />
      </div>
      <div className="form-group">
        <label htmlFor="project-desc">Description (optional)</label>
        <textarea id="project-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" disabled={isLoading} rows={3} />
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isLoading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Project'}</button>
      </div>
    </form>
  );
}

export default CreateProjectForm;
