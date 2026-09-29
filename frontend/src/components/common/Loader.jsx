import React from 'react';

export const Loader = ({ message = "Loading...", skeleton = false, count = 3 }) => {
  if (skeleton) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="neo-card-sm"
            style={{
              height: '90px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '0.75rem',
              animation: 'pulse 1.5s infinite ease-in-out'
            }}
          >
            <div style={{ height: '18px', width: '60%', background: 'var(--accent-light)', borderRadius: '4px', opacity: 0.5 }} />
            <div style={{ height: '14px', width: '85%', background: 'var(--accent-light)', borderRadius: '4px', opacity: 0.3 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '1rem' }}>
      <div
        className="neo-inset"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '3px solid var(--accent)',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite'
          }}
        />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem' }}>{message}</p>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Loader;
