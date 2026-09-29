import React from 'react';
import DiagramViewer from './DiagramViewer';

export const AnswerBox = ({ answer, answerDiagramUrl }) => {
  return (
    <div
      className="neo-inset"
      style={{
        padding: '1.75rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--surface-color)',
        border: 'var(--border-subtle)',
        marginTop: '0.75rem',
        marginBottom: '1.5rem',
        position: 'relative'
      }}
    >
      {/* Answer Body Content */}
      {answer ? (
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: answer }}
        />
      ) : (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No written answer provided yet.
        </p>
      )}

      {/* Answer Diagram must strictly appear INSIDE the answer box (Specification 17 & 18) */}
      {answerDiagramUrl && (
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: 'var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div style={{ alignSelf: 'flex-start', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Reference / Solution Diagram:
          </div>
          <DiagramViewer src={answerDiagramUrl} alt="Answer Solution Diagram" caption="Figure: Solution Diagram" />
        </div>
      )}
    </div>
  );
};

export default AnswerBox;
