import React, { useState } from 'react';
import { ZoomIn, ZoomOut, X, Maximize2 } from 'lucide-react';
import { getAssetUrl } from '../../services/api';

export const DiagramViewer = ({ src, alt = "Diagram", caption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const resolvedUrl = getAssetUrl(src);

  if (!src) return null;

  return (
    <>
      <div
        className="neo-card-sm"
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          margin: '1rem 0',
          maxWidth: '100%',
          overflow: 'hidden'
        }}
        onClick={() => { setIsOpen(true); setZoom(1); }}
        title="Click to view diagram in full size"
      >
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <img
            src={resolvedUrl}
            alt={alt}
            style={{
              maxHeight: '360px',
              maxWidth: '100%',
              borderRadius: 'var(--radius-sm)',
              objectFit: 'contain',
              display: 'block'
            }}
            loading="lazy"
          />
          <div
            style={{
              position: 'absolute',
              right: '8px',
              bottom: '8px',
              background: 'rgba(0,0,0,0.6)',
              color: '#FFF',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(2px)'
            }}
          >
            <Maximize2 size={16} />
          </div>
        </div>
        {caption && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
            {caption}
          </span>
        )}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          {/* Header Controls */}
          <div
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              zIndex: 1110
            }}
          >
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.3, 3))}
              className="neo-btn neo-btn-icon"
              style={{ background: '#FFF', color: '#000', width: '38px', height: '38px' }}
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.3, 0.5))}
              className="neo-btn neo-btn-icon"
              style={{ background: '#FFF', color: '#000', width: '38px', height: '38px' }}
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="neo-btn neo-btn-icon"
              style={{ background: '#FFF', color: '#000', width: '38px', height: '38px' }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={resolvedUrl}
              alt={alt}
              style={{
                transform: `scale(${zoom})`,
                transition: 'transform 0.15s ease',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DiagramViewer;
