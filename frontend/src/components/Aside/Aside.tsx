import './Aside.css'

import { NavLink, useLocation } from 'react-router-dom'

import homeIcon from '../../assets/icons/home.svg'
import chatIcon from '../../assets/icons/chat.svg'
import notesIcon from '../../assets/icons/notes.svg'
import libraryIcon from '../../assets/icons/library_books.svg'
import settingsIcon from '../../assets/icons/settings.svg'
import aboutIcon from '../../assets/icons/info.svg'

function Aside() {
  const { pathname } = useLocation()

  return (
    <aside className="aside">
        <div className="logo">
            <h1>mind.local&reg;</h1>
        </div>

        <NavLink
            className={({ isActive }) =>
              isActive || pathname === '/home' ? 'link active' : 'link'
            }
            to="/"
            end
        >
            <img className="icon" src={homeIcon} alt="home icon" />
            HOME
        </NavLink>
        <NavLink className="link" to="/chat" end>
            <img className="icon" src={chatIcon} alt="chat icon" />
            CHAT
        </NavLink>
        <NavLink className="link" to="/notes" end>
            <img className="icon" src={notesIcon} alt="notes icon" />
            NOTES
        </NavLink>
        <NavLink className="link" to="/library" end>
            <img className="icon" src={libraryIcon} alt="library icon" />
            LIBRARY
        </NavLink>
        <NavLink className="link" to="/settings" end>
            <img className="icon" src={settingsIcon} alt="settings icon" />
            SETTINGS
        </NavLink>
        <NavLink className="link" to="/about" end>
            <img className="icon" src={aboutIcon} alt="about icon" />
            ABOUT
        </NavLink>
    </aside>
  )
}

export default Aside;