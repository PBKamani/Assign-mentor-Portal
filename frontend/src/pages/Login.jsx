import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';

const GENERIC_ERROR_MESSAGE = "Invalid username or password.";

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError(GENERIC_ERROR_MESSAGE);
      return;
    }

    setError('');
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);

    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      // Strictly generic error message (Change 1 Security Requirement)
      setError(GENERIC_ERROR_MESSAGE);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'var(--bg-color)',
        position: 'relative'
      }}
    >
      {/* Top Bar with Theme Toggle */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <ThemeToggle />
      </div>

      <div
        className="neo-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.75rem 2rem',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="neo-inset"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)'
            }}
          >
            <BookOpen size={32} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Assignmentor
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Your Assignments. Organized. Simplified.
          </p>
        </div>

        {/* Error Alert: Strictly generic message (Specification Change 1) */}
        {error && (
          <div
            className="neo-inset"
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              borderLeft: '4px solid var(--danger)'
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Username or ID
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="neo-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="neo-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <span>Sign In</span>
            <ArrowRight size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
