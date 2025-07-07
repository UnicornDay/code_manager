import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { createClient } from '@supabase/supabase-js';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

const supabaseUrl = 'https://koxpylkobinhdldrkmog.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveHB5bGtvYmluaGRsZHJrbW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODM0MDgsImV4cCI6MjA2NjY1OTQwOH0.WE1bKMbq99khwx7cNeD3fsSo6YXaMHzUb7gBQml2x5E';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else navigate('/');
  };

  return (
    <div style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>
      <h2>Login Page</h2>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left', background: '#222', padding: 24, borderRadius: 8 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Email:<br />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: 240, padding: 8, borderRadius: 4, border: '1px solid #444' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password:<br />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: 240, padding: 8, borderRadius: 4, border: '1px solid #444' }} />
          </label>
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 4, background: '#61dafb', color: '#222', fontWeight: 'bold', border: 'none' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
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
                <img src={logo} className="App-logo" alt="logo" />
                <button onClick={handleLogout} style={{ position: 'absolute', top: 20, right: 20, padding: '8px 16px', borderRadius: 4, background: '#ff5252', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                  Log Out
                </button>
                <p>
                  Edit <code>src/App.js</code> and save to reload.
                </p>
                <div>
                  <h3>Supabase test_table Table:</h3>
                  <button onClick={fetchData} disabled={loading} style={{marginBottom: 10}}>
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                  {error && <div style={{ color: 'red' }}>Error: {error}</div>}
                  {data && <pre style={{ color: 'yellow', background: '#222', maxWidth: 400, margin: '0 auto', padding: 10, borderRadius: 4 }}>{JSON.stringify(data, null, 2)}</pre>}
                  {data ? (
                    Array.isArray(data) && data.length > 0 ? (
                      <table style={{ margin: '0 auto', borderCollapse: 'collapse', background: '#222', color: '#fff', borderRadius: 4 }}>
                        <thead>
                          <tr>
                            {Object.keys(data[0]).map((key) => (
                              <th key={key} style={{ border: '1px solid #444', padding: '8px' }}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((row, idx) => (
                            <tr key={idx}>
                              {Object.values(row).map((value, i) => (
                                <td key={i} style={{ border: '1px solid #444', padding: '8px' }}>{String(value)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ color: '#fff' }}>No data found.</div>
                    )
                  ) : (
                    !error && <span>Loading...</span>
                  )}
                </div>
                <a
                  className="App-link"
                  href="https://reactjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn React
                </a>
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
