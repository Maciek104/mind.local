import "./Welcome.css"

import bulbIcon from "../../assets/icons/emoji_objects.svg"

interface WelcomeProps {
    title?: string;
    subtitle?: string;
    icon?: string;
}

function Welcome({
    title = "Welcome to mind.local®!",
    subtitle = "mind.local® is a knowledge management application that helps you organize and access your information efficiently.",
    icon = bulbIcon,
}: WelcomeProps) {
    return(
        <div className="welcome">
            <div className="column">
                <h2 className="title">{title}</h2>
                <span className="subtitle">{subtitle}</span>
            </div>

            <img src={icon} alt="" className="icon" />
        </div>
    )
}

export default Welcome;