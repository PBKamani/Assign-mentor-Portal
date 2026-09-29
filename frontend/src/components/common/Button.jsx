import React from 'react';

export const Button = ({
  children,
  variant = 'default', // 'default' | 'primary' | 'danger' | 'icon'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  active = false,
  onClick,
  type = 'button',
  ...props
}) => {
  let variantClass = 'neo-btn';
  if (variant === 'primary') variantClass += ' neo-btn-primary';
  if (variant === 'danger') variantClass += ' neo-btn-danger';
  if (variant === 'icon') variantClass += ' neo-btn-icon';
  if (active) variantClass += ' active';

  const sizeStyles = {
    sm: { padding: variant === 'icon' ? '0' : '0.4rem 0.8rem', fontSize: '0.85rem' },
    md: { padding: variant === 'icon' ? '0' : '0.65rem 1.25rem', fontSize: '0.95rem' },
    lg: { padding: variant === 'icon' ? '0' : '0.85rem 1.75rem', fontSize: '1.05rem' }
  };

  return (
    <button
      type={type}
      className={`${variantClass} ${className}`}
      style={sizeStyles[size]}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
