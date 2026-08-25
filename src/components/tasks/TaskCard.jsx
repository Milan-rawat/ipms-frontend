import { STATUS_LABELS, PRIORITY_LABELS } from '../../utils/constants';
import useAuthStore from '../../stores/authStore';

function TaskCard({ task, isAdmin, onEdit, onDelete }) {
  const { user } = useAuthStore();
  const canDelete = isAdmin || task.createdBy?._id === user?._id;

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h4 className="task-card-title">{task.title}</h4>
        <span className={`priority-badge priority-${task.priority}`}>
          {PRIORITY_LABELS[task.priority] || task.priority}
        </span>
      </div>

      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-meta">
        <span className={`status-badge status-${task.status}`}>
          {STATUS_LABELS[task.status] || task.status}
        </span>
        <span className="task-assignee">
          {task.assignee ? task.assignee.name : 'Unassigned'}
        </span>
      </div>

      <div className="task-card-actions">
        <button onClick={() => onEdit(task)} className="btn btn-sm btn-secondary" type="button">Edit</button>
        {canDelete && (
          <button onClick={() => onDelete(task)} className="btn btn-sm btn-danger" type="button">Delete</button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
