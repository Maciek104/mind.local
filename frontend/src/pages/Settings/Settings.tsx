import { useState } from "react"
import { Link } from "react-router-dom"

import "./Settings.css"

import settingsIcon from "../../assets/icons/settings.svg"
import chatIcon from "../../assets/icons/chat.svg"
import databaseIcon from "../../assets/icons/database.svg"
import libraryIcon from "../../assets/icons/library_books.svg"
import Footer from "../../components/Footer/Footer.tsx"
import Nav from "../../components/Nav/Nav.tsx"
import Welcome from "../../components/Welcome/Welcome.tsx"

interface ToggleProps {
    checked: boolean;
    label: string;
    onChange: () => void;
}

function Toggle({ checked, label, onChange }: ToggleProps) {
    return (
        <label className="settings-toggle">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                aria-label={label}
            />
            <span className="settings-toggle__track" aria-hidden="true">
                <span />
            </span>
        </label>
    )
}

function Settings() {
    const [theme, setTheme] = useState("System")
    const [chatModel, setChatModel] = useState("local-default")
    const [showSuggestions, setShowSuggestions] = useState(true)
    const [enterToSend, setEnterToSend] = useState(false)

    return (
        <div className="settings">
            <Nav page="SETTINGS" />

            <main className="layout">
                <Welcome
                    title="Settings"
                    subtitle="Personalize your mind.local experience."
                    icon={settingsIcon}
                />

                <section className="settings-section">
                    <div className="settings-section__title">
                        <img src={settingsIcon} alt="" />
                        <h2>General</h2>
                    </div>
                    <div className="settings-section__body">
                        <div className="settings-row">
                            <div className="settings-row__copy">
                                <h3>Appearance</h3>
                                <p>Choose how mind.local looks on this device.</p>
                            </div>
                            <select
                                aria-label="Appearance"
                                value={theme}
                                onChange={(event) => setTheme(event.target.value)}
                            >
                                <option value="System">System default</option>
                                <option value="Light">Light</option>
                                <option value="Dark">Dark</option>
                            </select>
                        </div>
                        <div className="settings-row">
                            <div className="settings-row__copy">
                                <h3>Language</h3>
                                <p>Choose the language used in the interface.</p>
                            </div>
                            <select
                                aria-label="Language"
                                value="English"
                                disabled
                            >
                                <option>English</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <div className="settings-section__title">
                        <img src={chatIcon} alt="" />
                        <h2>Chat</h2>
                    </div>
                    <div className="settings-section__body">
                        <div className="settings-row">
                            <div className="settings-row__copy">
                                <h3>Default model</h3>
                                <p>Choose the model for new conversations.</p>
                            </div>
                            <select
                                aria-label="Default chat model"
                                value={chatModel}
                                onChange={(event) => setChatModel(event.target.value)}
                            >
                                <option value="local-default">Local default</option>
                                <option value="llama-3.1-8b">Llama 3.1 8B</option>
                                <option value="mistral-7b">Mistral 7B</option>
                                <option value="qwen-2.5-7b">Qwen 2.5 7B</option>
                            </select>
                        </div>
                        <div className="settings-row">
                            <div className="settings-row__copy">
                                <h3>Suggested prompts</h3>
                                <p>Show prompt suggestions when starting a conversation.</p>
                            </div>
                            <Toggle
                                checked={showSuggestions}
                                label="Show suggested prompts"
                                onChange={() => setShowSuggestions((enabled) => !enabled)}
                            />
                        </div>
                        <div className="settings-row">
                            <div className="settings-row__copy">
                                <h3>Send with Enter</h3>
                                <p>Press Enter to send a message instead of adding a new line.</p>
                            </div>
                            <Toggle
                                checked={enterToSend}
                                label="Send messages with Enter"
                                onChange={() => setEnterToSend((enabled) => !enabled)}
                            />
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <div className="settings-section__title">
                        <img src={databaseIcon} alt="" />
                        <h2>Data &amp; privacy</h2>
                    </div>
                    <div className="settings-storage">
                        <div className="settings-storage__icon">
                            <img src={databaseIcon} alt="" />
                        </div>
                        <div className="settings-row__copy">
                            <h3>Your workspace</h3>
                            <p>Manage the documents stored in your local library.</p>
                        </div>
                        <Link className="settings-storage__link" to="/library">
                            <img src={libraryIcon} alt="" />
                            Open library
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default Settings
