import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import api from '../../services/api';
import QuestionCard from '../../components/questions/QuestionCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export const QuestionPage = () => {
  const { assignmentId, questionId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const res = await api.getAssignmentQuestions(assignmentId);
        if (res?.success) {
          const list = res.data || [];
          setQuestions(list);
          const found = list.find(q => q.id === questionId) || list[0];
          setCurrentQuestion(found);
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [assignmentId, questionId]);

  if (loading) return <Loader count={2} skeleton={true} />;

  if (!currentQuestion) {
    return (
      <EmptyState
        title="Question Not Found"
        message="The specified question could not be loaded."
        actionLabel="Back to Assignment"
        onAction={() => navigate(`/assignments/${assignmentId}`)}
      />
    );
  }

  const currentIndex = questions.findIndex(q => q.id === currentQuestion.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < questions.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      const prevQ = questions[currentIndex - 1];
      navigate(`/assignments/${assignmentId}/questions/${prevQ.id}`);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const nextQ = questions[currentIndex + 1];
      navigate(`/assignments/${assignmentId}/questions/${nextQ.id}`);
    }
  };

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto' }}>
      {/* Breadcrumb Back Link */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to={`/assignments/${assignmentId}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Assignment Questions</span>
        </Link>
      </div>

      {/* Primary Question Study Card */}
      <QuestionCard
        question={currentQuestion}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
};

export default QuestionPage;
