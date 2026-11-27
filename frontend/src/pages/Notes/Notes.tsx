import "./Notes.css"

import Nav from "../../components/Nav/Nav.tsx"
import Footer from "../../components/Footer/Footer.tsx"
import notesIcon from "../../assets/icons/notes.svg"
import warningIcon from "../../assets/icons/warning.svg"

function Notes() {
    return (        
        <div className="notes">
            <Nav page="NOTES" />

            <main className="layout">
                <section className="notes-warning" role="status">
                    <div className="notes-warning__icon">
                        <img src={warningIcon} alt="" />
                    </div>
                    <div className="notes-warning__copy">
                        <strong>The Notes module is only a concept</strong>
                        <p>This section is being prepared for future development and is not available yet.</p>
                    </div>
                </section>

                <section className="notes-coming-soon">
                    <div className="notes-coming-soon__icon">
                        <img src={notesIcon} alt="" />
                    </div>
                    <div className="notes-coming-soon__copy">
                        <span className="notes-coming-soon__badge">COMING SOON</span>
                        <h1>Notes</h1>
                        <p>
                            Soon, you will be able to create, organize, and
                            quickly search your own notes here.
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default Notes;