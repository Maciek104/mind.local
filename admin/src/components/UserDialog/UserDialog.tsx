import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AdminUser, UserInput } from '../../services/admin';
import { getErrorMessage } from '../../utils/errors';
import './UserDialog.css';

interface UserDialogProps {
  user: AdminUser | null;
  onClose: () => void;
  onSave: (input: UserInput) => Promise<void>;
}

function UserDialog({ user, onClose, onSave }: UserDialogProps) {
  const [email, setEmail] = useState(user?.email ?? '');
  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [plan, setPlan] = useState(user?.plan ?? 'FREE');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({
        email,
        display_name: displayName,
        plan,
        ...(password ? { password } : {}),
      });
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form className="user-dialog" onSubmit={(event) => void handleSubmit(event)}>
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">ZARZĄDZANIE KONTEM</p>
            <h2>{user ? 'Edytuj użytkownika' : 'Dodaj użytkownika'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Zamknij">
            ×
          </button>
        </div>
        <label>
          Adres e-mail
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Nazwa wyświetlana
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={100}
          />
        </label>
        <label>
          Plan
          <select value={plan} onChange={(event) => setPlan(event.target.value)}>
            <option value="FREE">FREE</option>
            <option value="PRO">PRO</option>
          </select>
        </label>
        <label>
          {user ? 'Nowe hasło (opcjonalnie)' : 'Hasło początkowe'}
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={128}
            required={!user}
          />
          <span className="field-hint">
            {user ? 'Pozostaw puste, aby nie zmieniać hasła.' : 'Co najmniej 8 znaków.'}
          </span>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Anuluj
          </button>
          <button className="primary-button" disabled={saving}>
            {saving ? 'Zapisywanie…' : user ? 'Zapisz zmiany' : 'Utwórz konto'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserDialog;
