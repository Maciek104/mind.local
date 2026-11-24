import "./Chat.css"

import chatIcon from "../../assets/icons/chat.svg"
import sendIcon from "../../assets/icons/send.svg"

function Chat() {
    return(
        <div className="chat">
            <div className="title">
                <img src={chatIcon} alt="chat icon" className="icon" />
                Chat
            </div>

            <div className="messages">

            </div>

            <div className="chat__row">
                <input type="text" placeholder="Ask whatever you like..." className="input" />
                <button className="button">
                    <img src={sendIcon} alt="send icon" className="icon" />
                </button>
            </div>
        </div>
    )
}

export default Chat;