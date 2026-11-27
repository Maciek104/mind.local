import { useEffect, useState } from 'react';
import Aside from './components/Aside/Aside';
import Alert from './components/Alert/Alert';
import Nav from './components/Nav/Nav';
import UserDialog from './components/UserDialog/UserDialog';
import Files from './pages/Files/Files';
import Login from './pages/Login/Login';
import Overview from './pages/Overview/Overview';
import Plans from './pages/Plans/Plans';
import Users from './pages/Users/Users';
import {
  createUser,
  deleteUserAvatar,
  deleteUser,
  downloadDocument,
  getCurrentAdmin,
  listPlans,
  listDocuments,
  listUsers,
  logout,
  setUserActive,
  updatePlan,
  updateUser,
  uploadUserAvatar,
  type AdminPlan,
  type AdminDocument,
  type AdminUser,
  type PlanInput,
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
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dialogUser, setDialogUser] = useState<AdminUser | null | undefined>();
  const [busyId, setBusyId] = useState('');

  async function loadData() {
    try {
      const [nextUsers, nextDocuments, nextPlans] = await Promise.all([
        listUsers(),
        listDocuments(),
        listPlans(),
      ]);
      setUsers(nextUsers);
      setDocuments(nextDocuments);
      setPlans(nextPlans);
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
          setAuthError('This account does not have administrator privileges.');
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
      setPlans([]);
    } catch (logoutError) {
      setError(getErrorMessage(logoutError));
    }
  }

  async function saveUser(user: AdminUser | null, input: UserInput) {
    if (user) {
      await updateUser(user.id, input);
      setNotice('User details have been updated.');
    } else {
      if (!input.password) {
        throw new Error('An initial password is required.');
      }
      await createUser({ ...input, password: input.password });
      setNotice('The user account has been created.');
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
        ? 'The account has been deactivated.'
        : 'The account has been activated.');
      await refreshData();
    } catch (toggleError) {
      setError(getErrorMessage(toggleError));
    } finally {
      setBusyId('');
    }
  }

  async function removeUser(user: AdminUser) {
    if (!window.confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
      return;
    }

    setBusyId(user.id);
    setError('');
    try {
      await deleteUser(user.id);
      setNotice('The user account has been deleted.');
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

  async function savePlan(plan: AdminPlan, input: PlanInput) {
    await updatePlan(plan.code, input);
    setNotice(`${plan.name} plan has been updated.`);
    await refreshData();
  }

  async function handleAvatarUpload(userId: string, file: File): Promise<AdminUser> {
    const updatedUser = await uploadUserAvatar(userId, file);
    setUsers((currentUsers) => currentUsers.map((user) =>
      user.id === userId ? updatedUser : user,
    ));
    setAdmin((currentAdmin) => currentAdmin?.id === userId ? updatedUser : currentAdmin);
    setDialogUser((currentUser) => currentUser?.id === userId ? updatedUser : currentUser);
    return updatedUser;
  }

  async function handleAvatarDelete(userId: string): Promise<AdminUser> {
    const updatedUser = await deleteUserAvatar(userId);
    setUsers((currentUsers) => currentUsers.map((user) =>
      user.id === userId ? updatedUser : user,
    ));
    setAdmin((currentAdmin) => currentAdmin?.id === userId ? updatedUser : currentAdmin);
    setDialogUser((currentUser) => currentUser?.id === userId ? updatedUser : currentUser);
    return updatedUser;
  }

  function openCreateUser() {
    setSection('users');
    setDialogUser(null);
  }

  if (checkingSession) {
    return <main className="session-loading">Loading admin panel...</main>;
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
          {section === 'plans' && (
            <Plans
              plans={plans}
              loading={loadingData}
              onSave={(plan, input) => savePlan(plan, input)}
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
          onAvatarUpload={handleAvatarUpload}
          onAvatarDelete={handleAvatarDelete}
        />
      )}
    </div>
  );
}

export default App;
