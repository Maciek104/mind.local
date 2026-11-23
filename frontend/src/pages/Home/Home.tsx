import "./Home.css"

import Nav from "../../components/Nav/Nav.tsx"
import Footer from "../../components/Footer/Footer.tsx"

function Home() {
    return (        
        <div className="home">
            <Nav page="HOME" />

            <h1>Welcome to Knowly!</h1>
            <p>Knowly is a knowledge management application that helps you organize and access your information efficiently.</p>

            <Footer />
        </div>
    )
}

export default Home