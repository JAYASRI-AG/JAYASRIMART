import React from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 1.5rem',
      backgroundColor: 'white',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-200)',
      margin: '1.5rem 0'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--gray-100)',
        color: 'var(--gray-500)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem'
      }}>
        {icon || <PackageOpen size={32} />}
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem', maxWidth: '400px', marginBottom: '1.5rem' }}>
        {description}
      </p>

      {actionText && (
        actionLink ? (
          <Link to={actionLink} className="btn btn-primary">
            {actionText}
          </Link>
        ) : (
          <button onClick={onAction} className="btn btn-primary">
            {actionText}
          </button>
        )
      )}
    </div>
  );
};
