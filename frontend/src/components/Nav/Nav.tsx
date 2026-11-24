import "./Nav.css"

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
        </nav>
    )
}

export default Nav;