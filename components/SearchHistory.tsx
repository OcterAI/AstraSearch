import React from 'react';

interface SearchHistoryProps {
  history: string[];
  onItemClick: (query: string) => void;
  onClear: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onItemClick, onClear }) => {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-[color:var(--surface)] rounded-2xl shadow-xl border border-[color:var(--outline)] z-10 p-2 animate-fade-in">
      <div className="flex justify-between items-center px-3 pt-2 pb-1">
        <span className="text-sm font-medium text-[color:var(--on-surface-variant)]">Recent Searches</span>
        <button
          onClick={(e) => {
            e.preventDefault(); // prevent form submission
            onClear();
          }}
          className="text-sm text-[color:var(--primary)] hover:opacity-80 font-medium"
          aria-label="Clear search history"
        >
          Clear
        </button>
      </div>
      <ul className="max-h-60 overflow-y-auto">
        {history.map((item, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => onItemClick(item)}
              className="w-full text-left px-3 py-2 text-[color:var(--on-surface)] hover:bg-[color:var(--surface-variant)] rounded-lg transition-colors duration-150"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchHistory;