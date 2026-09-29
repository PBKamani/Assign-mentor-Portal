import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export const SubjectPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubjectDetails = async () => {
      setLoading(true);
      try {
        const [subRes, assignRes] = await Promise.all([
          api.getSubject(subjectId),
          api.getSubjectAssignments(subjectId)
        ]);
        if (subRes?.success) setSubject(subRes.data);
        if (assignRes?.success) setAssignments(assignRes.data || []);
      } catch (err) {
        console.error("Failed to load subject details:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSubjectDetails();
  }, [subjectId]);

  if (loading) return <Loader count={3} skeleton={true} />;

  if (!subject) {
    return (
      <EmptyState
        title="Subject Not Found"
        message="The requested subject could not be located."
        actionLabel="Return to Study Desk"
        onAction={() => navigate('/dashboard')}
      />
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Breadcrumb / Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} />
          <span>Back to All Subjects</span>
        </Link>
      </div>

      {/* Subject Header */}
      <div className="neo-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div
            className="neo-inset"
            style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}
          >
            <BookOpen size={22} />
          </div>
          <span className="neo-badge neo-badge-accent">Subject</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {subject.name}
        </h1>
        {subject.description && (
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {subject.description}
          </p>
        )}
      </div>

      {/* Assignments List (Directly under Subject) */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          Subject Assignments
        </h2>

        {assignments.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Assignments Yet"
            message="There are currently no assignments available under this subject."
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="neo-card neo-card-hover"
                onClick={() => navigate(`/assignments/${assignment.id}`)}
                style={{
                  cursor: 'pointer',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="neo-badge" style={{ fontSize: '0.75rem' }}>
                      Assignment {assignment.assignmentNumber}
                    </span>
                    <FileText size={18} color="var(--accent)" />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    {assignment.name}
                  </h3>
                  {assignment.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {assignment.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', marginTop: '1.5rem' }}>
                  <span>Study Questions</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectPage;
