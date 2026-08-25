import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

/**
 * Route guard:
 * - Shows loading while auth initializes
 * - Redirects to /login if unauthenticated
 * - Renders children if authenticated
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) {
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
