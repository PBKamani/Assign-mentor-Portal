import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FileText, HelpCircle, ArrowLeft, ArrowRight, Play } from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

export const AssignmentPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssignmentDetails = async () => {
      setLoading(true);
      try {
        const [assignRes, questionsRes] = await Promise.all([
          api.getAssignment(assignmentId),
          api.getAssignmentQuestions(assignmentId)
        ]);
        if (assignRes?.success) setAssignment(assignRes.data);
        if (questionsRes?.success) setQuestions(questionsRes.data || []);
      } catch (err) {
        console.error("Failed to load assignment questions:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAssignmentDetails();
  }, [assignmentId]);

  if (loading) return <Loader count={3} skeleton={true} />;

  if (!assignment) {
    return (
      <EmptyState
        title="Assignment Not Found"
        message="The requested assignment could not be located."
        actionLabel="Back to Dashboard"
        onAction={() => navigate('/dashboard')}
      />
    );
  }

  const startStudying = () => {
    if (questions.length > 0) {
      navigate(`/assignments/${assignmentId}/questions/${questions[0].id}`);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation directly back to Subject */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/subjects/${assignment.subjectId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} />
          <span>Back to Subject</span>
        </Link>
      </div>

      {/* Assignment Header Card */}
      <div className="neo-card" style={{ padding: '2.25rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div
                className="neo-inset"
                style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}
              >
                <FileText size={22} />
              </div>
              <span className="neo-badge neo-badge-accent">Assignment {assignment.assignmentNumber}</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {assignment.name}
            </h1>
            {assignment.description && (
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                {assignment.description}
              </p>
            )}
          </div>

          {questions.length > 0 && (
            <Button variant="primary" size="lg" onClick={startStudying} icon={Play}>
              Start Studying
            </Button>
          )}
        </div>
      </div>

      {/* Questions Index */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Assignment Questions ({questions.length})
          </h2>
        </div>

        {questions.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="No Questions Added"
            message="There are no questions attached to this assignment yet."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="neo-card neo-card-hover"
                onClick={() => navigate(`/assignments/${assignmentId}/questions/${question.id}`)}
                style={{
                  cursor: 'pointer',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    className="neo-inset"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: 'var(--accent)',
                      flexShrink: 0
                    }}
                  >
                    {question.questionNumber || index + 1}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {question.questionText}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                      {question.questionDiagramUrl && (
                        <span className="neo-badge" style={{ fontSize: '0.7rem' }}>📷 Outside Diagram</span>
                      )}
                      {question.answerDiagramUrl && (
                        <span className="neo-badge" style={{ fontSize: '0.7rem' }}>📊 Inside Diagram</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                  <ArrowRight size={18} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentPage;
