import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Layers, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.getSubjects();
        if (res?.success) {
          setSubjects(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Welcome Banner (Specification 34) */}
      <section
        className="neo-card"
        style={{
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '2.5rem',
          background: 'var(--surface-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <Sparkles size={18} />
            <span>ACADEMIC STUDY DESK</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            Welcome back, {user?.username || 'Student'}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '580px' }}>
            Select any subject from below or browse via the sidebar to study assignments, structured answers, and diagrams.
          </p>
        </div>
      </section>

      {/* Available Subjects Grid */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Your Enrolled Subjects
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {subjects.length} {subjects.length === 1 ? 'Subject' : 'Subjects'} Available
          </span>
        </div>

        {loading ? (
          <Loader count={2} skeleton={true} />
        ) : subjects.length === 0 ? (
          <EmptyState
            title="No Subjects Available"
            message="No academic subjects have been published to your curriculum yet. Please check back later."
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="neo-card neo-card-hover"
                onClick={() => navigate(`/subjects/${subject.id}`)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '190px'
                }}
              >
                <div>
                  <div
                    className="neo-inset"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                      marginBottom: '1rem'
                    }}
                  >
                    <BookOpen size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {subject.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {subject.description || 'Comprehensive curriculum coursework and assignments.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', marginTop: '1.25rem' }}>
                  <span>Explore Assignments</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;
