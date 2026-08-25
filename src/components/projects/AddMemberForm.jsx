import { useState } from 'react';

function AddMemberForm({ onSubmit, onCancel, isLoading, error: externalError }) {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setLocalError('Please enter a valid email');
      return;
    }

    onSubmit(email.trim().toLowerCase());
  };

  const displayError = localError || externalError;

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {displayError && <div className="auth-error" role="alert">{displayError}</div>}
      <p className="form-hint">Add an existing registered user by their email address.</p>
      <div className="form-group">
        <label htmlFor="member-email">User Email</label>
        <input id="member-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setLocalError(''); }} placeholder="user@company.com" disabled={isLoading} />
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isLoading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Member'}</button>
      </div>
    </form>
  );
}

export default AddMemberForm;
