import React from 'react';
import { Button } from '@astryxdesign/core/Button';

export default function App() {
  return (
    <main style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <section
        style={{
          padding: '2.5rem',
          borderRadius: '16px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }}
      >
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, margin: '0 0 1rem', color: '#1a202c' }}>
          Welcome to 205 Project
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#4a5568', lineHeight: 1.6, marginBottom: '2rem' }}>
          Successfully integrated with <strong>Astryx Design System</strong> and built following{' '}
          <strong>Modern Web Guidance</strong> best practices.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="primary" label="Get Started" onClick={() => alert('Astryx button working!')}>
            Get Started
          </Button>
          <Button variant="secondary" label="Explore Documentation">
            Explore Documentation
          </Button>
        </div>
      </section>
    </main>
  );
}

