
import React from 'react';

interface SuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (query: string) => void;
}

const Suggestions: React.FC<SuggestionsProps> = ({ suggestions, onSuggestionClick }) => {
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 animate-fade-in">
      <div className="p-4 bg-[color:var(--surface-variant)] rounded-lg">
        <p className="text-sm text-[color:var(--on-surface-variant)] mb-3">Did you mean:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-3 py-1 text-sm bg-[color:var(--primary-container)] text-[color:var(--on-primary-container)] rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--surface-variant)] focus:ring-[color:var(--primary)] transition-opacity duration-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Suggestions;