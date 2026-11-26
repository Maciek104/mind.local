import './Library.css';

import { useEffect, useRef, useState } from 'react';
import Nav from '../../components/Nav/Nav.tsx';
import Footer from '../../components/Footer/Footer.tsx';
import libraryIcon from '../../assets/icons/library_books.svg';
import uploadIcon from '../../assets/icons/upload.svg';
import downloadIcon from '../../assets/icons/download.svg';
import deleteIcon from '../../assets/icons/delete.svg';
import {
  deleteDocument,
  downloadDocument,
  listDocuments,
  uploadDocument,
  type DocumentItem,
} from '../../services/documents.ts';

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function Library() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [hasLoadedDocuments, setHasLoadedDocuments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  async function loadDocuments() {
    try {
      setError('');
      const items = await listDocuments();
      setDocuments(items);
      setHasLoadedDocuments(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    setUploading(true);
    setError('');

    try {
      for (const file of Array.from(files)) {
        await uploadDocument(file);
      }
      await loadDocuments();
      if (fileInput.current) fileInput.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(document: DocumentItem) {
    if (!window.confirm(`Delete "${document.originalName}"?`)) return;

    try {
      await deleteDocument(document.id);
      setDocuments((current) =>
        current.filter((item) => item.id !== document.id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file.');
    }
  }

  async function handleDownload(document: DocumentItem) {
    try {
      await downloadDocument(document.id, document.originalName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file.');
    }
  }

  const totalSize = documents.reduce(
    (total, document) => total + document.fileSize,
    0,
  );

  return (
    <div className="library">
      <Nav page="LIBRARY" />

      <main className="layout">
        <section
          className={`upload-panel${isDragging ? ' is-dragging' : ''}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
          }}
          onDragLeave={(event) => {
            const relatedTarget = event.relatedTarget;
            if (
              !(relatedTarget instanceof Node) ||
              !event.currentTarget.contains(relatedTarget)
            ) {
              setIsDragging(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (!uploading) {
              void handleFiles(event.dataTransfer.files);
            }
          }}
        >
          <input
            ref={fileInput}
            type="file"
            multiple
            onChange={(event) => void handleFiles(event.target.files)}
          />
          <button
            className="upload-button"
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
          >
            <img src={uploadIcon} alt="" className="icon" />
            {uploading ? 'Uploading...' : 'Add files'}
          </button>
          <span>
            Maximum file size per file: 25 MB. You can also drag and drop files here.
          </span>
        </section>

        {error && <div className="library-error">{error}</div>}

        <div className="document-list">
          <div className="document-list-title">
            <img src={libraryIcon} alt="" className="icon" />
            <h2>Your files</h2>
          </div>

          {loading ? (
            <div className="library-empty">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="library-empty">No files have been added yet.</div>
          ) : (
            documents.map((document) => (
              <article className="document-item" key={document.id}>
                <div className="document-details">
                  <strong>{document.originalName}</strong>
                  <span>
                    {formatFileSize(document.fileSize)}
                    {' · '}
                    {new Date(document.createdAt).toLocaleString('en-GB')}
                  </span>
                </div>
                <div className="document-actions">
                  <button
                    className="download-button"
                    type="button"
                    aria-label="Download"
                    title="Download"
                    onClick={() => void handleDownload(document)}
                  >
                    <img src={downloadIcon} alt="" className="icon" />
                  </button>
                  <button
                    className="delete-button"
                    type="button"
                    aria-label="Delete"
                    title="Delete"
                    onClick={() => void handleDelete(document)}
                  >
                    <img src={deleteIcon} alt="" className="icon" />
                  </button>
                </div>
              </article>
            ))
          )}

          {hasLoadedDocuments && (
            <div className="document-summary">
              <span>File count: {documents.length}</span>
              <span>Total size: {formatFileSize(totalSize)}</span>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Library;