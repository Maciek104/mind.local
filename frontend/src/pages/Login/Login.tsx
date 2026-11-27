import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import './Login.css';

import Nav from '../../components/Nav/Nav.tsx';
import Footer from '../../components/Footer/Footer.tsx';
import { login } from '../../services/auth.ts';
import type { AuthenticatedUser } from '../../services/auth.ts';
import keyIcon from '../../assets/icons/key.svg';

interface LoginProps {
    onLogin: (user: AuthenticatedUser) => void;
}

function Login({ onLogin }: LoginProps) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        try {
            setLoading(true);
            const user = await login(email.trim().toLowerCase(), password);
            onLogin(user);
            navigate('/', { replace: true });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Wystąpił nieoczekiwany błąd.',
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login">
            <Nav page="LOGIN" />

            <div className="layout">
                <form className="form" onSubmit={handleLogin}>
                    <div className="title">
                        <img src={keyIcon} alt="key icon" />
                        <span className="span">
                            Sign in to your <strong>mind.local&reg;</strong> account...
                        </span>
                    </div>

                    <input
                        id="email"
                        type="email"
                        className="input"
                        placeholder="Enter your email address..."
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                    />

                    <input
                        id="password"
                        type="password"
                        className="input"
                        placeholder="Enter your password..."
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                    />

                    {error && <p role="alert">{error}</p>}

                    <button className="button" type="submit" disabled={loading}>
                        {loading ? 'Logowanie...' : 'Zaloguj się'}
                    </button>
                </form>
            </div>

            <Footer />
        </div>
    );
}

export default Login;