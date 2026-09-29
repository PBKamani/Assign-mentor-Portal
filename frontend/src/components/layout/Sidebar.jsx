import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Book,
  FileText,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // User hierarchy tree: Subject -> Assignment -> Question (Specification Change 2)
  const [treeData, setTreeData] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [loadingTree, setLoadingTree] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      loadUserTree();
    }
  }, [isAdmin]);

  const loadUserTree = async () => {
    setLoadingTree(true);
    try {
      const [subjectsRes, assignmentsRes, questionsRes] = await Promise.all([
        api.getSubjects(),
        api.getAssignments(),
        api.getQuestions()
      ]);

      const subjects = subjectsRes?.data || [];
      const assignments = assignmentsRes?.data || [];
      const questions = questionsRes?.data || [];

      // Structure hierarchy: Subject -> Assignments -> Questions (NO UNITS)
      const structured = subjects.map(sub => {
        const subAssignments = assignments
          .filter(a => a.subjectId === sub.id)
          .map(a => {
            const aQuestions = questions.filter(q => q.assignmentId === a.id);
            return { ...a, questions: aQuestions };
          });
        return { ...sub, assignments: subAssignments };
      });

      setTreeData(structured);

      // Auto expand first subject and first assignment
      if (structured.length > 0) {
        const initialExpanded = { [`sub-${structured[0].id}`]: true };
        if (structured[0].assignments?.length > 0) {
          initialExpanded[`assign-${structured[0].assignments[0].id}`] = true;
        }
        setExpandedNodes(initialExpanded);
      }
    } catch (err) {
      console.error("Failed to load navigation tree:", err);
    } finally {
      setLoadingTree(false);
    }
  };

  const toggleNode = (nodeKey) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeKey]: !prev[nodeKey]
    }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 40,
            display: 'block'
          }}
        />
      )}

      <aside
        style={{
          width: '280px',
          minWidth: '280px',
          height: 'calc(100vh - 65px)',
          position: 'sticky',
          top: '65px',
          backgroundColor: 'var(--surface-color)',
          borderRight: 'var(--border-subtle)',
          boxShadow: 'var(--neo-subtle)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 45,
          overflowY: 'auto',
          padding: '1.25rem 0.75rem',
          transition: 'transform var(--transition-normal)',
          transform: isOpen ? 'translateX(0)' : undefined
        }}
        className="assignmentor-sidebar"
      >
        {isAdmin ? (
          /* ADMIN SIDEBAR (No Units) */
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.75rem 0.5rem' }}>
                Overview
              </div>
              <NavLink
                to="/admin/dashboard"
                onClick={onClose}
                className={({ isActive }) => `neo-btn ${isActive ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.4rem' }}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.75rem 0.5rem' }}>
                Content Management
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <NavLink
                  to="/admin/subjects"
                  onClick={onClose}
                  className={({ isActive }) => `neo-btn ${isActive ? 'active' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <Book size={18} />
                  <span>Subjects</span>
                </NavLink>

                <NavLink
                  to="/admin/assignments"
                  onClick={onClose}
                  className={({ isActive }) => `neo-btn ${isActive ? 'active' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <FileText size={18} />
                  <span>Assignments</span>
                </NavLink>

                <NavLink
                  to="/admin/questions"
                  onClick={onClose}
                  className={({ isActive }) => `neo-btn ${isActive ? 'active' : ''}`}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <HelpCircle size={18} />
                  <span>Questions</span>
                </NavLink>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: 'var(--border-subtle)' }}>
              <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Assignmentor v2.0 (Admin Mode)
              </div>
            </div>
          </div>
        ) : (
          /* USER STUDY SIDEBAR: Subject -> Assignment -> Question (Specification Change 2) */
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '0.75rem' }}>
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={({ isActive }) => `neo-btn ${isActive ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem' }}
            >
              <Sparkles size={18} color="var(--accent)" />
              <span>Study Desk</span>
            </NavLink>

            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.5rem 0.75rem 0.25rem' }}>
              SUBJECTS
            </div>

            {loadingTree ? (
              <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Loading curriculum...
              </div>
            ) : treeData.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No subjects assigned yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {treeData.map(subject => {
                  const subKey = `sub-${subject.id}`;
                  const isSubExpanded = !!expandedNodes[subKey];

                  return (
                    <div key={subject.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      {/* Subject Node */}
                      <div
                        onClick={() => toggleNode(subKey)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          backgroundColor: isSubExpanded ? 'var(--surface-elevated)' : 'transparent',
                          transition: 'background var(--transition-fast)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                          <Book size={16} color="var(--accent)" />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {subject.name}
                          </span>
                        </div>
                        {isSubExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>

                      {/* Assignments under Subject */}
                      {isSubExpanded && (
                        <div style={{ paddingLeft: '1rem', marginTop: '0.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', borderLeft: '2px solid var(--accent-light)' }}>
                          {subject.assignments?.length === 0 ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.3rem 0.5rem' }}>No assignments</span>
                          ) : (
                            subject.assignments.map(assignment => {
                              const assignKey = `assign-${assignment.id}`;
                              const isAssignExpanded = !!expandedNodes[assignKey];

                              return (
                                <div key={assignment.id}>
                                  <div
                                    onClick={() => toggleNode(assignKey)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '0.45rem 0.6rem',
                                      borderRadius: 'var(--radius-sm)',
                                      cursor: 'pointer',
                                      fontSize: '0.85rem',
                                      fontWeight: 600,
                                      color: 'var(--text-primary)'
                                    }}
                                  >
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/assignments/${assignment.id}`);
                                        if (onClose) onClose();
                                      }}
                                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden', flex: 1 }}
                                    >
                                      <FileText size={14} color="var(--accent)" />
                                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {assignment.name}
                                      </span>
                                    </div>
                                    {assignment.questions?.length > 0 && (
                                      isAssignExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                                    )}
                                  </div>

                                  {/* Questions under Assignment */}
                                  {isAssignExpanded && assignment.questions?.length > 0 && (
                                    <div style={{ paddingLeft: '1.25rem', marginTop: '0.15rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                      {assignment.questions.map((q, idx) => (
                                        <NavLink
                                          key={q.id}
                                          to={`/assignments/${assignment.id}/questions/${q.id}`}
                                          onClick={onClose}
                                          style={({ isActive }) => ({
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            padding: '0.3rem 0.5rem',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.78rem',
                                            fontWeight: isActive ? 700 : 500,
                                            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                                            backgroundColor: isActive ? 'var(--surface-elevated)' : 'transparent',
                                            boxShadow: isActive ? 'var(--neo-subtle)' : 'none'
                                          })}
                                        >
                                          <HelpCircle size={12} />
                                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            Q{q.questionNumber || idx + 1}: {q.questionText}
                                          </span>
                                        </NavLink>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
