import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#333' }}>Nightmodel</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Sankey diagram solver and flow analyzer
        </p>
      </header>

      <main>
        <div style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: '#f9f9f9'
        }}>
          <h2 style={{ color: '#666', fontSize: '1.2rem', marginBottom: '1rem' }}>
            UI Coming Soon
          </h2>
          <p style={{ color: '#999', marginBottom: '1.5rem' }}>
            This is a placeholder for the future React UI.
          </p>
          <div style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4a5568',
            color: 'white',
            borderRadius: '6px',
            cursor: 'not-allowed',
            opacity: 0.6
          }}>
            Load YAML File
          </div>
        </div>

        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>For now, use the CLI:</h3>
          <pre style={{
            backgroundColor: '#f4f4f4',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            <code>node sankey-solver.js example.yaml</code>
          </pre>
        </div>
      </main>
    </div>
  );
}

export default App;
