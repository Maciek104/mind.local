import { useMemo, useState } from 'react';
import type { AdminDocument } from '../../services/admin';
import { formatDate, formatSize } from '../../utils/format';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
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
    const query = search.trim().toLocaleLowerCase('en');
    if (!query) return documents;
    return documents.filter((document) =>
      `${document.originalName} ${document.userEmail} ${document.userDisplayName ?? ''}`
        .toLocaleLowerCase('en')
        .includes(query),
    );
  }, [documents, search]);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">USER LIBRARY</p>
          <h1>Files</h1>
          <p className="page-subtitle">Browse and download documents added to the system.</p>
        </div>
        <button className="secondary-button refresh-button" onClick={onRefresh} disabled={loading}>
          <MaterialIcon name="refresh" /> <span>Refresh</span>
        </button>
      </div>
      <section className="content-card data-card">
        <div className="table-toolbar">
          <div>
            <h2>All files</h2>
            <span className="result-count">
              {filteredDocuments.length} files · {formatSize(totalStorage)}
            </span>
          </div>
          <label className="search-box">
            <MaterialIcon name="search" />
            <input
              aria-label="Search files"
              placeholder="File name or user..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        {loading ? (
          <div className="empty-state">Loading files...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="empty-state">No files found.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>FILE</th>
                  <th>OWNER</th>
                  <th>SIZE</th>
                  <th>ADDED</th>
                  <th>STATUS</th>
                  <th className="actions-heading">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((document) => (
                  <tr key={document.id}>
                    <td>
                      <div className="table-file">
                        <span className="file-type-icon"><MaterialIcon name="description" /></span>
                        <span>
                          <strong>{document.originalName}</strong>
                          <small>{document.mimeType || 'Unknown file type'}</small>
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
                        <MaterialIcon name="download" /> Download
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
