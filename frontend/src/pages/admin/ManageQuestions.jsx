import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/admin/DataTable';
import QuestionEditor from '../../components/admin/QuestionEditor';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export const ManageQuestions = () => {
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Filter selection
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [loading, setLoading] = useState(true);

  // Editor View State
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    const loadInitialMetadata = async () => {
      try {
        const [subjRes, assignRes] = await Promise.all([
          api.getSubjects(),
          api.getAssignments()
        ]);
        if (subjRes?.success) setSubjects(subjRes.data || []);
        if (assignRes?.success) {
          const list = assignRes.data || [];
          setAssignments(list);
          if (list.length > 0 && !selectedAssignmentId) {
            setSelectedAssignmentId(list[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    };
    loadInitialMetadata();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.getQuestions(selectedAssignmentId || undefined);
      if (res?.success) setQuestions(res.data || []);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedAssignmentId]);

  const handleOpenCreate = () => {
    if (!selectedAssignmentId && assignments.length === 0) {
      alert("Please create an Assignment first before creating questions.");
      return;
    }
    const currentAssign = assignments.find(a => a.id === selectedAssignmentId) || assignments[0];
    setCurrentQuestion({
      assignmentId: currentAssign.id,
      subjectId: currentAssign.subjectId,
      questionNumber: questions.length + 1,
      order: questions.length + 1,
      questionText: '',
      answer: '<p></p>',
      questionDiagramUrl: null,
      answerDiagramUrl: null
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (q) => {
    setCurrentQuestion(q);
    setIsEditing(true);
  };

  const handleSaveQuestion = async (payload) => {
    if (currentQuestion?.id) {
      await api.updateQuestion(currentQuestion.id, payload);
    } else {
      await api.createQuestion(payload);
    }
    setIsEditing(false);
    setCurrentQuestion(null);
    fetchQuestions();
  };

  const handleDeleteQuestion = async (q) => {
    await api.deleteQuestion(q.id);
    fetchQuestions();
  };

  const assignMap = assignments.reduce((acc, a) => { acc[a.id] = a.name; return acc; }, {});

  const columns = [
    { header: "Q#", accessor: "questionNumber" },
    {
      header: "Question Statement",
      accessor: "questionText",
      render: (row) => (
        <div style={{ maxWidth: '420px' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.questionText}</div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
            {row.questionDiagramUrl && (
              <span className="neo-badge neo-badge-accent" style={{ fontSize: '0.7rem' }}>📷 Outside Diagram</span>
            )}
            {row.answerDiagramUrl && (
              <span className="neo-badge" style={{ fontSize: '0.7rem' }}>📊 Inside Diagram</span>
            )}
          </div>
        </div>
      )
    },
    {
      header: "Assignment",
      accessor: "assignmentId",
      render: (row) => (
        <span className="neo-badge" style={{ fontSize: '0.8rem' }}>
          {assignMap[row.assignmentId] || row.assignmentId}
        </span>
      )
    },
    { header: "Order", accessor: "order" }
  ];

  if (isEditing) {
    const selectedAssign = assignments.find(a => a.id === (currentQuestion?.assignmentId || selectedAssignmentId));
    return (
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        <QuestionEditor
          question={currentQuestion}
          subjectId={selectedAssign?.subjectId}
          assignmentId={selectedAssign?.id}
          onSave={handleSaveQuestion}
          onCancel={() => { setIsEditing(false); setCurrentQuestion(null); }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Manage Questions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Questions, TipTap answers, and outside/inside diagram attachments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Assignment Filter */}
          <select
            className="neo-input"
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            style={{ width: '250px', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="">All Assignments</option>
            {assignments.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <Button variant="primary" onClick={handleOpenCreate} icon={Plus}>
            Add Question
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader skeleton={true} count={3} />
      ) : (
        <DataTable
          columns={columns}
          data={questions}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteQuestion}
          emptyMessage="No questions found for this selection. Click 'Add Question' to create one."
        />
      )}
    </div>
  );
};

export default ManageQuestions;
