import "./LastFiles.css"

import { Link } from "react-router-dom";

import libraryIcon from "../../assets/icons/library_books.svg"
import addFileIcon from "../../assets/icons/upload_file.svg"

function LastFiles() {
    return(
        <div className="last-files">
            <Link to="/library" className="title">
                <img src={libraryIcon} alt="chat icon" className="icon" />
                Last files
            </Link>

            <div className="files">

            </div>

            <button className="button">
                <img src={addFileIcon} alt="add file icon" className="icon" />
                Add files...
            </button>
        </div>
    )
}

export default LastFiles;