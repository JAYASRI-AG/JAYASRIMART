import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, text }) => {
  const displayText = text || message || 'Loading...';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', minHeight: '280px' }}>
      <div style={{
        width: '42px',
        height: '42px',
        border: '3.5px solid var(--border)',
        borderTopColor: 'var(--primary-color)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: '1rem'
      }}></div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>{displayText}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="card" style={{ height: '360px', padding: '0.75rem', display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton" style={{ width: '100%', height: '180px', borderRadius: 'var(--radius-lg)' }}></div>
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton" style={{ width: '40%', height: '14px' }}></div>
        <div className="skeleton" style={{ width: '90%', height: '18px' }}></div>
        <div className="skeleton" style={{ width: '60%', height: '16px' }}></div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem' }}>
        <div className="skeleton" style={{ width: '35%', height: '24px' }}></div>
        <div className="skeleton" style={{ width: '30%', height: '32px', borderRadius: 'var(--radius-md)' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
