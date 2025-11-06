import React, { useState, FormEvent, useRef, useEffect } from 'react';
import SearchHistory from './SearchHistory';
import SystemPromptModal from './SystemPromptModal';
import { SearchFilters } from '../types';
import { DEFAULT_SYSTEM_PROMPT } from '../services/systemPromptService';

// Fix: Add type definitions for Web Speech API to resolve TypeScript errors.
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}


interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  history: string[];
  onClearHistory: () => void;
  filters: SearchFilters;
  onFilterChange: (filterUpdate: Partial<SearchFilters>) => void;
  systemPrompt: string;
  onSystemPromptChange: (newPrompt: string) => void;
}

const CogIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MicrophoneIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);


const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, history, onClearHistory, filters, onFilterChange, systemPrompt, onSystemPromptChange }) => {
  const [query, setQuery] = useState('');
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const searchBarRef = useRef<HTMLFormElement>(null);

  const isCustomPromptActive = systemPrompt !== DEFAULT_SYSTEM_PROMPT;

  useEffect(() => {
    // Fix: Use the added types for Web Speech API and handle vendor prefix.
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        onSearch(transcript);
        setIsHistoryVisible(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone access in your browser settings to use voice search.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsVoiceSupported(false);
    }
  }, [onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsHistoryVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setIsHistoryVisible(false);
    }
  };

  const handleHistoryItemClick = (historyQuery: string) => {
    setQuery(historyQuery);
    onSearch(historyQuery);
    setIsHistoryVisible(false);
  };
  
  const handleClear = () => {
    onClearHistory();
    setIsHistoryVisible(false);
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="w-full" ref={searchBarRef}>
        <div className="relative">
          {isVoiceSupported && (
            <button
                type="button"
                onClick={handleToggleListening}
                disabled={isLoading}
                className={`absolute top-1/2 left-4 -translate-y-1/2 p-1 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--background)] focus:ring-[color:var(--primary)] disabled:opacity-50 ${
                    isListening ? 'text-[color:var(--error)] animate-pulse' : 'text-[color:var(--on-surface-variant)] hover:text-[color:var(--on-surface)]'
                }`}
                aria-label={isListening ? "Stop listening" : "Search by voice"}
            >
                <MicrophoneIcon className="h-6 w-6" />
            </button>
          )}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsHistoryVisible(true)}
            placeholder={isListening ? "Listening..." : "Ask Astra anything..."}
            className={`w-full py-3 text-lg text-[color:var(--on-surface)] bg-[color:var(--surface-variant)] border-2 border-[color:var(--outline)] rounded-full focus:outline-none focus:border-[color:var(--primary)] transition-colors duration-200 pr-14 ${isVoiceSupported ? 'pl-14' : 'pl-5'}`}
            disabled={isLoading}
            aria-label="Search input"
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute top-1/2 right-3 -translate-y-1/2 p-2 bg-[color:var(--primary)] rounded-full text-[color:var(--on-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--background)] focus:ring-[color:var(--primary)] disabled:bg-[color:var(--on-surface)] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
            disabled={isLoading}
            aria-label="Submit search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </button>

          {isHistoryVisible && history.length > 0 && (
            <SearchHistory
              history={history}
              onItemClick={handleHistoryItemClick}
              onClear={handleClear}
            />
          )}
        </div>
      </form>
      
      <div className="flex justify-center items-center gap-2 sm:gap-4 mt-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor="dateRange" className="text-sm text-[color:var(--on-surface-variant)]">Date:</label>
          <select
            id="dateRange"
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ dateRange: e.target.value as SearchFilters['dateRange'] })}
            disabled={isLoading}
            className="bg-[color:var(--surface-variant)] text-[color:var(--on-surface)] text-sm rounded-md py-1 pl-2 pr-7 border border-[color:var(--outline)] focus:ring-1 focus:ring-[color:var(--primary)] focus:border-[color:var(--primary)] transition disabled:opacity-50"
          >
            <option value="all">All time</option>
            <option value="day">Past day</option>
            <option value="week">Past week</option>
            <option value="month">Past month</option>
            <option value="year">Past year</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sortBy" className="text-sm text-[color:var(--on-surface-variant)]">Sort by:</label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as SearchFilters['sortBy'] })}
            disabled={isLoading}
            className="bg-[color:var(--surface-variant)] text-[color:var(--on-surface)] text-sm rounded-md py-1 pl-2 pr-7 border border-[color:var(--outline)] focus:ring-1 focus:ring-[color:var(--primary)] focus:border-[color:var(--primary)] transition disabled:opacity-50"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Date</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sourceType" className="text-sm text-[color:var(--on-surface-variant)]">Source:</label>
          <select
            id="sourceType"
            value={filters.sourceType}
            onChange={(e) => onFilterChange({ sourceType: e.target.value as SearchFilters['sourceType'] })}
            disabled={isLoading}
            className="bg-[color:var(--surface-variant)] text-[color:var(--on-surface)] text-sm rounded-md py-1 pl-2 pr-7 border border-[color:var(--outline)] focus:ring-1 focus:ring-[color:var(--primary)] focus:border-[color:var(--primary)] transition disabled:opacity-50"
          >
            <option value="all">All</option>
            <option value="news">News</option>
            <option value="academic">Academic</option>
            <option value="blogs">Blogs</option>
          </select>
        </div>

        <button 
          onClick={() => setIsPromptModalOpen(true)}
          disabled={isLoading}
          className={`p-1.5 rounded-md transition disabled:opacity-50 ${isCustomPromptActive ? 'text-[color:var(--primary)]' : 'text-[color:var(--on-surface-variant)] hover:text-[color:var(--on-surface)]'}`}
          aria-label="Open system prompt settings"
          title="System Prompt Settings"
        >
          <CogIcon className="h-5 w-5" />
        </button>
      </div>

      <SystemPromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        currentPrompt={systemPrompt}
        onSave={onSystemPromptChange}
      />
    </div>
  );
};

export default SearchBar;
