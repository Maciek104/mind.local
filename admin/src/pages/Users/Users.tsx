import { useMemo, useState } from 'react';
import { getUserAvatarUrl, type AdminUser } from '../../services/admin';
import { formatDate } from '../../utils/format';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
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
    const query = search.trim().toLocaleLowerCase('en');
    if (!query) return users;
    return users.filter((user) =>
      `${user.email} ${user.display_name ?? ''} ${user.plan}`
        .toLocaleLowerCase('en')
        .includes(query),
    );
  }, [search, users]);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ACCOUNTS AND PERMISSIONS</p>
          <h1>Users</h1>
          <p className="page-subtitle">Create accounts and manage access to the application.</p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <MaterialIcon name="person_add" /> Add user
        </button>
      </div>
      <section className="content-card data-card">
        <div className="table-toolbar">
          <div>
            <h2>User list</h2>
            <span className="result-count">{filteredUsers.length} accounts</span>
          </div>
          <label className="search-box">
            <MaterialIcon name="search" />
            <input
              aria-label="Search users"
              placeholder="Search users..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        {loading ? (
          <div className="empty-state">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">No users found.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>USER</th>
                  <th>PLAN</th>
                  <th>CREATED</th>
                  <th>STATUS</th>
                  <th className="actions-heading">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="table-user">
                        <span className="table-avatar">
                          {user.profile_image_path ? (
                            <img
                              crossOrigin="use-credentials"
                              src={getUserAvatarUrl(user.id, user.profile_image_path)}
                              alt=""
                            />
                          ) : (
                            (user.display_name || user.email).slice(0, 1).toUpperCase()
                          )}
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
                      <i />{user.is_active === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="row-action"
                          title="Edit user"
                          aria-label={`Edit ${user.email}`}
                          onClick={() => onEdit(user)}
                        >
                          <MaterialIcon name="edit" />
                        </button>
                        {user.id !== adminId && (
                          <button
                            className="row-action"
                            title={user.is_active === 1 ? 'Deactivate account' : 'Activate account'}
                            aria-label={user.is_active === 1 ? `Deactivate ${user.email}` : `Activate ${user.email}`}
                            disabled={busyId === user.id}
                            onClick={() => onToggle(user)}
                          >
                            <MaterialIcon name={user.is_active === 1 ? 'power_settings_new' : 'check'} />
                          </button>
                        )}
                        {user.id !== adminId && (
                          <button
                            className="row-action danger-action"
                            title="Delete user"
                            aria-label={`Delete ${user.email}`}
                            disabled={busyId === user.id}
                            onClick={() => onDelete(user)}
                          >
                            <MaterialIcon name="delete" />
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
