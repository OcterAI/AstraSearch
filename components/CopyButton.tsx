
import React, { useState } from 'react';

interface CopyButtonProps {
  textToCopy: string;
}

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (isCopied) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy link.');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--background)] focus:ring-[color:var(--primary)] ${
        isCopied
          ? 'bg-green-100 text-green-700'
          : 'bg-[color:var(--surface-variant)] text-[color:var(--on-surface-variant)] hover:bg-opacity-80'
      }`}
      aria-label={isCopied ? 'Copied to clipboard' : 'Copy to clipboard'}
      title={isCopied ? 'Copied!' : 'Copy link'}
    >
      {isCopied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
};

export default CopyButton;
