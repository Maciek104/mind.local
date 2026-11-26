import { useState } from 'react';
import type { FormEvent } from 'react';
import { login, type AdminUser } from '../../services/admin';
import { getErrorMessage } from '../../utils/errors';
import './Login.css';

interface LoginProps {
  initialError: string;
  onLogin: (user: AdminUser) => void | Promise<void>;
}

function Login({ initialError, onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user.role !== 'ADMIN') {
        setError('To konto nie ma uprawnień administratora.');
        return;
      }
      await onLogin(user);
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={(event) => void handleSubmit(event)}>
        <div className="login-header">
          <strong>mind.local<sup>®</sup></strong>
          <span>ADMIN PANEL</span>
        </div>
        <div className="login-intro">
          <h1>Panel administracyjny</h1>
          <p className="muted">Zaloguj się na konto administratora.</p>
        </div>
        <label>
          Adres e-mail
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Hasło
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button login-submit" disabled={submitting}>
          {submitting ? 'Logowanie…' : 'Zaloguj się'}
        </button>
      </form>
    </main>
  );
}

export default Login;
