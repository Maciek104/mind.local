import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { AdminUser, UserInput } from '../../services/admin';
import { getUserAvatarUrl } from '../../services/admin';
import { getErrorMessage } from '../../utils/errors';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import './UserDialog.css';

interface UserDialogProps {
  user: AdminUser | null;
  onClose: () => void;
  onSave: (input: UserInput) => Promise<void>;
  onAvatarUpload: (userId: string, file: File) => Promise<AdminUser>;
  onAvatarDelete: (userId: string) => Promise<AdminUser>;
}

function UserDialog({ user, onClose, onSave, onAvatarUpload, onAvatarDelete }: UserDialogProps) {
  const [email, setEmail] = useState(user?.email ?? '');
  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [profileImagePath, setProfileImagePath] = useState(user?.profile_image_path ?? null);
  const [plan, setPlan] = useState(user?.plan ?? 'FREE');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarNotice, setAvatarNotice] = useState('');
  const avatarInput = useRef<HTMLInputElement>(null);

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

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!user || !file) return;

    setSaving(true);
    setError('');
    setAvatarNotice('');
    try {
      const updatedUser = await onAvatarUpload(user.id, file);
      setProfileImagePath(updatedUser.profile_image_path);
      setAvatarNotice('Avatar uploaded.');
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setSaving(false);
      event.target.value = '';
    }
  }

  async function handleAvatarDelete() {
    if (!user) return;

    setSaving(true);
    setError('');
    setAvatarNotice('');
    try {
      const updatedUser = await onAvatarDelete(user.id);
      setProfileImagePath(updatedUser.profile_image_path);
      setAvatarNotice('Avatar removed.');
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
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
            <p className="eyebrow">ACCOUNT MANAGEMENT</p>
            <h2>{user ? 'Edit user' : 'Add user'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <MaterialIcon name="close" />
          </button>
        </div>
        {user && (
          <div className="avatar-editor">
            <div className="avatar-preview">
              {profileImagePath ? (
                <img
                  crossOrigin="use-credentials"
                  src={getUserAvatarUrl(user.id, profileImagePath)}
                  alt=""
                />
              ) : (
                (displayName || email).slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="avatar-controls">
              <span className="avatar-label">Profile avatar</span>
              <input
                ref={avatarInput}
                className="avatar-file-input"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(event) => void handleAvatarChange(event)}
              />
              <button
                type="button"
                className="secondary-button avatar-action"
                disabled={saving}
                onClick={() => profileImagePath
                  ? void handleAvatarDelete()
                  : avatarInput.current?.click()}
              >
                {profileImagePath ? 'Remove avatar' : 'Upload avatar'}
              </button>
              <span className="field-hint">JPEG, PNG, GIF or WebP; up to 5 MB.</span>
              {avatarNotice && <span className="avatar-notice">{avatarNotice}</span>}
            </div>
          </div>
        )}
        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Display name
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
            <option value="ULTRA">ULTRA</option>
          </select>
        </label>
        <label>
          {user ? 'New password (optional)' : 'Initial password'}
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
            {user ? 'Leave blank to keep the current password.' : 'At least 8 characters.'}
          </span>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" disabled={saving}>
            {saving ? 'Saving...' : user ? 'Save changes' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserDialog;
