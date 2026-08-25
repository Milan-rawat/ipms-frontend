import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useTaskStore from '../stores/taskStore';
import useProjectStore from '../stores/projectStore';
import useAuthStore from '../stores/authStore';
import TaskColumn from '../components/tasks/TaskColumn';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import { TASK_STATUSES } from '../utils/constants';
import { joinProjectRoom, leaveProjectRoom, getSocket } from '../sockets/socket';

function TaskBoardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentProject, fetchProject, clearCurrentProject, removedFromProject, clearRemovedFlag } = useProjectStore();
  const { tasks, isLoading, error, fetchTasks, createTask, updateTask, deleteTask, reset } = useTaskStore();

  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [opLoading, setOpLoading] = useState(false);
  const [opError, setOpError] = useState('');

  const isAdmin = currentProject?.owner?._id === user?._id;
  const members = currentProject?.members || [];

  // Load project + tasks, join socket room
  useEffect(() => {
    fetchProject(projectId);
    fetchTasks(projectId);
    joinProjectRoom(projectId);

    return () => {
      leaveProjectRoom(projectId);
      clearCurrentProject();
      reset();
    };
  }, [projectId, fetchProject, fetchTasks, clearCurrentProject, reset]);

  // Reconnect handler: refresh state from API
  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    const handleReconnect = () => {
      fetchProject(projectId);
      fetchTasks(projectId);
    };

    sock.on('connect', handleReconnect);
    return () => { sock.off('connect', handleReconnect); };
  }, [projectId, fetchProject, fetchTasks]);

  // Handle being removed from this project
  useEffect(() => {
    if (removedFromProject === projectId) {
      clearRemovedFlag();
      navigate('/projects', { replace: true });
    }
  }, [removedFromProject, projectId, clearRemovedFlag, navigate]);

  const handleCreate = async (data) => {
    setOpLoading(true);
    setOpError('');
    try {
      await createTask(projectId, data);
      setShowCreate(false);
    } catch (err) {
      setOpError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setOpLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setOpLoading(true);
    setOpError('');
    try {
      await updateTask(projectId, editTask._id, data);
      setEditTask(null);
    } catch (err) {
      setOpError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setOpLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setOpLoading(true);
    try {
      await deleteTask(projectId, deleteConfirm._id);
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setOpLoading(false);
    }
  };

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  if (isLoading && tasks.length === 0 && !currentProject) {
    return <div className="page"><p>Loading task board...</p></div>;
  }

  if (error) {
    return (
      <div className="page">
        <div className="auth-error">{error}</div>
        <Link to="/projects" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="page task-board-page">
      <div className="page-header">
        <div>
          <Link to={`/projects/${projectId}`} className="back-link">&larr; {currentProject?.name || 'Project'}</Link>
          <h1>Task Board</h1>
        </div>
        <button onClick={() => { setShowCreate(true); setOpError(''); }} className="btn btn-primary" type="button">
          + New Task
        </button>
      </div>

      {tasks.length === 0 && !isLoading ? (
        <div className="empty-state">
          <p>No tasks yet.</p>
          <p>Create your first task to get started.</p>
        </div>
      ) : (
        <div className="task-board">
          {TASK_STATUSES.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={getTasksByStatus(status)}
              isAdmin={isAdmin}
              onEdit={(task) => { setEditTask(task); setOpError(''); }}
              onDelete={(task) => setDeleteConfirm(task)}
            />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Task">
        <TaskForm members={members} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isLoading={opLoading} error={opError} />
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={Boolean(editTask)} onClose={() => setEditTask(null)} title="Edit Task">
        <TaskForm initialData={editTask} members={members} onSubmit={handleUpdate} onCancel={() => setEditTask(null)} isLoading={opLoading} error={opError} />
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} title="Delete Task">
        <p style={{ marginBottom: '1.5rem' }}>
          Are you sure you want to delete <strong>{deleteConfirm?.title}</strong>?
        </p>
        <div className="form-actions">
          <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary" disabled={opLoading} type="button">Cancel</button>
          <button onClick={handleDelete} className="btn btn-danger" disabled={opLoading} type="button">
            {opLoading ? 'Deleting...' : 'Delete Task'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default TaskBoardPage;
