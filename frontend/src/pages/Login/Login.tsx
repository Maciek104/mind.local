import "./Login.css"

import Nav from "../../components/Nav/Nav.tsx"
import Footer from "../../components/Footer/Footer.tsx"

function Login() {
    return (        
        <div className="login">
            <Nav page="LOGIN" />

            <div className="layout">
                <form className="form">
                    <label htmlFor="">E-MAIL</label>
                    <input type="text" />

                    <label htmlFor="">PASSWORD</label>
                    <input type="password" />

                    <button>Sign in</button>
                </form>
            </div>

            <Footer />
        </div>
    )
}

export default Login;