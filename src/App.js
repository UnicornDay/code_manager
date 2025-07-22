import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { createClient } from '@supabase/supabase-js';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

const supabaseUrl = 'https://koxpylkobinhdldrkmog.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveHB5bGtvYmluaGRsZHJrbW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODM0MDgsImV4cCI6MjA2NjY1OTQwOH0.WE1bKMbq99khwx7cNeD3fsSo6YXaMHzUb7gBQml2x5E';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function Login() {
  const [email, setEmail] = useState('');
  // Remove password state
  // const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // can remove if not used elsewhere
  const [error, setError] = useState(null);
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicMessage, setMagicMessage] = useState('');
  const navigate = useNavigate();

  // Remove handleSubmit and password login logic

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setMagicLoading(true);
    setMagicMessage('');
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setMagicLoading(false);
    if (error) setError(error.message);
    else setMagicMessage('Check your email for the magic link!');
  };

  return (
    <div style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>
      <h2>Sign in with Magic Link</h2>
      <form onSubmit={handleMagicLink} style={{ display: 'inline-block', textAlign: 'left', background: '#222', padding: 24, borderRadius: 8 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Email:<br />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: 240, padding: 8, borderRadius: 4, border: '1px solid #444' }} />
          </label>
        </div>
        <button type="submit" disabled={magicLoading} style={{ width: '100%', padding: 10, borderRadius: 4, background: '#7cfb61', color: '#222', fontWeight: 'bold', border: 'none' }}>
          {magicLoading ? 'Sending magic link...' : 'Send Magic Link'}
        </button>
        {magicMessage && <div style={{ color: 'lightgreen', marginTop: 12 }}>{magicMessage}</div>}
        {error && !magicMessage && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setLoading(false);
      if (!session) navigate('/login', { replace: true });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      if (!session) navigate('/login', { replace: true });
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>Loading...</div>;
  if (!session) return null;
  return children;
}

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    supabase
      .from('test_table')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setData(data);
        setLoading(false);
      });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <div className="App">
              <header className="App-header">
                <button onClick={handleLogout} style={{ position: 'absolute', top: 20, right: 20, padding: '8px 16px', borderRadius: 4, background: '#ff5252', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                  Log Out
                </button>
                <iframe
                  src="/file_manager.html"
                  title="File Manager"
                  style={{
                    width: '100vw',
                    height: '100vh',
                    border: 'none',
                    background: '#fff'
                  }}
                />
              </header>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
