import { useMemo, useState } from 'react';
import type { AdminUser } from '../../services/admin';
import { formatDate } from '../../utils/format';
import './Users.css';

interface UsersProps {
  users: AdminUser[];
  adminId: string;
  loading: boolean;
  busyId: string;
  onCreate: () => void;
  onEdit: (user: AdminUser) => void;
  onToggle: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

function Users({
  users,
  adminId,
  loading,
  busyId,
  onCreate,
  onEdit,
  onToggle,
  onDelete,
}: UsersProps) {
  const [search, setSearch] = useState('');
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pl');
    if (!query) return users;
    return users.filter((user) =>
      `${user.email} ${user.display_name ?? ''} ${user.plan}`
        .toLocaleLowerCase('pl')
        .includes(query),
    );
  }, [search, users]);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">KONTA I UPRAWNIENIA</p>
          <h1>Użytkownicy</h1>
          <p className="page-subtitle">Twórz konta i zarządzaj dostępem do aplikacji.</p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <span>＋</span> Dodaj użytkownika
        </button>
      </div>
      <section className="content-card data-card">
        <div className="table-toolbar">
          <div>
            <h2>Lista użytkowników</h2>
            <span className="result-count">{filteredUsers.length} kont</span>
          </div>
          <label className="search-box">
            <span>⌕</span>
            <input
              aria-label="Szukaj użytkowników"
              placeholder="Szukaj użytkownika…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        {loading ? (
          <div className="empty-state">Ładowanie użytkowników…</div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">Nie znaleziono użytkowników.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>UŻYTKOWNIK</th>
                  <th>PLAN</th>
                  <th>UTWORZONO</th>
                  <th>STATUS</th>
                  <th className="actions-heading">DZIAŁANIA</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="table-user">
                        <span className="table-avatar">
                          {(user.display_name || user.email).slice(0, 1).toUpperCase()}
                        </span>
                        <span>
                          <strong>{user.display_name || '—'}</strong>
                          <small>{user.email}</small>
                        </span>
                        {user.role === 'ADMIN' && <span className="role-badge">ADMIN</span>}
                      </div>
                    </td>
                    <td><span className="plan-badge">{user.plan}</span></td>
                    <td className="date-cell">{formatDate(user.created_at)}</td>
                    <td>
                      <span className={user.is_active === 1 ? 'status-badge active' : 'status-badge inactive'}>
                        <i />{user.is_active === 1 ? 'Aktywny' : 'Nieaktywny'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="row-action"
                          title="Edytuj użytkownika"
                          aria-label={`Edytuj ${user.email}`}
                          onClick={() => onEdit(user)}
                        >
                          ✎
                        </button>
                        {user.id !== adminId && (
                          <button
                            className="row-action"
                            title={user.is_active === 1 ? 'Dezaktywuj konto' : 'Aktywuj konto'}
                            aria-label={user.is_active === 1 ? `Dezaktywuj ${user.email}` : `Aktywuj ${user.email}`}
                            disabled={busyId === user.id}
                            onClick={() => onToggle(user)}
                          >
                            {user.is_active === 1 ? '⏻' : '✓'}
                          </button>
                        )}
                        {user.id !== adminId && (
                          <button
                            className="row-action danger-action"
                            title="Usuń użytkownika"
                            aria-label={`Usuń ${user.email}`}
                            disabled={busyId === user.id}
                            onClick={() => onDelete(user)}
                          >
                            ⌫
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default Users;
