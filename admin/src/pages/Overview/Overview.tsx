import type { AdminDocument, AdminUser } from '../../services/admin';
import { formatSize } from '../../utils/format';
import type { Section } from '../../types';
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
          <p className="eyebrow">CENTRUM ZARZĄDZANIA</p>
          <h1>Przegląd</h1>
          <p className="page-subtitle">Najważniejsze informacje o Twoim local.mind.</p>
        </div>
        <button className="secondary-button refresh-button" onClick={onRefresh} disabled={loading}>
          ↻ <span>Odśwież</span>
        </button>
      </div>
      <section className="stats-grid" aria-label="Statystyki">
        <article className="stat-card">
          <span className="stat-icon violet">♙</span>
          <span className="stat-label">Wszyscy użytkownicy</span>
          <strong>{users.length}</strong>
          <span className="stat-caption">{activeUsers} aktywnych kont</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon blue">▤</span>
          <span className="stat-label">Przechowywane pliki</span>
          <strong>{documents.length}</strong>
          <span className="stat-caption">{formatSize(totalStorage)} łącznie</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon green">●</span>
          <span className="stat-label">Status systemu</span>
          <strong className="system-status">Aktywny</strong>
          <span className="stat-caption">Połączono z API</span>
        </article>
      </section>
      <section className="content-card recent-card">
        <div className="section-heading">
          <div>
            <h2>Ostatnio dodane pliki</h2>
            <p>Pliki przesłane przez użytkowników</p>
          </div>
          <button className="text-button" onClick={() => onNavigate('files')}>
            Zobacz wszystkie <span>→</span>
          </button>
        </div>
        {loading ? (
          <div className="empty-state">Ładowanie danych…</div>
        ) : documents.length === 0 ? (
          <div className="empty-state">Nie dodano jeszcze żadnych plików.</div>
        ) : (
          <div className="recent-list">
            {documents.slice(0, 5).map((document) => (
              <article className="recent-file" key={document.id}>
                <div className="file-type-icon">▧</div>
                <div className="recent-file-name">
                  <strong>{document.originalName}</strong>
                  <span>{document.userDisplayName || document.userEmail}</span>
                </div>
                <span className="recent-file-size">{formatSize(document.fileSize)}</span>
                <button
                  className="file-download-button"
                  title="Pobierz plik"
                  onClick={() => onDownload(document)}
                  disabled={busyId === document.id}
                >
                  ↓
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="quick-actions">
        <button className="quick-action" onClick={onCreateUser}>
          <span className="quick-action-icon">＋</span>
          <span>
            <strong>Dodaj użytkownika</strong>
            <small>Utwórz nowe konto w systemie</small>
          </span>
          <b>→</b>
        </button>
        <button className="quick-action" onClick={() => onNavigate('files')}>
          <span className="quick-action-icon file-quick-icon">▤</span>
          <span>
            <strong>Przeglądaj pliki</strong>
            <small>Sprawdź pliki dodane przez użytkowników</small>
          </span>
          <b>→</b>
        </button>
      </section>
    </>
  );
}

export default Overview;
