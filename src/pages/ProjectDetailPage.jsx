import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useProjectStore from '../stores/projectStore';
import useAuthStore from '../stores/authStore';
import MemberList from '../components/projects/MemberList';
import AddMemberForm from '../components/projects/AddMemberForm';
import Modal from '../components/common/Modal';
import { joinProjectRoom, leaveProjectRoom } from '../sockets/socket';

function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentProject, isLoading, error, fetchProject, updateProject, deleteProject, addMember, removeMember, clearCurrentProject, removedFromProject, clearRemovedFlag } = useProjectStore();

  const [showAddMember, setShowAddMember] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [opError, setOpError] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const isAdmin = currentProject?.owner?._id === user?._id;

  useEffect(() => {
    fetchProject(projectId);
    joinProjectRoom(projectId);
    return () => {
      leaveProjectRoom(projectId);
      clearCurrentProject();
    };
  }, [projectId, fetchProject, clearCurrentProject]);

  // Handle being removed from this project
  useEffect(() => {
    if (removedFromProject === projectId) {
      clearRemovedFlag();
      navigate('/projects', { replace: true });
    }
  }, [removedFromProject, projectId, clearRemovedFlag, navigate]);

  useEffect(() => {
    if (currentProject) {
      setEditName(currentProject.name);
      setEditDesc(currentProject.description || '');
    }
  }, [currentProject]);

  const handleAddMember = async (email) => {
    setOpLoading(true);
    setOpError('');
    try {
      await addMember(projectId, email);
      setShowAddMember(false);
    } catch (err) {
      setOpError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setOpLoading(false);
    }
  };

  const handleRemoveMember = async (userId, name) => {
    if (!confirm(`Remove ${name} from this project?`)) return;
    setOpLoading(true);
    try {
      await removeMember(projectId, userId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setOpLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || editName.trim().length < 2) return;
    setOpLoading(true);
    setOpError('');
    try {
      await updateProject(projectId, { name: editName.trim(), description: editDesc.trim() });
      setShowEdit(false);
    } catch (err) {
      setOpError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setOpLoading(false);
    }
  };

  const handleDelete = async () => {
    setOpLoading(true);
    try {
      await deleteProject(projectId);
      navigate('/projects', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
      setShowDeleteConfirm(false);
    } finally {
      setOpLoading(false);
    }
  };

  if (isLoading && !currentProject) {
    return <div className="page"><p>Loading project...</p></div>;
  }

  if (error) {
    return (
      <div className="page">
        <div className="auth-error">{error}</div>
        <Link to="/projects" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Projects</Link>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="page">
        <p>Project not found.</p>
        <Link to="/projects" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="page project-detail-page">
      <div className="page-header">
        <div>
          <Link to="/projects" className="back-link">&larr; Projects</Link>
          <h1>{currentProject.name}</h1>
          {currentProject.description && <p className="project-description">{currentProject.description}</p>}
        </div>
        {isAdmin && (
          <div className="admin-actions">
            <button onClick={() => setShowEdit(true)} className="btn btn-secondary" type="button">Edit</button>
            <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger" type="button">Delete</button>
          </div>
        )}
      </div>

      <div className="project-content">
        <div className="project-sidebar">
          <MemberList members={currentProject.members || []} ownerId={currentProject.owner?._id} isAdmin={isAdmin} onRemove={handleRemoveMember} removeLoading={opLoading} />
          {isAdmin && (
            <button onClick={() => { setShowAddMember(true); setOpError(''); }} className="btn btn-primary btn-full" type="button" style={{ marginTop: '0.75rem' }}>
              + Add Member
            </button>
          )}
        </div>
        <div className="project-main">
          <div className="task-board-placeholder">
            <h2>Task Board</h2>
            <p>Task management will be available here.</p>
            <Link to={`/projects/${projectId}/tasks`} className="btn btn-primary">Open Task Board</Link>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member">
        <AddMemberForm onSubmit={handleAddMember} onCancel={() => setShowAddMember(false)} isLoading={opLoading} error={opError} />
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Project">
        <form onSubmit={handleEdit} className="auth-form">
          {opError && <div className="auth-error">{opError}</div>}
          <div className="form-group">
            <label htmlFor="edit-name">Name</label>
            <input id="edit-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={opLoading} />
          </div>
          <div className="form-group">
            <label htmlFor="edit-desc">Description</label>
            <textarea id="edit-desc" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} disabled={opLoading} rows={3} />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setShowEdit(false)} className="btn btn-secondary" disabled={opLoading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={opLoading}>{opLoading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Project">
        <p style={{ marginBottom: '1rem' }}>Are you sure you want to delete <strong>{currentProject.name}</strong>?</p>
        <p style={{ marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.875rem' }}>All tasks in this project will also be permanently deleted.</p>
        <div className="form-actions">
          <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary" disabled={opLoading} type="button">Cancel</button>
          <button onClick={handleDelete} className="btn btn-danger" disabled={opLoading} type="button">{opLoading ? 'Deleting...' : 'Delete Project'}</button>
        </div>
      </Modal>
    </div>
  );
}

export default ProjectDetailPage;
