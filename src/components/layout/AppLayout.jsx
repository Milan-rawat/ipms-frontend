import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { disconnectSocket } from '../../sockets/socket';

/**
 * Main application layout for authenticated pages.
 * Provides navigation, user info, logout, and content area.
 */
function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    disconnectSocket();
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <nav className="app-nav">
          <Link to="/projects" className="app-logo">
            IPMS
          </Link>
          <div className="app-nav-right">
            <span className="user-name">{user?.name}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
