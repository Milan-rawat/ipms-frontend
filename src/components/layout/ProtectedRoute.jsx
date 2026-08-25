import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

/**
 * Route guard that redirects unauthenticated users to /login.
 * Shows nothing while auth state is loading (prevents flash).
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
