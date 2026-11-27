
import './App.css';

import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Aside from './components/Aside/Aside.tsx';

import Register from './pages/Register/Register.tsx';
import Login from './pages/Login/Login.tsx';

import Home from './pages/Home/Home.tsx';
import Chat from './pages/Chat/Chat.tsx';
import Notes from './pages/Notes/Notes.tsx';
import Library from './pages/Library/Library.tsx';
import Settings from './pages/Settings/Settings.tsx';
import About from './pages/About/About.tsx';
import Account from './pages/Account/Account.tsx';
import Tetris from './pages/tetris/Tetris.tsx';

import { checkSetupStatus } from './services/setup.ts';
import { checkAuthentication, type AuthenticatedUser } from './services/auth.ts';
import AdminAccessContext from './context/AdminAccessContext.ts';

type AppStatus = 'loading' | 'setup' | 'ready' | 'error';

function App() {
  const [status, setStatus] = useState<AppStatus>('loading');
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  async function checkSetup() {
    try {
      const initialized = await checkSetupStatus();

      if (!initialized) {
        setStatus('setup');
        return;
      }

      const user = await checkAuthentication();
      setAuthenticated(user !== null);
      setIsAdmin(user?.role === 'ADMIN');
      setStatus('ready');
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Nie udało się połączyć z serwerem.',
      );

      setStatus('error');
    }
  }

  useEffect(() => {
    checkSetup();
  }, []);

  return (
    <Router>
      <AdminAccessContext.Provider value={isAdmin}>
      {status === 'loading' && (
        <div>Ładowanie local.mind...</div>
      )}

      {status === 'error' && (
        <div>
          <h2>Nie udało się uruchomić local.mind</h2>
          <p>{error}</p>
          <button
            onClick={() => {
              setStatus('loading');
              setError('');
              void checkSetup();
            }}
          >
            Spróbuj ponownie
          </button>
        </div>
      )}

      {status === 'setup' && (
        <Register onRegistered={checkSetup} />
      )}

      {status === 'ready' && (
        <Routes>
          <Route
            path="/login"
            element={
              authenticated
                ? <Navigate to="/" replace />
                : (
                  <Login
                    onLogin={(user: AuthenticatedUser) => {
                      setAuthenticated(true);
                      setIsAdmin(user.role === 'ADMIN');
                    }}
                  />
                )
            }
          />

          <Route
            path="/*"
            element={
              authenticated
                ? (
                  <div className="layout">
                    <Aside
                      onLogout={() => {
                        setAuthenticated(false);
                        setIsAdmin(false);
                      }}
                    />

                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/home" element={<Home />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/notes" element={<Notes />} />
                      <Route path="/library" element={<Library />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/tetris" element={<Tetris />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                )
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      )}
      </AdminAccessContext.Provider>
    </Router>
  );
}

export default App;
