import { useState, type FormEvent } from "react"

import "./Chat.css"

import notesIcon from "../../assets/icons/notes.svg"
import libraryIcon from "../../assets/icons/library_books.svg"
import ideaIcon from "../../assets/icons/emoji_objects.svg"
import sendIcon from "../../assets/icons/send.svg"
import Footer from "../../components/Footer/Footer.tsx"
import Nav from "../../components/Nav/Nav.tsx"

interface Message {
    id: number;
    content: string;
}

const suggestions = [
    { text: "Summarize my recent notes", icon: notesIcon },
    { text: "Find information in my library", icon: libraryIcon },
    { text: "Help me develop an idea", icon: ideaIcon },
]

function Chat() {
    const [draft, setDraft] = useState("")
    const [messages, setMessages] = useState<Message[]>([])

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const content = draft.trim()
        if (!content) {
            return
        }

        setMessages((currentMessages) => [
            ...currentMessages,
            { id: Date.now(), content },
        ])
        setDraft("")
    }

    return (
        <div className="chat-page">
            <Nav page="CHAT" />

            <main className="layout chat-page__content" aria-label="Chat conversation">
                    <div className="chat-page__messages" aria-live="polite">
                        {messages.length === 0 ? (
                            <div className="chat-welcome">
                                <span className="chat-welcome__eyebrow">
                                    Your space to chat
                                </span>
                                <h2>Hi! How can I help you?</h2>
                                <p>
                                    Ask about your materials, get a summary, or start with
                                    one of these suggestions.
                                </p>

                                <div className="chat-suggestions" aria-label="Suggested prompts">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            className="chat-suggestions__item"
                                            key={suggestion.text}
                                            type="button"
                                            onClick={() => setDraft(suggestion.text)}
                                        >
                                            <span className="chat-suggestions__icon">
                                                <img src={suggestion.icon} alt="" />
                                            </span>
                                            {suggestion.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="chat-messages">
                                {messages.map((message) => (
                                    <article className="chat-message" key={message.id}>
                                    <span className="chat-message__label">You</span>
                                        <p>{message.content}</p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    <form className="chat-composer" onSubmit={handleSubmit}>
                        <label className="visually-hidden" htmlFor="chat-message">
                            Your message
                        </label>
                        <input
                            id="chat-message"
                            className="chat-composer__input"
                            type="text"
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            placeholder="Type a message..."
                            maxLength={4000}
                        />
                        <button
                            className="chat-composer__send"
                            type="submit"
                            aria-label="Send message"
                            disabled={!draft.trim()}
                        >
                            <img src={sendIcon} alt="" />
                        </button>
                    </form>
            </main>

            <Footer />
        </div>
    )
}

export default Chat
