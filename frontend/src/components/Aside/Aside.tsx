import './Aside.css'

import { Link } from 'react-router-dom'

import homeIcon from '../../assets/icons/home.svg'
import chatIcon from '../../assets/icons/chat.svg'
import libraryIcon from '../../assets/icons/library_books.svg'
import settingsIcon from '../../assets/icons/settings.svg'
import aboutIcon from '../../assets/icons/info.svg'

function Aside() {
  return (
    <aside className="aside">
        <div className="logo">
            <h1>mind.local&reg;</h1>
        </div>

        <Link className="link" to="/">
            <img className="icon" src={homeIcon} alt="home icon" />
            HOME
        </Link>
        <Link className='link' to="/chat">
            <img className="icon" src={chatIcon} alt="chat icon" />
            CHAT
        </Link>
        <Link className="link" to="/library">
            <img className="icon" src={libraryIcon} alt="library icon" />
            LIBRARY
        </Link>
        <Link className="link" to="/settings">
            <img className="icon" src={settingsIcon} alt="settings icon" />
            SETTINGS
        </Link>
        <Link className="link" to="/about">
            <img className="icon" src={aboutIcon} alt="about icon" />
            ABOUT
        </Link>
    </aside>
  )
}

export default Aside;