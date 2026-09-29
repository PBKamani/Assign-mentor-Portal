import React from 'react';
import { FolderOpen } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No content found",
  message = "There are no items created in this section yet.",
  actionLabel,
  onAction
}) => {
  return (
    <div
      className="neo-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3.5rem 2rem',
        margin: '1.5rem 0'
      }}
    >
      <div
        className="neo-inset"
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
          marginBottom: '1.25rem'
        }}
      >
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', marginBottom: actionLabel ? '1.5rem' : 0 }}>
        {message}
      </p>
      {actionLabel && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
