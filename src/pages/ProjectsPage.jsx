import { useEffect, useState } from 'react';
import useProjectStore from '../stores/projectStore';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectForm from '../components/projects/CreateProjectForm';
import Modal from '../components/common/Modal';

function ProjectsPage() {
  const { projects, isLoading, error, fetchProjects, createProject } = useProjectStore();
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (data) => {
    setCreateLoading(true);
    setCreateError('');
    try {
      await createProject(data);
      setShowCreate(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreateLoading(false);
    }
  };

  if (isLoading && projects.length === 0) {
    return <div className="page"><p>Loading projects...</p></div>;
  }

  if (error) {
    return <div className="page"><div className="auth-error">{error}</div></div>;
  }

  return (
    <div className="page projects-page">
      <div className="page-header">
        <h1>My Projects</h1>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary" type="button">
          + Create Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet.</p>
          <p>Create your first project to get started.</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
        {createError && <div className="auth-error" role="alert">{createError}</div>}
        <CreateProjectForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isLoading={createLoading} />
      </Modal>
    </div>
  );
}

export default ProjectsPage;
