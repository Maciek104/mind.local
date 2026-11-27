import './Aside.css'

import { NavLink, useLocation } from 'react-router-dom'

import homeIcon from '../../assets/icons/home.svg'
import chatIcon from '../../assets/icons/chat.svg'
import notesIcon from '../../assets/icons/notes.svg'
import libraryIcon from '../../assets/icons/library_books.svg'
import settingsIcon from '../../assets/icons/settings.svg'
import aboutIcon from '../../assets/icons/info.svg'
import { useState } from 'react'
import { logout } from '../../services/auth'

interface AsideProps {
  onLogout: () => void;
}

function Aside({ onLogout }: AsideProps) {
  const { pathname } = useLocation()
  const [logoutError, setLogoutError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLogoutError('')
    setLoggingOut(true)

    try {
      await logout()
      onLogout()
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : 'Could not log out.',
      )
    } finally {
      setLoggingOut(false)
    }
  }

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

        <div className="aside-bottom">
            {logoutError ? (
                <p className="logout-error" role="alert">{logoutError}</p>
            ) : null}
            <button
                className="logout-button"
                type="button"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
            >
                <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10 17l1.4-1.4L8.8 13H20v-2H8.8l2.6-2.6L10 7l-5 5 5 5zm-5 4h8a2 2 0 0 0 2-2v-2h-2v2H5V5h8v2h2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
                </svg>
                {loggingOut ? 'LOGGING OUT...' : 'LOG OUT'}
            </button>
        </div>
    </aside>
  )
}

export default Aside;