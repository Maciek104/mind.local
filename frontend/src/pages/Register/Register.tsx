
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import './Register.css';

import Nav from '../../components/Nav/Nav';
import Footer from '../../components/Footer/Footer';

import keyIcon from '../../assets/icons/key.svg';

const API_URL = 'http://localhost:3000';

interface RegisterProps {
    onRegistered: () => Promise<void>;
}

function Register({ onRegistered }: RegisterProps) {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleRegister(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError('');

        const normalizedEmail = email.trim().toLowerCase();

        if (password !== repeatPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must contain at least 8 characters.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/setup/initialize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: normalizedEmail,
                    password,
                    confirmPassword: repeatPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    Array.isArray(data.message)
                        ? data.message.join(', ')
                        : data.message || 'Registration failed.',
                );
            }

            // Ponowne sprawdzenie statusu konfiguracji
            await onRegistered();

            // Przejście do logowania
            navigate('/login', { replace: true });

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred.',
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="register">
            <Nav page="REGISTER" />

            <div className="layout_register">
                <form className="form" onSubmit={handleRegister}>
                    <div className="title">
                        <img src={keyIcon} alt="key icon" />

                        <span className="span">
                            Create an administrator account on{' '}
                            <strong>mind.local&reg;</strong>
                        </span>
                    </div>

                    <input
                        id="email"
                        type="email"
                        className="input"
                        placeholder="Enter your email address..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />

                    <input
                        id="password"
                        type="password"
                        className="input"
                        placeholder="Enter your password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        maxLength={128}
                        autoComplete="new-password"
                        required
                    />

                    <input
                        id="repeatPassword"
                        type="password"
                        className="input"
                        placeholder="Repeat your password..."
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                    />

                    {error && (
                        <p className="register_error">
                            {error}
                        </p>
                    )}

                    <button
                        className="button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? 'Creating account...'
                            : 'Create account'}
                    </button>
                </form>
            </div>

            <Footer />
        </div>
    );
}

export default Register;
