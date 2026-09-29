import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`neo-btn neo-btn-icon ${className}`}
      title={isDark ? 'Switch to Cream Light Theme' : 'Switch to Dark Blue Theme'}
      aria-label="Toggle Theme"
      style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        color: isDark ? '#F59E0B' : '#8A795D',
        transition: 'all 0.3s ease'
      }}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;
