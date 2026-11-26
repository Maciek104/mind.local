import type { AdminUser } from '../../services/admin';
import type { Section } from '../../types';
import homeIcon from '../../../../frontend/src/assets/icons/home.svg';
import usersIcon from '../../../../frontend/src/assets/icons/person.svg';
import filesIcon from '../../../../frontend/src/assets/icons/library_books.svg';
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
      <p className="sidebar-label">NAWIGACJA</p>
      <nav className="sidebar-nav" aria-label="Nawigacja panelu">
        <button
          className={section === 'overview' ? 'nav-item selected' : 'nav-item'}
          onClick={() => onNavigate('overview')}
        >
          <img className="nav-icon" src={homeIcon} alt="" />
          Przegląd
        </button>
        <button
          className={section === 'users' ? 'nav-item selected' : 'nav-item'}
          onClick={() => onNavigate('users')}
        >
          <img className="nav-icon" src={usersIcon} alt="" />
          Użytkownicy
          <span className="nav-count">{userCount}</span>
        </button>
        <button
          className={section === 'files' ? 'nav-item selected' : 'nav-item'}
          onClick={() => onNavigate('files')}
        >
          <img className="nav-icon" src={filesIcon} alt="" />
          Pliki
          <span className="nav-count">{documentCount}</span>
        </button>
      </nav>
      <div className="sidebar-bottom">
        <div className="admin-identity">
          <div className="avatar">{(user.display_name || user.email).slice(0, 1).toUpperCase()}</div>
          <div className="identity-copy">
            <strong>{user.display_name || 'Administrator'}</strong>
            <span>{user.email}</span>
          </div>
        </div>
        <button className="logout-button" onClick={onLogout}>
          ↪ <span>Wyloguj</span>
        </button>
      </div>
    </aside>
  );
}

export default Aside;
