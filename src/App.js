import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://koxpylkobinhdldrkmog.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveHB5bGtvYmluaGRsZHJrbW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwODM0MDgsImV4cCI6MjA2NjY1OTQwOH0.WE1bKMbq99khwx7cNeD3fsSo6YXaMHzUb7gBQml2x5E';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
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
  );
}

export default App;
