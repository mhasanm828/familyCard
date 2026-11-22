import React from 'react';

export default function Page() {
  const items: string[] = [
    'First bullet point',
    'Second bullet point',
    'Third bullet point',
  ];

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Bullet Points</h1>
      <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
        {items.map((item, index) => (
          <li key={index} style={{ marginBottom: '0.5rem' }}>
            {item}
          </li>
        ))}
      </ul>
    </main>
  );
}
