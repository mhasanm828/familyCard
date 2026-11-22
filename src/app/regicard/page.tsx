import React, { useState } from 'react';

interface AppProps {
  title?: string;
}

export const App: React.FC<AppProps> = ({ title = 'Starter React TypeScript Component' }) => {
  const [count, setCount] = useState<number>(0);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>{title}</h1>
      <p>This is a ready-to-use TypeScript React (.tsx) starter component.</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={() => setCount((prev) => prev - 1)}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          -
        </button>
        <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{count}</span>
        <button
          type="button"
          onClick={() => setCount((prev) => prev + 1)}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default App;
