import "./Home.css"

import Nav from "../../components/Nav/Nav.tsx"
import Footer from "../../components/Footer/Footer.tsx"
import Welcome from "../../components/Welcome/Welcome.tsx"
import Chat from "../../components/Chat/Chat.tsx"
import Library from "../../components/LastFiles/LastFiles.tsx"

function Home() {
    return (        
        <div className="home">
            <Nav page="HOME" />

            <div className="layout">
                <Welcome />
            
                <div className="row">
                    <Library />
                    <Chat />
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Home