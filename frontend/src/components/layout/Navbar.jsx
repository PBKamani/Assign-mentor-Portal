import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, LogOut, Menu, X, BookOpen, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import Button from '../common/Button';
import api from '../../services/api';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search(searchQuery.trim());
        if (res?.success) {
          setSearchResults(res.data || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (item) => {
    setShowResults(false);
    setSearchQuery('');
    if (item.type === 'question') {
      navigate(`/assignments/${item.assignmentId}/questions/${item.id}`);
    } else if (item.type === 'assignment') {
      navigate(`/assignments/${item.id}`);
    } else if (item.type === 'subject') {
      navigate(`/subjects/${item.id}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--surface-color)',
        borderBottom: 'var(--border-subtle)',
        boxShadow: 'var(--neo-subtle)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}
    >
      {/* Left: Mobile Toggle & Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="neo-btn neo-btn-icon"
          aria-label="Toggle Navigation"
          style={{ width: '38px', height: '38px' }}
        >
          <Menu size={18} />
        </button>

        <Link
          to={isAdmin ? "/admin/dashboard" : "/dashboard"}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary)' }}
        >
          <div
            className="neo-inset"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)'
            }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Assignmentor</span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Academic Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Middle: Universal Search Bar */}
      <div
        ref={searchContainerRef}
        style={{
          position: 'relative',
          flex: '1',
          maxWidth: '520px',
          margin: '0 0.5rem'
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="neo-input"
            placeholder="Search subjects, assignments, questions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            style={{ paddingLeft: '2.5rem', paddingRight: searchQuery ? '2.5rem' : '1rem', height: '42px', fontSize: '0.9rem' }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setShowResults(false); }}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchQuery.trim() && (
          <div
            className="neo-card"
            style={{
              position: 'absolute',
              top: '50px',
              left: 0,
              right: 0,
              zIndex: 100,
              maxHeight: '380px',
              overflowY: 'auto',
              padding: '0.75rem',
              boxShadow: '10px 10px 25px var(--shadow-dark), -10px -10px 25px var(--shadow-light)'
            }}
          >
            {isSearching ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Searching academic index...
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No matching content found for "{searchQuery}".
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {searchResults.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleResultClick(item)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)',
                      border: 'var(--border-subtle)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-elevated)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span className={`neo-badge ${item.type === 'question' ? 'neo-badge-accent' : ''}`} style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem' }}>
                        {item.type.toUpperCase()}
                      </span>
                      {item.subject && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {item.subject} {item.assignment ? `→ ${item.assignment}` : ''}
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {item.type === 'question'
                        ? `${item.questionNumber ? `${item.questionNumber}) ` : ''}${item.question}`
                        : item.name || item.assignment || item.subject}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Theme Toggle, User Badge, Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ThemeToggle />

        {user && (
          <div
            className="neo-inset"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            {isAdmin ? <Shield size={16} color="var(--accent)" /> : <User size={16} color="var(--accent)" />}
            <span>{user.username}</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                background: isAdmin ? 'var(--accent)' : 'var(--accent-light)',
                color: isAdmin ? '#FFF' : 'var(--text-primary)',
                marginLeft: '0.25rem'
              }}
            >
              {isAdmin ? 'ADMIN' : 'STUDENT'}
            </span>
          </div>
        )}

        <Button
          variant="icon"
          size="sm"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          style={{ width: '38px', height: '38px' }}
        >
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
