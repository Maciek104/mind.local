import "./Nav.css"

import { Link } from "react-router-dom"
import accountIcon from "../../assets/icons/person.svg"

interface NavProps {
    page: string;
}

function Nav({ page }: NavProps) {
    return (
        <nav className="nav">
            <div className="page-title">
                <span className="logo">mind.local&reg; &gt;</span>
                <h2 className="page-name">{page}</h2>
            </div>

            <Link className="account-link" to="/account" aria-label="Account">
                <img className="account-icon" src={accountIcon} alt="" />
            </Link>
        </nav>
    )
}

export default Nav;