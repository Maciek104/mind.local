import type { Section } from '../../types';
import './Nav.css';

interface NavProps {
  section: Section;
}

const sectionTitles: Record<Section, string> = {
  overview: 'Overview',
  users: 'Users',
  files: 'Files',
  plans: 'Plans',
};

function Nav({ section }: NavProps) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>mind.local®</span>
        <span className="breadcrumb-divider">&gt;</span>
        <strong>{sectionTitles[section]}</strong>
      </div>
      <div className="topbar-right">
        <span className="secure-dot" />
        Admin panel
      </div>
    </header>
  );
}

export default Nav;
