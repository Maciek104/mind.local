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
                            organizing documents and personal knowledge. It keeps
                            the application, database, uploaded files, and user
                            data together on your own server. The project combines
                            a React interface, a NestJS API, and SQLite.
                        </p>
                    </div>
                </section>

                <div className="about-features">
                    <article className="about-card">
                        <img src={docsIcon} alt="" />
                        <h3>Document library</h3>
                        <p>
                            Upload several files, browse their metadata, download
                            originals, and remove documents you no longer need.
                            Each file is limited to 25 MB.
                        </p>
                    </article>
                    <article className="about-card">
                        <img src={chatIcon} alt="" />
                        <h3>Your account</h3>
                        <p>
                            Manage your display name, bio, profile photo, email,
                            role, and plan from one protected account page.
                        </p>
                    </article>
                    <article className="about-card">
                        <img src={libraryIcon} alt="" />
                        <h3>Local and private</h3>
                        <p>
                            Authentication uses an HTTP-only cookie and server-side
                            sessions. Documents and avatars are stored locally,
                            with metadata kept in SQLite.
                        </p>
                    </article>
                    <article className="about-card">
                        <img src={docsIcon} alt="" />
                        <h3>Administration</h3>
                        <p>
                            Administrator accounts can create and manage users,
                            activate or deactivate them, and change their plans,
                            and review uploaded documents.
                        </p>
                    </article>
                    <article className="about-card">
                        <img src={chatIcon} alt="" />
                        <h3>Chat interface</h3>
                        <p>
                            The conversation view supports prompt suggestions and
                            local in-session messages. It is not connected to an
                            AI model or persistent conversations yet.
                        </p>
                    </article>
                    <article className="about-card">
                        <img src={libraryIcon} alt="" />
                        <h3>Plans and settings</h3>
                        <p>
                            The API includes FREE, PRO, and ULTRA plan metadata.
                            Settings expose planned appearance, language, chat,
                            and privacy controls; persistence is still in progress.
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