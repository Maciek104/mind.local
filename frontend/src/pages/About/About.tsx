import "./About.css"

import Nav from "../../components/Nav/Nav.tsx"
import Footer from "../../components/Footer/Footer.tsx"
import aboutIcon from "../../assets/icons/info.svg"
import libraryIcon from "../../assets/icons/library_books.svg"
import chatIcon from "../../assets/icons/chat.svg"
import docsIcon from "../../assets/icons/docs.svg"
import warningIcon from "../../assets/icons/warning.svg"

function About() {
    return (
        <div className="about">
            <Nav page="ABOUT" />

            <main className="layout">
                <section className="about-section about-intro">
                    <div className="about-section-title">
                        <img src={aboutIcon} alt="" />
                        <h2>About the project</h2>
                    </div>
                    <div className="about-intro-content">
                        <h1>Your knowledge, on your terms.</h1>
                        <p>
                            mind.local is a locally developed application for
                            collecting documents and organizing personal
                            knowledge. It aims to make it easier to store,
                            revisit, and work with materials in one place while
                            keeping control of your data. The project combines
                            a React interface, a NestJS backend, and an SQLite
                            database. More features are in development,
                            including semantic search and AI-powered answers.
                        </p>
                    </div>
                </section>

                <div className="about-features">
                    <article className="about-card">
                        <img src={docsIcon} alt="" />
                        <h3>Documents</h3>
                        <p>
                            Add and store your files in a local document
                            library.
                        </p>
                    </article>
                    <article className="about-card">
                        <img src={chatIcon} alt="" />
                        <h3>Conversations</h3>
                        <p>
                            A conversation interface is part of the project;
                            AI features and semantic search are in development.
                        </p>
                    </article>
                    <article className="about-card">
                        <img src={libraryIcon} alt="" />
                        <h3>Local data</h3>
                        <p>
                            Application data is stored locally in SQLite, and
                            access is protected by a user account.
                        </p>
                    </article>
                </div>

                <section className="about-section about-creators">
                    <div className="about-section-title">
                        <img src={aboutIcon} alt="" />
                        <h2>Creators</h2>
                    </div>
                    <div className="about-creators-content">
                        <p>
                            The project is developed by <strong>Maciej Stępień</strong>
                            {" "}(@Maciek104) and <strong>Paweł Kieliszak</strong>
                            {" "}(@kaszlak). The project is associated with
                            <strong> HanzaStudios</strong>.
                        </p>
                    </div>
                </section>

                <section className="about-section about-status">
                    <div className="about-section-title">
                        <img src={warningIcon} alt="" />
                        <h2>Project status</h2>
                    </div>
                    <div className="about-creators-content">
                        <p>
                            mind.local is under active development. Some
                            features may not yet be complete.
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default About;