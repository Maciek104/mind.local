import type { AdminUser } from '../../services/admin';
import type { Section } from '../../types';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import { getUserAvatarUrl } from '../../services/admin';
import './Aside.css';

interface AsideProps {
  section: Section;
  user: AdminUser;
  userCount: number;
  documentCount: number;
  onNavigate: (section: Section) => void;
  onLogout: () => void;
}

function Aside({
  section,
  user,
  userCount,
  documentCount,
  onNavigate,
  onLogout,
}: AsideProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>mind.local<sup>®</sup></h1>
        <span>ADMIN PANEL</span>
      </div>
      <p className="sidebar-label">NAVIGATION</p>
      <nav className="sidebar-nav" aria-label="Admin panel navigation">
        <button
          className={section === 'overview' ? 'nav-item selected' : 'nav-item'}
          onClick={() => onNavigate('overview')}
        >
          <MaterialIcon className="nav-icon" name="home" />
          Overview
        </button>
        <button
          className={section === 'users' ? 'nav-item selected' : 'nav-item'}
          onClick={() => onNavigate('users')}
        >
          <MaterialIcon className="nav-icon" name="group" />
          Users
          <span className="nav-count">{userCount}</span>
        </button>
        <button
          className={section === 'files' ? 'nav-item selected' : 'nav-item'}
          onClick={() => onNavigate('files')}
        >
          <MaterialIcon className="nav-icon" name="folder_open" />
          Files
          <span className="nav-count">{documentCount}</span>
        </button>
        <button
          className={section === 'plans' ? 'nav-item selected' : 'nav-item'}
          onClick={() => onNavigate('plans')}
        >
          <MaterialIcon className="nav-icon" name="sell" />
          Plans
        </button>
      </nav>
      <div className="sidebar-bottom">
        <div className="admin-identity">
          <div className="avatar">
            {user.profile_image_path ? (
              <img
                crossOrigin="use-credentials"
                src={getUserAvatarUrl(user.id, user.profile_image_path)}
                alt=""
              />
            ) : (
              (user.display_name || user.email).slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="identity-copy">
            <strong>{user.display_name || 'Administrator'}</strong>
            <span>{user.email}</span>
          </div>
        </div>
        <button className="logout-button" onClick={onLogout}>
          <MaterialIcon name="logout" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default Aside;
