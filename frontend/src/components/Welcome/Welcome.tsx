import "./Welcome.css"

import bulbIcon from "../../assets/icons/emoji_objects.svg"

function Welcome() {
    return(
        <div className="welcome">
            <div className="column">
                <h2 className="title">Welcome to mind.local&reg;!</h2>
                <span className="subtitle">
                    mind.local&reg; is a knowledge management application that helps you organize and access your information efficiently.
                </span>
            </div>

            <img src={bulbIcon} alt="bulb icon" className="icon" />
        </div>
    )
}

export default Welcome;