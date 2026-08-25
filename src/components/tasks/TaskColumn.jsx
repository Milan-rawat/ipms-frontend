import TaskCard from './TaskCard';
import { STATUS_LABELS } from '../../utils/constants';

function TaskColumn({ status, tasks, isAdmin, onEdit, onDelete }) {
  return (
    <div className="task-column">
      <div className="task-column-header">
        <h3 className={`task-column-title status-${status}`}>
          {STATUS_LABELS[status] || status}
        </h3>
        <span className="task-column-count">{tasks.length}</span>
      </div>
      <div className="task-column-body">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && (
          <p className="task-column-empty">No tasks</p>
        )}
      </div>
    </div>
  );
}

export default TaskColumn;
