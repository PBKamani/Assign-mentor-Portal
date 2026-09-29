import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import DiagramViewer from './DiagramViewer';
import AnswerBox from './AnswerBox';
import Button from '../common/Button';

export const QuestionCard = ({
  question,
  currentIndex = 0,
  totalQuestions = 1,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}) => {
  // Support optional keyboard navigation (Specification 36)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrevious, hasNext, onPrevious, onNext]);

  if (!question) return null;

  return (
    <article
      className="neo-card"
      style={{
        padding: '2.5rem',
        marginBottom: '2rem',
        borderRadius: 'var(--radius-xl)'
      }}
    >
      {/* Top Header / Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <span className="neo-badge neo-badge-accent" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Order #{question.order || question.questionNumber}
        </span>
      </div>

      {/* Question Header & Text */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.4, color: 'var(--text-primary)' }}>
          {question.questionNumber ? `${question.questionNumber}) ` : ''}{question.questionText}
        </h2>
      </div>

      {/* QUESTION DIAGRAM: STRICTLY OUTSIDE THE ANSWER BOX (Specification 17 & 72) */}
      {question.questionDiagramUrl && (
        <div style={{ marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Question Problem Diagram:
          </div>
          <DiagramViewer
            src={question.questionDiagramUrl}
            alt="Question Diagram"
            caption="Figure: Question Diagram (Outside Answer Box)"
          />
        </div>
      )}

      {/* Answer Section Heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        <BookOpen size={18} color="var(--accent)" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Answer:
        </h3>
      </div>

      {/* ANSWER BOX: Houses formatted answer and ANSWER DIAGRAM inside */}
      <AnswerBox
        answer={question.answer}
        answerDiagramUrl={question.answerDiagramUrl}
      />

      {/* Bottom Navigation: Previous / Next (Specification 35 & 36) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: 'var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <Button
          onClick={onPrevious}
          disabled={!hasPrevious}
          icon={ArrowLeft}
          style={{ visibility: hasPrevious ? 'visible' : 'hidden' }}
        >
          Previous Question
        </Button>

        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Question {currentIndex + 1} / {totalQuestions}
        </div>

        <Button
          onClick={onNext}
          disabled={!hasNext}
          variant="primary"
          style={{ visibility: hasNext ? 'visible' : 'hidden', display: 'flex', flexDirection: 'row-reverse' }}
        >
          <span>Next Question</span>
          <ArrowRight size={18} />
        </Button>
      </div>
    </article>
  );
};

export default QuestionCard;
