import "./LastFiles.css"

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import libraryIcon from "../../assets/icons/library_books.svg"
import addFileIcon from "../../assets/icons/upload_file.svg"
import { listDocuments, type DocumentItem } from "../../services/documents.ts";

function LastFiles() {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isActive = true;

        listDocuments()
            .then((items) => {
                if (isActive) {
                    setDocuments(items.slice(0, 5));
                }
            })
            .catch((err: unknown) => {
                if (isActive) {
                    setError(err instanceof Error ? err.message : "Could not load the latest files.");
                }
            })
            .finally(() => {
                if (isActive) {
                    setLoading(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, []);

    return(
        <div className="last-files">
            <Link to="/library" className="title">
                <img src={libraryIcon} alt="" className="icon" />
                Last files
            </Link>

            <div className="files">
                {loading ? (
                    <p className="files-message">Loading files...</p>
                ) : error ? (
                    <p className="files-message files-error">{error}</p>
                ) : documents.length === 0 ? (
                    <p className="files-message">No files have been added yet.</p>
                ) : (
                    <ul className="file-list">
                        {documents.map((document) => (
                            <li key={document.id}>
                                <Link to="/library" className="file">
                                    <span className="file-name">{document.originalName}</span>
                                    <time dateTime={document.createdAt}>
                                        {new Date(document.createdAt).toLocaleDateString("en-GB")}
                                    </time>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Link to="/library" className="button">
                <img src={addFileIcon} alt="add file icon" className="icon" />
                Add files
            </Link>
        </div>
    )
}

export default LastFiles;