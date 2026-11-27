import type { AdminDocument, AdminUser } from '../../services/admin';
import { formatSize } from '../../utils/format';
import type { Section } from '../../types';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
import './Overview.css';

interface OverviewProps {
  users: AdminUser[];
  documents: AdminDocument[];
  loading: boolean;
  busyId: string;
  onRefresh: () => void;
  onDownload: (document: AdminDocument) => void;
  onNavigate: (section: Section) => void;
  onCreateUser: () => void;
}

function Overview({
  users,
  documents,
  loading,
  busyId,
  onRefresh,
  onDownload,
  onNavigate,
  onCreateUser,
}: OverviewProps) {
  const activeUsers = users.filter((user) => user.is_active === 1).length;
  const totalStorage = documents.reduce((total, document) => total + document.fileSize, 0);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Overview</h1>
          <p className="page-subtitle">Key information about your local.mind instance.</p>
        </div>
        <button className="secondary-button refresh-button" onClick={onRefresh} disabled={loading}>
          <MaterialIcon name="refresh" /> <span>Refresh</span>
        </button>
      </div>
      <section className="stats-grid" aria-label="Statistics">
        <article className="stat-card">
          <span className="stat-icon violet"><MaterialIcon name="group" /></span>
          <span className="stat-label">All users</span>
          <strong>{users.length}</strong>
          <span className="stat-caption">{activeUsers} active accounts</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon blue"><MaterialIcon name="folder_open" /></span>
          <span className="stat-label">Stored files</span>
          <strong>{documents.length}</strong>
          <span className="stat-caption">{formatSize(totalStorage)} total</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon green"><MaterialIcon name="check_circle" /></span>
          <span className="stat-label">System status</span>
          <strong className="system-status">Active</strong>
          <span className="stat-caption">Connected to API</span>
        </article>
      </section>
      <section className="content-card recent-card">
        <div className="section-heading">
          <div>
            <h2>Recently added files</h2>
            <p>Files uploaded by users</p>
          </div>
          <button className="text-button" onClick={() => onNavigate('files')}>
            View all <MaterialIcon name="arrow_forward" />
          </button>
        </div>
        {loading ? (
          <div className="empty-state">Loading data...</div>
        ) : documents.length === 0 ? (
          <div className="empty-state">No files have been uploaded yet.</div>
        ) : (
          <div className="recent-list">
            {documents.slice(0, 5).map((document) => (
              <article className="recent-file" key={document.id}>
                <div className="file-type-icon"><MaterialIcon name="description" /></div>
                <div className="recent-file-name">
                  <strong>{document.originalName}</strong>
                  <span>{document.userDisplayName || document.userEmail}</span>
                </div>
                <span className="recent-file-size">{formatSize(document.fileSize)}</span>
                <button
                  className="file-download-button"
                  title="Download file"
                  aria-label="Download file"
                  onClick={() => onDownload(document)}
                  disabled={busyId === document.id}
                >
                  <MaterialIcon name="download" />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="quick-actions">
        <button className="quick-action" onClick={onCreateUser}>
          <span className="quick-action-icon"><MaterialIcon name="person_add" /></span>
          <span>
            <strong>Add a user</strong>
            <small>Create a new account</small>
          </span>
          <b><MaterialIcon name="arrow_forward" /></b>
        </button>
        <button className="quick-action" onClick={() => onNavigate('files')}>
          <span className="quick-action-icon file-quick-icon"><MaterialIcon name="folder_open" /></span>
          <span>
            <strong>Browse files</strong>
            <small>Review files uploaded by users</small>
          </span>
          <b><MaterialIcon name="arrow_forward" /></b>
        </button>
      </section>
    </>
  );
}

export default Overview;
