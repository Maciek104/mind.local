import './Library.css';

import { useEffect, useRef, useState } from 'react';
import Nav from '../../components/Nav/Nav.tsx';
import Footer from '../../components/Footer/Footer.tsx';
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
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function loadDocuments() {
    try {
      setError('');
      setDocuments(await listDocuments());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się pobrać dokumentów.');
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
      setError(err instanceof Error ? err.message : 'Nie udało się przesłać pliku.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(document: DocumentItem) {
    if (!window.confirm(`Usunąć "${document.originalName}"?`)) return;

    try {
      await deleteDocument(document.id);
      setDocuments((current) =>
        current.filter((item) => item.id !== document.id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć pliku.');
    }
  }

  async function handleDownload(document: DocumentItem) {
    try {
      await downloadDocument(document.id, document.originalName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się pobrać pliku.');
    }
  }

  return (
    <div className="library">
      <Nav page="LIBRARY" />

      <main className="layout">
        <section className="upload-panel">
          <input
            ref={fileInput}
            type="file"
            multiple
            onChange={(event) => void handleFiles(event.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Przesyłanie...' : 'Dodaj pliki'}
          </button>
          <span>Maksymalny rozmiar jednego pliku: 25 MB</span>
        </section>

        {error && <div className="library-error">{error}</div>}

        {loading ? (
          <div className="library-empty">Ładowanie dokumentów...</div>
        ) : documents.length === 0 ? (
          <div className="library-empty">Nie dodano jeszcze żadnych plików.</div>
        ) : (
          <div className="document-list">
            {documents.map((document) => (
              <article className="document-item" key={document.id}>
                <div className="document-details">
                  <strong>{document.originalName}</strong>
                  <span>
                    {formatFileSize(document.fileSize)}
                    {' · '}
                    {new Date(document.createdAt).toLocaleString('pl-PL')}
                  </span>
                </div>
                <div className="document-actions">
                  <button
                    type="button"
                    onClick={() => void handleDownload(document)}
                  >
                    Pobierz
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(document)}
                  >
                    Usuń
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Library;