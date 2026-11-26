import { useEffect, useState } from 'react';
import Aside from './components/Aside/Aside';
import Alert from './components/Alert/Alert';
import Nav from './components/Nav/Nav';
import UserDialog from './components/UserDialog/UserDialog';
import Files from './pages/Files/Files';
import Login from './pages/Login/Login';
import Overview from './pages/Overview/Overview';
import Users from './pages/Users/Users';
import {
  createUser,
  deleteUser,
  downloadDocument,
  getCurrentAdmin,
  listDocuments,
  listUsers,
  logout,
  setUserActive,
  updateUser,
  type AdminDocument,
  type AdminUser,
  type UserInput,
} from './services/admin';
import type { Section } from './types';
import { getErrorMessage } from './utils/errors';
import './App.css';

function App() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [authError, setAuthError] = useState('');
  const [section, setSection] = useState<Section>('overview');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dialogUser, setDialogUser] = useState<AdminUser | null | undefined>();
  const [busyId, setBusyId] = useState('');

  async function loadData() {
    try {
      const [nextUsers, nextDocuments] = await Promise.all([
        listUsers(),
        listDocuments(),
      ]);
      setUsers(nextUsers);
      setDocuments(nextDocuments);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoadingData(false);
    }
  }

  async function refreshData() {
    setLoadingData(true);
    setError('');
    await loadData();
  }

  useEffect(() => {
    getCurrentAdmin()
      .then((user) => {
        if (user?.role === 'ADMIN') {
          setAdmin(user);
          void loadData();
        } else if (user) {
          setAuthError('To konto nie ma uprawnień administratora.');
          setLoadingData(false);
        } else {
          setLoadingData(false);
        }
      })
      .catch((sessionError: unknown) => {
        setAuthError(getErrorMessage(sessionError));
        setLoadingData(false);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  async function handleLogout() {
    try {
      await logout();
      setAdmin(null);
      setAuthError('');
      setUsers([]);
      setDocuments([]);
    } catch (logoutError) {
      setError(getErrorMessage(logoutError));
    }
  }

  async function saveUser(user: AdminUser | null, input: UserInput) {
    if (user) {
      await updateUser(user.id, input);
      setNotice('Dane użytkownika zostały zaktualizowane.');
    } else {
      if (!input.password) {
        throw new Error('Hasło początkowe jest wymagane.');
      }
      await createUser({ ...input, password: input.password });
      setNotice('Konto użytkownika zostało utworzone.');
    }
    setDialogUser(undefined);
    await refreshData();
  }

  async function toggleUser(user: AdminUser) {
    setBusyId(user.id);
    setError('');
    try {
      await setUserActive(user.id, user.is_active !== 1);
      setNotice(user.is_active === 1
        ? 'Konto zostało dezaktywowane.'
        : 'Konto zostało aktywowane.');
      await refreshData();
    } catch (toggleError) {
      setError(getErrorMessage(toggleError));
    } finally {
      setBusyId('');
    }
  }

  async function removeUser(user: AdminUser) {
    if (!window.confirm(`Czy na pewno usunąć konto ${user.email}? Tej operacji nie można cofnąć.`)) {
      return;
    }

    setBusyId(user.id);
    setError('');
    try {
      await deleteUser(user.id);
      setNotice('Konto użytkownika zostało usunięte.');
      await refreshData();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setBusyId('');
    }
  }

  async function handleDownload(document: AdminDocument) {
    setBusyId(document.id);
    setError('');
    try {
      await downloadDocument(document);
    } catch (downloadError) {
      setError(getErrorMessage(downloadError));
    } finally {
      setBusyId('');
    }
  }

  function openCreateUser() {
    setSection('users');
    setDialogUser(null);
  }

  if (checkingSession) {
    return <main className="session-loading">Ładowanie panelu…</main>;
  }

  if (!admin) {
    return (
      <Login
        initialError={authError}
        onLogin={async (user) => {
          setAuthError('');
          setAdmin(user);
          await refreshData();
        }}
      />
    );
  }

  const totalStorage = documents.reduce((total, document) => total + document.fileSize, 0);

  return (
    <div className="admin-layout">
      <Aside
        section={section}
        user={admin}
        userCount={users.length}
        documentCount={documents.length}
        onNavigate={setSection}
        onLogout={() => void handleLogout()}
      />
      <main className="main-panel">
        <Nav section={section} />
        <div className="page-content">
          {error && <Alert kind="error" onDismiss={() => setError('')}>{error}</Alert>}
          {notice && <Alert kind="success" onDismiss={() => setNotice('')}>{notice}</Alert>}
          {section === 'overview' && (
            <Overview
              users={users}
              documents={documents}
              loading={loadingData}
              busyId={busyId}
              onRefresh={() => void refreshData()}
              onDownload={(document) => void handleDownload(document)}
              onNavigate={setSection}
              onCreateUser={openCreateUser}
            />
          )}
          {section === 'users' && (
            <Users
              users={users}
              adminId={admin.id}
              loading={loadingData}
              busyId={busyId}
              onCreate={() => setDialogUser(null)}
              onEdit={setDialogUser}
              onToggle={(user) => void toggleUser(user)}
              onDelete={(user) => void removeUser(user)}
            />
          )}
          {section === 'files' && (
            <Files
              documents={documents}
              totalStorage={totalStorage}
              loading={loadingData}
              busyId={busyId}
              onRefresh={() => void refreshData()}
              onDownload={(document) => void handleDownload(document)}
            />
          )}
        </div>
      </main>
      {dialogUser !== undefined && (
        <UserDialog
          key={dialogUser?.id ?? 'new-user'}
          user={dialogUser}
          onClose={() => setDialogUser(undefined)}
          onSave={(input) => saveUser(dialogUser, input)}
        />
      )}
    </div>
  );
}

export default App;
