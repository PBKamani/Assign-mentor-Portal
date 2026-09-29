import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, FileText, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    subjects: 0,
    assignments: 0,
    questions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getStats();
        if (res?.success && res?.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const metricCards = [
    { label: 'Subjects', count: stats.subjects, icon: Book, link: '/admin/subjects' },
    { label: 'Assignments', count: stats.assignments, icon: FileText, link: '/admin/assignments' },
    { label: 'Questions', count: stats.questions, icon: HelpCircle, link: '/admin/questions' }
  ];

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div className="neo-card" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={18} />
          <span>ADMINISTRATION CONSOLE</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Academic Content Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
          Manage your Subject → Assignment → Question curriculum hierarchy, format answers with TipTap, and attach diagrams.
        </p>
      </div>

      {/* Metrics Row (3 cards: Subjects, Assignments, Questions) */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
        System Summary
      </h2>

      {loading ? (
        <Loader count={1} skeleton={true} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {metricCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="neo-card neo-card-hover"
                onClick={() => navigate(card.link)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.75rem'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {card.label}
                  </span>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    {card.count}
                  </div>
                </div>

                <div
                  className="neo-inset"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)'
                  }}
                >
                  <Icon size={24} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content Management Direct Actions (No Units) */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Quick Management
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="neo-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Manage Subjects</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.5 }}>
              Add, update, or remove top-level academic subjects and courses.
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/subjects')}
            variant="primary"
            size="sm"
            style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }}
            icon={ArrowRight}
          >
            Subjects Console
          </Button>
        </div>

        <div className="neo-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Manage Assignments</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.5 }}>
              Create and manage problem sets attached directly to subjects.
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/assignments')}
            variant="primary"
            size="sm"
            style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }}
            icon={ArrowRight}
          >
            Assignments Console
          </Button>
        </div>

        <div className="neo-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Manage Questions</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.5 }}>
              Create questions, edit answers with TipTap, and upload outside/inside diagrams.
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/questions')}
            variant="primary"
            size="sm"
            style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }}
            icon={ArrowRight}
          >
            Questions Console
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
