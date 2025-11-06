
import React from 'react';

interface RefreshButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
    </svg>
);


const RefreshButton: React.FC<RefreshButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--background)] focus:ring-[color:var(--primary)] bg-[color:var(--surface-variant)] text-[color:var(--on-surface-variant)] hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label="Refresh search"
      title="Refresh search"
    >
      <RefreshIcon />
    </button>
  );
};

export default RefreshButton;
