import './Aside.css'

import { Link } from 'react-router-dom'

import homeIcon from '../../assets/icons/home.svg'
import libraryIcon from '../../assets/icons/library_books.svg'
import settingsIcon from '../../assets/icons/settings.svg'
import aboutIcon from '../../assets/icons/info.svg'

function Aside() {
  return (
    <aside className="aside">
        <div className="logo">
            <h1>Knowly&reg;</h1>
        </div>

        <Link className="link" to="/">
            <img className="icon" src={homeIcon} alt="home" />
            HOME
        </Link>
        <Link className="link" to="/library">
            <img className="icon" src={libraryIcon} alt="library" />
            LIBRARY
        </Link>
        <Link className="link" to="/settings">
            <img className="icon" src={settingsIcon} alt="settings" />
            SETTINGS
        </Link>
        <Link className="link" to="/about">
            <img className="icon" src={aboutIcon} alt="about" />
            ABOUT
        </Link>
    </aside>
  )
}

export default Aside;