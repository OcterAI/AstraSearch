import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_SYSTEM_PROMPT } from '../services/systemPromptService';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string;
  onSave: (newPrompt: string) => void;
}

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({ isOpen, onClose, currentPrompt, onSave }) => {
  const [localPrompt, setLocalPrompt] = useState(currentPrompt);
  const modalRef = useRef<HTMLDivElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Sync local state when the modal opens or the external prompt changes
    if (isOpen) {
      setLocalPrompt(currentPrompt);
    }
  }, [currentPrompt, isOpen]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Focus the save button when the modal opens for better accessibility
      saveButtonRef.current?.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);


  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(localPrompt);
    onClose();
  };

  const handleReset = () => {
    setLocalPrompt(DEFAULT_SYSTEM_PROMPT);
  };
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
      }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 animate-fade-in"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-prompt-title"
    >
      <div ref={modalRef} className="w-full max-w-lg bg-[color:var(--surface)] rounded-2xl shadow-xl p-6 text-[color:var(--on-surface)] flex flex-col gap-4">
        <h2 id="system-prompt-title" className="text-xl">System Prompt</h2>
        <p className="text-[color:var(--on-surface-variant)] text-sm">
          Provide instructions for the model to follow for all search queries. You can define a persona, set response formats, and more. Leave it empty to use the default behavior.
        </p>
        <textarea
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          placeholder="e.g., You are a helpful assistant that explains complex topics to a 10-year-old."
          className="w-full h-40 p-3 text-base text-[color:var(--on-surface)] bg-[color:var(--surface-variant)] border-2 border-[color:var(--outline)] rounded-lg focus:outline-none focus:border-[color:var(--primary)] transition-colors duration-200 resize-none"
          aria-label="System prompt input"
        />
        <div className="flex justify-end items-center gap-3 mt-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm rounded-full text-[color:var(--on-surface-variant)] hover:bg-[color:var(--surface-variant)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--surface)] focus:ring-[color:var(--primary)] transition"
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-full text-[color:var(--primary)] hover:bg-[color:var(--primary-container)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--surface)] focus:ring-[color:var(--primary)] transition"
          >
            Cancel
          </button>
          <button
            ref={saveButtonRef}
            onClick={handleSave}
            className="px-6 py-2 text-sm font-semibold rounded-full bg-[color:var(--primary)] text-[color:var(--on-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--surface)] focus:ring-[color:var(--primary)] transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemPromptModal;