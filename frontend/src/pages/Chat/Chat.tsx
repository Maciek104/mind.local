import "./Chat.css"

import Nav from "../../components/Nav/Nav.tsx"
import Footer from "../../components/Footer/Footer.tsx"

function Chat() {
    return (        
        <div className="chat">
            <Nav page="CHAT" />

            <div className="layout">
                <div className="chat-container">

                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Chat;