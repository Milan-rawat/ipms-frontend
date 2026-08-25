import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

function ProjectCard({ project }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isAdmin = project.owner?._id === user?._id;
  const role = isAdmin ? 'Admin' : 'Member';
  const memberCount = project.members?.length || 0;

  return (
    <div className="project-card" onClick={() => navigate(`/projects/${project._id}`)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate(`/projects/${project._id}`)}>
      <div className="project-card-header">
        <h3 className="project-card-name">{project.name}</h3>
        <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-member'}`}>{role}</span>
      </div>
      {project.description && <p className="project-card-desc">{project.description}</p>}
      <div className="project-card-footer">
        <span className="project-card-members">{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

export default ProjectCard;
