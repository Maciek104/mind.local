import { useMemo, useState } from 'react';
import type { AdminDocument } from '../../services/admin';
import { formatDate, formatSize } from '../../utils/format';
import './Files.css';

interface FilesProps {
  documents: AdminDocument[];
  totalStorage: number;
  loading: boolean;
  busyId: string;
  onRefresh: () => void;
  onDownload: (document: AdminDocument) => void;
}

function Files({
  documents,
  totalStorage,
  loading,
  busyId,
  onRefresh,
  onDownload,
}: FilesProps) {
  const [search, setSearch] = useState('');
  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pl');
    if (!query) return documents;
    return documents.filter((document) =>
      `${document.originalName} ${document.userEmail} ${document.userDisplayName ?? ''}`
        .toLocaleLowerCase('pl')
        .includes(query),
    );
  }, [documents, search]);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">BIBLIOTEKA UŻYTKOWNIKÓW</p>
          <h1>Pliki</h1>
          <p className="page-subtitle">Podglądaj i pobieraj dokumenty dodane do systemu.</p>
        </div>
        <button className="secondary-button refresh-button" onClick={onRefresh} disabled={loading}>
          ↻ <span>Odśwież</span>
        </button>
      </div>
      <section className="content-card data-card">
        <div className="table-toolbar">
          <div>
            <h2>Wszystkie pliki</h2>
            <span className="result-count">
              {filteredDocuments.length} plików · {formatSize(totalStorage)}
            </span>
          </div>
          <label className="search-box">
            <span>⌕</span>
            <input
              aria-label="Szukaj plików"
              placeholder="Nazwa pliku lub użytkownik…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        {loading ? (
          <div className="empty-state">Ładowanie plików…</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="empty-state">Nie znaleziono plików.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>PLIK</th>
                  <th>WŁAŚCICIEL</th>
                  <th>ROZMIAR</th>
                  <th>DODANO</th>
                  <th>STATUS</th>
                  <th className="actions-heading">AKCJE</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((document) => (
                  <tr key={document.id}>
                    <td>
                      <div className="table-file">
                        <span className="file-type-icon">▧</span>
                        <span>
                          <strong>{document.originalName}</strong>
                          <small>{document.mimeType || 'Nieznany typ pliku'}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="owner-cell">
                        <strong>{document.userDisplayName || document.userEmail}</strong>
                        {document.userDisplayName && <small>{document.userEmail}</small>}
                      </div>
                    </td>
                    <td className="date-cell">{formatSize(document.fileSize)}</td>
                    <td className="date-cell">{formatDate(document.createdAt)}</td>
                    <td>
                      <span className="status-badge active"><i />{document.status}</span>
                    </td>
                    <td>
                      <button
                        className="download-action"
                        onClick={() => onDownload(document)}
                        disabled={busyId === document.id}
                      >
                        <span>↓</span> Pobierz
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default Files;
