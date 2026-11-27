import "./Nav.css"

import { Link } from "react-router-dom"
import { useContext } from "react"
import accountIcon from "../../assets/icons/person.svg"
import adminIcon from "../../assets/icons/admin_panel.svg"
import AdminAccessContext from "../../context/AdminAccessContext.ts"

interface NavProps {
    page: string;
}

function Nav({ page }: NavProps) {
    const isAdmin = useContext(AdminAccessContext)

    return (
        <nav className="nav">
            <div className="page-title">
                <span className="logo">mind.local&reg; &gt;</span>
                <h2 className="page-name">{page}</h2>
            </div>

            <div className="nav-actions">
                {isAdmin ? (
                    <a
                        className="admin-link"
                        href="http://localhost:5174/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Admin panel"
                    >
                        <img className="admin-icon" src={adminIcon} alt="" />
                    </a>
                ) : null}
                <Link className="account-link" to="/account" aria-label="Account">
                    <img className="account-icon" src={accountIcon} alt="" />
                </Link>
            </div>
        </nav>
    )
}

export default Nav;